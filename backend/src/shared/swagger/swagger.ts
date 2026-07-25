import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import { API_PREFIX } from '../constants';

const routesGlob = path.join(__dirname, '../../modules/**/*.routes.{ts,js}');

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'HireSense AI API',
      version: '1.0.0',
      description:
        'REST API for HireSense AI — resume analysis, AI-powered job matching and interview prep, Daily DSA practice, and a peer community platform (friends, challenges, leaderboards, notifications).',
    },
    servers: [{ url: API_PREFIX, description: 'API base path (relative to this server\'s origin)' }],
    tags: [
      { name: 'Auth', description: 'Registration, login, tokens, password reset, username' },
      { name: 'Profile', description: 'Student profile CRUD, public profiles, search' },
      { name: 'Resume', description: 'Resume upload, versioning, history' },
      { name: 'Resume Parser', description: 'AI extraction of structured data from a resume' },
      { name: 'Resume Processing', description: 'End-to-end resume processing pipeline' },
      { name: 'Resume Analysis', description: 'AI scoring and feedback on a resume' },
      { name: 'Job Description Analysis', description: 'AI comparison of a resume against a job description' },
      { name: 'Interview Generator', description: 'AI-generated interview questions from a resume' },
      { name: 'Job Input', description: 'Job description text extraction from an uploaded file' },
      { name: 'Dashboard', description: 'Aggregated per-user dashboard summary' },
      { name: 'Daily DSA', description: 'Daily coding-practice assignments and streaks' },
      { name: 'Statistics', description: 'Platform-wide usage statistics' },
      { name: 'Leaderboard', description: 'Daily DSA leaderboards' },
      { name: 'Notifications', description: 'In-app notifications' },
      { name: 'Friends', description: 'Friend requests and connections' },
      { name: 'Challenges', description: 'Peer-to-peer coding challenges' },
      { name: 'Admin', description: 'Admin and super-admin management endpoints' },
      { name: 'Health', description: 'Service health/readiness checks' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access token returned from /auth/login, /auth/register, or /auth/refresh.',
        },
      },
      schemas: {
        ApiSuccess: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: {},
            errors: { nullable: true, example: null },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            data: { nullable: true, example: null },
            errors: { nullable: true },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 42 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            totalPages: { type: 'integer', example: 3 },
            hasNextPage: { type: 'boolean' },
            hasPreviousPage: { type: 'boolean' },
          },
        },
        AuthTokens: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            username: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['student', 'admin', 'super_admin'] },
            authProvider: { type: 'string', enum: ['email', 'google'] },
            isActive: { type: 'boolean' },
            currentStreak: { type: 'integer' },
            totalCompleted: { type: 'integer' },
          },
        },
        ProfilePicture: {
          type: 'object',
          nullable: true,
          properties: {
            url: { type: 'string' },
            publicId: { type: 'string' },
          },
        },
        Profile: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            fullName: { type: 'string' },
            college: { type: 'string', nullable: true },
            collegeType: { type: 'string', nullable: true },
            degree: { type: 'string', nullable: true },
            branch: { type: 'string', nullable: true },
            graduationYear: { type: 'integer', nullable: true },
            cgpa: { type: 'number', nullable: true },
            phone: { type: 'string', nullable: true },
            linkedin: { type: 'string', nullable: true },
            github: { type: 'string', nullable: true },
            portfolioUrl: { type: 'string', nullable: true },
            leetcode: { type: 'string', nullable: true },
            codeforces: { type: 'string', nullable: true },
            targetRole: { type: 'string', nullable: true },
            targetCompany: { type: 'string', nullable: true },
            about: { type: 'string', nullable: true },
            skills: { type: 'array', items: { type: 'string' } },
            receiveDailyDSAEmails: { type: 'boolean' },
            profilePicture: { $ref: '#/components/schemas/ProfilePicture' },
          },
        },
        StudentCard: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            username: { type: 'string', nullable: true },
            name: { type: 'string' },
            college: { type: 'string', nullable: true },
            branch: { type: 'string', nullable: true },
            graduationYear: { type: 'integer', nullable: true },
            skills: { type: 'array', items: { type: 'string' } },
            profilePicture: { $ref: '#/components/schemas/ProfilePicture' },
          },
        },
        Resume: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            originalFilename: { type: 'string' },
            version: { type: 'integer' },
            isActive: { type: 'boolean' },
            uploadedAt: { type: 'string', format: 'date-time' },
          },
        },
        DailyDsaAssignment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            leetcodeProblemId: { type: 'string' },
            leetcodeUrl: { type: 'string' },
            difficulty: { type: 'string', enum: ['Easy', 'Medium', 'Hard'] },
            topic: { type: 'string' },
            description: { type: 'string', nullable: true },
            date: { type: 'string', format: 'date' },
            isPublished: { type: 'boolean' },
          },
        },
        LeaderboardEntry: {
          type: 'object',
          properties: {
            rank: { type: 'integer' },
            userId: { type: 'string' },
            username: { type: 'string', nullable: true },
            fullName: { type: 'string', nullable: true },
            currentStreak: { type: 'integer' },
            totalCompleted: { type: 'integer' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            recipientId: { type: 'string' },
            actorId: { type: 'string', nullable: true },
            type: {
              type: 'string',
              enum: [
                'friend_request',
                'friend_accepted',
                'challenge_received',
                'challenge_accepted',
                'challenge_completed',
                'daily_dsa_reminder',
              ],
            },
            title: { type: 'string' },
            message: { type: 'string' },
            link: { type: 'string', nullable: true },
            isRead: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        FriendCard: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            username: { type: 'string', nullable: true },
            name: { type: 'string' },
            profilePicture: { $ref: '#/components/schemas/ProfilePicture' },
          },
        },
        FriendRequest: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            username: { type: 'string', nullable: true },
            name: { type: 'string' },
            profilePicture: { $ref: '#/components/schemas/ProfilePicture' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ChallengeParticipant: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            username: { type: 'string', nullable: true },
            name: { type: 'string' },
          },
        },
        ChallengeProblem: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            url: { type: 'string', nullable: true },
            difficulty: { type: 'string', enum: ['Easy', 'Medium', 'Hard'], nullable: true },
            notes: { type: 'string', nullable: true },
          },
        },
        Challenge: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            challenger: { $ref: '#/components/schemas/ChallengeParticipant' },
            opponent: { $ref: '#/components/schemas/ChallengeParticipant' },
            problem: { $ref: '#/components/schemas/ChallengeProblem' },
            status: { type: 'string', enum: ['pending', 'accepted', 'declined', 'cancelled', 'completed'] },
            challengerCompletedAt: { type: 'string', format: 'date-time', nullable: true },
            opponentCompletedAt: { type: 'string', format: 'date-time', nullable: true },
            winnerId: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'A business-rule precondition was not met (not a request-shape validation failure — see 422).',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
        UnprocessableEntity: {
          description: 'The request body/query/params failed schema validation. `errors` holds a list of { field, message }.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
        Unauthorized: {
          description: 'Missing, malformed, or expired access token.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
        Forbidden: {
          description: "Caller's role does not permit this action.",
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
        NotFound: {
          description: 'The requested resource does not exist.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
        Conflict: {
          description: 'The request conflicts with the current state of the resource.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
        TooManyRequests: {
          description: 'Rate limit exceeded.',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [routesGlob],
};

export const swaggerSpec = swaggerJsdoc(options);
