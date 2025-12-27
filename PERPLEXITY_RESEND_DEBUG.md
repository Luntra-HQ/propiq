# Perplexity Prompt: Resend Email Not Sending - Convex Integration Debug

---

## COPY THIS ENTIRE PROMPT TO PERPLEXITY:

I'm debugging a Resend email integration with Convex (serverless backend) and emails are not being sent. I need help identifying the issue.

---

## 🔧 MY TECH STACK

- **Backend:** Convex (TypeScript serverless platform)
- **Email Service:** Resend
- **Frontend:** React + Vite
- **Deployment:** Production (Convex Cloud)
- **Date:** December 26, 2025

---

## ✅ WHAT I'VE CONFIGURED

1. **Resend Account:**
   - Created account successfully
   - Generated API key: `re_4CdJEL2t_GcMioqLz1JeNnpd7Y6QNG7aG`
   - Free tier (3,000 emails/month)
   - No custom domain configured (using Resend's default)

2. **Convex Environment:**
   - Set API key: `npx convex env set RESEND_API_KEY re_4CdJEL2t_GcMioqLz1JeNnpd7Y6QNG7aG`
   - Verified it's set: `npx convex env list` shows `RESEND_API_KEY=re_...`

3. **Backend Implementation:**
   - HTTP endpoint: `POST /auth/request-password-reset`
   - Located in: `convex/http.ts`
   - Uses Resend API v1 endpoint: `https://api.resend.com/emails`

---

## 🧪 WHAT I'VE TESTED

**Test 1: Via HTTP Endpoint (Correct Way)**
```bash
curl -X POST https://mild-tern-361.convex.site/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"bdusape@gmail.com"}'
```

**Response:**
```json
{"success":true,"message":"If an account exists with that email, a password reset link has been sent."}
```

**Result:**
- ✅ Backend returns success
- ❌ NO EMAIL RECEIVED (checked inbox, spam, promotions)
- ⏱️ Waited 5+ minutes

---

## 📝 BACKEND CODE (Simplified)

```typescript
// convex/http.ts - HTTP endpoint handler

http.route({
  path: "/auth/request-password-reset",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { email } = await request.json();

    // Create reset token (this works - confirmed in logs)
    const result = await ctx.runMutation(api.auth.requestPasswordReset, { email });

    // Send email via Resend
    if (result.token) {
      const RESEND_API_KEY = process.env.RESEND_API_KEY;

      if (RESEND_API_KEY) {
        const resetLink = `https://propiq.luntra.one/reset-password?token=${result.token}`;

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "PropIQ <noreply@onresend.com>",
            to: [result.email],
            subject: "Reset Your PropIQ Password",
            html: `
              <h1>Reset Your Password</h1>
              <p>Click the link below to reset your password:</p>
              <a href="${resetLink}">Reset Password</a>
              <p>This link expires in 15 minutes.</p>
            `,
          }),
        });

        if (!emailResponse.ok) {
          console.error("[AUTH] Failed to send password reset email:", await emailResponse.text());
        } else {
          console.log("[AUTH] Password reset email sent to:", result.email);
        }
      } else {
        console.warn("[AUTH] RESEND_API_KEY not configured");
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: result.message }),
      { status: 200 }
    );
  }),
});
```

---

## ❌ THE PROBLEM

1. **Backend returns success** - No errors in response
2. **No email arrives** - Checked inbox, spam, promotions
3. **No error logs** - Convex logs don't show any errors
4. **API key is set** - Confirmed via `convex env list`
5. **Resend dashboard** - Haven't checked yet (will check)

---

## 🔍 WHAT I NEED HELP WITH

**Primary Questions:**

1. **Is my Resend API request format correct for 2024-2025?**
   - Endpoint: `https://api.resend.com/emails`
   - Authorization header format
   - Request body structure
   - From email format (`PropIQ <noreply@onresend.com>`)

2. **Common issues with Resend + Convex integration?**
   - Environment variable access in Convex httpActions
   - CORS or security restrictions
   - API key format/permissions
   - Default "from" domain requirements

3. **How to debug silent failures?**
   - Email sends with no error but doesn't arrive
   - How to check Resend API response properly
   - Logging best practices for Resend

4. **Resend free tier restrictions?**
   - Need domain verification first?
   - Sandbox mode limitations?
   - Default sender restrictions?

---

## 🎯 SPECIFIC HELP NEEDED

Please provide:

1. **Updated Resend API format for 2025**
   - Correct endpoint URL
   - Correct headers
   - Correct request body structure
   - Example working code

2. **Debugging checklist**
   - How to check Resend dashboard for sent emails
   - How to verify API key permissions
   - How to check for silent failures
   - Common "email sent but not received" issues

3. **Convex-specific considerations**
   - How to access environment variables in httpActions
   - Any known issues with Resend + Convex
   - Alternative approaches if current one doesn't work

4. **Quick win solutions**
   - What's the fastest way to verify Resend is working?
   - Simple test email curl command
   - How to enable detailed error logging

---

## 🚨 CONSTRAINTS

- **Must use Resend** (already have account and API key)
- **Backend is Convex** (can't change to Express/Node)
- **Need production solution** (not just dev/testing)
- **Free tier** (3,000 emails/month limit)

---

## 💡 ADDITIONAL CONTEXT

- User account exists: `bdusape@gmail.com`
- Reset token is created successfully (confirmed in backend response)
- Backend httpAction runs without errors
- This is part of auth system (password reset flow)
- Frontend calls this endpoint via `fetch()` from React

---

**Please focus on:**
1. Most likely causes for silent email failures with Resend
2. Updated 2024-2025 Resend API documentation/examples
3. Convex httpAction + Resend integration patterns
4. Step-by-step debugging approach

Thank you!
