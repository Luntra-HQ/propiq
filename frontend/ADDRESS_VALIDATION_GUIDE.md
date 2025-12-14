# Address Validation Guide

## Overview

PropIQ now includes comprehensive frontend address validation to ensure property addresses are complete and correctly formatted before submitting to the AI analysis engine.

**Phase 1 Implementation: Enhanced Frontend Validation** ✅

- Real-time validation as users type
- Intelligent error detection and suggestions
- Component parsing (street number, city, state, ZIP)
- Typo detection
- US state and ZIP code validation

---

## Features

### ✅ **Real-Time Validation**

Validation runs automatically as users type addresses, with feedback appearing after 10 characters.

### ✅ **Multi-Level Feedback**

1. **Errors** (red) - Must be fixed before analysis
2. **Warnings** (yellow) - Recommended improvements
3. **Suggestions** (blue) - Optional enhancements
4. **Success** (green) - Address is ready for analysis

### ✅ **Component Parsing**

Automatically extracts and validates:
- Street number (e.g., "123")
- Street name (e.g., "Main St")
- Unit/Apt number (e.g., "Apt 2B")
- City (e.g., "Austin")
- State code (e.g., "TX")
- ZIP code (e.g., "78701" or "78701-1234")

### ✅ **Smart Validation Rules**

- Street number required at start
- Minimum address length (10 characters)
- Valid US state codes (50 states + DC)
- ZIP code format (5 or 9 digits)
- Comma separation checks
- Typo detection (common misspellings)
- Repeated word detection
- Long number sequence detection

---

## Usage Examples

### **Valid Addresses** ✅

```
2505 Longview St, Austin, TX 78705
1600 Pennsylvania Ave NW, Washington, DC 20500
350 Fifth Avenue, New York, NY 10118
100 Congress Ave, Suite 200, Austin, TX 78701
1 Apple Park Way, Cupertino, CA 95014-2083
```

### **Invalid Addresses** ❌

```
Main Street                          → Missing street number
123                                  → Too short, missing details
123 Main St, Fake City, ZZ 99999    → Invalid state code "ZZ"
123 Main St, Austin, TX 1234        → Invalid ZIP code format
Not an address                       → No valid components detected
```

### **Warnings** ⚠️

```
123 Main St, Austin, TX             → Missing ZIP code (warning, but allowed)
123 Main St Austin TX 78701         → Missing commas (warning about formatting)
123 Main Stret, Austin, TX 78701    → Typo detected: "stret" → "street"
```

---

## Validation Confidence Levels

### **High Confidence** 🟢
All 5 components present and valid:
- Street number ✓
- Street name ✓
- City ✓
- State ✓
- ZIP code ✓

**Example:** `123 Main St, Austin, TX 78701`

### **Medium Confidence** 🟡
3-4 components present, no errors

**Example:** `123 Main St, Austin, TX` (missing ZIP)

### **Low Confidence** 🔴
- Less than 3 components, OR
- Validation errors exist

**Example:** `123 Main St` (only 2 components)

---

## Component API

### **validateAddress(address: string)**

Main validation function - returns comprehensive validation result.

```typescript
import { validateAddress } from '../utils/addressValidation';

const result = validateAddress('123 Main St, Austin, TX 78701');

console.log(result);
// {
//   valid: true,
//   errors: [],
//   warnings: [],
//   suggestions: [],
//   components: {
//     streetNumber: '123',
//     streetName: 'Main St',
//     city: 'Austin',
//     state: 'TX',
//     zipCode: '78701'
//   },
//   confidence: 'high'
// }
```

### **parseAddress(address: string)**

Extract components from address string.

```typescript
import { parseAddress } from '../utils/addressValidation';

const components = parseAddress('456 Oak Ave, Apt 2B, Dallas, TX 75201');

console.log(components);
// {
//   streetNumber: '456',
//   streetName: 'Oak Ave',
//   unitNumber: '2B',
//   city: 'Dallas',
//   state: 'TX',
//   zipCode: '75201'
// }
```

### **isValidUSState(code: string)**

Check if state code is valid.

```typescript
import { isValidUSState } from '../utils/addressValidation';

isValidUSState('TX'); // true
isValidUSState('CA'); // true
isValidUSState('ZZ'); // false
```

### **isValidZipCode(zipCode: string)**

Validate ZIP code format.

```typescript
import { isValidZipCode } from '../utils/addressValidation';

isValidZipCode('78701');       // true (5 digits)
isValidZipCode('78701-1234');  // true (9 digits)
isValidZipCode('1234');        // false (too short)
```

### **formatAddress(components: AddressComponents)**

Format components into standardized address string.

```typescript
import { formatAddress } from '../utils/addressValidation';

const components = {
  streetNumber: '123',
  streetName: 'Main St',
  city: 'Austin',
  state: 'TX',
  zipCode: '78701'
};

const formatted = formatAddress(components);
// "123 Main St, Austin, TX 78701"
```

---

## Integration in Components

### **PropIQAnalysis Component**

The validation is integrated into `PropIQAnalysis.tsx` with real-time feedback:

```tsx
import { validateAddress } from '../utils/addressValidation';

// Real-time validation on address change
useEffect(() => {
  if (address.trim().length > 0) {
    const result = validateAddress(address);
    setValidationResult(result);
    setShowValidation(address.trim().length >= 10);
  }
}, [address]);

// Validation check before API call
const handleAnalyze = async () => {
  const validation = validateAddress(address.trim());

  if (!validation.valid) {
    setError(validation.errors[0]);
    return;
  }

  // Proceed with analysis...
};
```

---

## Visual Feedback Components

### **Error Display** (Red Border + Alert Icon)

```tsx
{validationResult.errors.length > 0 && (
  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
    {validationResult.errors.map((error, idx) => (
      <div key={idx} className="flex items-start gap-2 text-red-400">
        <AlertTriangle className="h-4 w-4" />
        <span>{error}</span>
      </div>
    ))}
  </div>
)}
```

### **Warning Display** (Yellow Border + Info Icon)

```tsx
{validationResult.warnings.length > 0 && (
  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
    {validationResult.warnings.map((warning, idx) => (
      <div key={idx} className="flex items-start gap-2 text-yellow-400">
        <Info className="h-4 w-4" />
        <span>{warning}</span>
      </div>
    ))}
  </div>
)}
```

### **Success Display** (Green Checkmark)

```tsx
{validationResult.valid && validationResult.confidence === 'high' && (
  <div className="flex items-center gap-2 text-green-400">
    <CheckCircle className="h-4 w-4" />
    <span>Address looks complete and ready for analysis</span>
  </div>
)}
```

---

## Testing

### **Run Tests**

```bash
cd frontend
npm test addressValidation
```

### **Test Coverage**

- ✅ Valid addresses (complete, with units, 9-digit ZIPs)
- ✅ Invalid addresses (missing components, wrong formats)
- ✅ Edge cases (typos, repeated words, special characters)
- ✅ US state validation (all 50 + DC)
- ✅ ZIP code validation (5 and 9 digit formats)
- ✅ Component parsing accuracy
- ✅ Confidence level calculation
- ✅ Real-world address examples

---

## Future Enhancements (Phase 2 & 3)

### **Phase 2: Address Autocomplete** (Planned)
- Google Places Autocomplete API integration
- Dropdown suggestions as users type
- Auto-fill city, state, ZIP from selected address
- Coordinates capture for mapping features

### **Phase 3: Backend Geocoding** (Planned)
- Server-side address verification
- USPS standardization
- Latitude/longitude storage
- Invalid address rejection before analysis

---

## Troubleshooting

### **Validation not showing?**
- Check that address length >= 10 characters
- Validation only displays after user has typed enough

### **False positive typo detection?**
- Typo detection uses common misspellings
- Warnings don't block submission (only errors do)

### **State code not recognized?**
- Must be 2-letter uppercase code (TX, CA, NY, etc.)
- Check `US_STATES` constant for complete list

### **ZIP code validation failing?**
- Must be exactly 5 digits OR 5 digits + dash + 4 digits
- Format: `12345` or `12345-6789`

---

## Performance

- **Validation speed:** < 5ms per address
- **No network calls:** Pure frontend validation
- **Zero cost:** No external API usage
- **Real-time:** Debounced input (no lag)

---

## Accessibility

- ✅ ARIA labels on address input
- ✅ `aria-invalid` attribute set when validation fails
- ✅ Error messages linked to input via `aria-describedby`
- ✅ Color-blind friendly (icons + text, not just color)
- ✅ Keyboard navigation support

---

## Best Practices

1. **Always validate before API calls** - Prevents wasted AI analysis credits
2. **Show warnings, don't block** - Let users proceed with warnings if needed
3. **Provide helpful error messages** - Tell users exactly what's wrong
4. **Parse and display components** - Help users verify their input
5. **Use confidence levels** - Guide users toward complete addresses

---

## Examples in Code

### **Example 1: Basic Validation**

```typescript
const result = validateAddress('123 Main St, Austin, TX 78701');

if (result.valid) {
  console.log('✓ Address is valid!');
  console.log('Confidence:', result.confidence);
  console.log('Components:', result.components);
} else {
  console.log('✗ Validation failed');
  console.log('Errors:', result.errors);
}
```

### **Example 2: Handling Warnings**

```typescript
const result = validateAddress('123 Main St, Austin, TX');

if (!result.valid) {
  // Block submission
  alert(result.errors.join('\n'));
} else if (result.warnings.length > 0) {
  // Show warnings but allow submission
  console.warn('Warnings:', result.warnings);
  // User can still proceed
} else {
  // Perfect!
  submitAddress(address);
}
```

### **Example 3: Auto-Fill Components**

```typescript
const result = validateAddress(userInput);

if (result.components.city) {
  setCityField(result.components.city);
}
if (result.components.state) {
  setStateField(result.components.state);
}
if (result.components.zipCode) {
  setZipField(result.components.zipCode);
}
```

---

## Support

For issues or questions about address validation:
- Check test file: `frontend/src/utils/__tests__/addressValidation.test.ts`
- Review implementation: `frontend/src/utils/addressValidation.ts`
- See integration: `frontend/src/components/PropIQAnalysis.tsx`

---

**Last Updated:** 2025-01-13
**Phase:** 1 - Enhanced Frontend Validation ✅
**Next Phase:** 2 - Address Autocomplete (Mapbox/Google Places)
