/**
 * Button Component - 2025 Design System
 *
 * Interactive button with micro-interactions, loading states, and variants.
 * Features satisfying press feedback and hover effects.
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-violet-600 to-purple-600
    hover:from-violet-500 hover:to-purple-500
    text-white font-semibold
    shadow-lg shadow-violet-500/30
    hover:shadow-xl hover:shadow-violet-500/40
    focus:ring-violet-400
    disabled:from-violet-600/50 disabled:to-purple-600/50
  `,
  secondary: `
    bg-slate-700 hover:bg-slate-600
    border border-slate-600 hover:border-slate-500
    text-gray-100 font-medium
    shadow-md
    hover:shadow-lg
    focus:ring-slate-400
    disabled:bg-slate-700/50
  `,
  ghost: `
    bg-transparent hover:bg-white/5
    text-gray-300 hover:text-white
    font-medium
    focus:ring-slate-400
  `,
  danger: `
    bg-gradient-to-r from-red-600 to-rose-600
    hover:from-red-500 hover:to-rose-500
    text-white font-semibold
    shadow-lg shadow-red-500/30
    hover:shadow-xl hover:shadow-red-500/40
    focus:ring-red-400
    disabled:from-red-600/50 disabled:to-rose-600/50
  `,
  success: `
    bg-gradient-to-r from-emerald-600 to-green-600
    hover:from-emerald-500 hover:to-green-500
    text-white font-semibold
    shadow-lg shadow-emerald-500/30
    hover:shadow-xl hover:shadow-emerald-500/40
    focus:ring-emerald-400
    disabled:from-emerald-600/50 disabled:to-green-600/50
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
  xl: 'px-8 py-4 text-lg rounded-2xl gap-3',
};

const iconSizes: Record<ButtonSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
  xl: 'h-6 w-6',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || loading;

  const baseStyles = `
    relative
    inline-flex items-center justify-center
    transition-all duration-200 ease-smooth
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900
    disabled:cursor-not-allowed disabled:opacity-60
  `;

  // Micro-interaction styles
  const interactionStyles = !isDisabled ? `
    hover:translate-y-[-1px]
    active:translate-y-[0px] active:scale-[0.98]
  ` : '';

  const widthStyle = fullWidth ? 'w-full' : '';

  const combinedClassName = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${interactionStyles}
    ${widthStyle}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const iconElement = loading ? (
    <Loader2 className={`${iconSizes[size]} animate-spin`} />
  ) : icon ? (
    <span className={iconSizes[size]}>{icon}</span>
  ) : null;

  return (
    <button
      className={combinedClassName}
      disabled={isDisabled}
      {...props}
    >
      {/* Ripple effect container */}
      <span className="absolute inset-0 overflow-hidden rounded-inherit">
        <span className="ripple-effect" />
      </span>

      {/* Content */}
      <span className="relative flex items-center gap-inherit">
        {iconPosition === 'left' && iconElement}
        <span>{loading && loadingText ? loadingText : children}</span>
        {iconPosition === 'right' && iconElement}
      </span>
    </button>
  );
};

/**
 * IconButton - Compact button for icon-only actions
 */
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon: React.ReactNode;
  label: string; // For accessibility
}

const iconButtonSizes: Record<ButtonSize, string> = {
  sm: 'p-1.5 rounded-lg',
  md: 'p-2 rounded-xl',
  lg: 'p-2.5 rounded-xl',
  xl: 'p-3 rounded-2xl',
};

export const IconButton: React.FC<IconButtonProps> = ({
  variant = 'ghost',
  size = 'md',
  loading = false,
  icon,
  label,
  disabled,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || loading;

  const baseStyles = `
    inline-flex items-center justify-center
    transition-all duration-200 ease-smooth
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900
    disabled:cursor-not-allowed disabled:opacity-60
  `;

  const interactionStyles = !isDisabled ? `
    hover:translate-y-[-1px]
    active:translate-y-[0px] active:scale-[0.95]
  ` : '';

  // Simplified variant styles for icon buttons
  const iconVariantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-violet-600 hover:bg-violet-500 text-white focus:ring-violet-400',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-gray-100 focus:ring-slate-400',
    ghost: 'bg-transparent hover:bg-white/10 text-gray-400 hover:text-white focus:ring-slate-400',
    danger: 'bg-red-600 hover:bg-red-500 text-white focus:ring-red-400',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white focus:ring-emerald-400',
  };

  const combinedClassName = `
    ${baseStyles}
    ${iconVariantStyles[variant]}
    ${iconButtonSizes[size]}
    ${interactionStyles}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <button
      className={combinedClassName}
      disabled={isDisabled}
      aria-label={label}
      title={label}
      {...props}
    >
      {loading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : (
        <span className={iconSizes[size]}>{icon}</span>
      )}
    </button>
  );
};

export default Button;
