import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { logger } from '../../shared/config/logger';
import { AdminResumesService } from './admin-resumes.service';
import { ADMIN_MESSAGES } from './admin.constants';

export class AdminResumesController {
  private service: AdminResumesService;

  constructor() {
    this.service = new AdminResumesService();
  }

  listResumes = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, search } = req.query as { page?: string; limit?: string; search?: string };
    const result = await this.service.listResumes({
      page: page as unknown as number,
      limit: limit as unknown as number,
      search,
    });
    res.status(200).json(ApiResponse.success(ADMIN_MESSAGES.RESUMES_FETCHED, result));
  });

  deleteResume = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.service.deleteResume(id as string);
    logger.info(`[Admin] Resume soft-deleted [ResumeID: ${id}] [AdminID: ${req.user!.userId}]`);
    res.status(200).json(ApiResponse.success(ADMIN_MESSAGES.RESUME_DELETED));
  });

  reprocessResume = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const processing = await this.service.reprocessResume(id as string, req.id);
    logger.info(`[Admin] Resume reprocess triggered [ResumeID: ${id}] [AdminID: ${req.user!.userId}]`);
    res.status(200).json(ApiResponse.success('Resume reprocessing started', { processing }));
  });
}
