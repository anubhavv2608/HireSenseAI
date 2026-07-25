import { Router } from 'express';
import { validate } from '../../shared/middleware/validate';
import { authenticate } from '../../shared/middleware/auth';
import { authRateLimit } from '../../shared/middleware/authRateLimit';
import { AuthController } from './auth.controller';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleAuthSchema,
  usernameAvailabilitySchema,
  updateUsernameSchema,
} from './auth.validation';

const router = Router();
const controller = new AuthController();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new account with email/password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       201:
 *         description: Account created.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 */
router.post('/register', authRateLimit, validate(registerSchema), controller.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in with email/password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login succeeded; sets a refresh-token cookie and returns tokens + user.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 */
router.post('/login', authRateLimit, validate(loginSchema), controller.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Exchange a refresh token (cookie or body) for a new token pair
 *     security: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string, description: 'Only needed if the refresh-token cookie is unavailable.' }
 *     responses:
 *       200:
 *         description: New access/refresh tokens issued.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.post('/refresh', controller.refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Log out the current session (clears refresh token)
 *     responses:
 *       200:
 *         description: Logged out.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.post('/logout', authenticate, controller.logout);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request a password reset email
 *     description: Always responds with the same success message whether or not the email is registered, to prevent account enumeration. The reset link is sent by email only — it is never returned in the response.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Request accepted.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 */
router.post('/forgot-password', authRateLimit, validate(forgotPasswordSchema), controller.forgotPassword);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset the password using the token emailed by /auth/forgot-password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token: { type: string }
 *               newPassword: { type: string, minLength: 8 }
 *     responses:
 *       200:
 *         description: Password updated.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword);

/**
 * @openapi
 * /auth/google:
 *   post:
 *     tags: [Auth]
 *     summary: Log in or register via a Google ID token
 *     description: "`mode` determines whether this can create a new account. `mode=login` requires an existing account (404 if none exists) and never creates one. `mode=signup` creates a new account (409 if one already exists for the email) and never logs into an existing one."
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idToken, mode]
 *             properties:
 *               idToken: { type: string }
 *               mode: { type: string, enum: [login, signup] }
 *     responses:
 *       200:
 *         description: Authenticated via Google.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404:
 *         description: "mode=login and no account exists for this Google email."
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 *       409:
 *         description: "mode=signup and an account already exists for this Google email."
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.post('/google', validate(googleAuthSchema), controller.googleLogin);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the currently authenticated user
 *     responses:
 *       200:
 *         description: Current user.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get('/me', authenticate, controller.getCurrentUser);

/**
 * @openapi
 * /auth/username/available:
 *   get:
 *     tags: [Auth]
 *     summary: Check whether a username is available
 *     security: []
 *     parameters:
 *       - in: query
 *         name: username
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Availability result.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.get('/username/available', validate(usernameAvailabilitySchema), controller.checkUsernameAvailability);

/**
 * @openapi
 * /auth/username:
 *   patch:
 *     tags: [Auth]
 *     summary: Change the current user's username
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username]
 *             properties:
 *               username: { type: string }
 *     responses:
 *       200:
 *         description: Username updated.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.patch('/username', authenticate, validate(updateUsernameSchema), controller.updateUsername);

export default router;
