/**
 * Address Validation Tests
 *
 * Comprehensive test suite for address validation utilities
 */

// Note: This test file uses Vitest. If using Jest, replace with:
// import { describe, test, expect } from '@jest/globals';

// Vitest may not be installed yet. You can skip type checking for this file
// by adding it to tsconfig.json exclude, or install vitest:
// npm install -D vitest

// @ts-nocheck
import { describe, test, expect } from 'vitest';
import {
  validateAddress,
  parseAddress,
  isValidUSState,
  isValidZipCode,
  formatAddress,
  US_STATES,
} from '../addressValidation';

describe('Address Validation', () => {
  describe('parseAddress', () => {
    test('should parse complete address with all components', () => {
      const result = parseAddress('123 Main St, Austin, TX 78701');

      expect(result.streetNumber).toBe('123');
      expect(result.streetName).toBe('Main St');
      expect(result.city).toBe('Austin');
      expect(result.state).toBe('TX');
      expect(result.zipCode).toBe('78701');
    });

    test('should parse address with unit number', () => {
      const result = parseAddress('456 Oak Ave, Apt 2B, Dallas, TX 75201');

      expect(result.streetNumber).toBe('456');
      expect(result.streetName).toBe('Oak Ave');
      expect(result.unitNumber).toBe('2B');
      expect(result.city).toBe('Dallas');
      expect(result.state).toBe('TX');
      expect(result.zipCode).toBe('75201');
    });

    test('should parse address with 9-digit ZIP code', () => {
      const result = parseAddress('789 Elm St, Houston, TX 77001-1234');

      expect(result.zipCode).toBe('77001-1234');
    });

    test('should handle missing components gracefully', () => {
      const result = parseAddress('123 Main St');

      expect(result.streetNumber).toBe('123');
      expect(result.streetName).toBe('Main St');
      expect(result.city).toBeUndefined();
      expect(result.state).toBeUndefined();
      expect(result.zipCode).toBeUndefined();
    });
  });

  describe('isValidUSState', () => {
    test('should accept valid state codes', () => {
      expect(isValidUSState('TX')).toBe(true);
      expect(isValidUSState('CA')).toBe(true);
      expect(isValidUSState('NY')).toBe(true);
      expect(isValidUSState('DC')).toBe(true);
    });

    test('should reject invalid state codes', () => {
      expect(isValidUSState('XX')).toBe(false);
      expect(isValidUSState('ZZ')).toBe(false);
      expect(isValidUSState('ABC')).toBe(false);
    });

    test('should be case-insensitive', () => {
      expect(isValidUSState('tx')).toBe(true);
      expect(isValidUSState('Tx')).toBe(true);
    });
  });

  describe('isValidZipCode', () => {
    test('should accept valid 5-digit ZIP codes', () => {
      expect(isValidZipCode('78701')).toBe(true);
      expect(isValidZipCode('90210')).toBe(true);
      expect(isValidZipCode('10001')).toBe(true);
    });

    test('should accept valid 9-digit ZIP codes', () => {
      expect(isValidZipCode('78701-1234')).toBe(true);
      expect(isValidZipCode('90210-5678')).toBe(true);
    });

    test('should reject invalid ZIP codes', () => {
      expect(isValidZipCode('1234')).toBe(false);      // Too short
      expect(isValidZipCode('123456')).toBe(false);    // Too long
      expect(isValidZipCode('ABCDE')).toBe(false);     // Letters
      expect(isValidZipCode('12345-67')).toBe(false);  // Wrong format
    });
  });

  describe('validateAddress - Valid Addresses', () => {
    test('should validate complete, well-formatted address', () => {
      const result = validateAddress('2505 Longview St, Austin, TX 78705');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.confidence).toBe('high');
    });

    test('should validate address with unit number', () => {
      const result = validateAddress('100 Congress Ave, Suite 200, Austin, TX 78701');

      expect(result.valid).toBe(true);
      expect(result.components.unitNumber).toBe('200');
    });

    test('should validate address with 9-digit ZIP', () => {
      const result = validateAddress('1600 Pennsylvania Ave NW, Washington, DC 20500-0001');

      expect(result.valid).toBe(true);
      expect(result.components.zipCode).toBe('20500-0001');
    });
  });

  describe('validateAddress - Invalid Addresses', () => {
    test('should reject empty address', () => {
      const result = validateAddress('');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Address is required');
    });

    test('should reject address without street number', () => {
      const result = validateAddress('Main Street, Austin, TX');

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('street number'))).toBe(true);
    });

    test('should reject very short address', () => {
      const result = validateAddress('123 A');

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('too short'))).toBe(true);
    });

    test('should reject address with invalid state code', () => {
      const result = validateAddress('123 Main St, Austin, XX 78701');

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('not a valid US state'))).toBe(true);
    });

    test('should reject address with invalid ZIP code', () => {
      const result = validateAddress('123 Main St, Austin, TX 1234');

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('ZIP code'))).toBe(true);
    });
  });

  describe('validateAddress - Warnings and Suggestions', () => {
    test('should warn when missing commas', () => {
      const result = validateAddress('123 Main St Austin TX');

      expect(result.warnings.some(w => w.includes('comma'))).toBe(true);
    });

    test('should warn about missing state', () => {
      const result = validateAddress('123 Main St, Austin');

      expect(result.warnings.some(w => w.includes('state'))).toBe(true);
    });

    test('should warn about missing ZIP code', () => {
      const result = validateAddress('123 Main St, Austin, TX');

      expect(result.warnings.some(w => w.includes('ZIP'))).toBe(true);
    });

    test('should suggest adding ZIP code for better accuracy', () => {
      const result = validateAddress('123 Main St, Austin, TX');

      expect(result.suggestions.some(s => s.includes('ZIP code'))).toBe(true);
    });

    test('should detect typos', () => {
      const result = validateAddress('123 Main Stret, Austin, TX 78701');

      expect(result.warnings.some(w => w.includes('typo'))).toBe(true);
    });
  });

  describe('validateAddress - Confidence Levels', () => {
    test('should have high confidence for complete address', () => {
      const result = validateAddress('123 Main St, Austin, TX 78701');

      expect(result.confidence).toBe('high');
    });

    test('should have medium confidence for partially complete address', () => {
      const result = validateAddress('123 Main St, Austin, TX');

      expect(result.confidence).toBe('medium');
    });

    test('should have low confidence for incomplete address', () => {
      const result = validateAddress('123 Main St');

      expect(result.confidence).toBe('low');
    });

    test('should have low confidence when validation errors exist', () => {
      const result = validateAddress('123 Main St, Austin, XX');

      expect(result.confidence).toBe('low');
    });
  });

  describe('formatAddress', () => {
    test('should format complete address components', () => {
      const components = {
        streetNumber: '123',
        streetName: 'Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
      };

      const formatted = formatAddress(components);
      expect(formatted).toBe('123 Main St, Austin, TX 78701');
    });

    test('should format address with unit number', () => {
      const components = {
        streetNumber: '456',
        streetName: 'Oak Ave',
        unitNumber: 'Apt 2B',
        city: 'Dallas',
        state: 'TX',
        zipCode: '75201',
      };

      const formatted = formatAddress(components);
      expect(formatted).toBe('456 Oak Ave, Apt 2B, Dallas, TX 75201');
    });

    test('should format partial address components', () => {
      const components = {
        streetNumber: '789',
        streetName: 'Elm St',
        city: 'Houston',
      };

      const formatted = formatAddress(components);
      expect(formatted).toBe('789 Elm St, Houston');
    });
  });

  describe('Real-World Address Examples', () => {
    const validAddresses = [
      '1600 Pennsylvania Ave NW, Washington, DC 20500',
      '350 Fifth Avenue, New York, NY 10118', // Empire State Building
      '1 Apple Park Way, Cupertino, CA 95014',
      '2505 Longview St, Austin, TX 78705',
      '100 Universal City Plaza, Universal City, CA 91608',
    ];

    test.each(validAddresses)('should validate real address: %s', (address: string) => {
      const result = validateAddress(address);
      expect(result.valid).toBe(true);
    });

    const invalidAddresses = [
      'Not an address',
      '123',
      'Main Street',
      '123 Main St, Fake City, ZZ 99999',
    ];

    test.each(invalidAddresses)('should reject invalid address: %s', (address: string) => {
      const result = validateAddress(address);
      expect(result.valid).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('should handle address with repeated words', () => {
      const result = validateAddress('123 Main Main St, Austin, TX 78701');

      expect(result.warnings.some(w => w.includes('Repeated word'))).toBe(true);
    });

    test('should handle address with long number sequence', () => {
      const result = validateAddress('123 Main St 123456789, Austin, TX');

      expect(result.warnings.some(w => w.includes('long number'))).toBe(true);
    });

    test('should handle very long addresses', () => {
      const longAddress = '123 Very Long Street Name That Goes On And On Boulevard, City Name, TX 78701';
      const result = validateAddress(longAddress);

      expect(result.suggestions.some(s => s.includes('abbreviations'))).toBe(true);
    });

    test('should handle addresses with special characters', () => {
      const result = validateAddress("123 O'Connor St, Austin, TX 78701");

      expect(result.components.streetName).toContain("O'Connor");
    });

    test('should handle addresses with hyphens', () => {
      const result = validateAddress('123 Twenty-First St, Austin, TX 78701');

      expect(result.components.streetName).toContain('Twenty-First');
    });
  });

  describe('US States Constant', () => {
    test('should include all 50 states plus DC', () => {
      expect(US_STATES).toHaveLength(51);
    });

    test('should include DC', () => {
      expect(US_STATES).toContain('DC');
    });

    test('should include common states', () => {
      const commonStates = ['CA', 'TX', 'NY', 'FL', 'IL'];
      commonStates.forEach(state => {
        expect(US_STATES).toContain(state);
      });
    });
  });
});
