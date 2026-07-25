import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../../shared/errors/ApiError';
import { getPaginationOptions, createPaginatedResponse } from '../../shared/utils/pagination';
import { PaginatedResponse, PaginationQuery } from '../../shared/types';
import { config } from '../../shared/config';
import { EmailService, challengeAcceptedEmail, challengeReceivedEmail } from '../../shared/email';
import { AuthRepository } from '../auth/auth.repository';
import { NotificationsService } from '../notifications/notifications.service';
import { ChallengesRepository, ChallengeParticipantInfo } from './challenges.repository';
import { CHALLENGES_MESSAGES } from './challenges.constants';
import { ChallengeDTO, ChallengeListType, ChallengeProblemInput } from './challenges.types';
import { IChallengeDocument } from './challenge.schema';

export class ChallengesService {
  private repository: ChallengesRepository;
  private authRepository: AuthRepository;
  private notificationsService: NotificationsService;
  private emailService: EmailService;

  constructor() {
    this.repository = new ChallengesRepository();
    this.authRepository = new AuthRepository();
    this.notificationsService = new NotificationsService();
    this.emailService = new EmailService();
  }

  private challengesUrl(): string {
    return `${config.cors.origin}/challenges`;
  }

  private async getOwnedChallenge(challengeId: string, userId?: string): Promise<IChallengeDocument> {
    const challenge = await this.repository.findById(challengeId);
    if (!challenge) {
      throw new NotFoundError(CHALLENGES_MESSAGES.NOT_FOUND);
    }
    if (userId && challenge.challengerId.toString() !== userId && challenge.opponentId.toString() !== userId) {
      throw new ForbiddenError(CHALLENGES_MESSAGES.NOT_AUTHORIZED);
    }
    return challenge;
  }

  private async toDTO(challenge: IChallengeDocument): Promise<ChallengeDTO> {
    const challengerId = challenge.challengerId.toString();
    const opponentId = challenge.opponentId.toString();
    const participants = await this.repository.getParticipantsMap([challengerId, opponentId]);
    return this.buildDTO(challenge, participants);
  }

  private buildDTO(challenge: IChallengeDocument, participants: Map<string, ChallengeParticipantInfo>): ChallengeDTO {
    const challengerId = challenge.challengerId.toString();
    const opponentId = challenge.opponentId.toString();
    const fallback: ChallengeParticipantInfo = { username: null, name: 'Unknown' };

    return {
      id: challenge._id.toString(),
      challenger: { userId: challengerId, ...(participants.get(challengerId) ?? fallback) },
      opponent: { userId: opponentId, ...(participants.get(opponentId) ?? fallback) },
      problem: challenge.problem,
      status: challenge.status,
      challengerCompletedAt: challenge.challengerCompletedAt ?? null,
      opponentCompletedAt: challenge.opponentCompletedAt ?? null,
      winnerId: challenge.winnerId ? challenge.winnerId.toString() : null,
      createdAt: challenge.createdAt,
    };
  }

  async createChallenge(challengerId: string, opponentId: string, problem: ChallengeProblemInput): Promise<ChallengeDTO> {
    if (challengerId === opponentId) {
      throw new BadRequestError(CHALLENGES_MESSAGES.CANNOT_CHALLENGE_SELF);
    }

    const participants = await this.authRepository.findByIds([challengerId, opponentId]);
    const challenger = participants.find((user) => user._id.toString() === challengerId);
    const opponent = participants.find((user) => user._id.toString() === opponentId);
    if (!challenger || !opponent) {
      throw new NotFoundError(CHALLENGES_MESSAGES.USER_NOT_FOUND);
    }

    const challenge = await this.repository.create(challengerId, opponentId, problem);

    await this.notificationsService.create({
      recipientId: opponentId,
      type: 'challenge_received',
      actorId: challengerId,
      title: 'New challenge',
      message: `@${challenger.username} challenged you: "${problem.title}"`,
      link: '/challenges?tab=incoming',
    });

    const { subject, html } = challengeReceivedEmail(opponent.username, challenger.username, problem.title, this.challengesUrl());
    this.emailService.sendInBackground({ to: opponent.email, subject, html });

    return this.toDTO(challenge);
  }

  async acceptChallenge(userId: string, challengeId: string): Promise<ChallengeDTO> {
    const challenge = await this.getOwnedChallenge(challengeId);
    if (challenge.opponentId.toString() !== userId) {
      throw new ForbiddenError(CHALLENGES_MESSAGES.NOT_AUTHORIZED);
    }
    if (challenge.status !== 'pending') {
      throw new ConflictError(CHALLENGES_MESSAGES.NOT_FOUND);
    }

    const updated = await this.repository.updateStatus(challengeId, 'accepted');
    if (!updated) {
      throw new NotFoundError(CHALLENGES_MESSAGES.NOT_FOUND);
    }

    const challengerId = challenge.challengerId.toString();
    const participants = await this.authRepository.findByIds([challengerId, userId]);
    const challenger = participants.find((user) => user._id.toString() === challengerId);
    const opponent = participants.find((user) => user._id.toString() === userId);
    await this.notificationsService.create({
      recipientId: challenge.challengerId.toString(),
      type: 'challenge_accepted',
      actorId: userId,
      title: 'Challenge accepted',
      message: `@${opponent?.username ?? 'Your opponent'} accepted your challenge: "${challenge.problem.title}"`,
      link: `/challenges?tab=active`,
    });

    if (challenger && opponent) {
      const { subject, html } = challengeAcceptedEmail(
        challenger.username,
        opponent.username,
        challenge.problem.title,
        this.challengesUrl()
      );
      this.emailService.sendInBackground({ to: challenger.email, subject, html });
    }

    return this.toDTO(updated);
  }

  async declineChallenge(userId: string, challengeId: string): Promise<ChallengeDTO> {
    const challenge = await this.getOwnedChallenge(challengeId);
    if (challenge.opponentId.toString() !== userId) {
      throw new ForbiddenError(CHALLENGES_MESSAGES.NOT_AUTHORIZED);
    }
    if (challenge.status !== 'pending') {
      throw new ConflictError(CHALLENGES_MESSAGES.NOT_FOUND);
    }

    const updated = await this.repository.updateStatus(challengeId, 'declined');
    if (!updated) {
      throw new NotFoundError(CHALLENGES_MESSAGES.NOT_FOUND);
    }

    await this.notificationsService.create({
      recipientId: challenge.challengerId.toString(),
      type: 'challenge_declined',
      actorId: userId,
      title: 'Challenge declined',
      message: `Your challenge "${challenge.problem.title}" was declined`,
      link: '/challenges?tab=outgoing',
    });

    return this.toDTO(updated);
  }

  async cancelChallenge(userId: string, challengeId: string): Promise<ChallengeDTO> {
    const challenge = await this.getOwnedChallenge(challengeId);
    if (challenge.challengerId.toString() !== userId) {
      throw new ForbiddenError(CHALLENGES_MESSAGES.NOT_AUTHORIZED);
    }
    if (challenge.status !== 'pending') {
      throw new ConflictError(CHALLENGES_MESSAGES.NOT_FOUND);
    }

    const updated = await this.repository.updateStatus(challengeId, 'cancelled');
    if (!updated) {
      throw new NotFoundError(CHALLENGES_MESSAGES.NOT_FOUND);
    }
    return this.toDTO(updated);
  }

  async completeChallenge(userId: string, challengeId: string): Promise<ChallengeDTO> {
    const challenge = await this.getOwnedChallenge(challengeId, userId);
    if (challenge.status !== 'accepted') {
      throw new ConflictError(CHALLENGES_MESSAGES.NOT_ACCEPTED);
    }

    const isChallenger = challenge.challengerId.toString() === userId;
    const field = isChallenger ? 'challengerCompletedAt' : 'opponentCompletedAt';
    if (challenge[field]) {
      throw new ConflictError(CHALLENGES_MESSAGES.ALREADY_COMPLETED_BY_YOU);
    }

    const now = new Date();
    let updated = await this.repository.markCompletedBy(challengeId, field, now);
    if (!updated) {
      throw new NotFoundError(CHALLENGES_MESSAGES.NOT_FOUND);
    }

    const otherUserId = isChallenger ? challenge.opponentId.toString() : challenge.challengerId.toString();
    const otherCompletedAt = isChallenger ? updated.opponentCompletedAt : updated.challengerCompletedAt;

    if (otherCompletedAt) {
      const winnerId = now.getTime() <= otherCompletedAt.getTime() ? userId : otherUserId;
      updated = await this.repository.finalize(challengeId, winnerId);
      if (!updated) {
        throw new NotFoundError(CHALLENGES_MESSAGES.NOT_FOUND);
      }

      await Promise.all([
        this.notificationsService.create({
          recipientId: userId,
          type: 'challenge_completed',
          actorId: otherUserId,
          title: 'Challenge completed',
          message: `"${challenge.problem.title}" is complete${winnerId === userId ? ' — you won!' : ''}`,
          link: `/challenges?tab=completed`,
        }),
        this.notificationsService.create({
          recipientId: otherUserId,
          type: 'challenge_completed',
          actorId: userId,
          title: 'Challenge completed',
          message: `"${challenge.problem.title}" is complete${winnerId === otherUserId ? ' — you won!' : ''}`,
          link: `/challenges?tab=completed`,
        }),
      ]);
    } else {
      await this.notificationsService.create({
        recipientId: otherUserId,
        type: 'challenge_completed',
        actorId: userId,
        title: 'Your opponent finished',
        message: `Your opponent completed "${challenge.problem.title}" — your turn!`,
        link: `/challenges?tab=active`,
      });
    }

    return this.toDTO(updated);
  }

  async getChallenge(userId: string, challengeId: string): Promise<ChallengeDTO> {
    const challenge = await this.getOwnedChallenge(challengeId, userId);
    return this.toDTO(challenge);
  }

  async listChallenges(userId: string, type: ChallengeListType, query: PaginationQuery): Promise<PaginatedResponse<ChallengeDTO>> {
    const { page, limit, skip } = getPaginationOptions(query);
    const { items, total } = await this.repository.findPaginated(userId, type, { skip, limit });

    const ids = new Set<string>();
    items.forEach((item) => {
      ids.add(item.challengerId.toString());
      ids.add(item.opponentId.toString());
    });
    const participants = await this.repository.getParticipantsMap([...ids]);
    const dtos = items.map((item) => this.buildDTO(item, participants));

    return createPaginatedResponse(dtos, total, page, limit);
  }
}
