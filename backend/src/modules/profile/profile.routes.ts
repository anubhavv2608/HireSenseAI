import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { ProfileController } from './profile.controller';
import {
  createProfileSchema,
  updateProfileSchema,
  searchProfilesSchema,
  userIdParamSchema,
  usernameParamSchema,
} from './profile.validation';
import { PROFILE_CONSTANTS } from './profile.constants';

const pictureUploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: PROFILE_CONSTANTS.PICTURE_MAX_SIZE_BYTES,
  },
});

const router = Router();
const controller = new ProfileController();

// All profile endpoints require authentication
router.use(authenticate);

/**
 * @openapi
 * /profile:
 *   post:
 *     tags: [Profile]
 *     summary: Create the current user's profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Profile' }
 *     responses:
 *       201:
 *         description: Profile created.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 *   get:
 *     tags: [Profile]
 *     summary: Get the current user's profile (alias of /profile/me)
 *     responses:
 *       200:
 *         description: Profile.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   patch:
 *     tags: [Profile]
 *     summary: Update the current user's profile (alias of /profile/me)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Profile' }
 *     responses:
 *       200:
 *         description: Profile updated.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 *   delete:
 *     tags: [Profile]
 *     summary: Delete the current user's profile
 *     responses:
 *       200:
 *         description: Profile deleted.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.post('/', validate(createProfileSchema), controller.createProfile);
router.get('/', controller.getProfile);
router.patch('/', validate(updateProfileSchema), controller.updateProfile);
router.delete('/', controller.deleteProfile);

/**
 * @openapi
 * /profile/me:
 *   get:
 *     tags: [Profile]
 *     summary: Get the current user's profile
 *     responses:
 *       200:
 *         description: Profile.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   patch:
 *     tags: [Profile]
 *     summary: Update the current user's profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Profile' }
 *     responses:
 *       200:
 *         description: Profile updated.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.get('/me', controller.getProfile);
router.patch('/me', validate(updateProfileSchema), controller.updateProfile);

/**
 * @openapi
 * /profile/me/picture:
 *   post:
 *     tags: [Profile]
 *     summary: Upload/replace the current user's profile picture
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Picture uploaded.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *   delete:
 *     tags: [Profile]
 *     summary: Remove the current user's profile picture
 *     responses:
 *       200:
 *         description: Picture removed.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.post('/me/picture', pictureUploadMiddleware.single('file'), controller.uploadProfilePicture);
router.delete('/me/picture', controller.removeProfilePicture);

/**
 * @openapi
 * /profile/search:
 *   get:
 *     tags: [Profile]
 *     summary: Search student profiles (Student Search)
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Matches full name or username (case-insensitive).
 *       - in: query
 *         name: college
 *         schema: { type: string }
 *       - in: query
 *         name: branch
 *         schema: { type: string }
 *       - in: query
 *         name: graduationYear
 *         schema: { type: integer }
 *       - in: query
 *         name: skills
 *         schema: { type: array, items: { type: string } }
 *         style: form
 *         explode: true
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [newest, oldest, name] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated list of matching students.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.get('/search', validate(searchProfilesSchema), controller.searchProfiles);

/**
 * @openapi
 * /profile/username/{username}:
 *   get:
 *     tags: [Profile]
 *     summary: Get a public profile by username
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Public profile.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.get('/username/:username', validate(usernameParamSchema), controller.getPublicProfileByUsername);

/**
 * @openapi
 * /profile/{userId}:
 *   get:
 *     tags: [Profile]
 *     summary: Get a public profile by user ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Public profile.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.get('/:userId', validate(userIdParamSchema), controller.getPublicProfile);

export default router;
