import { EmailTemplate } from '../types';
import { emailLayout } from './layout';

export function friendAcceptedEmail(recipientName: string, accepterName: string, profileUrl: string): EmailTemplate {
  return {
    subject: `${accepterName} accepted your friend request`,
    html: emailLayout(`
      <p style="font-size: 16px; margin: 0 0 16px;">Hi ${recipientName},</p>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
        <strong>${accepterName}</strong> accepted your friend request. You're now connected on HireSense AI.
      </p>
      <a href="${profileUrl}" style="display: inline-block; padding: 10px 20px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px;">
        View profile
      </a>
    `),
  };
}
