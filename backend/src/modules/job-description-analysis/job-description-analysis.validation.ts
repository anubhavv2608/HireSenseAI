import { z } from 'zod';
import { JD_ANALYSIS_CONSTANTS } from './job-description-analysis.constants';

export const analyzeJobDescriptionSchema = z.object({
  body: z.object({
    resumeId: z.string().min(1, 'resumeId is required'),
    jobDescription: z
      .string()
      .trim()
      .min(1, 'jobDescription is required')
      .max(JD_ANALYSIS_CONSTANTS.MAX_JOB_DESCRIPTION_LENGTH, 'jobDescription is too long'),
  }),
});

export const resumeIdParamSchema = z.object({
  params: z.object({
    resumeId: z.string().min(1, 'resumeId is required'),
  }),
});
