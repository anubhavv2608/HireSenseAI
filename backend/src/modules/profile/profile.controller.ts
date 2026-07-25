import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { BadRequestError } from '../../shared/errors/ApiError';
import { StorageFile } from '../../shared/storage/types';
import { logger } from '../../shared/config/logger';
import { ProfileService } from './profile.service';
import { PROFILE_MESSAGES } from './profile.constants';
import { SearchStudentsQuery } from './profile.types';

export class ProfileController {
  private profileService: ProfileService;

  constructor() {
    this.profileService = new ProfileService();
  }

  createProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const profile = await this.profileService.createProfile(userId, req.body);

    res.status(201).json(ApiResponse.success(PROFILE_MESSAGES.CREATE_SUCCESS, { profile }));
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { profile, stats, completionPercentage } = await this.profileService.getProfile(userId);

    res.status(200).json(ApiResponse.success(PROFILE_MESSAGES.GET_SUCCESS, { profile, stats, completionPercentage }));
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const profile = await this.profileService.updateProfile(userId, req.body);

    res.status(200).json(ApiResponse.success(PROFILE_MESSAGES.UPDATE_SUCCESS, { profile }));
  });

  deleteProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    await this.profileService.deleteProfile(userId);

    res.status(200).json(ApiResponse.success(PROFILE_MESSAGES.DELETE_SUCCESS));
  });

  getPublicProfile = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const profile = await this.profileService.getPublicProfile(userId as string);

    res.status(200).json(ApiResponse.success(PROFILE_MESSAGES.GET_SUCCESS, { profile }));
  });

  getPublicProfileByUsername = asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params;
    const profile = await this.profileService.getPublicProfileByUsername(username as string);

    res.status(200).json(ApiResponse.success(PROFILE_MESSAGES.GET_SUCCESS, { profile }));
  });

  searchProfiles = asyncHandler(async (req: Request, res: Response) => {
    const query: SearchStudentsQuery = {
      ...(req.query as unknown as SearchStudentsQuery),
      excludeUserId: req.user!.userId,
    };
    const result = await this.profileService.searchStudents(query);

    res.status(200).json(ApiResponse.success(PROFILE_MESSAGES.SEARCH_SUCCESS, result));
  });

  uploadProfilePicture = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const expressFile = req.file;

    if (!expressFile) {
      throw new BadRequestError('No file uploaded');
    }

    const storageFile: StorageFile = {
      originalname: expressFile.originalname,
      mimetype: expressFile.mimetype,
      size: expressFile.size,
      buffer: expressFile.buffer,
    };

    const profilePicture = await this.profileService.uploadProfilePicture(userId, storageFile);
    logger.info(`[Profile] Picture updated [UserID: ${userId}]`);

    res.status(200).json(ApiResponse.success(PROFILE_MESSAGES.PICTURE_UPDATED, { profilePicture }));
  });

  removeProfilePicture = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    await this.profileService.removeProfilePicture(userId);
    logger.info(`[Profile] Picture removed [UserID: ${userId}]`);

    res.status(200).json(ApiResponse.success(PROFILE_MESSAGES.PICTURE_REMOVED));
  });
}
