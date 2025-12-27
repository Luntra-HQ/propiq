# Gmail MCP Setup Guide for Password Reset Testing

This guide explains how to set up Gmail MCP integration for automated password reset E2E testing.

## Overview

The Gmail MCP integration allows Playwright tests to:
1. Automatically fetch password reset emails
2. Extract reset tokens from emails
3. Complete the full reset flow without manual intervention

## Prerequisites

- Gmail account: `bdusape@gmail.com`
- Node.js 18+ installed
- Playwright installed (`npm install -D @playwright/test`)

## Setup Steps

### 1. Enable Gmail API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing: "PropIQ Testing"
3. Enable Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

### 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Application type: "Desktop app"
4. Name: "PropIQ Playwright Tests"
5. Click "Create"
6. Download the credentials JSON file
7. Save as `frontend/gmail-credentials.json`

### 3. Install Gmail MCP Server

```bash
# Option A: Use existing MCP server (if you have one configured)
# Your MCP server should already be running at the configured URL

# Option B: Install standalone Gmail MCP package (if available)
npm install -D @modelcontextprotocol/server-gmail

# Option C: Use Gmail API directly in Playwright
npm install -D googleapis
```

### 4. Configure Environment Variables

Add to `frontend/.env.local`:

```bash
# Gmail MCP Configuration
GMAIL_MCP_SERVER_URL=http://localhost:3000
GMAIL_MCP_API_KEY=your-mcp-api-key

# Or if using Gmail API directly:
GMAIL_CREDENTIALS_PATH=./gmail-credentials.json
GMAIL_TOKEN_PATH=./gmail-token.json

# Test user credentials
TEST_USER_EMAIL=bdusape@gmail.com
TEST_USER_PASSWORD=your-current-password
```

### 5. Authenticate Gmail Access (First Time Only)

```bash
cd frontend
node tests/gmail-auth-setup.js
```

This will:
1. Open a browser window
2. Ask you to sign in to Gmail
3. Grant permissions to read emails
4. Save the refresh token for future use

### 6. Run the Password Reset Test

```bash
# Run the Gmail-integrated password reset test
npm run test:password-reset-gmail

# Or run directly with Playwright
npx playwright test password-reset-with-gmail.spec.ts --headed
```

## Alternative: Using Your Existing Gmail MCP

If you already have a Gmail MCP server set up, you can use it directly:

### Update the Test File

In `tests/password-reset-with-gmail.spec.ts`, update the `waitForResetEmail` function:

```typescript
async function waitForResetEmail(maxAttempts = 10, delayMs = 3000): Promise<string | null> {
  const mcpServerUrl = process.env.GMAIL_MCP_SERVER_URL || 'http://localhost:3000';

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Call your MCP server
      const response = await fetch(`${mcpServerUrl}/api/gmail/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GMAIL_MCP_API_KEY}`,
        },
        body: JSON.stringify({
          query: 'from:noreply@luntra.one subject:"Reset Your PropIQ Password" newer_than:5m',
          maxResults: 1,
        }),
      });

      const data = await response.json();

      if (data.emails && data.emails.length > 0) {
        const emailHtml = data.emails[0].html || data.emails[0].body;
        const token = extractResetToken(emailHtml);

        if (token) {
          console.log('✅ Reset token found in email');
          return token;
        }
      }

      await new Promise(resolve => setTimeout(resolve, delayMs));
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
    }
  }

  return null;
}
```

## Quick Start (Using Gmail API Directly)

If you don't want to set up an MCP server, you can use the Gmail API directly:

### 1. Create Helper File

Create `frontend/tests/helpers/gmail-client.ts`:

```typescript
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = path.join(__dirname, '../../gmail-token.json');
const CREDENTIALS_PATH = path.join(__dirname, '../../gmail-credentials.json');

export async function getRecentEmails(query: string, maxResults: number = 5) {
  const auth = await authorize();
  const gmail = google.gmail({ version: 'v1', auth });

  const res = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults,
  });

  const messages = res.data.messages || [];
  const emails = [];

  for (const message of messages) {
    const msg = await gmail.users.messages.get({
      userId: 'me',
      id: message.id!,
      format: 'full',
    });

    emails.push(msg.data);
  }

  return emails;
}

async function authorize() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  try {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    oAuth2Client.setCredentials(token);
  } catch (err) {
    throw new Error('Gmail token not found. Run gmail-auth-setup.js first.');
  }

  return oAuth2Client;
}
```

### 2. Update Test to Use Gmail Client

```typescript
import { getRecentEmails } from './helpers/gmail-client';

async function waitForResetEmail(maxAttempts = 10, delayMs = 3000): Promise<string | null> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const emails = await getRecentEmails(
        'from:noreply@luntra.one subject:"Reset Your PropIQ Password" newer_than:5m',
        1
      );

      if (emails.length > 0) {
        const emailHtml = emails[0].payload?.parts?.[1]?.body?.data || '';
        const decodedHtml = Buffer.from(emailHtml, 'base64').toString('utf-8');
        const token = extractResetToken(decodedHtml);

        if (token) return token;
      }

      await new Promise(resolve => setTimeout(resolve, delayMs));
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
    }
  }

  return null;
}
```

## Testing

### Run Tests

```bash
# Run all password reset tests (including Gmail integration)
npm run test:password-reset

# Run only Gmail-integrated test
npm run test:password-reset-gmail

# Run with headed browser (see what's happening)
npm run test:password-reset-gmail -- --headed

# Run with debug mode
PWDEBUG=1 npm run test:password-reset-gmail
```

### Expected Output

```
=== STEP 1: Request Password Reset ===
✅ Password reset requested successfully

=== STEP 2: Fetch Email from Gmail ===
📧 Waiting for email to bdusape@gmail.com...
[Gmail] Attempt 1/10...
[Gmail] Attempt 2/10...
✅ Reset token found in email

=== STEP 3: Navigate to Reset Link ===
✅ Token verified successfully

=== STEP 4: Reset Password ===
✅ Password reset successful
✅ Redirected to login page

=== STEP 5: Verify New Password Works ===
✅ Successfully logged in with new password

=== TEST COMPLETE ===
New password: NewPassword1735175234567!@#Abc
💡 Save this password for future tests!
```

## Troubleshooting

### "Gmail MCP not accessible"
- Ensure MCP server is running
- Check `GMAIL_MCP_SERVER_URL` environment variable
- Verify API key is correct

### "Gmail token not found"
- Run `node tests/gmail-auth-setup.js` to authenticate
- Check that `gmail-token.json` exists
- Verify credentials file is in the correct location

### "No emails found"
- Wait longer (emails can take 5-30 seconds to arrive)
- Check spam folder in Gmail
- Verify Resend is working (`npm run test:resend-health`)
- Check Convex logs: `npx convex logs --history 20`

### "Token extraction failed"
- Check email HTML format
- Update `extractResetToken` regex if email template changed
- Log the raw email HTML to debug

## Security Notes

⚠️ **IMPORTANT:**
- **Never commit** `gmail-credentials.json` or `gmail-token.json` to git
- Add to `.gitignore`:
  ```
  gmail-credentials.json
  gmail-token.json
  ```
- Use environment variables for sensitive data
- Rotate credentials regularly
- Use separate test Gmail account (not production)

## Next Steps

1. ✅ Set up Gmail API access
2. ✅ Run authentication setup
3. ✅ Run password reset test
4. Add to CI/CD pipeline (optional)
5. Create similar tests for:
   - Email verification
   - Welcome emails
   - Notification emails

## Support

If you encounter issues:
1. Check Playwright documentation: https://playwright.dev
2. Check Gmail API docs: https://developers.google.com/gmail/api
3. Review test output and error messages
4. Check Convex logs for backend issues

---

**Happy Testing!** 🎭📧
