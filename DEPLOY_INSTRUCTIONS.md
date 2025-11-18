# PropIQ Deployment Instructions

## Quick Deploy to propiq.luntra.one

Follow these steps to deploy PropIQ with Convex backend + Netlify frontend.

---

## Step 1: Initialize Convex Backend

Run this command from the project root:

```bash
cd /Users/briandusape/Projects/LUNTRA/propiq
npx convex dev
```

This will:
1. Open your browser to login/create a Convex account
2. Create a new Convex project
3. Generate `convex/_generated/` directory
4. Create `.env.local` with `VITE_CONVEX_URL`

**Important:** Keep this terminal running while developing locally.

---

## Step 2: Set Environment Variables in Convex Dashboard

Go to: https://dashboard.convex.dev → Your Project → Settings → Environment Variables

Add these variables:

```
OPENAI_API_KEY=<your-openai-api-key>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
STRIPE_STARTER_PRICE_ID=<price_id_for_starter_tier>
STRIPE_PRO_PRICE_ID=<price_id_for_pro_tier>
STRIPE_ELITE_PRICE_ID=<price_id_for_elite_tier>
```

---

## Step 3: Deploy Convex Backend to Production

Once you've tested locally and everything works:

```bash
npx convex deploy
```

This creates a production Convex deployment and gives you a production URL like:
`https://your-project.convex.cloud`

**Save this URL** - you'll need it for the frontend deployment.

---

## Step 4: Configure Netlify Environment Variables

Go to: Netlify Dashboard → propiq.luntra.one → Site Settings → Environment Variables

Add:

```
VITE_CONVEX_URL=<your-production-convex-url>
```

---

## Step 5: Deploy Frontend to Netlify

From the frontend directory:

```bash
cd /Users/briandusape/Projects/LUNTRA/propiq/frontend
npm run build
```

If you have Netlify CLI installed:

```bash
netlify deploy --prod
```

Or use Netlify's web interface to deploy the `dist/` folder.

---

## Step 6: Update Stripe Webhook URL

Once deployed, update your Stripe webhook endpoint to:

```
https://<your-convex-url>/stripe-webhook
```

Configure it in: https://dashboard.stripe.com/webhooks

Select these events:
- `checkout.session.completed`
- `customer.subscription.deleted`

---

## Verification Checklist

After deployment, verify:

- [ ] Visit https://propiq.luntra.one
- [ ] Site loads correctly
- [ ] Can create new account (signup works)
- [ ] Can login with created account
- [ ] Property analysis works (if you have analyses remaining)
- [ ] Support chat responds
- [ ] Stripe checkout works (test mode)
- [ ] Check Convex dashboard for data

---

## Troubleshooting

### "Convex URL not defined"
- Make sure `.env.local` exists with `VITE_CONVEX_URL`
- Restart Vite dev server after adding env vars

### "Module not found: convex/_generated"
- Run `npx convex dev` to generate types
- Make sure Convex dashboard is connected

### "OpenAI API key not configured"
- Check Convex dashboard → Settings → Environment Variables
- Make sure `OPENAI_API_KEY` is set

### Netlify build fails
- Check build logs
- Make sure `VITE_CONVEX_URL` is set in Netlify env vars
- Run `npm run build` locally first to test

---

## Quick Commands Reference

```bash
# Initialize Convex (run once)
npx convex dev

# Deploy Convex backend to production
npx convex deploy

# View Convex logs
npx convex logs

# Open Convex dashboard
npx convex dashboard

# Run frontend locally
cd frontend && npm run dev

# Build frontend for production
cd frontend && npm run build

# Deploy to Netlify (if CLI installed)
cd frontend && netlify deploy --prod
```

---

## Deployment URLs

- **Frontend:** https://propiq.luntra.one
- **Convex Backend:** https://<your-project>.convex.cloud
- **Convex Dashboard:** https://dashboard.convex.dev
- **Netlify Dashboard:** https://app.netlify.com

---

## Notes

- Convex deployments are automatic when you push to git (if configured)
- Frontend deployments to Netlify are automatic on git push (if configured)
- Always test locally before deploying to production
- Keep your API keys secure - never commit them to git

---

**Next Steps:**

1. Run `npx convex dev` in the project root
2. Complete the browser authentication
3. Copy the generated `VITE_CONVEX_URL` to Netlify
4. Deploy!
