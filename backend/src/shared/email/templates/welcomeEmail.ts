import { EmailTemplate } from '../types';
import { emailLayout } from './layout';

export function welcomeEmail(name: string): EmailTemplate {
  return {
    subject: 'Welcome to HireSense AI',
    html: emailLayout(`
      <p style="font-size: 16px; margin: 0 0 16px;">Hi ${name},</p>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
        Welcome to HireSense AI! Your account is ready. Upload a resume to get an instant analysis,
        practice with AI-generated interview questions, and connect with other students in the community.
      </p>
    `),
  };
}
