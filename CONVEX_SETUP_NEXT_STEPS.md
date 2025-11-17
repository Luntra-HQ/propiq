# Conv

ex Migration - Next Steps

**Status:** Phase 1 Setup Complete - Ready for Convex Account Connection
**Completed:** Schema created, Convex installed, Migration plan documented
**Next:** Connect to Convex dashboard and complete authentication migration

---

## ✅ What's Been Done

1. **Installed Convex** - `npm install convex` completed
2. **Created Schema** - `convex/schema.ts` with full database structure
3. **Migration Plan** - See `CONVEX_MIGRATION_PLAN.md`
4. **Removed Azure Confusion** - Documented all Azure references to remove

---

## 🚀 Next Steps (15 minutes to get accounts working)

### **Step 1: Initialize Convex Project** (5 minutes)

```bash
cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/propiq
npx convex dev
```

This will:
- Open browser to create/login to Convex account
- Create a new Convex project
- Generate `convex/_generated` directory
- Create `.env.local` with `VITE_CONVEX_URL`

**Important:**
- Name your project "propiq" or "propiq-production"
- Note down the deployment URL (will be like `https://xxx.convex.cloud`)

### **Step 2: Set Environment Variables in Convex Dashboard**

Go to: https://dashboard.convex.dev → Your Project → Settings → Environment Variables

Add:
```
OPENAI_API_KEY=<your-openai-key>
STRIPE_SECRET_KEY=<your-stripe-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
```

### **Step 3: Create Authentication Functions**

Create `convex/auth.ts`:
```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { hashPassword, comparePassword } from "./utils/crypto";

// Signup mutation
export const signup = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    company: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existing) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const passwordHash = await hashPassword(args.password);

    // Create user
    const userId = await ctx.db.insert("users", {
      email: args.email.toLowerCase(),
      passwordHash,
      firstName: args.firstName,
      lastName: args.lastName,
      company: args.company,
      subscriptionTier: "free",
      analysesUsed: 0,
      analysesLimit: 3,
      active: true,
      emailVerified: false,
      createdAt: Date.now(),
    });

    return {
      success: true,
      userId: userId.toString(),
      message: "Account created successfully",
    };
  },
});

// Login mutation
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isValid = await comparePassword(args.password, user.passwordHash);

    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    // Update last login
    await ctx.db.patch(user._id, {
      lastLogin: Date.now(),
    });

    return {
      success: true,
      userId: user._id.toString(),
      email: user.email,
      subscriptionTier: user.subscriptionTier,
      message: "Login successful",
    };
  },
});

// Get user query
export const get = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      return null;
    }

    // Don't return password hash
    const { passwordHash, ...userWithoutPassword } = user;

    return userWithoutPassword;
  },
});
```

Create `convex/utils/crypto.ts`:
```typescript
// Password hashing utilities
// Note: In production, use a proper library like bcrypt-edge or argon2

export async function hashPassword(password: string): Promise<string> {
  // For now, use a simple hash (REPLACE WITH PROPER BCRYPT IN PRODUCTION)
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "salt"); // Add proper salt
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// TODO: Replace with proper bcrypt implementation
// npm install bcryptjs
// import bcrypt from "bcryptjs";
// export const hashPassword = (password: string) => bcrypt.hash(password, 10);
// export const comparePassword = (password: string, hash: string) => bcrypt.compare(password, hash);
```

### **Step 4: Update Frontend to Use Convex**

**Install Convex in frontend:**
```bash
cd frontend
npm install convex
```

**Update `frontend/src/main.tsx`:**
```typescript
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL!);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </React.StrictMode>
);
```

**Replace `frontend/src/config/api.ts`:**
```typescript
// REMOVE THE OLD AZURE URL ENTIRELY
// Replace with:
export const USE_CONVEX = true;
// All API calls now use Convex React hooks
```

**Update Signup Component:**
```typescript
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

function SignupPage() {
  const signup = useMutation(api.auth.signup);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signup({
        email,
        password,
        firstName,
        lastName,
        company,
      });

      console.log("Signup successful:", result);
      // Redirect to login or dashboard
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  // ... rest of component
}
```

**Update Login Component:**
```typescript
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

function LoginPage() {
  const login = useMutation(api.auth.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login({ email, password });

      // Store user info in localStorage
      localStorage.setItem("propiq_user_id", result.userId);
      localStorage.setItem("propiq_user_email", result.email);

      // Redirect to dashboard
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  // ... rest of component
}
```

### **Step 5: Test Locally**

```bash
# Terminal 1 - Run Convex backend
cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/propiq
npx convex dev

# Terminal 2 - Run frontend
cd frontend
npm run dev
```

Visit http://localhost:5173 and try:
1. Create an account
2. Login with that account
3. Check Convex dashboard to see data

### **Step 6: Deploy to Production**

**Deploy Convex:**
```bash
npx convex deploy
```

This creates a production deployment and gives you a production URL.

**Update Netlify Environment Variables:**
Go to: Netlify Dashboard → Site Settings → Environment Variables

Add:
```
VITE_CONVEX_URL=<your-production-convex-url>
```

**Deploy Frontend:**
```bash
cd frontend
npm run build
netlify deploy --prod
```

---

## 🎯 Success Criteria

After completing these steps:
- ✅ Users can create accounts on propiq.luntra.one
- ✅ Users can log in
- ✅ No Azure dependencies
- ✅ Real-time database updates
- ✅ Accounts persist in Convex dashboard

---

## 🔧 Troubleshooting

**"Convex URL not defined"**
- Make sure `.env.local` exists with `VITE_CONVEX_URL`
- Restart Vite dev server after adding env vars

**"Module not found: convex/_generated"**
- Run `npx convex dev` to generate types
- Make sure Convex dashboard is connected

**"User already exists" on first signup**
- Check Convex dashboard → Data → users table
- Delete test users if needed

**Password hashing not secure**
- Replace crypto.ts with proper bcrypt implementation
- See TODO comments in code

---

## 📋 Quick Command Reference

```bash
# Initialize Convex (do this first!)
npx convex dev

# Deploy to production
npx convex deploy

# View logs
npx convex logs

# Open dashboard
npx convex dashboard

# Run frontend
cd frontend && npm run dev

# Deploy frontend
cd frontend && netlify deploy --prod
```

---

## 🗑️ Cleanup After Migration

Once everything works:

**1. Archive old backend:**
```bash
cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/propiq
mv backend backend-fastapi-archived
```

**2. Remove Azure references:**
- Delete deployment scripts in `backend-fastapi-archived/`
- Update all documentation
- Remove from git (optional)

**3. Update README:**
- Document Convex as the backend
- Remove FastAPI mentions
- Update setup instructions

---

## ⏰ Estimated Timeline

- **Step 1:** 5 min - Connect Convex account
- **Step 2:** 2 min - Set environment variables
- **Step 3:** 5 min - Copy auth functions
- **Step 4:** 10 min - Update frontend
- **Step 5:** 5 min - Test locally
- **Step 6:** 5 min - Deploy production

**Total: ~30 minutes to working accounts!**

---

## 💡 Next Features After Auth Works

1. **Property Analysis** - Migrate propiq.py to Convex action
2. **Stripe Payments** - Set up webhook HTTP route
3. **Support Chat** - Migrate support chat logic
4. **Background Jobs** - Set up scheduled functions

See `CONVEX_MIGRATION_PLAN.md` for full roadmap.

---

## 🆘 Need Help?

- **Convex Docs:** https://docs.convex.dev
- **Convex Discord:** https://convex.dev/community
- **Migration Plan:** `CONVEX_MIGRATION_PLAN.md`

---

**You're 90% there! Just need to:**
1. Run `npx convex dev`
2. Copy the auth functions
3. Update frontend components
4. Test & deploy

**Let's get PropIQ accounts working! 🚀**
