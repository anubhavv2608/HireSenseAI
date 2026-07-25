import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
  }),
});

export const googleAuthSchema = z.object({
  body: z.object({
    idToken: z.string().min(1, 'Google ID Token is required'),
    mode: z.enum(['login', 'signup']),
  }),
});

export const usernameAvailabilitySchema = z.object({
  query: z.object({
    username: z.string().min(1, 'Username is required'),
  }),
});

export const updateUsernameSchema = z.object({
  body: z.object({
    username: z.string().min(1, 'Username is required'),
  }),
});
