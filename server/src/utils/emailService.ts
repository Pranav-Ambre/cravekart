import { env } from '../config/env';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResult {
  sent: boolean;
  provider: 'resend' | 'development_logger';
  messageId?: string;
  previewUrl?: string;
  note?: string;
}

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  if (env.RESEND_API_KEY && env.RESEND_API_KEY.trim() !== '') {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.EMAIL_FROM,
          to: options.to,
          subject: options.subject,
          html: options.html,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as { id?: string };
        return {
          sent: true,
          provider: 'resend',
          messageId: data.id,
        };
      } else {
        const errorText = await response.text();
        console.error('Failed to send email via Resend:', errorText);
        return {
          sent: false,
          provider: 'resend',
          note: `Resend error: ${errorText}`,
        };
      }
    } catch (err: any) {
      console.error('Resend delivery exception:', err.message);
      return {
        sent: false,
        provider: 'resend',
        note: err.message,
      };
    }
  }

  // Safe development logger fallback
  console.log('--------------------------------------------------');
  console.log(`📧 [Dev Email Simulation] To: ${options.to}`);
  console.log(`📧 Subject: ${options.subject}`);
  console.log(`📧 Note: External email credentials not configured.`);
  console.log('--------------------------------------------------');

  return {
    sent: false, // Accurately reports not sent through real mail server
    provider: 'development_logger',
    note: 'Simulated in development mode. Configure RESEND_API_KEY for live delivery.',
  };
}
