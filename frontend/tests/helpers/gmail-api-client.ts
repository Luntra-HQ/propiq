/**
 * Direct Gmail API Client for E2E Testing
 *
 * Uses Google's official googleapis library to fetch emails.
 * Much simpler than MCP protocol - just direct API calls.
 */

import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';

const CREDENTIALS_PATH = path.join(homedir(), '.gmail-mcp', 'credentials.json');
const TOKEN_PATH = path.join(homedir(), '.gmail-mcp', 'token.json');

interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  html: string;
  date: Date;
}

/**
 * Gmail API Client
 */
export class GmailAPIClient {
  private gmail: any;
  private auth: any;

  /**
   * Initialize the Gmail client with OAuth credentials
   */
  async initialize(): Promise<void> {
    console.log('[Gmail API] Initializing client...');

    // Load credentials
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));

    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

    // Create OAuth2 client
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Load saved token
    try {
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
      oAuth2Client.setCredentials(token);
      console.log('[Gmail API] Loaded existing token');
    } catch (error) {
      throw new Error('No token found. Please authenticate first.');
    }

    this.auth = oAuth2Client;
    this.gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    console.log('[Gmail API] Client initialized successfully');
  }

  /**
   * Search for emails matching a query
   */
  async searchEmails(query: string, maxResults: number = 10): Promise<Email[]> {
    console.log('[Gmail API] Searching:', query);

    const response = await this.gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults,
    });

    const messages = response.data.messages || [];
    console.log(`[Gmail API] Found ${messages.length} messages`);

    if (messages.length === 0) {
      return [];
    }

    // Fetch full message details
    const emails: Email[] = [];
    for (const message of messages) {
      const email = await this.getEmail(message.id);
      if (email) {
        emails.push(email);
      }
    }

    return emails;
  }

  /**
   * Get a specific email by ID
   */
  async getEmail(messageId: string): Promise<Email | null> {
    console.log('[Gmail API] Fetching email:', messageId);

    const response = await this.gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });

    const message = response.data;

    // Extract headers
    const headers = message.payload.headers;
    const from = headers.find((h: any) => h.name === 'From')?.value || '';
    const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
    const date = new Date(parseInt(message.internalDate));

    // Extract body (handle multipart)
    let body = '';
    let html = '';

    const extractBody = (part: any): void => {
      if (part.mimeType === 'text/plain' && part.body.data) {
        body += Buffer.from(part.body.data, 'base64').toString('utf-8');
      } else if (part.mimeType === 'text/html' && part.body.data) {
        html += Buffer.from(part.body.data, 'base64').toString('utf-8');
      } else if (part.parts) {
        part.parts.forEach(extractBody);
      }
    };

    if (message.payload.parts) {
      message.payload.parts.forEach(extractBody);
    } else if (message.payload.body.data) {
      // Single part message
      const content = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
      if (message.payload.mimeType === 'text/html') {
        html = content;
      } else {
        body = content;
      }
    }

    return {
      id: message.id,
      from,
      subject,
      body,
      html,
      date,
    };
  }
}

/**
 * Extract reset token from email HTML
 */
export function extractResetToken(html: string): string | null {
  // Match the reset-password?token=XXXXX pattern (64 hex characters)
  const tokenMatch = html.match(/reset-password\?token=([a-f0-9]{64})/i);
  return tokenMatch ? tokenMatch[1] : null;
}

/**
 * Wait for password reset email and extract token
 */
export async function waitForPasswordResetEmail(
  email: string,
  maxAttempts: number = 10,
  delayMs: number = 3000
): Promise<string | null> {
  console.log(`[Gmail] Waiting for password reset email to ${email}...`);

  const client = new GmailAPIClient();
  await client.initialize();

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`[Gmail] Attempt ${attempt}/${maxAttempts}...`);

    try {
      // Search for recent password reset emails
      const emails = await client.searchEmails(
        `from:noreply@luntra.one subject:"Reset Your PropIQ Password" to:${email} newer_than:5m`,
        1
      );

      if (emails && emails.length > 0) {
        console.log('[Gmail] Found password reset email!');

        const resetEmail = emails[0];
        const token = extractResetToken(resetEmail.html || resetEmail.body);

        if (token) {
          console.log('[Gmail] ✅ Successfully extracted reset token');
          return token;
        } else {
          console.log('[Gmail] ⚠️ Email found but no token extracted');
          console.log('[Gmail] Email HTML preview:', (resetEmail.html || resetEmail.body).substring(0, 500));
        }
      } else {
        console.log('[Gmail] No emails found yet...');
      }

      // Wait before next attempt
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`[Gmail] Error on attempt ${attempt}:`, error);
    }
  }

  console.log('[Gmail] ❌ Failed to find password reset email after', maxAttempts, 'attempts');
  return null;
}
