import { EmailTemplate } from '../types';
import { emailLayout } from './layout';

export function challengeReceivedEmail(recipientName: string, challengerName: string, problemTitle: string, challengesUrl: string): EmailTemplate {
  return {
    subject: `${challengerName} challenged you: "${problemTitle}"`,
    html: emailLayout(`
      <p style="font-size: 16px; margin: 0 0 16px;">Hi ${recipientName},</p>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
        <strong>${challengerName}</strong> challenged you to solve <strong>${problemTitle}</strong> on HireSense AI.
      </p>
      <a href="${challengesUrl}" style="display: inline-block; padding: 10px 20px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px;">
        View challenge
      </a>
    `),
  };
}

export function challengeAcceptedEmail(recipientName: string, accepterName: string, problemTitle: string, challengesUrl: string): EmailTemplate {
  return {
    subject: `${accepterName} accepted your challenge`,
    html: emailLayout(`
      <p style="font-size: 16px; margin: 0 0 16px;">Hi ${recipientName},</p>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
        <strong>${accepterName}</strong> accepted your challenge on <strong>${problemTitle}</strong>. Good luck!
      </p>
      <a href="${challengesUrl}" style="display: inline-block; padding: 10px 20px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px;">
        View challenge
      </a>
    `),
  };
}
