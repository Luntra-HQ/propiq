# PropIQ Debugging Tools Guide

**Created:** December 22, 2025
**Tools Installed:** Console Ninja v1.0.501

---

## ✅ Installed & Configured

### Console Ninja (VSCode Extension)
- **Status:** ✅ Installed and configured
- **Location:** Both `propiq` and `propiq-extension` projects
- **Config Files:**
  - `/Users/briandusape/Projects/propiq-extension/.vscode/settings.json`
  - `/Users/briandusape/Projects/propiq/.vscode/settings.json`

---

## 🚀 Quick Start: Testing Console Ninja

### Test 1: Chrome Extension

**Terminal:**
```bash
cd /Users/briandusape/Projects/propiq-extension
npm run watch
```

**VSCode:**
```bash
code /Users/briandusape/Projects/propiq-extension
```

**Steps:**
1. Open `src/shared/api-client.ts` in VSCode
2. Look at line 46: `console.log('PropIQ ApiClient: Initialized (stateless)');`
3. Load extension in Chrome (chrome://extensions → Load unpacked → select `dist/`)
4. Click extension icon
5. **You should see inline output** appear next to line 46 in VSCode! 💬

### Test 2: Web App

**Terminal:**
```bash
cd /Users/briandusape/Projects/propiq/frontend
npm run dev
```

**VSCode:**
```bash
code /Users/briandusape/Projects/propiq
```

**Steps:**
1. Open any component file in `src/components/`
2. Add a test log: `console.log('Testing Console Ninja!', { timestamp: Date.now() })`
3. Open the app in browser
4. **See the log appear inline** in VSCode!

---

## 🎯 When to Use Each Tool

### Chrome DevTools (ALWAYS)
**Use for:**
- ✅ Extension debugging (popup, content scripts, background worker)
- ✅ Network requests (API calls to Azure backend)
- ✅ Storage inspection (`chrome.storage.local`)
- ✅ Breakpoints and step-through debugging
- ✅ Performance profiling
- ✅ React component tree (React DevTools extension)

**How to access:**
- **Popup:** Right-click extension icon → "Inspect popup"
- **Content Script:** Right-click Zillow page → Inspect → Console (filter: "PropIQ")
- **Background Worker:** chrome://extensions → "Service worker" link
- **Storage:** DevTools → Application tab → Storage → Local

### Console Ninja (RAPID ITERATION)
**Use for:**
- ✅ Quick feedback while coding
- ✅ Seeing logs without switching windows
- ✅ Exploring object structures inline
- ✅ Debugging async operations
- ✅ Watching state changes in real-time

**Best for:**
- Development phase (coding new features)
- Quick bug fixes
- Understanding data flow
- Testing user inputs

**Configuration:**
- Extension project: Filters logs to "PropIQ" only
- Web app project: Shows all logs

### theORQL (AI-ASSISTED FIXING)
**Use for:**
- ✅ Complex runtime errors you can't figure out
- ✅ Production bugs that are hard to reproduce
- ✅ Getting AI explanations of error causes
- ✅ One-click fixes synced to VS Code
- ✅ Learning from AI suggestions

**When to install:**
- After you've mastered Chrome DevTools and Console Ninja
- When you hit a bug that takes > 30 minutes to solve
- For production error analysis

**Installation:** https://theorql.com/en/download-free

### console.log() (SPARINGLY)
**Use for:**
- ✅ Quick one-off debugging
- ✅ Temporary logging (remove before commit)

**DON'T use for:**
- ❌ Production code
- ❌ Permanent logging (use structured logger instead)
- ❌ Complex object inspection (use debugger statements)

---

## 🔧 PropIQ-Specific Debugging Scenarios

### Scenario 1: "Analyze" button not showing on Zillow

**Tools to use:**
1. **Console Ninja** - Check if `AnalyzerUI init started` log appears
2. **Chrome DevTools** - Set breakpoint in `analyzer-ui.ts:91` (attemptInjection)
3. **DevTools Console** - Check for errors (filter: "PropIQ")

**Debugging steps:**
```typescript
// In analyzer-ui.ts
private attemptInjection(): void {
  debugger; // ← Stops here in DevTools
  console.log('Attempting injection #', this.injectionAttempts);
  // Check DOM state
}
```

### Scenario 2: API request failing

**Tools to use:**
1. **Chrome DevTools Network tab** - See actual HTTP request/response
2. **Console Ninja** - See request config logged from `api-client.ts:65-69`
3. **theORQL** - If error is cryptic, get AI explanation

**Debugging steps:**
```typescript
// In api-client.ts
private async getConfig(): Promise<ApiConfig> {
  const config = await getConfigFromStorage();
  console.table(config); // ← Console Ninja shows formatted table inline
  debugger; // ← DevTools stops here, inspect network tab
  return config;
}
```

### Scenario 3: Auth token not persisting

**Tools to use:**
1. **Chrome DevTools Application tab** - Inspect `chrome.storage.local`
2. **Console Ninja** - Watch storage updates in real-time
3. **Breakpoint** in `session-manager.ts`

**Debugging steps:**
```javascript
// In DevTools Console (any context):
chrome.storage.local.get(null, (data) => {
  console.table(data); // See ALL stored data
});

// Check specific key:
chrome.storage.local.get('propiq_user_data', console.log);
```

### Scenario 4: Mock mode not working

**Tools to use:**
1. **Console Ninja** - See `mockMode` flag in logs
2. **Chrome DevTools** - Check storage value
3. **Breakpoint** in `api-client.ts:53`

**Debugging steps:**
```typescript
// In api-client.ts
private async getConfig(): Promise<ApiConfig> {
  const settings = await getSettings();
  console.log('Mock mode:', settings?.mockMode); // ← Console Ninja shows inline

  if (settings?.mockMode) {
    debugger; // ← Verify mock data generation
  }
}
```

---

## 📊 Debugging Workflow Comparison

### Old Workflow (console.log only):
```
1. Add console.log
2. Save file
3. Rebuild extension
4. Reload extension in Chrome
5. Switch to Chrome
6. Open DevTools
7. Find your log in noise
8. Switch back to VSCode
9. Repeat
```
**Time per iteration:** ~2-3 minutes

### New Workflow (with Console Ninja):
```
1. Add console.log
2. Look at inline output in VSCode
3. Done
```
**Time per iteration:** ~5 seconds ⚡

### Advanced Workflow (with theORQL):
```
1. Error occurs
2. theORQL captures it
3. Read AI explanation
4. Click "Apply Fix"
5. Code updated in VSCode
6. Done
```
**Time per error:** ~30 seconds 🚀

---

## 🎓 Learning Path

### Week 1: Master Chrome DevTools
- Practice setting breakpoints
- Learn extension context debugging
- Master Network and Application tabs
- Get comfortable with Console filtering

### Week 2: Leverage Console Ninja
- Use it during all feature development
- Practice with object inspection
- Learn to use inline output effectively
- Reduce window switching

### Week 3: Optimize Your Workflow
- Create structured logger utility
- Set up theORQL for complex bugs
- Build muscle memory for tool switching
- Document your debugging patterns

---

## 🔍 Console Ninja Settings Explained

### Extension Project (`propiq-extension/.vscode/settings.json`)

```json
{
  "console-ninja.toolsToEnableSupportAutomatically": {
    "webpack": true  // ← Detects webpack builds
  },
  "console-ninja.consoleFilter": "PropIQ",  // ← Only show logs with "PropIQ"
  "console-ninja.showWhileDebugging": true,  // ← Works with debugger
  "console-ninja.outputMode": "Beside"  // ← Shows output next to code
}
```

### Web App Project (`propiq/.vscode/settings.json`)

```json
{
  "console-ninja.toolsToEnableSupportAutomatically": {
    "vite": true  // ← Detects Vite builds
  },
  "console-ninja.consoleFilter": "",  // ← Show all logs
  "console-ninja.outputMode": "Beside"
}
```

---

## 🚨 Common Issues & Solutions

### Console Ninja not showing output

**Check:**
1. Is the dev server running? (`npm run watch` or `npm run dev`)
2. Is the file open in VSCode?
3. Does the log actually execute? (check DevTools Console)
4. Try reloading VSCode window (Cmd+Shift+P → "Reload Window")

### DevTools not showing extension logs

**Fix:**
- Filter console by "PropIQ"
- Check correct context (popup vs content script vs background)
- Verify extension is loaded (check chrome://extensions)

### theORQL installation issues

**Visit:** https://theorql.com/en/download-free
- Install Chrome extension first
- Then install VS Code extension
- Restart both Chrome and VSCode

---

## 📚 Additional Resources

### Console Ninja
- Docs: Built into extension (hover over inline output)
- Tips: Use `console.table()` for objects, `console.time()` for performance

### theORQL
- Website: https://theorql.com
- Download: https://theorql.com/en/download-free
- Blog: https://theorql.com/en/blog

### Chrome DevTools
- Extension debugging: https://developer.chrome.com/docs/extensions/mv3/tut_debugging/
- Network panel: https://developer.chrome.com/docs/devtools/network/
- Storage: https://developer.chrome.com/docs/devtools/storage/

---

## ✅ Next Steps

1. **Test Console Ninja now:**
   - Run `npm run watch` in extension project
   - Open `src/shared/api-client.ts` in VSCode
   - Load extension in Chrome
   - Watch inline logs appear!

2. **Practice with Chrome DevTools:**
   - Set a breakpoint in `analyzer-ui.ts:91`
   - Load a Zillow page
   - Step through the code

3. **Consider installing theORQL:**
   - Visit https://theorql.com/en/download-free
   - Try it on your next complex bug
   - See if AI-assisted fixing helps

4. **Build a structured logger:**
   - Create `src/shared/logger.ts`
   - Replace console.log calls gradually
   - Add log levels (DEBUG, INFO, WARN, ERROR)

---

**Happy Debugging! 🐛🔍**
