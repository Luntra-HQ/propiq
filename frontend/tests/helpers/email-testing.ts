/**
 * Email Testing Helpers
 *
 * Provides utilities for testing email functionality with different strategies:
 * 1. Mailosaur (recommended for CI/CD)
 * 2. Ethereal Email (free, good for development)
 * 3. Real test account (manual verification)
 */

export interface EmailMessage {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface ResetPasswordEmail extends EmailMessage {
  resetLink: string;
  token: string;
  expiresAt: number;
}

/**
 * Extract reset token from email HTML
 */
export function extractResetToken(emailHtml: string): string | null {
  // Look for reset-password?token=XXX pattern
  const tokenMatch = emailHtml.match(/reset-password\?token=([a-f0-9]{64})/i);
  return tokenMatch ? tokenMatch[1] : null;
}

/**
 * Extract reset link from email HTML
 */
export function extractResetLink(emailHtml: string): string | null {
  // Look for full reset link
  const linkMatch = emailHtml.match(/(https?:\/\/[^"'\s]+\/reset-password\?token=[a-f0-9]{64})/i);
  return linkMatch ? linkMatch[1] : null;
}

/**
 * Validate reset email content
 */
export function validateResetEmail(email: EmailMessage): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!email.subject.toLowerCase().includes('reset')) {
    errors.push('Email subject should mention "reset"');
  }

  if (!email.html || !email.html.includes('reset-password?token=')) {
    errors.push('Email should contain reset link');
  }

  if (!email.from.includes('PropIQ') && !email.from.includes('noreply@luntra.one')) {
    errors.push('Email should be from PropIQ <noreply@luntra.one>');
  }

  if (!email.html.includes('15 minutes') && !email.html.includes('15 min')) {
    errors.push('Email should mention expiration time');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Mailosaur Email Testing
 * Requires MAILOSAUR_API_KEY environment variable
 */
export class MailosaurHelper {
  private apiKey: string;
  private serverId: string;
  private baseUrl = 'https://mailosaur.com/api';

  constructor(apiKey?: string, serverId?: string) {
    this.apiKey = apiKey || process.env.MAILOSAUR_API_KEY || '';
    this.serverId = serverId || process.env.MAILOSAUR_SERVER_ID || '';

    if (!this.apiKey) {
      throw new Error('MAILOSAUR_API_KEY environment variable is required');
    }
    if (!this.serverId) {
      throw new Error('MAILOSAUR_SERVER_ID environment variable is required');
    }
  }

  /**
   * Generate a test email address
   */
  getTestEmail(prefix: string = 'test'): string {
    const timestamp = Date.now();
    return `${prefix}-${timestamp}@${this.serverId}.mailosaur.net`;
  }

  /**
   * Wait for and retrieve password reset email
   */
  async getPasswordResetEmail(email: string, timeout: number = 30000): Promise<ResetPasswordEmail | null> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch(
          `${this.baseUrl}/messages?server=${this.serverId}`,
          {
            headers: {
              'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Mailosaur API error: ${response.status}`);
        }

        const data = await response.json();
        const message = data.items.find((m: any) =>
          m.to.some((t: any) => t.email === email) &&
          m.subject.toLowerCase().includes('reset')
        );

        if (message) {
          const html = message.html?.body || '';
          const resetLink = extractResetLink(html);
          const token = extractResetToken(html);

          if (!resetLink || !token) {
            throw new Error('Could not extract reset link or token from email');
          }

          return {
            from: message.from[0].email,
            to: email,
            subject: message.subject,
            html,
            text: message.text?.body,
            resetLink,
            token,
            expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
          };
        }
      } catch (error) {
        console.error('Error fetching email:', error);
      }

      // Wait 2 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return null;
  }

  /**
   * Delete all messages for testing cleanup
   */
  async deleteAllMessages(): Promise<void> {
    await fetch(`${this.baseUrl}/messages?server=${this.serverId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
      },
    });
  }
}

/**
 * Ethereal Email Testing (Free)
 * Creates temporary test email accounts
 */
export class EtherealHelper {
  /**
   * Create a temporary test email account
   */
  static async createTestAccount(): Promise<{
    email: string;
    password: string;
    webUrl: string;
  }> {
    const response = await fetch('https://api.nodemailer.com/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to create Ethereal test account');
    }

    const account = await response.json();

    return {
      email: account.user,
      password: account.pass,
      webUrl: 'https://ethereal.email/messages',
    };
  }

  /**
   * Get test email info (requires manual verification via web interface)
   */
  static getManualVerificationUrl(): string {
    return 'https://ethereal.email/messages';
  }
}

/**
 * Mock Email Testing
 * For unit tests where actual email sending is not needed
 */
export class MockEmailHelper {
  private sentEmails: EmailMessage[] = [];

  /**
   * Record a sent email (for mocking)
   */
  recordEmail(email: EmailMessage): void {
    this.sentEmails.push(email);
  }

  /**
   * Get all sent emails
   */
  getSentEmails(): EmailMessage[] {
    return this.sentEmails;
  }

  /**
   * Get reset password emails
   */
  getResetPasswordEmails(): ResetPasswordEmail[] {
    return this.sentEmails
      .filter(email => email.subject.toLowerCase().includes('reset'))
      .map(email => {
        const resetLink = extractResetLink(email.html);
        const token = extractResetToken(email.html);

        if (!resetLink || !token) {
          throw new Error('Invalid reset password email format');
        }

        return {
          ...email,
          resetLink,
          token,
          expiresAt: Date.now() + 15 * 60 * 1000,
        };
      });
  }

  /**
   * Clear all sent emails
   */
  clear(): void {
    this.sentEmails = [];
  }

  /**
   * Get reset email by recipient
   */
  getResetEmailForRecipient(email: string): ResetPasswordEmail | null {
    const resetEmails = this.getResetPasswordEmails();
    return resetEmails.find(e => e.to === email) || null;
  }
}

/**
 * Factory function to create appropriate email helper based on environment
 */
export function createEmailHelper(): MailosaurHelper | MockEmailHelper {
  if (process.env.MAILOSAUR_API_KEY && process.env.MAILOSAUR_SERVER_ID) {
    return new MailosaurHelper();
  }

  console.warn('⚠️  Using MockEmailHelper - no real email testing. Set MAILOSAUR_API_KEY and MAILOSAUR_SERVER_ID for real email testing.');
  return new MockEmailHelper();
}

/**
 * Resend Test Mode Helper
 * Check if email was sent via Resend (requires Resend API access)
 */
export class ResendHelper {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.RESEND_API_KEY || '';

    if (!this.apiKey) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }
  }

  /**
   * List recent emails sent via Resend
   */
  async listEmails(): Promise<any[]> {
    const response = await fetch('https://api.resend.com/emails', {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Get a specific email by ID
   */
  async getEmail(emailId: string): Promise<any> {
    const response = await fetch(`https://api.resend.com/emails/${emailId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Find reset password email sent to specific address
   */
  async findResetEmail(toEmail: string, sinceTimestamp: number): Promise<any | null> {
    const emails = await this.listEmails();

    return emails.find(email =>
      email.to.includes(toEmail) &&
      email.subject.includes('Reset') &&
      new Date(email.created_at).getTime() >= sinceTimestamp
    ) || null;
  }
}
