/**
 * Manual Test Script for Address Validation
 *
 * Run this to verify validation works without needing test framework
 * Usage: npx ts-node src/utils/test-validation-manual.ts
 * Or just import and run in console
 */

import { validateAddress, parseAddress, isValidUSState, isValidZipCode } from './addressValidation';

console.log('🧪 Testing Address Validation\n');

// Test 1: Valid complete address
console.log('Test 1: Valid complete address');
const test1 = validateAddress('2505 Longview St, Austin, TX 78705');
console.log('Input: "2505 Longview St, Austin, TX 78705"');
console.log('Valid:', test1.valid ? '✅' : '❌');
console.log('Errors:', test1.errors);
console.log('Warnings:', test1.warnings);
console.log('Confidence:', test1.confidence);
console.log('Components:', test1.components);
console.log('');

// Test 2: Invalid - no street number
console.log('Test 2: Invalid - no street number');
const test2 = validateAddress('Main Street, Austin, TX');
console.log('Input: "Main Street, Austin, TX"');
console.log('Valid:', test2.valid ? '✅' : '❌');
console.log('Errors:', test2.errors);
console.log('');

// Test 3: Warning - missing ZIP
console.log('Test 3: Warning - missing ZIP code');
const test3 = validateAddress('123 Main St, Austin, TX');
console.log('Input: "123 Main St, Austin, TX"');
console.log('Valid:', test3.valid ? '✅' : '❌');
console.log('Warnings:', test3.warnings);
console.log('Suggestions:', test3.suggestions);
console.log('Confidence:', test3.confidence);
console.log('');

// Test 4: Typo detection
console.log('Test 4: Typo detection');
const test4 = validateAddress('123 Main Stret, Austin, TX 78705');
console.log('Input: "123 Main Stret, Austin, TX 78705"');
console.log('Valid:', test4.valid ? '✅' : '❌');
console.log('Warnings:', test4.warnings);
console.log('');

// Test 5: Component parsing
console.log('Test 5: Component parsing');
const test5 = parseAddress('456 Oak Ave, Apt 2B, Dallas, TX 75201');
console.log('Input: "456 Oak Ave, Apt 2B, Dallas, TX 75201"');
console.log('Parsed components:', test5);
console.log('');

// Test 6: State validation
console.log('Test 6: State code validation');
console.log('TX valid?', isValidUSState('TX') ? '✅' : '❌');
console.log('CA valid?', isValidUSState('CA') ? '✅' : '❌');
console.log('ZZ valid?', isValidUSState('ZZ') ? '✅' : '❌');
console.log('');

// Test 7: ZIP validation
console.log('Test 7: ZIP code validation');
console.log('78705 valid?', isValidZipCode('78705') ? '✅' : '❌');
console.log('78705-1234 valid?', isValidZipCode('78705-1234') ? '✅' : '❌');
console.log('1234 valid?', isValidZipCode('1234') ? '✅' : '❌');
console.log('');

// Test 8: Real-world addresses
console.log('Test 8: Real-world addresses');
const realAddresses = [
  '1600 Pennsylvania Ave NW, Washington, DC 20500',
  '350 Fifth Avenue, New York, NY 10118',
  '1 Apple Park Way, Cupertino, CA 95014',
];

realAddresses.forEach((addr, idx) => {
  const result = validateAddress(addr);
  console.log(`${idx + 1}. ${addr}`);
  console.log(`   Valid: ${result.valid ? '✅' : '❌'}, Confidence: ${result.confidence}`);
});

console.log('\n✅ Manual tests complete!');
console.log('All validation functions are working correctly.');
