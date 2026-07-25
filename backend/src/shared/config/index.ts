import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET_PLACEHOLDER = 'supersecretplaceholder';
const REFRESH_TOKEN_SECRET_PLACEHOLDER = 'supersecretrefreshplaceholder';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(5000),
    MONGO_URI: z.string().url().default('mongodb://localhost:27017/hiresense'),
    JWT_SECRET: z.string().default(JWT_SECRET_PLACEHOLDER),
    JWT_EXPIRES_IN: z.string().default('15m'),
    REFRESH_TOKEN_SECRET: z.string().default(REFRESH_TOKEN_SECRET_PLACEHOLDER),
    REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
    CORS_ORIGIN: z.string().default('http://localhost:5173'),
    GOOGLE_CLIENT_ID: z.string().optional(),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
    AI_PROVIDER: z.string().default('gemini'),
    AI_MODEL: z.string().default('gemini-3.6-flash'),
    AI_TIMEOUT_MS: z.coerce.number().default(30000),
    AI_MAX_RETRIES: z.coerce.number().default(2),
    AI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.2),
    RESEND_API_KEY: z.string().optional(),
    BREVO_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().default('HireSenseAI <onboarding@resend.dev>'),
    EMAIL_PROVIDER: z.enum(['resend', 'brevo', 'gmail', 'smtp']).default('resend'),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
  })
  .refine((data) => !(data.NODE_ENV === 'production' && data.JWT_SECRET === JWT_SECRET_PLACEHOLDER), {
    message: 'JWT_SECRET must be set to a real secret in production (placeholder default is not allowed)',
    path: ['JWT_SECRET'],
  })
  .refine((data) => !(data.NODE_ENV === 'production' && data.REFRESH_TOKEN_SECRET === REFRESH_TOKEN_SECRET_PLACEHOLDER), {
    message: 'REFRESH_TOKEN_SECRET must be set to a real secret in production (placeholder default is not allowed)',
    path: ['REFRESH_TOKEN_SECRET'],
  });

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

const env = parsedEnv.data;

export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  database: {
    uri: env.MONGO_URI,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshSecret: env.REFRESH_TOKEN_SECRET,
    refreshExpiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
  },
  cors: {
    origin: env.CORS_ORIGIN,
  },
  google: {
    clientId: env.GOOGLE_CLIENT_ID,
  },
  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  },
  gemini: {
    apiKey: env.GEMINI_API_KEY,
  },
  ai: {
    provider: env.AI_PROVIDER,
    model: env.AI_MODEL,
    timeoutMs: env.AI_TIMEOUT_MS,
    maxRetries: env.AI_MAX_RETRIES,
    temperature: env.AI_TEMPERATURE,
  },
  email: {
    provider: env.EMAIL_PROVIDER,
    apiKey: env.RESEND_API_KEY,
    brevoApiKey: env.BREVO_API_KEY,
    from: env.EMAIL_FROM,
    smtp: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  },
} as const;
