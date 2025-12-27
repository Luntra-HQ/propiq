/**
 * Gmail MCP Client for Playwright Tests
 *
 * Uses the existing Gmail MCP server at /Users/briandusape/gmail-mcp-server
 * to fetch emails during E2E tests.
 */

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

interface Email {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  snippet: string;
  body?: string;
  html?: string;
  date: string;
}

interface MCPResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

/**
 * Gmail MCP Client
 * Communicates with the local Gmail MCP server via stdio
 */
export class GmailMCPClient extends EventEmitter {
  private process: ChildProcess | null = null;
  private requestId = 0;
  private pendingRequests = new Map<number, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }>();

  /**
   * Start the Gmail MCP server
   */
  async start(): Promise<void> {
    const serverPath = '/Users/briandusape/gmail-mcp-server/dist/index.js';

    console.log('[Gmail MCP] Starting server:', serverPath);

    this.process = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    if (!this.process.stdout || !this.process.stdin) {
      throw new Error('Failed to create MCP server process');
    }

    // Buffer for incomplete JSON
    let buffer = '';

    this.process.stdout.on('data', (data) => {
      buffer += data.toString();

      // Try to parse complete JSON messages
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const response = JSON.parse(line);
          this.handleResponse(response);
        } catch (e) {
          console.error('[Gmail MCP] Failed to parse response:', line, e);
        }
      }
    });

    this.process.stderr?.on('data', (data) => {
      console.error('[Gmail MCP] Server error:', data.toString());
    });

    this.process.on('exit', (code) => {
      console.log('[Gmail MCP] Server exited with code:', code);
    });

    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('[Gmail MCP] Server started');
  }

  /**
   * Stop the Gmail MCP server
   */
  async stop(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.process = null;
      console.log('[Gmail MCP] Server stopped');
    }
  }

  /**
   * Send a request to the MCP server
   */
  private async sendRequest(method: string, params: any): Promise<any> {
    if (!this.process || !this.process.stdin) {
      throw new Error('MCP server not started');
    }

    const id = ++this.requestId;
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });

      const requestStr = JSON.stringify(request) + '\n';
      this.process!.stdin!.write(requestStr);

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Request ${id} timed out`));
        }
      }, 30000);
    });
  }

  /**
   * Handle response from MCP server
   */
  private handleResponse(response: any): void {
    if (response.id && this.pendingRequests.has(response.id)) {
      const { resolve, reject } = this.pendingRequests.get(response.id)!;
      this.pendingRequests.delete(response.id);

      if (response.error) {
        reject(new Error(response.error.message || 'MCP request failed'));
      } else {
        resolve(response.result);
      }
    }
  }

  /**
   * Search for emails using Gmail query syntax
   *
   * @param query Gmail search query (e.g., "from:noreply@luntra.one subject:Reset newer_than:5m")
   * @param maxResults Maximum number of results to return
   * @returns Array of emails
   */
  async searchEmails(query: string, maxResults: number = 10): Promise<Email[]> {
    console.log('[Gmail MCP] Searching:', query);

    try {
      const response: MCPResponse = await this.sendRequest('tools/call', {
        name: 'list_emails',
        arguments: {
          query,
          max_results: maxResults,
        },
      });

      // Parse the response
      if (response.content && response.content.length > 0) {
        const text = response.content[0].text;

        // The response might be formatted text, try to parse it
        try {
          const emails = JSON.parse(text);
          console.log('[Gmail MCP] Found emails:', emails.length);
          return emails;
        } catch (e) {
          // Response might be plain text description
          console.log('[Gmail MCP] Response:', text);
          return [];
        }
      }

      return [];
    } catch (error) {
      console.error('[Gmail MCP] Search failed:', error);
      return [];
    }
  }

  /**
   * Get email content by ID
   *
   * @param messageId Gmail message ID
   * @returns Email with full body content
   */
  async getEmail(messageId: string): Promise<Email | null> {
    console.log('[Gmail MCP] Getting email:', messageId);

    try {
      const response: MCPResponse = await this.sendRequest('tools/call', {
        name: 'get_email',
        arguments: {
          message_id: messageId,
        },
      });

      if (response.content && response.content.length > 0) {
        const text = response.content[0].text;

        try {
          return JSON.parse(text);
        } catch (e) {
          console.log('[Gmail MCP] Email content:', text);
          return null;
        }
      }

      return null;
    } catch (error) {
      console.error('[Gmail MCP] Get email failed:', error);
      return null;
    }
  }
}

/**
 * Extract reset token from email HTML
 */
export function extractResetToken(html: string): string | null {
  // Match the reset-password?token=XXXXX pattern
  const tokenMatch = html.match(/reset-password\?token=([a-f0-9]{64})/i);
  return tokenMatch ? tokenMatch[1] : null;
}

/**
 * Wait for password reset email and extract token
 *
 * @param client Gmail MCP client
 * @param email Email address to check
 * @param maxAttempts Maximum number of attempts
 * @param delayMs Delay between attempts in milliseconds
 * @returns Reset token or null
 */
export async function waitForPasswordResetEmail(
  client: GmailMCPClient,
  email: string,
  maxAttempts: number = 10,
  delayMs: number = 3000
): Promise<string | null> {
  console.log(`[Gmail] Waiting for password reset email to ${email}...`);

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

        // Get full email content
        const fullEmail = await client.getEmail(emails[0].id);

        if (fullEmail && fullEmail.html) {
          const token = extractResetToken(fullEmail.html);

          if (token) {
            console.log('[Gmail] ✅ Successfully extracted reset token');
            return token;
          } else {
            console.log('[Gmail] ⚠️ Email found but no token extracted');
            console.log('[Gmail] Email HTML preview:', fullEmail.html.substring(0, 500));
          }
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
