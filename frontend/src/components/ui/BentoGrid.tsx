/**
 * BentoGrid Component - 2025 Design System
 *
 * Modular, asymmetric grid layout inspired by Japanese bento boxes.
 * Creates visual hierarchy through varied card sizes and positions.
 */

import React from 'react';

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

const gapStyles = {
  sm: 'gap-3',
  md: 'gap-4 md:gap-5',
  lg: 'gap-5 md:gap-6',
};

const colStyles = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

export const BentoGrid: React.FC<BentoGridProps> = ({
  children,
  className = '',
  cols = 3,
  gap = 'md',
}) => {
  return (
    <div
      className={`
        grid
        ${colStyles[cols]}
        ${gapStyles[gap]}
        auto-rows-auto
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
};

/**
 * BentoItem - Grid item with span controls
 */
interface BentoItemProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3 | 4 | 'full';
  rowSpan?: 1 | 2 | 3;
  order?: number;
}

const colSpanStyles = {
  1: '',
  2: 'md:col-span-2',
  3: 'md:col-span-2 lg:col-span-3',
  4: 'md:col-span-2 lg:col-span-4',
  full: 'col-span-full',
};

const rowSpanStyles = {
  1: '',
  2: 'md:row-span-2',
  3: 'md:row-span-3',
};

export const BentoItem: React.FC<BentoItemProps> = ({
  children,
  className = '',
  colSpan = 1,
  rowSpan = 1,
  order,
}) => {
  const orderStyle = order !== undefined ? { order } : {};

  return (
    <div
      className={`
        ${colSpanStyles[colSpan]}
        ${rowSpanStyles[rowSpan]}
        animate-scale-in
        ${className}
      `.trim()}
      style={orderStyle}
    >
      {children}
    </div>
  );
};

/**
 * BentoDashboard - Pre-configured dashboard layout
 *
 * Layout structure:
 * ┌─────────────────────┬───────────┐
 * │                     │   Stat 1  │
 * │   Hero Card         ├───────────┤
 * │   (PropIQ)          │   Stat 2  │
 * │                     │           │
 * ├───────────┬─────────┴───────────┤
 * │  Card 1   │      Card 2         │
 * └───────────┴─────────────────────┘
 */
interface BentoDashboardProps {
  heroCard: React.ReactNode;
  statsCards: React.ReactNode[];
  mainCards: React.ReactNode[];
  className?: string;
}

export const BentoDashboard: React.FC<BentoDashboardProps> = ({
  heroCard,
  statsCards,
  mainCards,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 ${className}`}>
      {/* Hero Section - Takes 2 cols on large screens */}
      <div className="lg:col-span-2 lg:row-span-2">
        {heroCard}
      </div>

      {/* Stats Column - Stacked on the right */}
      <div className="flex flex-col gap-4 md:gap-5">
        {statsCards.map((stat, index) => (
          <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
            {stat}
          </div>
        ))}
      </div>

      {/* Bottom Row - Full width cards */}
      {mainCards.map((card, index) => (
        <div
          key={index}
          className={`
            ${index === 0 ? 'lg:col-span-1' : 'lg:col-span-2'}
            animate-slide-up
          `}
          style={{ animationDelay: `${(statsCards.length + index) * 100}ms` }}
        >
          {card}
        </div>
      ))}
    </div>
  );
};

/**
 * BentoBackground - Gradient mesh background for dashboard
 */
export const BentoBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative min-h-screen bg-slate-900">
    {/* Gradient mesh background */}
    <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />

    {/* Subtle noise texture overlay */}
    <div className="fixed inset-0 bg-noise opacity-[0.02] pointer-events-none" />

    {/* Content */}
    <div className="relative z-10">
      {children}
    </div>
  </div>
);

export default BentoGrid;
