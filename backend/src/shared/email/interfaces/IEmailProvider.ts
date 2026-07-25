import { EmailMessage } from '../types';

export interface IEmailProvider {
  readonly providerName: string;
  send(message: EmailMessage): Promise<void>;
}
