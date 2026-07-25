import rateLimit from 'express-rate-limit';

/** Stricter than the global app-wide limiter (app.ts) — scoped only to the
 * credential-guessing/account-enumeration-prone auth endpoints (login,
 * register, forgot-password). */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.' },
});
