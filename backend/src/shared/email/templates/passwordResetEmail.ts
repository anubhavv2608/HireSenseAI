import { EmailTemplate } from '../types';
import { emailLayout } from './layout';

export function passwordResetEmail(resetUrl: string): EmailTemplate {
  return {
    subject: 'Reset your HireSense AI password',
    html: emailLayout(`
      <p style="font-size: 16px; margin: 0 0 16px;">Hi,</p>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
        We received a request to reset your HireSense AI password. Click the button below to choose a new one.
        This link expires shortly, and if you didn't request this, you can safely ignore this email.
      </p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px;">
        Reset password
      </a>
    `),
  };
}
