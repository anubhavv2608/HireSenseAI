import { Request, Response } from 'express';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { INTERVIEW_GENERATOR_MESSAGES } from './interview-generator.constants';
import { InterviewGeneratorService } from './interview-generator.service';

export class InterviewGeneratorController {
  private service: InterviewGeneratorService;

  constructor() {
    this.service = new InterviewGeneratorService();
  }

  generate = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { resumeId } = req.body as { resumeId: string };

    const generation = await this.service.generateQuestions(userId, resumeId, req.id);

    res.status(200).json(ApiResponse.success(INTERVIEW_GENERATOR_MESSAGES.GENERATE_SUCCESS, { generation }));
  });

  regenerate = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { resumeId } = req.body as { resumeId: string };

    const generation = await this.service.regenerateQuestions(userId, resumeId, req.id);

    res.status(200).json(ApiResponse.success(INTERVIEW_GENERATOR_MESSAGES.GENERATE_SUCCESS, { generation }));
  });

  getStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { resumeId } = req.params;

    const status = await this.service.getStatus(userId, resumeId as string);

    res.status(200).json(ApiResponse.success(INTERVIEW_GENERATOR_MESSAGES.STATUS_FETCHED, { status }));
  });

  getRecord = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { resumeId } = req.params;

    const generation = await this.service.getRecord(userId, resumeId as string);

    res.status(200).json(ApiResponse.success(INTERVIEW_GENERATOR_MESSAGES.RECORD_FETCHED, { generation }));
  });
}
