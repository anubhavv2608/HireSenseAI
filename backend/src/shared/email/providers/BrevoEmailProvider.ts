import { config } from '../../config';
import { logger } from '../../config/logger';
import { IEmailProvider } from '../interfaces/IEmailProvider';
import { EmailMessage } from '../types';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

function parseSender(from: string): { name?: string; email: string } {
  const match = from.match(/^(.*)<(.+)>$/);
  if (!match) {
    return { email: from.trim() };
  }
  const name = match[1].trim();
  return { name: name || undefined, email: match[2].trim() };
}

export class BrevoEmailProvider implements IEmailProvider {
  readonly providerName = 'Brevo';

  async send(message: EmailMessage): Promise<void> {
    if (!config.email.brevoApiKey) {
      logger.warn(`[Email] BREVO_API_KEY not configured — skipping send to ${message.to}`);
      return;
    }

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': config.email.brevoApiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: parseSender(config.email.from),
        to: [{ email: message.to }],
        subject: message.subject,
        htmlContent: message.html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Brevo send failed (${response.status}): ${body}`);
    }
  }
}
