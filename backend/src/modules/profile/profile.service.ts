import { ProfileRepository } from './profile.repository';
import {
  CreateProfileDTO,
  ProfileEntityCreate,
  ProfileEntityUpdate,
  ProfilePictureDTO,
  ProfileStats,
  PublicProfileDTO,
  SearchStudentsQuery,
  StudentCardDTO,
  UpdateProfileDTO,
} from './profile.types';
import { IProfileDocument } from './profile.schema';
import { AuthRepository } from '../auth/auth.repository';
import { ResumeRepository } from '../resume/resume.repository';
import { ResumeAnalysisRepository } from '../resume-analysis/resume-analysis.repository';
import { StorageService } from '../../shared/storage/services/StorageService';
import { StorageFile } from '../../shared/storage/types';
import { BadRequestError, ConflictError, NotFoundError } from '../../shared/errors/ApiError';
import { getPaginationOptions, createPaginatedResponse } from '../../shared/utils/pagination';
import { PaginatedResponse } from '../../shared/types';
import { PROFILE_CONSTANTS, PROFILE_MESSAGES, SOCIAL_URL_DOMAINS } from './profile.constants';

const COMPLETION_FACTOR_COUNT = 12;

export class ProfileService {
  private repository: ProfileRepository;
  private authRepository: AuthRepository;
  private resumeRepository: ResumeRepository;
  private resumeAnalysisRepository: ResumeAnalysisRepository;
  private storageService: StorageService;

  constructor() {
    this.repository = new ProfileRepository();
    this.authRepository = new AuthRepository();
    this.resumeRepository = new ResumeRepository();
    this.resumeAnalysisRepository = new ResumeAnalysisRepository();
    this.storageService = new StorageService();
  }

  private normalizeUrl(url?: string, expectedDomain?: string): string | undefined {
    if (!url || url.trim() === '') return undefined;
    const trimmed = url.trim();
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    let parsed: URL;
    try {
      parsed = new URL(withProtocol);
    } catch {
      throw new BadRequestError(PROFILE_MESSAGES.INVALID_URL);
    }

    if (expectedDomain && !parsed.hostname.toLowerCase().endsWith(expectedDomain)) {
      throw new BadRequestError(PROFILE_MESSAGES.INVALID_URL);
    }

    return withProtocol;
  }

  private isProfileCompleted(data: Partial<CreateProfileDTO>): boolean {
    return !!(data.fullName && data.college && data.branch && data.graduationYear && data.targetRole);
  }

  private processUrls<T extends CreateProfileDTO | UpdateProfileDTO>(dto: T): T {
    const processed = { ...dto };
    if (processed.linkedin !== undefined) processed.linkedin = this.normalizeUrl(processed.linkedin, SOCIAL_URL_DOMAINS.linkedin);
    if (processed.github !== undefined) processed.github = this.normalizeUrl(processed.github, SOCIAL_URL_DOMAINS.github);
    if (processed.portfolioUrl !== undefined) processed.portfolioUrl = this.normalizeUrl(processed.portfolioUrl);
    if (processed.leetcode !== undefined) processed.leetcode = this.normalizeUrl(processed.leetcode, SOCIAL_URL_DOMAINS.leetcode);
    if (processed.codeforces !== undefined) processed.codeforces = this.normalizeUrl(processed.codeforces, SOCIAL_URL_DOMAINS.codeforces);
    return processed;
  }

  /** Maps the `about` DTO field (wire/API name) onto the schema's `bio` field. */
  private toEntityCreate(dto: CreateProfileDTO): ProfileEntityCreate {
    const { about, ...rest } = dto;
    return { ...rest, bio: about, fullName: dto.fullName };
  }

  private toEntityUpdate(dto: UpdateProfileDTO): ProfileEntityUpdate {
    const { about, ...rest } = dto;
    const update: ProfileEntityUpdate = { ...rest };
    if (about !== undefined) update.bio = about;
    return update;
  }

  private async getUserStats(userId: string): Promise<ProfileStats> {
    const user = await this.authRepository.findById(userId);
    const resume = await this.resumeRepository.findActiveByUserId(userId);
    const analysis = resume
      ? await this.resumeAnalysisRepository.findLatestByResumeId(resume._id.toString(), userId)
      : null;

    return {
      resumeScore: analysis?.overallScore ?? null,
      currentStreak: user?.currentStreak ?? 0,
      bestStreak: user?.bestStreak ?? 0,
      problemsSolved: user?.totalCompleted ?? 0,
    };
  }

  private async computeCompletionPercentage(profile: IProfileDocument): Promise<number> {
    const resume = await this.resumeRepository.findActiveByUserId(profile.userId.toString());

    const factors = [
      !!profile.bio,
      profile.skills.length > 0,
      !!profile.github,
      !!profile.linkedin,
      !!profile.leetcode,
      !!profile.codeforces,
      !!profile.college,
      !!profile.degree,
      !!profile.branch,
      !!profile.graduationYear,
      !!profile.profilePicture,
      !!resume,
    ];

    const filled = factors.filter(Boolean).length;
    return Math.round((filled / COMPLETION_FACTOR_COUNT) * 100);
  }

  async createProfile(userId: string, dto: CreateProfileDTO): Promise<IProfileDocument> {
    const existing = await this.repository.findByUserId(userId);
    if (existing) {
      throw new ConflictError(PROFILE_MESSAGES.PROFILE_ALREADY_EXISTS);
    }

    const processedDTO = this.processUrls(dto);
    const profileCompleted = this.isProfileCompleted(processedDTO);

    return this.repository.createProfile(userId, {
      ...this.toEntityCreate(processedDTO),
      profileCompleted,
    });
  }

  async getProfile(userId: string): Promise<{ profile: IProfileDocument; stats: ProfileStats; completionPercentage: number }> {
    const profile = await this.repository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError(PROFILE_MESSAGES.PROFILE_NOT_FOUND);
    }

    const [stats, completionPercentage] = await Promise.all([
      this.getUserStats(userId),
      this.computeCompletionPercentage(profile),
    ]);

    return { profile, stats, completionPercentage };
  }

  async updateProfile(userId: string, dto: UpdateProfileDTO): Promise<IProfileDocument> {
    const existing = await this.repository.findByUserId(userId);
    if (!existing) {
      throw new NotFoundError(PROFILE_MESSAGES.PROFILE_NOT_FOUND);
    }

    const processedDTO = this.processUrls(dto);

    // Merge existing profile data with updates to accurately evaluate profile completion
    const mergedData = {
      fullName: processedDTO.fullName ?? existing.fullName,
      college: processedDTO.college ?? existing.college,
      branch: processedDTO.branch ?? existing.branch,
      graduationYear: processedDTO.graduationYear ?? existing.graduationYear,
      targetRole: processedDTO.targetRole ?? existing.targetRole,
    };

    const profileCompleted = this.isProfileCompleted(mergedData);

    const updated = await this.repository.updateByUserId(userId, {
      ...this.toEntityUpdate(processedDTO),
      profileCompleted,
    });

    if (!updated) {
      throw new NotFoundError(PROFILE_MESSAGES.PROFILE_NOT_FOUND);
    }

    return updated;
  }

  async deleteProfile(userId: string): Promise<void> {
    const success = await this.repository.softDeleteByUserId(userId);
    if (!success) {
      throw new NotFoundError(PROFILE_MESSAGES.PROFILE_NOT_FOUND);
    }
  }

  async getPublicProfile(targetUserId: string): Promise<PublicProfileDTO> {
    const profile = await this.repository.findByUserId(targetUserId);
    const user = await this.authRepository.findById(targetUserId);
    if (!profile || !user) {
      throw new NotFoundError(PROFILE_MESSAGES.PROFILE_NOT_FOUND);
    }

    const [stats, completionPercentage] = await Promise.all([
      this.getUserStats(targetUserId),
      this.computeCompletionPercentage(profile),
    ]);

    return {
      userId: targetUserId,
      username: user.username ?? null,
      name: profile.fullName,
      profilePicture: profile.profilePicture,
      college: profile.college,
      degree: profile.degree,
      branch: profile.branch,
      graduationYear: profile.graduationYear,
      about: profile.bio,
      skills: profile.skills,
      github: profile.github,
      linkedin: profile.linkedin,
      leetcode: profile.leetcode,
      codeforces: profile.codeforces,
      ...stats,
      completionPercentage,
    };
  }

  async getPublicProfileByUsername(username: string): Promise<PublicProfileDTO> {
    const user = await this.authRepository.findByUsername(username);
    if (!user) {
      throw new NotFoundError(PROFILE_MESSAGES.PROFILE_NOT_FOUND);
    }
    return this.getPublicProfile(user._id.toString());
  }

  async searchStudents(query: SearchStudentsQuery): Promise<PaginatedResponse<StudentCardDTO>> {
    const { page, limit, skip } = getPaginationOptions(query);
    const { items, total } = await this.repository.searchProfiles({ ...query, skip, limit });
    return createPaginatedResponse(items, total, page, limit);
  }

  async uploadProfilePicture(userId: string, file: StorageFile): Promise<ProfilePictureDTO> {
    const profile = await this.repository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError(PROFILE_MESSAGES.PROFILE_NOT_FOUND);
    }

    const uploadResult = await this.storageService.uploadFile(file, {
      folder: PROFILE_CONSTANTS.PICTURE_STORAGE_FOLDER,
      allowedMimeTypes: [...PROFILE_CONSTANTS.PICTURE_ALLOWED_MIME_TYPES],
      maxSizeBytes: PROFILE_CONSTANTS.PICTURE_MAX_SIZE_BYTES,
    });

    const picture: ProfilePictureDTO = { publicId: uploadResult.publicId, url: uploadResult.secureUrl };

    const previousPublicId = profile.profilePicture?.publicId;
    await this.repository.updateProfilePicture(userId, picture);

    if (previousPublicId) {
      try {
        await this.storageService.deleteFile(previousPublicId);
      } catch {
        // Storage deletion failure shouldn't crash the picture replacement
      }
    }

    return picture;
  }

  async removeProfilePicture(userId: string): Promise<void> {
    const profile = await this.repository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError(PROFILE_MESSAGES.PROFILE_NOT_FOUND);
    }
    if (!profile.profilePicture) {
      throw new NotFoundError(PROFILE_MESSAGES.PICTURE_NOT_FOUND);
    }

    const publicId = profile.profilePicture.publicId;
    await this.repository.updateProfilePicture(userId, null);

    try {
      await this.storageService.deleteFile(publicId);
    } catch {
      // Storage deletion failure shouldn't crash the DB update
    }
  }
}
