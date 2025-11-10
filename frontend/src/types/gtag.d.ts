/**
 * Google Analytics gtag.js Type Definitions
 * Extends Window interface to include gtag function
 */

declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'set' | 'js',
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

export {};
