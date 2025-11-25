/**
 * Celebration Components - 2025 Design System
 *
 * Success animations and celebration effects for positive moments.
 * Creates joy and momentum in the user experience.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, Sparkles, Trophy, Star } from 'lucide-react';

/**
 * Confetti Particle
 */
interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocity: { x: number; y: number };
}

const COLORS = [
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#10b981', // emerald
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#ec4899', // pink
];

/**
 * Confetti - Particle burst celebration
 */
interface ConfettiProps {
  active: boolean;
  duration?: number;
  particleCount?: number;
  onComplete?: () => void;
}

export const Confetti: React.FC<ConfettiProps> = ({
  active,
  duration = 3000,
  particleCount = 50,
  onComplete,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  const createParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: 50 + (Math.random() - 0.5) * 20, // Start near center
        y: 50,
        rotation: Math.random() * 360,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 8 + Math.random() * 8,
        velocity: {
          x: (Math.random() - 0.5) * 15,
          y: -10 - Math.random() * 10,
        },
      });
    }
    return newParticles;
  }, [particleCount]);

  useEffect(() => {
    if (active) {
      setParticles(createParticles());
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [active, createParticles, duration, onComplete]);

  if (!active && particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            '--velocity-x': particle.velocity.x,
            '--velocity-y': particle.velocity.y,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

/**
 * SuccessBurst - Radial success animation
 */
interface SuccessBurstProps {
  active: boolean;
  size?: 'sm' | 'md' | 'lg';
  onComplete?: () => void;
}

const burstSizes = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
};

const iconSizes = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

export const SuccessBurst: React.FC<SuccessBurstProps> = ({
  active,
  size = 'md',
  onComplete,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div className={`relative ${burstSizes[size]}`}>
        {/* Ripple rings */}
        <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/30" />
        <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20 animation-delay-200" />

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center animate-scale-in">
          <div className="p-4 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/50">
            <CheckCircle className={`${iconSizes[size]} text-white`} />
          </div>
        </div>

        {/* Sparkles */}
        <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-amber-400 animate-bounce" />
        <Star className="absolute -bottom-1 -left-1 h-5 w-5 text-violet-400 animate-pulse" />
      </div>
    </div>
  );
};

/**
 * SuccessMessage - Animated success message overlay
 */
interface SuccessMessageProps {
  active: boolean;
  title: string;
  subtitle?: string;
  icon?: 'check' | 'trophy' | 'sparkles';
  duration?: number;
  onComplete?: () => void;
}

const icons = {
  check: CheckCircle,
  trophy: Trophy,
  sparkles: Sparkles,
};

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  active,
  title,
  subtitle,
  icon = 'check',
  duration = 2500,
  onComplete,
}) => {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (active) {
      setVisible(true);
      setExiting(false);

      const exitTimer = setTimeout(() => {
        setExiting(true);
      }, duration - 300);

      const hideTimer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, duration);

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [active, duration, onComplete]);

  if (!visible) return null;

  const Icon = icons[icon];

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div
        className={`
          flex flex-col items-center gap-4 p-8 rounded-3xl
          bg-slate-800/95 backdrop-blur-xl border border-emerald-500/30
          shadow-2xl shadow-emerald-500/20
          ${exiting ? 'animate-fadeOut' : 'animate-scale-in'}
        `}
      >
        {/* Icon container */}
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/30" />
          <div className="relative p-4 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/50">
            <Icon className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
          {subtitle && (
            <p className="text-gray-400">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * ScoreReveal - Animated score reveal (for deal scores)
 */
interface ScoreRevealProps {
  score: number;
  maxScore?: number;
  active: boolean;
  label?: string;
  onComplete?: () => void;
}

export const ScoreReveal: React.FC<ScoreRevealProps> = ({
  score,
  maxScore = 100,
  active,
  label = 'Deal Score',
  onComplete,
}) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setVisible(true);
      setDisplayScore(0);

      // Animate score counting up
      const duration = 1500;
      const steps = 60;
      const increment = score / steps;
      let current = 0;

      const interval = setInterval(() => {
        current += increment;
        if (current >= score) {
          setDisplayScore(score);
          clearInterval(interval);
          setTimeout(() => onComplete?.(), 500);
        } else {
          setDisplayScore(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }
  }, [active, score, onComplete]);

  if (!visible) return null;

  const percentage = (displayScore / maxScore) * 100;
  const strokeDasharray = 2 * Math.PI * 56; // circumference
  const strokeDashoffset = strokeDasharray * (1 - percentage / 100);

  // Color based on score
  let scoreColor = 'text-emerald-400';
  let strokeColor = 'stroke-emerald-500';
  if (score < 50) {
    scoreColor = 'text-red-400';
    strokeColor = 'stroke-red-500';
  } else if (score < 70) {
    scoreColor = 'text-amber-400';
    strokeColor = 'stroke-amber-500';
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm font-medium text-gray-400">{label}</p>
      <div className="relative w-32 h-32">
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            className="fill-none stroke-slate-700 stroke-[8]"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            className={`fill-none ${strokeColor} stroke-[8] transition-all duration-100`}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Score number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-4xl font-bold ${scoreColor}`}>
            {displayScore}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Confetti;
