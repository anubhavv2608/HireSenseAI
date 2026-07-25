import { Request, Response } from 'express';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { BadRequestError } from '../../shared/errors/ApiError';
import { StorageFile } from '../../shared/storage/types';
import { JOB_INPUT_MESSAGES } from './job-input.constants';
import { JobInputService } from './job-input.service';

export class JobInputController {
  private service: JobInputService;

  constructor() {
    this.service = new JobInputService();
  }

  extract = asyncHandler(async (req: Request, res: Response) => {
    const expressFile = req.file;

    if (!expressFile) {
      throw new BadRequestError(JOB_INPUT_MESSAGES.FILE_MISSING);
    }

    const storageFile: StorageFile = {
      originalname: expressFile.originalname,
      mimetype: expressFile.mimetype,
      size: expressFile.size,
      buffer: expressFile.buffer,
    };

    const result = await this.service.extractFromPdf(storageFile, req.id);

    res.status(200).json(ApiResponse.success(JOB_INPUT_MESSAGES.EXTRACT_SUCCESS, result));
  });
}
