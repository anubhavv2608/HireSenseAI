import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { requestId } from './shared/middleware/requestId';
import { requestLogger } from './shared/middleware/requestLogger';
import { errorHandler } from './shared/middleware/errorHandler';
import { API_PREFIX } from './shared/constants';
import { config } from './shared/config';
import { swaggerSpec } from './shared/swagger/swagger';
import healthRoutes from './modules/health/health.routes';
import authRoutes from './modules/auth/auth.routes';
import profileRoutes from './modules/profile/profile.routes';
import resumeRoutes from './modules/resume/resume.routes';
import resumeProcessingRoutes from './modules/resume-processing/resume-processing.routes';
import resumeParserRoutes from './modules/resume-parser/resume-parser.routes';
import resumeAnalysisRoutes from './modules/resume-analysis/resume-analysis.routes';
import jobDescriptionAnalysisRoutes from './modules/job-description-analysis/job-description-analysis.routes';
import interviewGeneratorRoutes from './modules/interview-generator/interview-generator.routes';
import jobInputRoutes from './modules/job-input/job-input.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import dailyDsaRoutes from './modules/daily-dsa/daily-dsa.routes';
import statisticsRoutes from './modules/statistics/statistics.routes';
import leaderboardRoutes from './modules/leaderboard/leaderboard.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import friendsRoutes from './modules/friends/friends.routes';
import challengesRoutes from './modules/challenges/challenges.routes';
import adminRoutes from './modules/admin/admin.routes';

const app = express();

// Request Correlation
app.use(requestId);

// Security Middlewares
app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Parse JSON & Cookie payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request Logging
app.use(requestLogger);

// Health & System Routes
app.use('/health', healthRoutes);
app.use(`${API_PREFIX}/health`, healthRoutes);

// API Documentation
app.use(`${API_PREFIX}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: 'HireSense AI API Docs' }));

// Register Business Modules
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/profile`, profileRoutes);
app.use(`${API_PREFIX}/resume`, resumeRoutes);
app.use(`${API_PREFIX}/resume-processing`, resumeProcessingRoutes);
app.use(`${API_PREFIX}/resume-parser`, resumeParserRoutes);
app.use(`${API_PREFIX}/resume-analysis`, resumeAnalysisRoutes);
app.use(`${API_PREFIX}/job-description-analysis`, jobDescriptionAnalysisRoutes);
app.use(`${API_PREFIX}/interview-generator`, interviewGeneratorRoutes);
app.use(`${API_PREFIX}/job-input`, jobInputRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/daily-dsa`, dailyDsaRoutes);
app.use(`${API_PREFIX}/statistics`, statisticsRoutes);
app.use(`${API_PREFIX}/leaderboard`, leaderboardRoutes);
app.use(`${API_PREFIX}/notifications`, notificationsRoutes);
app.use(`${API_PREFIX}/friends`, friendsRoutes);
app.use(`${API_PREFIX}/challenges`, challengesRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
