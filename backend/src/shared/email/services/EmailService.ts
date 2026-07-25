import { config } from '../../config';
import { logger } from '../../config/logger';
import { IEmailProvider } from '../interfaces/IEmailProvider';
import { ResendEmailProvider } from '../providers/ResendEmailProvider';
import { SmtpEmailProvider } from '../providers/SmtpEmailProvider';
import { EmailMessage } from '../types';

function createDefaultProvider(): IEmailProvider {
  if (config.email.provider === 'gmail' || config.email.provider === 'smtp') {
    return new SmtpEmailProvider();
  }
  return new ResendEmailProvider();
}

export class EmailService {
  private provider: IEmailProvider;

  constructor(provider?: IEmailProvider) {
    this.provider = provider || createDefaultProvider();
  }

  setProvider(provider: IEmailProvider): void {
    this.provider = provider;
  }

  getProviderName(): string {
    return this.provider.providerName;
  }

  async send(message: EmailMessage): Promise<void> {
    return this.provider.send(message);
  }

  /** Fire-and-forget send — never throws, never blocks the caller. Use this from
   * request/response paths so an email-provider outage can't break the underlying
   * action (registration, friend request, etc). */
  sendInBackground(message: EmailMessage): void {
    void this.send(message).catch((error: unknown) => {
      const messageText = error instanceof Error ? error.message : String(error);
      logger.error(`[Email] Failed to send to ${message.to}: ${messageText}`);
    });
  }
}
