# Browser Console Debugging Script

**Problem:** Clicking pricing buttons does nothing - no console logs, no errors.

---

## Quick Diagnostic (Copy-Paste into Browser Console)

### Step 1: Check if you're on the right page

```javascript
// Paste this in browser console at https://propiq.luntra.one/pricing
console.log('Current URL:', window.location.href);
console.log('React root exists:', !!document.getElementById('root'));
console.log('React app loaded:', !!window.React);
```

**Expected Output:**
```
Current URL: https://propiq.luntra.one/pricing
React root exists: true
React app loaded: true (or undefined if React isn't exposed)
```

---

### Step 2: Find the pricing buttons

```javascript
// Find all buttons on the page
const buttons = document.querySelectorAll('button');
console.log(`Found ${buttons.length} buttons on page`);

// Find buttons with "Choose" text
const chooseButtons = Array.from(buttons).filter(btn =>
  btn.textContent.includes('Choose')
);
console.log(`Found ${chooseButtons.length} "Choose" buttons:`, chooseButtons);

// List all button text
buttons.forEach((btn, i) => {
  console.log(`Button ${i}:`, btn.textContent.trim().substring(0, 50));
});
```

**Expected Output:**
```
Found X buttons on page
Found 3 "Choose" buttons
```

---

### Step 3: Test if buttons are clickable

```javascript
// Try clicking the first "Choose" button manually
const chooseButtons = Array.from(document.querySelectorAll('button'))
  .filter(btn => btn.textContent.includes('Choose'));

if (chooseButtons.length > 0) {
  console.log('Testing first "Choose" button...');
  console.log('Button text:', chooseButtons[0].textContent);
  console.log('Button disabled?', chooseButtons[0].disabled);
  console.log('Button onClick:', chooseButtons[0].onclick);

  // Try to click it programmatically
  chooseButtons[0].click();
  console.log('✅ Button clicked programmatically');
} else {
  console.error('❌ No "Choose" buttons found!');
}
```

---

### Step 4: Check for React event listeners

```javascript
// React uses event delegation, so listeners are on the root
const root = document.getElementById('root');
if (root) {
  console.log('React root element found');
  console.log('Root has children:', root.children.length > 0);

  // Check if Convex is loaded
  console.log('Convex client:', window.__convexClient !== undefined);
} else {
  console.error('❌ React root not found!');
}
```

---

### Step 5: Check Convex configuration

```javascript
// Check if Convex is properly configured
console.log('Convex URL from meta:',
  import.meta?.env?.VITE_CONVEX_URL || 'Not available in browser'
);

// Try to access Convex from window (if exposed)
if (window.convex) {
  console.log('✅ Convex client accessible');
} else {
  console.log('⚠️ Convex not exposed on window (this is normal)');
}
```

---

### Step 6: Add manual click listener

```javascript
// Add our own listener to see if clicks are being blocked
const chooseButtons = Array.from(document.querySelectorAll('button'))
  .filter(btn => btn.textContent.includes('Choose'));

chooseButtons.forEach((btn, index) => {
  btn.addEventListener('click', (e) => {
    console.log(`🔘 Manual listener triggered on button ${index}`);
    console.log('Event:', e);
    console.log('Target:', e.target);
    console.log('Current target:', e.currentTarget);
  }, { capture: true }); // Use capture phase to see it first
});

console.log('✅ Manual listeners added. Try clicking a "Choose" button now.');
```

**Expected:** You should see the manual listener fire even if React's doesn't.

---

## Common Issues & Fixes

### Issue #1: No buttons found
**Symptom:** `Found 0 "Choose" buttons`

**Cause:** Page isn't rendering or you're on the wrong route

**Fix:**
1. Make sure you're at `https://propiq.luntra.one/pricing` (not `/pricing/` with trailing slash)
2. Reload the page
3. Check if page shows "Choose Your Plan" header

---

### Issue #2: Buttons are disabled
**Symptom:** `Button disabled? true`

**Cause:** You're already on that tier (shows "Current Plan")

**Fix:** Try clicking a different tier button that says "Choose"

---

### Issue #3: Manual listener fires but React doesn't
**Symptom:** Manual listener logs appear, but no `[PRICING]` logs

**Cause:** React event handler isn't attached or Convex isn't working

**Fix:** Check browser network tab for failed requests to Convex

---

### Issue #4: React root not rendering
**Symptom:** `React root has children: false`

**Cause:** JavaScript bundle failed to load or errored during initialization

**Fix:**
1. Check browser console for errors on page load
2. Look for red errors in Network tab
3. Try hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

---

## Full Diagnostic Script (All-in-One)

```javascript
// === PROPIQ PRICING PAGE DIAGNOSTIC ===
console.clear();
console.log('🔍 PropIQ Pricing Page Diagnostic\n');

// 1. Page info
console.log('1️⃣ PAGE INFO');
console.log('URL:', window.location.href);
console.log('Root exists:', !!document.getElementById('root'));
console.log('Root has content:', document.getElementById('root')?.children.length > 0);
console.log('');

// 2. Button count
console.log('2️⃣ BUTTON ANALYSIS');
const allButtons = document.querySelectorAll('button');
console.log(`Total buttons: ${allButtons.length}`);

const chooseButtons = Array.from(allButtons).filter(btn =>
  btn.textContent.includes('Choose') && !btn.textContent.includes('Current')
);
console.log(`"Choose" buttons: ${chooseButtons.length}`);
console.log('');

// 3. Button details
console.log('3️⃣ BUTTON DETAILS');
chooseButtons.forEach((btn, i) => {
  console.log(`Button ${i}:`);
  console.log('  Text:', btn.textContent.trim().substring(0, 30));
  console.log('  Disabled:', btn.disabled);
  console.log('  Has onClick:', !!btn.onclick);
  console.log('  Classes:', btn.className);
});
console.log('');

// 4. Add test listeners
console.log('4️⃣ ADDING TEST LISTENERS');
chooseButtons.forEach((btn, index) => {
  btn.addEventListener('click', (e) => {
    console.log(`✅ CLICK DETECTED on button ${index}!`);
    console.log('   Button text:', btn.textContent.trim().substring(0, 30));
  }, { capture: true });
});
console.log(`✅ Test listeners added to ${chooseButtons.length} buttons`);
console.log('');

// 5. Instructions
console.log('5️⃣ NEXT STEPS');
console.log('Now click a "Choose" button and see if you get:');
console.log('  ✅ "CLICK DETECTED" message (from our test)');
console.log('  ✅ "[PRICING]" messages (from React)');
console.log('');
console.log('If you see CLICK DETECTED but no [PRICING] messages,');
console.log('the React event handler is not attached.');
console.log('');
console.log('=== END DIAGNOSTIC ===');
```

---

## What to Share

After running the diagnostic:

1. **Copy the console output**
2. **Click a "Choose" button**
3. **Copy any new messages that appear**
4. **Share both with me**

This will tell us exactly where the click handler is failing!

---

**Created:** December 18, 2025
**Purpose:** Debug non-responsive pricing buttons
