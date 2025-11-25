/**
 * Accessibility Components - 2025 Design System
 *
 * WCAG AA compliant components for improved accessibility:
 * - Skip navigation link
 * - Screen reader announcements
 * - Focus trap for modals
 * - Reduced motion preferences
 */

import React, { useEffect, useRef, useState } from 'react';

/**
 * SkipLink - Skip to main content for keyboard users
 */
interface SkipLinkProps {
  targetId?: string;
  children?: React.ReactNode;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId = 'main-content',
  children = 'Skip to main content',
}) => {
  return (
    <a
      href={`#${targetId}`}
      className="
        sr-only focus:not-sr-only
        focus:fixed focus:top-4 focus:left-4 focus:z-[100]
        focus:px-4 focus:py-2 focus:rounded-lg
        focus:bg-violet-600 focus:text-white focus:font-semibold
        focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-slate-900
        transition-all
      "
    >
      {children}
    </a>
  );
};

/**
 * VisuallyHidden - Screen reader only content
 */
interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({
  children,
  as = 'span',
}) => {
  const Tag = as;
  return (
    <Tag className="sr-only">
      {children}
    </Tag>
  );
};

/**
 * LiveRegion - Announce dynamic content to screen readers
 */
interface LiveRegionProps {
  message: string;
  type?: 'polite' | 'assertive';
  clearAfter?: number;
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
  message,
  type = 'polite',
  clearAfter = 5000,
}) => {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (message) {
      setAnnouncement(message);
      if (clearAfter > 0) {
        const timer = setTimeout(() => setAnnouncement(''), clearAfter);
        return () => clearTimeout(timer);
      }
    }
  }, [message, clearAfter]);

  return (
    <div
      role="status"
      aria-live={type}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
};

/**
 * FocusTrap - Trap focus within a container (for modals)
 */
interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  restoreFocus?: boolean;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  active = true,
  restoreFocus = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    // Store previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus first focusable element
    const container = containerRef.current;
    if (container) {
      const focusable = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }

    return () => {
      // Restore focus when unmounting
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [active, restoreFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!active || e.key !== 'Tab') return;

    const container = containerRef.current;
    if (!container) return;

    const focusable = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div ref={containerRef} onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
};

/**
 * useReducedMotion - Detect user's motion preference
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
};

/**
 * useAnnounce - Hook for programmatic announcements
 */
export const useAnnounce = () => {
  const [message, setMessage] = useState('');

  const announce = (text: string, delay = 100) => {
    // Clear first to ensure re-announcement
    setMessage('');
    setTimeout(() => setMessage(text), delay);
  };

  return { message, announce };
};

/**
 * useFocusReturn - Return focus to trigger element after modal closes
 */
export const useFocusReturn = (isOpen: boolean) => {
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
    } else if (triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [isOpen]);

  return triggerRef;
};

export default SkipLink;
