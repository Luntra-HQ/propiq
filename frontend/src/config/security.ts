/**
 * Security Configuration Validation
 *
 * Validates critical security settings before app startup
 * Prevents common misconfigurations that could lead to vulnerabilities
 */

interface SecurityConfig {
  convexUrl: string | undefined;
  environment: string;
  isProd: boolean;
  isDev: boolean;
}

interface SecurityCheck {
  name: string;
  passed: boolean;
  error?: string;
}

/**
 * Validate security configuration on app startup
 * Throws error if critical security issues are detected
 */
export function validateSecurityConfig(): void {
  const config: SecurityConfig = {
    convexUrl: import.meta.env.VITE_CONVEX_URL,
    environment: import.meta.env.MODE,
    isProd: import.meta.env.PROD === true,
    isDev: import.meta.env.DEV === true,
  };

  const checks: SecurityCheck[] = [
    // Check 1: HTTPS required in production
    {
      name: 'HTTPS in production',
      passed: !config.isProd || (!!config.convexUrl && config.convexUrl.startsWith('https://')),
      error: 'VITE_CONVEX_URL must use HTTPS in production',
    },

    // Check 2: No localhost in production
    {
      name: 'No localhost in production',
      passed: !config.isProd || !config.convexUrl?.includes('localhost'),
      error: 'Cannot use localhost URLs in production',
    },

    // Check 3: URL is set
    {
      name: 'URL exists',
      passed: !!config.convexUrl && config.convexUrl.length > 0,
      error: 'VITE_CONVEX_URL is not set',
    },

    // Check 4: Not a placeholder
    {
      name: 'Not a placeholder',
      passed: !config.convexUrl?.includes('YOUR_') &&
              !config.convexUrl?.includes('REPLACE_') &&
              !config.convexUrl?.includes('EXAMPLE'),
      error: 'VITE_CONVEX_URL appears to be a placeholder value',
    },

    // Check 5: Valid Convex domain
    {
      name: 'Valid Convex domain',
      passed: !config.convexUrl ||
              config.convexUrl.includes('.convex.cloud') ||
              config.convexUrl.includes('.convex.site') ||
              config.convexUrl.includes('localhost'), // Allow localhost in dev
      error: 'VITE_CONVEX_URL must be a valid Convex domain (.convex.cloud or .convex.site)',
    },
  ];

  // Collect all failed checks
  const failed = checks.filter(check => !check.passed);

  if (failed.length > 0) {
    const errorMessage = [
      '🔒 SECURITY CONFIGURATION ERROR',
      '',
      'The following security checks failed:',
      ...failed.map(check => `  ❌ ${check.name}: ${check.error}`),
      '',
      'Current configuration:',
      `  Environment: ${config.environment}`,
      `  Production: ${config.isProd}`,
      `  Convex URL: ${config.convexUrl || '(not set)'}`,
      '',
      'Please check your .env file and ensure:',
      '  1. VITE_CONVEX_URL is set correctly',
      '  2. HTTPS is used in production',
      '  3. No placeholder values remain',
      '',
      'See .env.example for proper configuration.',
    ].join('\n');

    throw new Error(errorMessage);
  }

  // Log validation success in development
  if (config.isDev) {
    console.log('[SECURITY] Configuration validated successfully');
    console.log('[SECURITY] Environment:', config.environment);
    console.log('[SECURITY] Convex URL:', config.convexUrl);
  }
}

/**
 * Check if running in a secure context (HTTPS or localhost)
 * Used for features that require secure context (e.g., Web Crypto API)
 */
export function isSecureContext(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // Browsers provide window.isSecureContext
  if (window.isSecureContext !== undefined) {
    return window.isSecureContext;
  }

  // Fallback: Check if HTTPS or localhost
  const { protocol, hostname } = window.location;
  return (
    protocol === 'https:' ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]'
  );
}

/**
 * Get security headers that should be present in API responses
 * Used for validation during development
 */
export function getExpectedSecurityHeaders(): string[] {
  return [
    'Content-Security-Policy',
    'X-Frame-Options',
    'X-Content-Type-Options',
    'X-XSS-Protection',
    'Strict-Transport-Security',
    'Referrer-Policy',
    'Permissions-Policy',
  ];
}
