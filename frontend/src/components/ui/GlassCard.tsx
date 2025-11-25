/**
 * GlassCard Component - 2025 Design System
 *
 * Glassmorphism card with multiple variants for the bento grid layout.
 * Features frosted glass effect, subtle gradients, and hover animations.
 */

import React from 'react';

export type GlassCardVariant = 'default' | 'primary' | 'hero' | 'stat' | 'interactive';
export type GlassCardSize = 'sm' | 'md' | 'lg' | 'hero';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: GlassCardVariant;
  size?: GlassCardSize;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  glow?: boolean;
  hover?: boolean;
  as?: 'div' | 'button' | 'article' | 'section';
}

const variantStyles: Record<GlassCardVariant, string> = {
  default: `
    bg-gradient-to-br from-glass-medium to-surface-200
    border-glass-border
  `,
  primary: `
    bg-gradient-to-br from-violet-500/10 to-surface-200
    border-violet-500/20
    hover:border-violet-500/40
  `,
  hero: `
    bg-gradient-hero
    border-violet-500/30
    shadow-hero
  `,
  stat: `
    bg-gradient-to-br from-glass-light to-surface-100
    border-glass-border
  `,
  interactive: `
    bg-gradient-to-br from-glass-medium to-surface-200
    border-glass-border
    hover:border-glass-border-hover
    cursor-pointer
  `,
};

const sizeStyles: Record<GlassCardSize, string> = {
  sm: 'p-4 rounded-xl',
  md: 'p-5 rounded-2xl',
  lg: 'p-6 rounded-2xl',
  hero: 'p-8 rounded-3xl',
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  glow = false,
  hover = true,
  as: Component = 'div',
}) => {
  const baseStyles = `
    relative
    border
    backdrop-blur-glass
    shadow-card
    transition-all
    duration-300
    ease-smooth
  `;

  const hoverStyles = hover && !disabled ? `
    hover:shadow-card-hover
    hover:translate-y-[-2px]
    hover:border-glass-border-hover
  ` : '';

  const glowStyles = glow ? 'shadow-glow animate-glow-pulse' : '';

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';

  const interactiveStyles = onClick ? 'cursor-pointer active:scale-[0.98]' : '';

  const combinedClassName = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${hoverStyles}
    ${glowStyles}
    ${disabledStyles}
    ${interactiveStyles}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <Component
      className={combinedClassName}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {/* Inner glow effect */}
      <div className="absolute inset-0 rounded-inherit bg-gradient-glass opacity-50 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </Component>
  );
};

/**
 * GlassCardHeader - Consistent header styling for glass cards
 */
interface GlassCardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const GlassCardHeader: React.FC<GlassCardHeaderProps> = ({
  title,
  subtitle,
  icon,
  action,
}) => (
  <div className="flex items-start justify-between mb-4">
    <div className="flex items-center gap-3">
      {icon && (
        <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold text-gray-50">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-400">{subtitle}</p>
        )}
      </div>
    </div>
    {action && (
      <div className="flex-shrink-0">
        {action}
      </div>
    )}
  </div>
);

/**
 * GlassCardFooter - Footer with actions
 */
interface GlassCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCardFooter: React.FC<GlassCardFooterProps> = ({
  children,
  className = '',
}) => (
  <div className={`mt-4 pt-4 border-t border-glass-border ${className}`}>
    {children}
  </div>
);

export default GlassCard;
