import { EmailTemplate } from '../types';
import { emailLayout } from './layout';

export function friendRequestEmail(recipientName: string, requesterName: string, profileUrl: string): EmailTemplate {
  return {
    subject: `${requesterName} sent you a friend request`,
    html: emailLayout(`
      <p style="font-size: 16px; margin: 0 0 16px;">Hi ${recipientName},</p>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
        <strong>${requesterName}</strong> would like to connect with you on HireSense AI.
      </p>
      <a href="${profileUrl}" style="display: inline-block; padding: 10px 20px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px;">
        View request
      </a>
    `),
  };
}
