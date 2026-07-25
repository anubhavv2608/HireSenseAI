import { Types } from 'mongoose';
import { ResumeRepository } from '../resume/resume.repository';
import { ResumeProcessingRepository } from '../resume-processing/resume-processing.repository';
import { ResumeProcessingService } from '../resume-processing/resume-processing.service';
import { ResumeAnalysisRepository } from '../resume-analysis/resume-analysis.repository';
import { IResumeProcessingDocument } from '../resume-processing/resume-processing.schema';
import { NotFoundError } from '../../shared/errors/ApiError';
import { getPaginationOptions, createPaginatedResponse } from '../../shared/utils/pagination';
import { PaginatedResponse, PaginationQuery } from '../../shared/types';
import { ADMIN_MESSAGES } from './admin.constants';

interface AdminResumeRow {
  resumeId: string;
  userId: string;
  originalFilename: string;
  storageProvider: string;
  isActive: boolean;
  uploadedAt: Date;
  processingStatus: string | null;
  hasAnalysis: boolean;
}

interface ListResumesQuery extends PaginationQuery {
  search?: string;
}

export class AdminResumesService {
  private resumeRepository: ResumeRepository;
  private resumeProcessingRepository: ResumeProcessingRepository;
  private resumeAnalysisRepository: ResumeAnalysisRepository;
  private resumeProcessingService: ResumeProcessingService;

  constructor() {
    this.resumeRepository = new ResumeRepository();
    this.resumeProcessingRepository = new ResumeProcessingRepository();
    this.resumeAnalysisRepository = new ResumeAnalysisRepository();
    this.resumeProcessingService = new ResumeProcessingService();
  }

  async listResumes(query: ListResumesQuery): Promise<PaginatedResponse<AdminResumeRow>> {
    const { page, limit, skip } = getPaginationOptions(query);
    const { items, total } = await this.resumeRepository.findAllAdmin({ skip, limit, search: query.search });

    const resumeIds = items.map((resume) => (resume._id as Types.ObjectId).toString());
    const [processingByResumeId, analysisResumeIds] = await Promise.all([
      this.resumeProcessingRepository.findLatestByResumeIds(resumeIds),
      this.resumeAnalysisRepository.existsForResumeIds(resumeIds),
    ]);

    const data: AdminResumeRow[] = items.map((resume) => {
      const resumeId = (resume._id as Types.ObjectId).toString();
      return {
        resumeId,
        userId: resume.userId.toString(),
        originalFilename: resume.originalFilename,
        storageProvider: resume.storageProvider,
        isActive: resume.isActive,
        uploadedAt: resume.uploadedAt,
        processingStatus: processingByResumeId.get(resumeId)?.processingStatus ?? null,
        hasAnalysis: analysisResumeIds.has(resumeId),
      };
    });

    return createPaginatedResponse(data, total, page, limit);
  }

  async deleteResume(id: string) {
    const resume = await this.resumeRepository.softDeleteAdmin(id);
    if (!resume) {
      throw new NotFoundError(ADMIN_MESSAGES.RESUME_NOT_FOUND);
    }
    return resume;
  }

  async reprocessResume(id: string, correlationId?: string): Promise<IResumeProcessingDocument> {
    const resume = await this.resumeRepository.findByIdAdmin(id);
    if (!resume) {
      throw new NotFoundError(ADMIN_MESSAGES.RESUME_NOT_FOUND);
    }
    return this.resumeProcessingService.processResume(resume.userId.toString(), id, correlationId);
  }
}
