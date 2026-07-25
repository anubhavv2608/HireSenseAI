export const ADMIN_MESSAGES = {
  DASHBOARD_FETCHED: 'Admin dashboard retrieved',
  USERS_FETCHED: 'Users retrieved',
  USER_UPDATED: 'User updated',
  USER_DELETED: 'User deleted',
  USER_NOT_FOUND: 'User not found',
  USER_ROLE_UPDATED: 'User role updated',
  CANNOT_MODIFY_SELF: 'You cannot perform this action on your own account',
  CANNOT_MODIFY_SUPER_ADMIN: 'You do not have permission to modify a super admin',
  CANNOT_MODIFY_ADMIN_ROLE: "You do not have permission to modify another admin's role",
  RESUMES_FETCHED: 'Resumes retrieved',
  RESUME_DELETED: 'Resume deleted',
  RESUME_NOT_FOUND: 'Resume not found',
  ASSIGNMENT_CREATED: 'Assignment created',
  ASSIGNMENT_UPDATED: 'Assignment updated',
  ASSIGNMENT_PUBLISHED: 'Assignment published',
  ASSIGNMENT_NOT_FOUND: 'Assignment not found',
  ASSIGNMENT_ALREADY_PUBLISHED: 'Cannot edit a published assignment',
  ASSIGNMENTS_FETCHED: 'Assignments retrieved',
} as const;

export const ACTIVE_SINCE_DAYS = 30;
export const RECENT_ACTIVITY_LIMIT = 10;
