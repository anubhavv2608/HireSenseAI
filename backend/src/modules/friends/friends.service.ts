import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../../shared/errors/ApiError';
import { getPaginationOptions, createPaginatedResponse } from '../../shared/utils/pagination';
import { PaginatedResponse, PaginationQuery } from '../../shared/types';
import { config } from '../../shared/config';
import { EmailService, friendAcceptedEmail, friendRequestEmail } from '../../shared/email';
import { AuthRepository } from '../auth/auth.repository';
import { NotificationsService } from '../notifications/notifications.service';
import { FriendsRepository } from './friends.repository';
import { FRIENDS_MESSAGES } from './friends.constants';
import { FriendCardDTO, FriendRequestDTO, FriendRequestListType, FriendStatus, FriendsListQuery } from './friends.types';
import { IFriendRequestDocument } from './friend-request.schema';

export class FriendsService {
  private repository: FriendsRepository;
  private authRepository: AuthRepository;
  private notificationsService: NotificationsService;
  private emailService: EmailService;

  constructor() {
    this.repository = new FriendsRepository();
    this.authRepository = new AuthRepository();
    this.notificationsService = new NotificationsService();
    this.emailService = new EmailService();
  }

  private profileUrl(username: string): string {
    return `${config.cors.origin}/u/${username}`;
  }

  async sendRequest(requesterId: string, recipientId: string): Promise<IFriendRequestDocument> {
    if (requesterId === recipientId) {
      throw new BadRequestError(FRIENDS_MESSAGES.CANNOT_FRIEND_SELF);
    }

    const existing = await this.repository.findBetween(requesterId, recipientId);
    if (existing?.status === 'accepted') {
      throw new ConflictError(FRIENDS_MESSAGES.ALREADY_FRIENDS);
    }
    if (existing?.status === 'pending') {
      throw new ConflictError(FRIENDS_MESSAGES.REQUEST_ALREADY_PENDING);
    }

    const participants = await this.authRepository.findByIds([requesterId, recipientId]);
    const requester = participants.find((user) => user._id.toString() === requesterId);
    const recipient = participants.find((user) => user._id.toString() === recipientId);
    if (!recipient || !requester) {
      throw new NotFoundError(FRIENDS_MESSAGES.USER_NOT_FOUND);
    }

    const request = await this.repository.create(requesterId, recipientId);

    await this.notificationsService.create({
      recipientId,
      type: 'friend_request',
      actorId: requesterId,
      title: 'New friend request',
      message: `@${requester.username} sent you a friend request`,
      link: '/friends?tab=incoming',
    });

    const { subject, html } = friendRequestEmail(recipient.username, requester.username, this.profileUrl(requester.username));
    this.emailService.sendInBackground({ to: recipient.email, subject, html });

    return request;
  }

  async acceptRequest(userId: string, requestId: string): Promise<IFriendRequestDocument> {
    const request = await this.repository.findById(requestId);
    if (!request) {
      throw new NotFoundError(FRIENDS_MESSAGES.REQUEST_NOT_FOUND);
    }
    if (request.recipientId.toString() !== userId) {
      throw new ForbiddenError(FRIENDS_MESSAGES.NOT_AUTHORIZED);
    }
    if (request.status !== 'pending') {
      throw new ConflictError(FRIENDS_MESSAGES.REQUEST_NOT_FOUND);
    }

    const updated = await this.repository.updateStatus(requestId, 'accepted');
    if (!updated) {
      throw new NotFoundError(FRIENDS_MESSAGES.REQUEST_NOT_FOUND);
    }

    const requesterId = request.requesterId.toString();
    const participants = await this.authRepository.findByIds([requesterId, userId]);
    const requester = participants.find((user) => user._id.toString() === requesterId);
    const recipient = participants.find((user) => user._id.toString() === userId);

    if (requester && recipient) {
      await this.notificationsService.create({
        recipientId: requester._id.toString(),
        type: 'friend_accepted',
        actorId: userId,
        title: 'Friend request accepted',
        message: `@${recipient.username} accepted your friend request`,
        link: `/u/${recipient.username}`,
      });

      const { subject, html } = friendAcceptedEmail(requester.username, recipient.username, this.profileUrl(recipient.username));
      this.emailService.sendInBackground({ to: requester.email, subject, html });
    }

    return updated;
  }

  async rejectRequest(userId: string, requestId: string): Promise<IFriendRequestDocument> {
    const request = await this.repository.findById(requestId);
    if (!request) {
      throw new NotFoundError(FRIENDS_MESSAGES.REQUEST_NOT_FOUND);
    }
    if (request.recipientId.toString() !== userId) {
      throw new ForbiddenError(FRIENDS_MESSAGES.NOT_AUTHORIZED);
    }
    if (request.status !== 'pending') {
      throw new ConflictError(FRIENDS_MESSAGES.REQUEST_NOT_FOUND);
    }

    const updated = await this.repository.updateStatus(requestId, 'rejected');
    if (!updated) {
      throw new NotFoundError(FRIENDS_MESSAGES.REQUEST_NOT_FOUND);
    }
    return updated;
  }

  async cancelRequest(userId: string, requestId: string): Promise<IFriendRequestDocument> {
    const request = await this.repository.findById(requestId);
    if (!request) {
      throw new NotFoundError(FRIENDS_MESSAGES.REQUEST_NOT_FOUND);
    }
    if (request.requesterId.toString() !== userId) {
      throw new ForbiddenError(FRIENDS_MESSAGES.NOT_AUTHORIZED);
    }
    if (request.status !== 'pending') {
      throw new ConflictError(FRIENDS_MESSAGES.REQUEST_NOT_FOUND);
    }

    const updated = await this.repository.updateStatus(requestId, 'cancelled');
    if (!updated) {
      throw new NotFoundError(FRIENDS_MESSAGES.REQUEST_NOT_FOUND);
    }
    return updated;
  }

  async removeFriend(userId: string, targetUserId: string): Promise<void> {
    const removed = await this.repository.deleteAcceptedBetween(userId, targetUserId);
    if (!removed) {
      throw new NotFoundError(FRIENDS_MESSAGES.REQUEST_NOT_FOUND);
    }
  }

  async listFriends(userId: string, query: FriendsListQuery): Promise<PaginatedResponse<FriendCardDTO>> {
    const { page, limit, skip } = getPaginationOptions(query);
    const { items, total } = await this.repository.findFriendsPaginated(userId, { skip, limit, search: query.search });
    return createPaginatedResponse(items, total, page, limit);
  }

  async listRequests(
    userId: string,
    type: FriendRequestListType,
    query: PaginationQuery
  ): Promise<PaginatedResponse<FriendRequestDTO>> {
    const { page, limit, skip } = getPaginationOptions(query);
    const { items, total } = await this.repository.findRequestsPaginated(userId, type, { skip, limit });
    return createPaginatedResponse(items, total, page, limit);
  }

  async getStatus(viewerId: string, targetUserId: string): Promise<{ status: FriendStatus; requestId: string | null }> {
    if (viewerId === targetUserId) {
      return { status: 'self', requestId: null };
    }

    const existing = await this.repository.findBetween(viewerId, targetUserId);
    if (!existing) {
      return { status: 'none', requestId: null };
    }
    if (existing.status === 'accepted') {
      return { status: 'friends', requestId: null };
    }

    const status: FriendStatus = existing.requesterId.toString() === viewerId ? 'pending_outgoing' : 'pending_incoming';
    return { status, requestId: existing._id.toString() };
  }

  async getMutualCount(userIdA: string, userIdB: string): Promise<number> {
    const [idsA, idsB] = await Promise.all([this.repository.getFriendIds(userIdA), this.repository.getFriendIds(userIdB)]);
    const setB = new Set(idsB);
    return idsA.filter((id) => setB.has(id)).length;
  }
}
