# Get Admin Deploy Key for mild-tern-361

**Follow these steps to get your Admin Deploy Key:**

## Step 1: Go to Convex Dashboard
Open this URL in your browser:
```
https://dashboard.convex.dev/d/mild-tern-361
```

## Step 2: Navigate to Settings
- Click on **Settings** in the left sidebar
- Or look for a gear/cog icon

## Step 3: Find Deploy Keys Section
- Look for "Deploy Keys" or "API Keys" section
- You should see options to generate keys

## Step 4: Generate Admin Deploy Key
- Click **"Generate Admin Deploy Key"** or similar button
- **IMPORTANT:** This key has full access - keep it secure!
- Copy the key that appears (it will look like: `prod:abc123...` or similar long string)

## Step 5: Return Here
Once you have the key, paste it in this chat and I'll configure your `.env.local` file.

---

## Alternative: If you can't find it
If you're having trouble finding the Admin Deploy Key section:
1. Take a screenshot of the Convex dashboard settings page
2. Or look for documentation at: https://docs.convex.dev

---

**Security Note:** 
- This key gives full deployment access
- Don't commit it to git (it will be in `.env.local` which is gitignored)
- Each developer should get their own key if working on the same deployment
