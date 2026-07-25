import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { logger } from '../../shared/config/logger';
import { PaginationQuery } from '../../shared/types';
import { AdminAssignmentsService } from './admin-assignments.service';
import { ADMIN_MESSAGES } from './admin.constants';

export class AdminAssignmentsController {
  private service: AdminAssignmentsService;

  constructor() {
    this.service = new AdminAssignmentsService();
  }

  createAssignment = asyncHandler(async (req: Request, res: Response) => {
    const adminUserId = req.user!.userId;
    const assignment = await this.service.createAssignment(req.body, adminUserId);
    logger.info(`[Admin] Assignment created [AssignmentID: ${assignment._id}] [AdminID: ${adminUserId}]`);
    res.status(201).json(ApiResponse.success(ADMIN_MESSAGES.ASSIGNMENT_CREATED, { assignment }));
  });

  listAssignments = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.listAssignments(req.query as unknown as PaginationQuery);
    res.status(200).json(ApiResponse.success(ADMIN_MESSAGES.ASSIGNMENTS_FETCHED, result));
  });

  getAssignment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const assignment = await this.service.getAssignment(id as string);
    res.status(200).json(ApiResponse.success(ADMIN_MESSAGES.ASSIGNMENTS_FETCHED, { assignment }));
  });

  updateAssignment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminUserId = req.user!.userId;
    const assignment = await this.service.updateAssignment(id as string, req.body, adminUserId);
    logger.info(`[Admin] Assignment updated [AssignmentID: ${id}] [AdminID: ${adminUserId}]`);
    res.status(200).json(ApiResponse.success(ADMIN_MESSAGES.ASSIGNMENT_UPDATED, { assignment }));
  });

  publishAssignment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminUserId = req.user!.userId;
    const assignment = await this.service.publishAssignment(id as string);
    logger.info(`[Admin] Assignment published [AssignmentID: ${id}] [AdminID: ${adminUserId}]`);
    res.status(200).json(ApiResponse.success(ADMIN_MESSAGES.ASSIGNMENT_PUBLISHED, { assignment }));
  });
}
