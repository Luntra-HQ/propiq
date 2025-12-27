#!/bin/bash
# Diagnostic commands for deployment debugging

echo "=== 1. CHECK NETLIFY DEPLOYMENT ==="
netlify status

echo -e "\n=== 2. LIST RECENT DEPLOYS ==="
netlify deploys list --json | head -50

echo -e "\n=== 3. CHECK CONVEX DEPLOYMENT ==="
npx convex env list

echo -e "\n=== 4. CHECK FOR SERVICE WORKER ==="
ls -la frontend/dist/sw.js 2>/dev/null || echo "No service worker found"

echo -e "\n=== 5. CHECK BUILD OUTPUT HASHES ==="
ls -la frontend/dist/assets/*ResetPasswordPage*.js

echo -e "\n=== 6. VERIFY INDEX.HTML ==="
cat frontend/dist/index.html | grep -i "script"

echo -e "\n=== 7. CHECK CONVEX API EXPORTS ==="
cat convex/_generated/api.d.ts | grep "auth"

echo -e "\n=== 8. PRODUCTION INDEX.HTML ==="
curl -s https://propiq.luntra.one/ | grep -i "script" | head -10
