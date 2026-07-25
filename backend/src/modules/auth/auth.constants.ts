export const AUTH_CONSTANTS = {
  SALT_ROUNDS: 12,
  RESET_TOKEN_EXPIRATION_HOURS: 1,
  REFRESH_TOKEN_COOKIE_NAME: 'refreshToken',
} as const;

export const AUTH_MESSAGES = {
  REGISTER_SUCCESS: 'User registered successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
  REFRESH_SUCCESS: 'Token refreshed successfully',
  FORGOT_PASSWORD_SUCCESS: 'If the email exists, a password reset link has been generated',
  RESET_PASSWORD_SUCCESS: 'Password reset successfully',
  EMAIL_ALREADY_EXISTS: 'User with this email already exists',
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  INVALID_REFRESH_TOKEN: 'Invalid or expired refresh token',
  INVALID_RESET_TOKEN: 'Invalid or expired password reset token',
  INVALID_USERNAME: 'Username must be 3-25 characters: lowercase letters, numbers, and underscores only (no leading/trailing or double underscores)',
  USERNAME_TAKEN: 'This username is already taken',
  USERNAME_UPDATED: 'Username updated successfully',
  USERNAME_AVAILABILITY_CHECKED: 'Username availability checked',
  GOOGLE_ACCOUNT_NOT_FOUND: 'No account found for this email. Please sign up first.',
  GOOGLE_ACCOUNT_ALREADY_EXISTS: 'An account with this email already exists. Please sign in instead.',
} as const;
