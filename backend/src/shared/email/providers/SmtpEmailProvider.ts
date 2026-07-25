import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../../config';
import { logger } from '../../config/logger';
import { IEmailProvider } from '../interfaces/IEmailProvider';
import { EmailMessage } from '../types';

const DEFAULT_SMTP_PORT = 587;

export class SmtpEmailProvider implements IEmailProvider {
  readonly providerName = 'SMTP';
  private transporter: Transporter | null;

  constructor() {
    const { host, user, pass } = config.email.smtp;
    const port = config.email.smtp.port ?? DEFAULT_SMTP_PORT;

    this.transporter =
      host && user && pass
        ? nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
          })
        : null;
  }

  async send(message: EmailMessage): Promise<void> {
    if (!this.transporter) {
      logger.warn(`[Email] SMTP not configured — skipping send to ${message.to}`);
      return;
    }

    await this.transporter.sendMail({
      from: config.email.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
    });
  }
}
