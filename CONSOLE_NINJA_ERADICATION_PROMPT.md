# Console Ninja Complete Eradication - Deep Research Required

**For: Grok / Perplexity / GPT-4 with System Administration Expertise**

---

## THE PROBLEM

Console Ninja extension keeps appearing in Vite dev server output **even after multiple removal attempts**. We need complete eradication, not workarounds.

---

## CONTEXT

### **System Information:**
- **OS:** macOS (Darwin 24.6.0)
- **IDE:** Cursor (VS Code fork) - **NOT regular VS Code**
- **Node Version:** 20.x
- **Package Manager:** npm
- **Dev Tool:** Vite 7.3.0
- **Project:** React/TypeScript frontend

### **Extension Identity:**
```
Name: Console Ninja
Publisher: WallabyJS
Version: 1.0.501
Extension ID: wallabyjs.console-ninja-1.0.501-universal
```

### **Symptom:**
Every time we start Vite dev server:
```bash
> vite
✔ Console Ninja extension is connected to Vite
[Server hangs here - never shows localhost URL]
```

---

## WHAT WE'VE TRIED (ALL FAILED)

### **Attempt 1: VS Code Extensions** ❌
- Checked VS Code extensions menu
- Console Ninja not listed
- **Why it failed:** User is using Cursor, not VS Code

### **Attempt 2: Cursor UI Uninstall** ❌
- Found in Cursor extensions
- Clicked "Uninstall"
- Restarted Cursor
- **Still appears in Vite output**

### **Attempt 3: Manual Directory Deletion** ❌
```bash
# Found extension at:
~/.cursor/extensions/wallabyjs.console-ninja-1.0.501-universal

# Deleted it:
rm -rf ~/.cursor/extensions/wallabyjs.console-ninja-*

# Verified deletion:
ls -la ~/.cursor/extensions | grep ninja
# (shows nothing)

# Started dev server again
npm run dev
# STILL SHOWS: "✔ Console Ninja extension is connected to Vite"
```

### **Attempt 4: Checked All Possible Locations** ❌
Scanned for Console Ninja in:
- ✓ package.json dependencies (not found)
- ✓ node_modules (not found)
- ✓ Global npm packages (not found)
- ✓ VS Code extensions (not found)
- ✓ Browser extensions (not found)
- ✓ vite.config.ts (not found)
- ✓ Project files (not found)
- ✗ **Cursor extensions** (WAS found, deleted, **still appears**)

---

## YOUR RESEARCH MISSION

### **Primary Questions:**

1. **WHERE IS IT HIDING?**
   - What are ALL possible locations Console Ninja can be installed on macOS?
   - Specifically for Cursor IDE (not VS Code)
   - Including hidden directories, cache locations, global configs
   - Any system-level installations?

2. **WHY DOES IT PERSIST AFTER DELETION?**
   - Does Cursor cache extensions somewhere else?
   - Could it be in Electron's application cache?
   - Is there a global Cursor config file that re-installs it?
   - Could it be in macOS's Application Support directory?
   - Is it being served from a CDN at runtime?

3. **HOW IS IT CONNECTING TO VITE?**
   - How does a Cursor extension inject itself into Vite?
   - Is it modifying node_modules at runtime?
   - Is it intercepting the Vite process?
   - Is it a Vite plugin that gets auto-loaded?
   - Could it be in package-lock.json?

4. **COMPLETE REMOVAL PROCEDURE:**
   - Exact steps to completely eradicate Console Ninja from Cursor
   - All files/directories to delete
   - All caches to clear
   - Any config files to edit
   - Nuclear option if needed

5. **PREVENTION:**
   - How to prevent it from reinstalling?
   - Is there a Cursor setting to disable extension auto-install?
   - Should we add it to a blocklist?

---

## SPECIFIC TECHNICAL DETAILS TO INVESTIGATE

### **Cursor IDE Architecture:**
- How does Cursor differ from VS Code in extension handling?
- Does Cursor have a separate extension marketplace?
- Where does Cursor store extension data vs VS Code?
- Does Cursor sync extensions from cloud?

### **Console Ninja Technical Details:**
Research the extension itself:
- How does it inject into dev servers?
- Does it use a browser extension + IDE extension combo?
- Does it install system-level agents?
- Are there background processes?
- Does it modify npm/node configs?

### **Vite Integration:**
- How can an IDE extension connect to Vite?
- Is this a Vite plugin being loaded somehow?
- Could it be in Vite's global config?
- Is there a ~/.vite directory with plugins?

---

## FILE SYSTEM LOCATIONS TO CHECK

Please investigate these specific paths:

### **Cursor Directories:**
```bash
~/.cursor/
~/.cursor/extensions/
~/.cursor/User/
~/.cursor/Backups/
~/.cursor-server/
~/Library/Application Support/Cursor/
~/Library/Caches/Cursor/
~/Library/Preferences/com.cursor.*
```

### **Global Config Locations:**
```bash
~/.config/cursor/
~/.local/share/cursor/
~/.vscode-server/ (if Cursor uses it)
~/.vite/
~/.npm/
/usr/local/lib/node_modules/
```

### **Project-Specific:**
```bash
/Users/briandusape/Projects/propiq/.cursor/
/Users/briandusape/Projects/propiq/.vscode/
/Users/briandusape/Projects/propiq/node_modules/.cache/
/Users/briandusape/Projects/propiq/node_modules/.bin/
```

### **System-Level:**
```bash
/Library/Application Support/
/usr/local/share/
```

---

## COMMANDS TO RUN (If Applicable)

If you need me to run diagnostic commands, provide EXACT commands for:

1. **Finding all Console Ninja artifacts:**
   - Full system search command
   - Include hidden files
   - Check symlinks
   - Inspect processes

2. **Checking running processes:**
   - Any Console Ninja background processes?
   - Node processes with ninja in args?
   - Electron helper processes?

3. **Configuration inspection:**
   - Cursor's settings.json
   - Global npm config
   - Vite global config
   - Any .rc files

4. **Complete removal:**
   - Exact deletion commands
   - Cache clearing commands
   - Process killing commands
   - Config file edits

---

## EXPECTED DELIVERABLES

Please provide:

### **1. Root Cause Analysis**
- Exactly where Console Ninja is hiding
- Why it persists after deletion
- How it connects to Vite

### **2. Complete Removal Script**
```bash
#!/bin/bash
# Provide a complete bash script that:
# 1. Finds all Console Ninja locations
# 2. Deletes all instances
# 3. Clears all caches
# 4. Removes all configs
# 5. Verifies complete removal
```

### **3. Verification Commands**
Commands to confirm it's completely gone:
- File system checks
- Process checks
- Configuration checks
- Test that Vite starts without it

### **4. Prevention Strategy**
- How to block it from reinstalling
- Cursor settings to change
- .gitignore or config updates needed

---

## ADDITIONAL CONTEXT

### **Why This Matters:**
- Blocking development workflow
- 4th time this issue has appeared
- User has verified it's not in VS Code extensions
- Cursor UI uninstall doesn't work
- Manual deletion doesn't work
- **This is not acceptable - we need complete eradication**

### **Similar Issues to Research:**
- "Console Ninja persists after uninstall"
- "Cursor extension won't delete"
- "Vite extension cache"
- "WallabyJS Console Ninja removal"
- "Cursor vs VS Code extension locations"

### **Technical Resources:**
- Cursor documentation on extensions
- Console Ninja GitHub issues
- Vite extension system docs
- macOS application support directories

---

## SUCCESS CRITERIA

Your research is complete when you can provide:

✅ **Location:** Exact path(s) where Console Ninja is actually stored/cached
✅ **Reason:** Why it persists after ~/.cursor/extensions deletion
✅ **Solution:** Complete removal procedure that WORKS
✅ **Verification:** Commands that prove it's gone
✅ **Prevention:** How to keep it from coming back

---

## RESEARCH METHODOLOGY SUGGESTIONS

1. **Search GitHub Issues:**
   - Console Ninja repository
   - Cursor repository
   - Vite repository
   - Search for similar persistence issues

2. **Check Documentation:**
   - Official Console Ninja docs
   - Cursor extension system docs
   - Electron cache locations
   - macOS application support patterns

3. **System Inspection:**
   - How Cursor handles extensions vs VS Code
   - Extension caching mechanisms
   - Auto-update/reinstall behaviors

4. **Community Resources:**
   - Stack Overflow
   - Reddit r/vscode or r/webdev
   - Cursor Discord/community
   - Console Ninja support channels

---

## OUTPUT FORMAT

Please structure your response as:

```markdown
# Console Ninja Eradication Guide

## Root Cause
[Explain where it's actually hiding and why deletion failed]

## Complete Removal Procedure
[Step-by-step commands to remove it completely]

## Verification
[How to confirm it's gone]

## Prevention
[How to prevent reinstallation]

## Technical Explanation
[Deep dive into the architecture]
```

---

## FINAL NOTES

- **Priority:** HIGH - Blocking development
- **Urgency:** Immediate
- **Acceptable:** Only complete eradication, not workarounds
- **Not Acceptable:** "Disable it" or "Ignore the message"

We don't want to work around Console Ninja. We want it **completely gone from the system**.

---

**BEGIN RESEARCH NOW.**
