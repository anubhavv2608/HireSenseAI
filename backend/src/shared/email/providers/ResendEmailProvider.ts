import { Resend } from 'resend';
import { config } from '../../config';
import { logger } from '../../config/logger';
import { IEmailProvider } from '../interfaces/IEmailProvider';
import { EmailMessage } from '../types';

export class ResendEmailProvider implements IEmailProvider {
  readonly providerName = 'Resend';
  private client: Resend | null;

  constructor() {
    this.client = config.email.apiKey ? new Resend(config.email.apiKey) : null;
  }

  async send(message: EmailMessage): Promise<void> {
    if (!this.client) {
      logger.warn(`[Email] RESEND_API_KEY not configured — skipping send to ${message.to}`);
      return;
    }

    const { error } = await this.client.emails.send({
      from: config.email.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
    });

    if (error) {
      throw new Error(`Resend send failed: ${error.message}`);
    }
  }
}
