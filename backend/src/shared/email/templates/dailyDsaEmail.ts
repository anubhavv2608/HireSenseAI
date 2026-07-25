import { EmailTemplate } from '../types';
import { emailLayout } from './layout';

export interface DailyDsaEmailProblem {
  title: string;
  leetcodeUrl: string;
  difficulty: string;
  topic: string;
}

export function dailyDsaEmail(recipientName: string, problem: DailyDsaEmailProblem, dailyDsaUrl: string): EmailTemplate {
  return {
    subject: `Today's DSA problem: ${problem.title}`,
    html: emailLayout(`
      <p style="font-size: 16px; margin: 0 0 16px;">Hi ${recipientName},</p>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
        Today's Daily DSA problem is ready: <strong>${problem.title}</strong> (${problem.difficulty} · ${problem.topic}).
      </p>
      <a href="${problem.leetcodeUrl}" style="display: inline-block; padding: 10px 20px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; margin-right: 8px;">
        Solve on LeetCode
      </a>
      <a href="${dailyDsaUrl}" style="display: inline-block; padding: 10px 20px; border: 1px solid #d1d5db; color: #111827; text-decoration: none; border-radius: 6px; font-size: 14px;">
        Mark complete
      </a>
      <p style="margin-top: 24px; font-size: 12px; color: #6b7280;">
        You can turn these emails off anytime from the Daily DSA page.
      </p>
    `),
  };
}
