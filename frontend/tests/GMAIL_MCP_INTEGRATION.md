# Gmail MCP Integration for Password Reset Testing

## ✅ Setup Complete!

Your Gmail MCP server is already configured and authenticated at:
```
/Users/briandusape/gmail-mcp-server/
/Users/briandusape/.gmail-mcp/  (credentials & tokens)
```

## 🚀 Quick Start

### Run the Test

```bash
cd /Users/briandusape/Projects/propiq/frontend

# Run with headed browser (recommended for first time)
npm run test:password-reset:gmail:headed

# Run in headless mode
npm run test:password-reset:gmail

# Run with debug mode
npm run test:password-reset:gmail:debug
```

### What the Test Does

1. **Starts Gmail MCP Server** - Connects to your existing server
2. **Requests Password Reset** - Submits email via web UI
3. **Fetches Email from Gmail** - Uses MCP to search for reset email
4. **Extracts Reset Token** - Parses the email HTML
5. **Completes Reset Flow** - Sets new password and verifies login

## 📋 Test Output

Expected console output:

```
=== STEP 1: Request Password Reset ===
✅ Password reset requested successfully

=== STEP 2: Fetch Email from Gmail ===
[Gmail MCP] Starting server: /Users/briandusape/gmail-mcp-server/dist/index.js
[Gmail MCP] Server started
📧 Waiting for email to bdusape@gmail.com...
[Gmail] Attempt 1/10...
[Gmail MCP] Searching: from:noreply@luntra.one subject:"Reset Your PropIQ Password" to:bdusape@gmail.com newer_than:5m
[Gmail MCP] Found emails: 1
[Gmail] Found password reset email!
[Gmail MCP] Getting email: 18d4f2c8a1b3e9f0
[Gmail] ✅ Successfully extracted reset token
✅ Reset token extracted: 919a58234523f988004d2d4982fec2122726a661b231eecd1673b1b3f003bce6

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

## 🔧 Troubleshooting

### Gmail MCP Server Not Starting

**Error:** `Failed to create MCP server process`

**Solution:**
```bash
# Rebuild the MCP server
cd /Users/briandusape/gmail-mcp-server
npm run build

# Verify dist/index.js exists
ls -la dist/index.js
```

### No Emails Found

**Error:** `Failed to find password reset email after 10 attempts`

**Possible causes:**
1. **Email not sent** - Check Convex logs:
   ```bash
   cd /Users/briandusape/Projects/propiq
   npx convex logs --deployment-name mild-tern-361 --history 20 | grep -i "reset\|email"
   ```

2. **Gmail MCP credentials expired** - Re-authenticate:
   ```bash
   rm /Users/briandusape/.gmail-mcp/token.pickle
   # Run test again, will open browser for auth
   ```

3. **Wrong email address** - Verify test is using `bdusape@gmail.com`

4. **Email delayed** - Increase max attempts or delay:
   ```typescript
   // In test file, increase timeout:
   const resetToken = await waitForPasswordResetEmail(gmailClient, TEST_EMAIL, 20, 5000);
   //                                                                          ^^  ^^^^
   //                                                                   attempts  delay(ms)
   ```

### Token Extraction Failed

**Error:** `Email found but no token extracted`

**Solution:** The email HTML format might have changed. Check the logs for "Email HTML preview" and update the regex in `gmail-mcp-client.ts`:

```typescript
// Current regex (in extractResetToken function):
const tokenMatch = html.match(/reset-password\?token=([a-f0-9]{64})/i);

// If emails use different format, update regex accordingly
```

## 📁 Files Created

### Test Files
- `tests/password-reset-with-gmail.spec.ts` - Main E2E test with Gmail integration
- `tests/helpers/gmail-mcp-client.ts` - Gmail MCP client for Playwright

### Configuration
- Uses existing: `/Users/briandusape/gmail-mcp-server/`
- Uses existing: `/Users/briandusape/.gmail-mcp/credentials.json`
- Uses existing: `/Users/briandusape/.gmail-mcp/token.pickle`

## 🔐 Security Notes

The test uses your **real Gmail account** (`bdusape@gmail.com`):
- ✅ OAuth tokens are stored locally in `.gmail-mcp/`
- ✅ Test runs locally on your machine
- ⚠️ **Never commit** credentials or tokens to git
- ⚠️ Test will **actually fetch** real emails from your inbox
- ⚠️ Test will **actually reset** your password

## 💡 Tips

### Run Specific Test Only
```bash
# Run only the Gmail integration test
npx playwright test password-reset-with-gmail.spec.ts

# Skip Gmail test, run mocked tests
npx playwright test password-reset.spec.ts
```

### Debug Mode
```bash
# Open Playwright Inspector
PWDEBUG=1 npm run test:password-reset:gmail

# See what emails are found
# (Add breakpoint in gmail-mcp-client.ts searchEmails function)
```

### Test with Different Email
Update the test file:
```typescript
const TEST_EMAIL = 'your-other-email@gmail.com';
```

## 📊 CI/CD Integration

To run in CI/CD (GitHub Actions, etc.), you would need to:

1. **Store Gmail credentials as secrets**
2. **Set up service account** (instead of OAuth)
3. **Or skip Gmail tests in CI:**

```yaml
# .github/workflows/test.yml
- name: Run tests (skip Gmail)
  run: npm run test:password-reset  # Without :gmail suffix
```

## 🎯 Next Steps

1. **Run the test:**
   ```bash
   npm run test:password-reset:gmail:headed
   ```

2. **Verify it works end-to-end**

3. **Add to your test suite:**
   ```json
   // package.json
   {
     "scripts": {
       "test:e2e": "npm run test:password-reset:gmail && npm run test:account-maintenance"
     }
   }
   ```

4. **Extend for other email tests:**
   - Email verification
   - Welcome emails
   - Notification emails

---

**Status:** ✅ Ready to use!
**Last Updated:** Dec 25, 2025
