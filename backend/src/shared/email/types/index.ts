export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
}
