export const ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;

export const ADMIN_ROLES = [ROLES.ADMIN, ROLES.SUPER_ADMIN] as const;
