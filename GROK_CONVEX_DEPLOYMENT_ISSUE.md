# Grok: Convex Deployment Mismatch Issue

**CONTEXT:**
PropIQ is a React + Vite app with Convex backend. We have TWO Convex deployments that keep getting out of sync, causing auth failures.

**THE PROBLEM:**
- `convex.json` specifies: `"deployment": "dev:mild-tern-361"`
- `npx convex dev` IGNORES this and creates/uses: `dev:diligent-starling-125`
- Every time `npx convex dev` runs, it overwrites `.env.local` back to `diligent-starling-125`
- Frontend `.env.local` has `VITE_CONVEX_URL=https://mild-tern-361.convex.cloud`
- This mismatch causes: "undefined is not an object" errors in browser

**WHAT I'VE VERIFIED:**
1. ✅ Both deployments exist and are accessible
2. ✅ Code successfully deploys to `mild-tern-361` via `npx convex deploy --yes`
3. ✅ `convex.json` contains `{"deployment": "dev:mild-tern-361"}`
4. ✅ Signup endpoint works on `mild-tern-361` (verified via curl)
5. ❌ `npx convex dev` shows warning: "Unknown property in `convex.json`: `deployment`"
6. ❌ Convex CLI keeps provisioning/preferring `diligent-starling-125`

**TECH STACK:**
- Frontend: React 18 + Vite 7.3.0 + TypeScript
- Backend: Convex (serverless functions)
- Convex CLI version: Latest (as of Dec 2025)
- Node: v20+

**DIAGNOSTIC OUTPUT:**
```bash
$ npx convex dev
Warning: Unknown property in `convex.json`: `deployment`
  These properties will be preserved but are not recognized by this version of Convex.
✔ Provisioned a dev deployment and saved its:
    name as CONVEX_DEPLOYMENT to .env.local
    URL as VITE_CONVEX_URL to .env.local

View the Convex dashboard at https://dashboard.convex.dev/d/diligent-starling-125
```

```bash
$ cat convex.json
{"deployment": "dev:mild-tern-361"}
```

```bash
$ cat .env.local  # AFTER convex dev runs
CONVEX_DEPLOYMENT=dev:diligent-starling-125  # ❌ WRONG!
VITE_CONVEX_URL=https://diligent-starling-125.convex.cloud
```

```bash
$ cat frontend/.env.local
VITE_CONVEX_URL=https://mild-tern-361.convex.cloud  # ✅ CORRECT
```

**SPECIFIC QUESTIONS:**
1. Why does Convex CLI ignore the `deployment` property in `convex.json`?
2. Is the `convex.json` format wrong for specifying deployment?
3. How do I force `npx convex dev` to use a specific existing deployment?
4. Should I use environment variables instead of `convex.json`?
5. Is there a `.convex` cache directory causing this?
6. Do I need to run `convex login` or `convex dev --configure` first?

**WHAT I NEED FROM YOU:**
1. Root cause: Why Convex CLI prefers `diligent-starling-125` over `mild-tern-361`
2. Correct way to configure default deployment in Convex
3. How to prevent `.env.local` from being overwritten
4. Whether I should delete one deployment and stick to one
5. Best practices for multi-deployment Convex projects

**CONSTRAINTS:**
- Cannot manually edit `.env.local` every time (gets overwritten)
- Need dev server to use same deployment as production (`mild-tern-361`)
- Frontend already configured for `mild-tern-361`, don't want to change
- Multiple developers may run `convex dev`, need consistent behavior

**ATTEMPTED FIXES (DIDN'T WORK):**
1. ❌ Editing `.env.local` manually → gets overwritten by `convex dev`
2. ❌ Setting `deployment` in `convex.json` → CLI ignores it (unknown property)
3. ❌ Running `rm -rf .convex` before `convex dev` → still uses wrong deployment

---

## Expected Output Format

Please provide:
1. **Root Cause:** Why Convex CLI behaves this way
2. **Correct Configuration:** Proper way to set default deployment
3. **Fix Commands:** Exact commands to run to resolve this
4. **Prevention:** How to ensure this doesn't happen again
5. **Alternative:** Should we just delete `diligent-starling-125` and use one deployment?

---

## Additional Context

**Working Test Results from mild-tern-361:**
```bash
$ curl -X POST https://mild-tern-361.convex.site/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"ValidPass123!"}'

{"success":true,"user":{...},"sessionToken":"..."}  # ✅ WORKS
```

**Project Structure:**
```
propiq/
├── convex.json                 # {"deployment": "dev:mild-tern-361"}
├── .env.local                  # Gets overwritten to diligent-starling-125
├── convex/
│   ├── auth.ts                 # Auth functions
│   ├── http.ts                 # HTTP endpoints
│   └── schema.ts               # Database schema
└── frontend/
    └── .env.local              # VITE_CONVEX_URL=mild-tern-361 (correct)
```

**Urgency:** HIGH - Blocking manual testing of auth flows
