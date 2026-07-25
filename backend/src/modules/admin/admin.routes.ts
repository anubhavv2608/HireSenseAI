import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth';
import { authorize } from '../../shared/middleware/authorize';
import { validate } from '../../shared/middleware/validate';
import { ROLES, ADMIN_ROLES } from '../../shared/constants/roles';
import {
  createAssignmentSchema,
  updateAssignmentSchema,
  assignmentIdParamSchema,
} from '../daily-dsa/daily-dsa.validation';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminUsersController } from './admin-users.controller';
import { AdminResumesController } from './admin-resumes.controller';
import { AdminAssignmentsController } from './admin-assignments.controller';
import {
  paginationQuerySchema,
  userListQuerySchema,
  idParamSchema,
  patchUserSchema,
  changeRoleSchema,
} from './admin.validation';

const router = Router();

const dashboardController = new AdminDashboardController();
const usersController = new AdminUsersController();
const resumesController = new AdminResumesController();
const assignmentsController = new AdminAssignmentsController();

router.use(authenticate);

// Shared admin + super_admin routes

/**
 * @openapi
 * /admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Get platform-wide admin dashboard metrics
 *     responses:
 *       200:
 *         description: Admin dashboard summary.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/dashboard', authorize(...ADMIN_ROLES), dashboardController.getDashboard);

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List all users (admin)
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [newest, oldest] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated users.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.get('/users', authorize(...ADMIN_ROLES), validate(userListQuerySchema), usersController.listUsers);

/**
 * @openapi
 * /admin/users/{id}:
 *   patch:
 *     tags: [Admin]
 *     summary: Enable or disable a user account
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isActive]
 *             properties: { isActive: { type: boolean } }
 *     responses:
 *       200:
 *         description: User updated.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 *   delete:
 *     tags: [Admin]
 *     summary: Soft-delete a user account (super_admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User soft-deleted.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.patch('/users/:id', authorize(...ADMIN_ROLES), validate(patchUserSchema), usersController.setActive);

/**
 * @openapi
 * /admin/resumes:
 *   get:
 *     tags: [Admin]
 *     summary: List all resumes (admin)
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated resumes.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.get('/resumes', authorize(...ADMIN_ROLES), validate(paginationQuerySchema), resumesController.listResumes);

/**
 * @openapi
 * /admin/resumes/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Soft-delete a resume (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Resume deleted.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.delete('/resumes/:id', authorize(...ADMIN_ROLES), validate(idParamSchema), resumesController.deleteResume);

/**
 * @openapi
 * /admin/resumes/{id}/reprocess:
 *   post:
 *     tags: [Admin]
 *     summary: Trigger reprocessing of a resume (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Reprocessing triggered.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.post(
  '/resumes/:id/reprocess',
  authorize(...ADMIN_ROLES),
  validate(idParamSchema),
  resumesController.reprocessResume
);

/**
 * @openapi
 * /admin/assignments:
 *   post:
 *     tags: [Admin]
 *     summary: Create a Daily DSA assignment (admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, leetcodeProblemId, leetcodeUrl, difficulty, topic, date]
 *             properties:
 *               title: { type: string }
 *               leetcodeProblemId: { type: string }
 *               leetcodeUrl: { type: string }
 *               difficulty: { type: string, enum: [Easy, Medium, Hard] }
 *               topic: { type: string }
 *               description: { type: string }
 *               date: { type: string, format: date }
 *     responses:
 *       201:
 *         description: Assignment created.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 *   get:
 *     tags: [Admin]
 *     summary: List Daily DSA assignments (admin)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated assignments.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.post(
  '/assignments',
  authorize(...ADMIN_ROLES),
  validate(createAssignmentSchema),
  assignmentsController.createAssignment
);
router.get(
  '/assignments',
  authorize(...ADMIN_ROLES),
  validate(paginationQuerySchema),
  assignmentsController.listAssignments
);

/**
 * @openapi
 * /admin/assignments/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get a single Daily DSA assignment (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Assignment.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 *   patch:
 *     tags: [Admin]
 *     summary: Update a Daily DSA assignment (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               leetcodeProblemId: { type: string }
 *               leetcodeUrl: { type: string }
 *               difficulty: { type: string, enum: [Easy, Medium, Hard] }
 *               topic: { type: string }
 *               description: { type: string }
 *               date: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Assignment updated.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.get(
  '/assignments/:id',
  authorize(...ADMIN_ROLES),
  validate(assignmentIdParamSchema),
  assignmentsController.getAssignment
);
router.patch(
  '/assignments/:id',
  authorize(...ADMIN_ROLES),
  validate(updateAssignmentSchema),
  assignmentsController.updateAssignment
);

/**
 * @openapi
 * /admin/assignments/{id}/publish:
 *   post:
 *     tags: [Admin]
 *     summary: Publish a Daily DSA assignment, sending it out to opted-in students by email
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Assignment published.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.post(
  '/assignments/:id/publish',
  authorize(...ADMIN_ROLES),
  validate(assignmentIdParamSchema),
  assignmentsController.publishAssignment
);

// Super-admin-only routes
// (DELETE /admin/users/{id} is documented above, combined with PATCH /admin/users/{id})
router.delete('/users/:id', authorize(ROLES.SUPER_ADMIN), validate(idParamSchema), usersController.softDeleteUser);

/**
 * @openapi
 * /admin/users/{id}/change-role:
 *   patch:
 *     tags: [Admin]
 *     summary: Change a user's role (super_admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [student, admin, super_admin] }
 *     responses:
 *       200:
 *         description: Role changed.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.patch(
  '/users/:id/change-role',
  authorize(ROLES.SUPER_ADMIN),
  validate(changeRoleSchema),
  usersController.changeRole
);

export default router;
