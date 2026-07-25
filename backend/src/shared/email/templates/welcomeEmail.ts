import { EmailTemplate } from '../types';
import { emailLayout } from './layout';

const BRAND_GREEN = '#1c4a35';

interface FeatureRow {
  title: string;
  description: string;
}

const FEATURES: FeatureRow[] = [
  {
    title: 'Daily DSA',
    description:
      'Build a real coding habit — a new problem every day, streak tracking, and a reminder delivered straight to your inbox so you never miss one.',
  },
  {
    title: 'Resume Analysis',
    description: 'Upload your resume for instant, AI-scored feedback across every section, plus a gap analysis against any job description.',
  },
  {
    title: 'Interview Prep',
    description: 'Practice with AI-generated interview questions built from your actual resume and target role.',
  },
  {
    title: 'Community',
    description: 'Add friends, send peer coding challenges, and track where you stand on the leaderboard.',
  },
];

function featureRowHtml({ title, description }: FeatureRow): string {
  return `
    <tr>
      <td style="padding: 12px 0; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #111827;">${title}</p>
        <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #4b5563;">${description}</p>
      </td>
    </tr>
  `;
}

export function welcomeEmail(name: string, dashboardUrl: string): EmailTemplate {
  return {
    subject: 'Welcome to HireSense AI',
    html: emailLayout(`
      <p style="font-size: 16px; margin: 0 0 16px;">Hi ${name},</p>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
        Your account is ready. Here's what you can do next:
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
        ${FEATURES.map(featureRowHtml).join('')}
      </table>
      <a href="${dashboardUrl}" style="display: inline-block; margin-top: 24px; padding: 10px 20px; background: ${BRAND_GREEN}; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">
        Go to your dashboard
      </a>
    `),
  };
}
