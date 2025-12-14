# Address Validation - Manual Testing Checklist

## 🚀 Dev Server Running

**URL:** http://localhost:5173/

The dev server is currently running in the background. Open this URL in your browser to test the validation.

---

## ✅ Testing Instructions

### **Step 1: Navigate to PropIQ Analysis**

1. Open http://localhost:5173/ in your browser
2. Log in (or create an account if needed)
3. Click on "Run PropIQ Analysis" or similar button to open the analysis modal
4. You should see the address input field

---

### **Step 2: Test Valid Addresses** ✅

Type each address below and verify you see **GREEN** success indicators:

#### Test 1: Complete Address
```
2505 Longview St, Austin, TX 78705
```
**Expected:**
- ✅ Green border on input
- ✅ Green checkmark icon
- ✅ "Address looks complete and ready for analysis"
- ✅ Expandable component preview showing:
  - Street #: 2505
  - Street: Longview St
  - City: Austin
  - State: TX
  - ZIP: 78705

#### Test 2: Address with Unit Number
```
100 Congress Ave, Suite 200, Austin, TX 78701
```
**Expected:**
- ✅ Green success indicator
- ✅ Component preview includes "Unit: 200"

#### Test 3: 9-Digit ZIP Code
```
1600 Pennsylvania Ave NW, Washington, DC 20500-0001
```
**Expected:**
- ✅ Green success indicator
- ✅ ZIP shows as: 20500-0001

---

### **Step 3: Test Invalid Addresses** ❌

Type each address below and verify you see **RED** error messages:

#### Test 1: No Street Number
```
Main Street, Austin, TX
```
**Expected:**
- ❌ Red border on input
- ❌ Error: "Address must start with a street number"

#### Test 2: Too Short
```
123 A
```
**Expected:**
- ❌ Red border
- ❌ Error: "Address seems too short"

#### Test 3: Invalid State Code
```
123 Main St, Austin, XX 78701
```
**Expected:**
- ❌ Red border
- ❌ Error: '"XX" is not a valid US state code'

#### Test 4: Invalid ZIP Code
```
123 Main St, Austin, TX 1234
```
**Expected:**
- ❌ Red border
- ❌ Error: "ZIP code must be 5 digits or 9 digits"

#### Test 5: Empty Address
```
(leave blank and try to submit)
```
**Expected:**
- ❌ Error: "Address is required" OR "Please enter a property address"

---

### **Step 4: Test Warnings** ⚠️

Type each address below and verify you see **YELLOW** warning messages:

#### Test 1: Missing ZIP Code
```
123 Main St, Austin, TX
```
**Expected:**
- ⚠️ Yellow warning box
- ⚠️ "Include ZIP code for precise location matching"
- ✅ Should still allow submission (not blocking)

#### Test 2: Typo Detection
```
123 Main Stret, Austin, TX 78705
```
**Expected:**
- ⚠️ Yellow warning
- ⚠️ 'Possible typo: "stret" → did you mean "street"?'
- ✅ Should still be valid (warnings don't block)

#### Test 3: Missing Commas
```
123 Main St Austin TX 78705
```
**Expected:**
- ⚠️ Yellow warning
- ⚠️ Suggestion to use commas to separate components

---

### **Step 5: Test Real-Time Validation**

1. Start typing: `123`
   - **Expected:** No validation feedback yet (too short)

2. Continue typing: `123 Main St`
   - **Expected:** Validation feedback should appear
   - Should show warnings about missing city/state

3. Complete typing: `123 Main St, Austin, TX 78701`
   - **Expected:** Validation updates in real-time
   - Should turn green when complete

---

### **Step 6: Test Component Preview**

1. Enter: `456 Oak Ave, Apt 2B, Dallas, TX 75201`

2. Click "View parsed address components" (details element)

3. **Expected to see:**
   ```
   Street #: 456
   Street: Oak Ave
   City: Dallas
   State: TX
   ZIP: 75201
   ```

---

### **Step 7: Test Submission Blocking**

1. Enter invalid address: `Main Street`

2. Try to click "Run PropIQ Analysis" button

3. **Expected:**
   - ❌ Error message appears
   - ❌ Analysis should NOT run
   - ❌ Should stay on input form

4. Fix the address: `123 Main Street, Austin, TX 78701`

5. Click "Run PropIQ Analysis" again

6. **Expected:**
   - ✅ Validation passes
   - ✅ Loading state appears
   - ✅ Analysis runs successfully

---

### **Step 8: Test Edge Cases**

#### Test 1: Apostrophes
```
123 O'Connor St, Austin, TX 78701
```
**Expected:** ✅ Should handle apostrophes correctly

#### Test 2: Hyphens
```
123 Twenty-First St, Austin, TX 78701
```
**Expected:** ✅ Should handle hyphens correctly

#### Test 3: Repeated Words
```
123 Main Main St, Austin, TX 78701
```
**Expected:** ⚠️ Warning about repeated word

#### Test 4: Very Long Address
```
123 Very Long Street Name That Goes On And On Boulevard, City Name, TX 78701
```
**Expected:** 💡 Suggestion to use abbreviations

---

## 🎨 Visual Check

Verify the following visual elements:

- [ ] Error messages have **AlertTriangle** icon (red)
- [ ] Warning messages have **Info** icon (yellow)
- [ ] Success message has **CheckCircle** icon (green)
- [ ] Suggestions have **Lightbulb** icon (blue)
- [ ] Input border changes color based on validation state
- [ ] Component preview is expandable/collapsible
- [ ] All text is readable and properly styled
- [ ] Icons align properly with text
- [ ] No layout shifts when validation appears

---

## ♿ Accessibility Check

1. **Keyboard Navigation:**
   - [ ] Can tab to address input
   - [ ] Can type without mouse
   - [ ] Can expand/collapse component preview with keyboard

2. **Screen Reader:**
   - [ ] Input has proper `aria-label`
   - [ ] Error state sets `aria-invalid="true"`
   - [ ] Validation messages are announced

---

## 📱 Responsive Check

Test on different screen sizes:

1. **Desktop (1920x1080):**
   - [ ] Validation messages fit properly
   - [ ] Component preview readable

2. **Tablet (768x1024):**
   - [ ] Layout adjusts correctly
   - [ ] No text overflow

3. **Mobile (375x667):**
   - [ ] Validation feedback displays properly
   - [ ] Touch-friendly interaction

---

## ✅ Acceptance Criteria

All of the following should be true:

- [ ] Valid addresses show green success indicator
- [ ] Invalid addresses show red error messages
- [ ] Warnings appear but don't block submission
- [ ] Real-time validation works as user types
- [ ] Component parsing shows correct data
- [ ] Typo detection identifies common mistakes
- [ ] US state validation works (TX=valid, XX=invalid)
- [ ] ZIP code validation works (78701=valid, 1234=invalid)
- [ ] Edge cases handled gracefully
- [ ] Visual design matches PropIQ style
- [ ] Accessibility features work
- [ ] Responsive on all screen sizes

---

## 🐛 Found Issues?

If you find any bugs or unexpected behavior:

1. **Document the issue:**
   - What address did you enter?
   - What did you expect to see?
   - What actually happened?

2. **Check the browser console:**
   - Open DevTools (F12)
   - Look for errors in Console tab
   - Copy any error messages

3. **Check validation result:**
   - Open Console tab in DevTools
   - Type: `validateAddress("your test address")`
   - See what the validation returns

---

## 🎯 Next: Build for Production

Once all tests pass:

1. Stop the dev server (Ctrl+C if needed)
2. Run: `npm run build`
3. Verify build succeeds
4. Deploy to production

---

## 📝 Test Results

**Date:** _______________
**Tester:** _______________

| Test | Status | Notes |
|------|--------|-------|
| Valid addresses | ⬜ Pass / ⬜ Fail | |
| Invalid addresses | ⬜ Pass / ⬜ Fail | |
| Warnings | ⬜ Pass / ⬜ Fail | |
| Real-time validation | ⬜ Pass / ⬜ Fail | |
| Component preview | ⬜ Pass / ⬜ Fail | |
| Submission blocking | ⬜ Pass / ⬜ Fail | |
| Edge cases | ⬜ Pass / ⬜ Fail | |
| Visual design | ⬜ Pass / ⬜ Fail | |
| Accessibility | ⬜ Pass / ⬜ Fail | |
| Responsive | ⬜ Pass / ⬜ Fail | |

**Overall Result:** ⬜ PASS / ⬜ FAIL

**Ready for Production:** ⬜ YES / ⬜ NO

---

**Happy Testing! 🎉**
