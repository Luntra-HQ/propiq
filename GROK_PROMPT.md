# Grok Deployment Debugging Prompt

**CONTEXT:**
I have a React + Vite + TypeScript app with Convex backend deployed to Netlify. Users are experiencing a critical caching issue where the frontend continues to serve old JavaScript files even after successful deployments.

**THE PROBLEM:**
- Users get: `TypeError: undefined is not an object (evaluating 'x.auth.verifyResetToken')`
- Browser loads old asset: `ResetPasswordPage-TX4sDyHG.js`
- Persists after hard refresh (Cmd+Shift+R)
- Happens to ALL users, not just one browser

**WHAT I'VE VERIFIED:**
1. ✅ Convex backend deployed successfully: `npx convex deploy --yes`
2. ✅ Frontend builds successfully: `npm run build` (new asset hashes generated)
3. ✅ Netlify deployment succeeds: `netlify deploy --prod --dir=dist`
4. ✅ New files exist in dist/ folder locally
5. ❌ Production site still serves old files

**TECH STACK:**
- Frontend: React 18 + Vite 7.3.0 + TypeScript
- Backend: Convex (serverless)
- Hosting: Netlify
- Domain: propiq.luntra.one
- Build: Vite with lazy-loaded routes (React.lazy)

**DIAGNOSTIC DATA:**
```
[PASTE DIAGNOSTIC_COMMANDS.sh OUTPUT HERE]
```

**SPECIFIC QUESTIONS:**
1. Why does Netlify continue serving old asset hashes after deploy succeeds?
2. Is this a Vite build configuration issue with lazy loading?
3. Could this be a Service Worker caching the old app?
4. Is there a Netlify CDN cache that's not being cleared?
5. Do I need to change how Vite generates asset hashes?
6. Is the index.html being cached separately from the JS chunks?

**WHAT I NEED FROM YOU:**
1. Root cause analysis of why deployments aren't updating
2. Step-by-step fix to ensure future deploys work for ALL users
3. Vite/Netlify configuration changes needed (if any)
4. How to force-clear any caches preventing updates
5. Best practices to prevent this in the future

**CONSTRAINTS:**
- Cannot use manual workarounds (need systematic fix for all users)
- Must work for both existing and new users
- Should not require users to clear browser cache
- Need production-ready solution, not dev hacks

---

## Alternative LLM Recommendations

**Use Grok if:** Backend/infrastructure issue (Netlify, CDN, deployment pipeline)
**Use Claude Code if:** Frontend code analysis, build config debugging
**Use Cursor/Windsurf if:** IDE-integrated debugging with file access
**Use ChatGPT-4 if:** General deployment pipeline architecture questions

---

## Expected Output Format

Please provide:
1. **Root Cause:** What's actually happening
2. **Verification Steps:** How to confirm the diagnosis
3. **Fix Commands:** Exact commands to run
4. **Prevention:** Config changes to prevent recurrence
5. **Testing:** How to verify it's fixed for all users
