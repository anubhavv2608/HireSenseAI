import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { FriendsController } from './friends.controller';
import {
  sendFriendRequestSchema,
  friendRequestIdParamSchema,
  friendUserIdParamSchema,
  listFriendsQuerySchema,
  listFriendRequestsQuerySchema,
} from './friends.validation';

const router = Router();
const controller = new FriendsController();

router.use(authenticate);

/**
 * @openapi
 * /friends/requests:
 *   post:
 *     tags: [Friends]
 *     summary: Send a friend request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [targetUserId]
 *             properties: { targetUserId: { type: string } }
 *     responses:
 *       201:
 *         description: Friend request sent.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 *   get:
 *     tags: [Friends]
 *     summary: List incoming or outgoing friend requests
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [incoming, outgoing], default: incoming }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated friend requests.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.post('/requests', validate(sendFriendRequestSchema), controller.sendRequest);
router.get('/requests', validate(listFriendRequestsQuerySchema), controller.listRequests);

/**
 * @openapi
 * /friends/requests/{id}/accept:
 *   post:
 *     tags: [Friends]
 *     summary: Accept an incoming friend request
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Friend request accepted.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.post('/requests/:id/accept', validate(friendRequestIdParamSchema), controller.acceptRequest);

/**
 * @openapi
 * /friends/requests/{id}/reject:
 *   post:
 *     tags: [Friends]
 *     summary: Reject an incoming friend request
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Friend request rejected.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.post('/requests/:id/reject', validate(friendRequestIdParamSchema), controller.rejectRequest);

/**
 * @openapi
 * /friends/requests/{id}/cancel:
 *   post:
 *     tags: [Friends]
 *     summary: Cancel an outgoing friend request
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Friend request cancelled.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.post('/requests/:id/cancel', validate(friendRequestIdParamSchema), controller.cancelRequest);

/**
 * @openapi
 * /friends/status/{userId}:
 *   get:
 *     tags: [Friends]
 *     summary: Get the friend-status between the current user and another user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Friend status (none/pending/friends/etc).
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.get('/status/:userId', validate(friendUserIdParamSchema), controller.getStatus);

/**
 * @openapi
 * /friends/mutual/{userId}:
 *   get:
 *     tags: [Friends]
 *     summary: Get the mutual-friends count between the current user and another user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Mutual friends count.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.get('/mutual/:userId', validate(friendUserIdParamSchema), controller.getMutualCount);

/**
 * @openapi
 * /friends/{userId}:
 *   delete:
 *     tags: [Friends]
 *     summary: Remove an existing friend
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Friend removed.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.delete('/:userId', validate(friendUserIdParamSchema), controller.removeFriend);

/**
 * @openapi
 * /friends:
 *   get:
 *     tags: [Friends]
 *     summary: List the current user's friends
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
 *         description: Paginated friends list.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.get('/', validate(listFriendsQuerySchema), controller.listFriends);

export default router;
