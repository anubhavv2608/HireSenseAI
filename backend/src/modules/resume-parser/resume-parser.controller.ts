import { Request, Response } from 'express';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { RESUME_PARSER_MESSAGES } from './resume-parser.constants';
import { ResumeParserService } from './resume-parser.service';

export class ResumeParserController {
  private service: ResumeParserService;

  constructor() {
    this.service = new ResumeParserService();
  }

  parse = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { resumeId } = req.body as { resumeId: string };

    const parse = await this.service.parseResume(userId, resumeId, req.id);

    res.status(200).json(ApiResponse.success(RESUME_PARSER_MESSAGES.PARSE_SUCCESS, { parse }));
  });

  reparse = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { resumeId } = req.body as { resumeId: string };

    const parse = await this.service.reparseResume(userId, resumeId, req.id);

    res.status(200).json(ApiResponse.success(RESUME_PARSER_MESSAGES.PARSE_SUCCESS, { parse }));
  });

  getStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { resumeId } = req.params;

    const status = await this.service.getStatus(userId, resumeId as string);

    res.status(200).json(ApiResponse.success(RESUME_PARSER_MESSAGES.STATUS_FETCHED, { status }));
  });

  getRecord = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { resumeId } = req.params;

    const parse = await this.service.getRecord(userId, resumeId as string);

    res.status(200).json(ApiResponse.success(RESUME_PARSER_MESSAGES.RECORD_FETCHED, { parse }));
  });
}
