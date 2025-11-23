/**
 * UI Components - 2025 Design System
 *
 * Export all reusable UI components from a single entry point.
 */

// Layout Components
export { GlassCard, GlassCardHeader, GlassCardFooter } from './GlassCard';
export type { GlassCardVariant, GlassCardSize } from './GlassCard';

export { BentoGrid, BentoItem, BentoDashboard, BentoBackground } from './BentoGrid';

// Interactive Components
export { Button, IconButton } from './Button';
export type { ButtonVariant, ButtonSize } from './Button';

// Feedback Components
export { ToastProvider, useToast } from './Toast';
export type { ToastType, ToastPosition } from './Toast';

// Loading States
export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonStat,
  SkeletonHero,
  SkeletonTable,
  SkeletonAvatar,
  SkeletonDashboard,
} from './Skeleton';

// Celebration & Success
export {
  Confetti,
  SuccessBurst,
  SuccessMessage,
  ScoreReveal,
} from './Celebration';

// Analysis Progress
export {
  AnalysisProgress,
  AnalysisProgressOverlay,
  useAnalysisProgress,
} from './AnalysisProgress';
export type { AnalysisStep } from './AnalysisProgress';

// Streaming Text (AI Experience)
export {
  StreamingText,
  StreamingParagraph,
  StreamingList,
  AIThinkingIndicator,
} from './StreamingText';

// Deal Score & Metrics (AI Experience)
export {
  DealScore,
  RecommendationBadge,
  ConfidenceIndicator,
  RiskLevel,
  MetricCard,
} from './DealScore';

// Analysis Results
export { AnalysisResults } from './AnalysisResults';
