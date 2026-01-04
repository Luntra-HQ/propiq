/**
 * GlassForm - PropIQ Styled Form Wrapper
 *
 * Wraps ShadCN Form component with PropIQ's glassmorphism aesthetic.
 * Use this for all forms to maintain consistent brand styling.
 *
 * @example
 * ```tsx
 * import { useForm } from 'react-hook-form';
 * import { zodResolver } from '@hookform/resolvers/zod';
 * import { GlassFormContainer, GlassFormSection } from '@/components/ui/GlassForm';
 * import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
 *
 * const form = useForm({ resolver: zodResolver(schema) });
 *
 * <GlassFormContainer>
 *   <Form {...form}>
 *     <GlassFormSection title="Property Details">
 *       <FormField ... />
 *     </GlassFormSection>
 *   </Form>
 * </GlassFormContainer>
 * ```
 */

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// GlassFormContainer - Main form container with glass aesthetic
// ============================================================================

interface GlassFormContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hero' | 'compact';
  children: React.ReactNode;
}

export const GlassFormContainer: React.FC<GlassFormContainerProps> = ({
  variant = 'default',
  className,
  children,
  ...props
}) => {
  const variantStyles = {
    default: 'p-6 sm:p-8',
    hero: 'p-8 sm:p-10',
    compact: 'p-4 sm:p-6',
  };

  return (
    <div
      className={cn(
        // Glass background
        'bg-gradient-to-br from-glass-medium to-surface-200',
        'backdrop-blur-glass',
        // Border and shadow
        'border border-glass-border',
        'shadow-card hover:shadow-card-hover',
        // Rounded corners
        'rounded-2xl',
        // Transitions
        'transition-all duration-300',
        // Variant spacing
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// ============================================================================
// GlassFormSection - Section within a form (with optional title)
// ============================================================================

interface GlassFormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export const GlassFormSection: React.FC<GlassFormSectionProps> = ({
  title,
  description,
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-semibold text-gray-50">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-gray-400">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
};

// ============================================================================
// GlassFormGrid - Responsive grid for form fields
// ============================================================================

interface GlassFormGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
}

export const GlassFormGrid: React.FC<GlassFormGridProps> = ({
  columns = 2,
  className,
  children,
  ...props
}) => {
  const gridColumns = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div
      className={cn(
        'grid gap-4',
        gridColumns[columns],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// ============================================================================
// GlassFormActions - Form action buttons container
// ============================================================================

interface GlassFormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right' | 'stretch';
  children: React.ReactNode;
}

export const GlassFormActions: React.FC<GlassFormActionsProps> = ({
  align = 'right',
  className,
  children,
  ...props
}) => {
  const alignmentStyles = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    stretch: 'justify-stretch',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 pt-6',
        align === 'stretch' ? 'flex-col sm:flex-row' : 'flex-row',
        alignmentStyles[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// ============================================================================
// GlassFormDivider - Visual separator between form sections
// ============================================================================

interface GlassFormDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export const GlassFormDivider: React.FC<GlassFormDividerProps> = ({
  label,
  className,
  ...props
}) => {
  if (label) {
    return (
      <div className={cn('relative py-4', className)} {...props}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-glass-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-surface-200 px-2 text-gray-400">{label}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('border-t border-glass-border my-6', className)}
      {...props}
    />
  );
};

// ============================================================================
// FormInputWrapper - Styled wrapper for individual form inputs
// ============================================================================

interface FormInputWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Shows a subtle highlight when input has a value
   */
  hasValue?: boolean;
  /**
   * Shows error state styling
   */
  hasError?: boolean;
  children: React.ReactNode;
}

export const FormInputWrapper: React.FC<FormInputWrapperProps> = ({
  hasValue,
  hasError,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'relative',
        // Optional highlight when filled
        hasValue && 'ring-1 ring-violet-500/20 rounded-lg',
        // Error state
        hasError && 'ring-1 ring-red-500/40 rounded-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// ============================================================================
// FormHint - Helper text component (improved styling over FormDescription)
// ============================================================================

interface FormHintProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const FormHint: React.FC<FormHintProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <p
      className={cn(
        'text-xs text-gray-400',
        'mt-1.5',
        'flex items-center gap-1',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
};

// ============================================================================
// FormSuccessMessage - Success state message
// ============================================================================

interface FormSuccessMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const FormSuccessMessage: React.FC<FormSuccessMessageProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'p-4 rounded-xl',
        'bg-emerald-500/10 border border-emerald-500/20',
        'text-sm text-emerald-300',
        'flex items-start gap-2',
        className
      )}
      role="status"
      aria-live="polite"
      {...props}
    >
      <svg
        className="w-5 h-5 flex-shrink-0 mt-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div>{children}</div>
    </div>
  );
};

// ============================================================================
// FormErrorMessage - Error state message (for form-level errors)
// ============================================================================

interface FormErrorMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const FormErrorMessage: React.FC<FormErrorMessageProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'p-4 rounded-xl',
        'bg-red-500/10 border border-red-500/20',
        'text-sm text-red-300',
        'flex items-start gap-2',
        className
      )}
      role="alert"
      aria-live="assertive"
      {...props}
    >
      <svg
        className="w-5 h-5 flex-shrink-0 mt-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div>{children}</div>
    </div>
  );
};

// ============================================================================
// Export all components
// ============================================================================

export default {
  Container: GlassFormContainer,
  Section: GlassFormSection,
  Grid: GlassFormGrid,
  Actions: GlassFormActions,
  Divider: GlassFormDivider,
  InputWrapper: FormInputWrapper,
  Hint: FormHint,
  Success: FormSuccessMessage,
  Error: FormErrorMessage,
};
