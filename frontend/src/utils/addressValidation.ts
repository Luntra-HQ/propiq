/**
 * Address Validation Utilities for PropIQ
 *
 * Provides frontend validation for property addresses to catch errors
 * before making API calls to the backend.
 *
 * Phase 1: Enhanced validation (no external API calls)
 * - Format validation
 * - Component extraction and verification
 * - Common typo detection
 * - US state and ZIP code validation
 */

// ============================================
// CONSTANTS
// ============================================

/**
 * All US state codes (2-letter abbreviations)
 */
export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC' // District of Columbia
] as const;

/**
 * Common address typos to detect
 */
const COMMON_TYPOS: Record<string, string> = {
  'stret': 'street',
  'streat': 'street',
  'avenu': 'avenue',
  'aveune': 'avenue',
  'citty': 'city',
  'ciyt': 'city',
  'raod': 'road',
  'driev': 'drive',
  'boulvard': 'boulevard',
  'blv': 'boulevard',
  'plza': 'plaza',
};

/**
 * Common street type abbreviations (for normalization suggestions)
 */
const STREET_ABBREVIATIONS: Record<string, string> = {
  'street': 'St',
  'avenue': 'Ave',
  'road': 'Rd',
  'drive': 'Dr',
  'boulevard': 'Blvd',
  'lane': 'Ln',
  'court': 'Ct',
  'circle': 'Cir',
  'way': 'Way',
  'place': 'Pl',
  'parkway': 'Pkwy',
};

// ============================================
// TYPES
// ============================================

export interface AddressComponents {
  streetNumber?: string;
  streetName?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  unitNumber?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  components: AddressComponents;
  confidence: 'high' | 'medium' | 'low';
}

// ============================================
// PARSING FUNCTIONS
// ============================================

/**
 * Parse address string into components
 *
 * Expected format: "123 Main St, Austin, TX 78701"
 * Also handles: "123 Main St, Apt 4B, Austin, TX 78701"
 */
export function parseAddress(address: string): AddressComponents {
  const trimmed = address.trim();
  const components: AddressComponents = {};

  // Extract ZIP code (5 or 9 digits)
  const zipMatch = trimmed.match(/\b(\d{5})(?:-(\d{4}))?\b/);
  if (zipMatch) {
    components.zipCode = zipMatch[0];
  }

  // Extract state code (2 capital letters, often before ZIP)
  const stateMatch = trimmed.match(/\b([A-Z]{2})\b(?:\s+\d{5})?/);
  if (stateMatch) {
    components.state = stateMatch[1];
  }

  // Extract street number (digits at start, possibly with letter suffix)
  const streetNumMatch = trimmed.match(/^(\d+[A-Za-z]?)\s/);
  if (streetNumMatch) {
    components.streetNumber = streetNumMatch[1];
  }

  // Extract unit number (Apt, Unit, Suite, #, etc.)
  const unitMatch = trimmed.match(/(?:apt|apartment|unit|suite|ste|#)\s*([A-Za-z0-9-]+)/i);
  if (unitMatch) {
    components.unitNumber = unitMatch[1];
  }

  // Extract city (word(s) before state code)
  if (components.state) {
    const cityMatch = trimmed.match(/,\s*([^,]+?)\s*,?\s*[A-Z]{2}\b/);
    if (cityMatch) {
      components.city = cityMatch[1].trim();
    }
  }

  // Extract street name (between street number and first comma)
  if (components.streetNumber) {
    const streetMatch = trimmed.match(new RegExp(`^${components.streetNumber}\\s+(.+?)(?:,|$)`));
    if (streetMatch) {
      components.streetName = streetMatch[1].trim();
    }
  }

  return components;
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Check if a string is a valid US state code
 */
export function isValidUSState(code: string): boolean {
  return US_STATES.includes(code.toUpperCase() as any);
}

/**
 * Check if ZIP code format is valid
 */
export function isValidZipCode(zipCode: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(zipCode);
}

/**
 * Detect common typos in address text
 */
function detectTypos(address: string): Array<{ typo: string; correction: string }> {
  const lowercased = address.toLowerCase();
  const detected: Array<{ typo: string; correction: string }> = [];

  for (const [typo, correction] of Object.entries(COMMON_TYPOS)) {
    if (lowercased.includes(typo)) {
      detected.push({ typo, correction });
    }
  }

  return detected;
}

/**
 * Generate address suggestions for improvement
 */
function generateSuggestions(address: string, components: AddressComponents): string[] {
  const suggestions: string[] = [];

  // Suggest adding missing components
  if (!components.zipCode) {
    suggestions.push('Consider adding a ZIP code for better accuracy');
  }

  if (!components.state) {
    suggestions.push('Include the state code (e.g., TX, CA, NY)');
  }

  if (!components.city) {
    suggestions.push('Include the city name for verification');
  }

  // Suggest using standard abbreviations if address is very long
  if (address.length > 80) {
    suggestions.push('Consider using standard abbreviations (St, Ave, Blvd) to shorten the address');
  }

  return suggestions;
}

/**
 * Calculate confidence score based on address completeness
 */
function calculateConfidence(components: AddressComponents, errors: string[]): 'high' | 'medium' | 'low' {
  if (errors.length > 0) return 'low';

  const hasStreetNumber = !!components.streetNumber;
  const hasStreetName = !!components.streetName;
  const hasCity = !!components.city;
  const hasState = !!components.state;
  const hasZipCode = !!components.zipCode;

  const score = [hasStreetNumber, hasStreetName, hasCity, hasState, hasZipCode].filter(Boolean).length;

  if (score === 5) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

// ============================================
// MAIN VALIDATION FUNCTION
// ============================================

/**
 * Comprehensive address validation
 *
 * Returns validation result with errors, warnings, and suggestions
 *
 * @example
 * const result = validateAddress('123 Main St, Austin, TX 78701');
 * if (!result.valid) {
 *   console.error('Validation errors:', result.errors);
 * }
 */
export function validateAddress(address: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const trimmed = address.trim();

  // Basic presence check
  if (!trimmed) {
    return {
      valid: false,
      errors: ['Address is required'],
      warnings: [],
      suggestions: [],
      components: {},
      confidence: 'low'
    };
  }

  // Minimum length check
  if (trimmed.length < 10) {
    errors.push('Address seems too short. Please enter a complete address.');
  }

  // Parse address components
  const components = parseAddress(trimmed);

  // Check for street number
  if (!components.streetNumber) {
    errors.push('Address must start with a street number (e.g., "123 Main St")');
  } else {
    // Street number should be reasonable (1-9999999)
    const numValue = parseInt(components.streetNumber);
    if (numValue < 1 || numValue > 9999999) {
      warnings.push(`Street number ${components.streetNumber} seems unusual`);
    }
  }

  // Check for street name
  if (!components.streetName) {
    errors.push('Please include the street name');
  } else if (components.streetName.length < 2) {
    errors.push('Street name seems too short');
  }

  // Check for city, state separator (commas)
  const commaCount = (trimmed.match(/,/g) || []).length;
  if (commaCount === 0) {
    warnings.push('Use commas to separate street, city, and state (e.g., "123 Main St, Austin, TX")');
  }

  // Validate state code
  if (components.state) {
    if (!isValidUSState(components.state)) {
      errors.push(`"${components.state}" is not a valid US state code`);
    }
  } else {
    warnings.push('Include state code for better accuracy (e.g., TX, CA, NY)');
  }

  // Validate ZIP code
  if (components.zipCode) {
    if (!isValidZipCode(components.zipCode)) {
      errors.push('ZIP code must be 5 digits or 9 digits (e.g., 12345 or 12345-6789)');
    }
  } else {
    warnings.push('Include ZIP code for precise location matching');
  }

  // Detect typos
  const typos = detectTypos(trimmed);
  if (typos.length > 0) {
    typos.forEach(({ typo, correction }) => {
      warnings.push(`Possible typo: "${typo}" → did you mean "${correction}"?`);
    });
  }

  // Check for suspicious patterns
  if (/\d{6,}/.test(trimmed) && !components.zipCode) {
    warnings.push('Detected long number sequence - make sure ZIP code is separated');
  }

  // Check for repeated words (common copy-paste error)
  const words = trimmed.toLowerCase().split(/\s+/);
  const repeatedWords = words.filter((word, index) => word === words[index + 1]);
  if (repeatedWords.length > 0) {
    warnings.push(`Repeated word detected: "${repeatedWords[0]}" - please review`);
  }

  // Generate suggestions
  const suggestions = generateSuggestions(trimmed, components);

  // Calculate confidence
  const confidence = calculateConfidence(components, errors);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
    components,
    confidence
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format address components into standardized string
 */
export function formatAddress(components: AddressComponents): string {
  const parts: string[] = [];

  if (components.streetNumber && components.streetName) {
    parts.push(`${components.streetNumber} ${components.streetName}`);
  }

  if (components.unitNumber) {
    parts[0] = `${parts[0]}, ${components.unitNumber}`;
  }

  if (components.city) {
    parts.push(components.city);
  }

  if (components.state) {
    const statePart = components.zipCode
      ? `${components.state} ${components.zipCode}`
      : components.state;
    parts.push(statePart);
  } else if (components.zipCode) {
    parts.push(components.zipCode);
  }

  return parts.join(', ');
}

/**
 * Get a user-friendly description of validation confidence
 */
export function getConfidenceDescription(confidence: 'high' | 'medium' | 'low'): string {
  switch (confidence) {
    case 'high':
      return 'Address looks complete and well-formatted';
    case 'medium':
      return 'Address is acceptable but missing some details';
    case 'low':
      return 'Address needs improvement - please add more details';
  }
}

/**
 * Quick validation - returns just true/false (for simple checks)
 */
export function isValidAddress(address: string): boolean {
  const result = validateAddress(address);
  return result.valid;
}
