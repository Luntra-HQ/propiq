import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { TooltipMetadata } from '@/utils/tooltipMetadata';

interface EnhancedTooltipProps {
  metadata: TooltipMetadata;
  className?: string;
}

/**
 * EnhancedTooltip - Rich tooltip with help text, warnings, examples, and interpretation
 *
 * Displays a help icon that shows detailed information when hovered, including:
 * - Title and help text
 * - Optional warning (yellow box)
 * - Optional example (blue box)
 * - Optional interpretation guide
 * - Optional good/concern ranges
 */
export const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({ metadata, className = '' }) => {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center justify-center ${className}`}
            onClick={(e) => e.preventDefault()}
          >
            <HelpCircle className="w-4 h-4 text-gray-400 hover:text-violet-400 transition-colors cursor-help" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          align="start"
          className="max-w-sm bg-slate-800 border-violet-500/30 p-0 shadow-xl"
        >
          <div className="p-4 space-y-3">
            {/* Title */}
            <h4 className="font-semibold text-gray-100 text-sm">{metadata.title}</h4>

            {/* Help Text */}
            <p className="text-xs text-gray-300 leading-relaxed">{metadata.help}</p>

            {/* Warning Box */}
            {metadata.warning && (
              <div className="bg-yellow-500/10 border-l-2 border-yellow-500 p-2.5 rounded">
                <p className="text-xs text-yellow-300 leading-relaxed">
                  <span className="font-semibold">⚠️ Warning:</span> {metadata.warning}
                </p>
              </div>
            )}

            {/* Example Box */}
            {metadata.example && (
              <div className="bg-blue-500/10 border-l-2 border-blue-500 p-2.5 rounded">
                <p className="text-xs text-blue-300 leading-relaxed">
                  <span className="font-semibold">💡 Example:</span> {metadata.example}
                </p>
              </div>
            )}

            {/* Interpretation Guide */}
            {metadata.interpretation && (
              <div className="bg-violet-500/10 border-l-2 border-violet-500 p-2.5 rounded">
                <p className="text-xs text-violet-300 leading-relaxed">
                  <span className="font-semibold">📊 Interpretation:</span> {metadata.interpretation}
                </p>
              </div>
            )}

            {/* Good/Concern Ranges */}
            {(metadata.goodRange || metadata.concernRange) && (
              <div className="pt-2 border-t border-gray-700 space-y-1.5">
                {metadata.goodRange && (
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 text-xs font-semibold">✓</span>
                    <p className="text-xs text-emerald-300">
                      <span className="font-semibold">Good:</span> {metadata.goodRange}
                    </p>
                  </div>
                )}
                {metadata.concernRange && (
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 text-xs font-semibold">✗</span>
                    <p className="text-xs text-red-300">
                      <span className="font-semibold">Concern:</span> {metadata.concernRange}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * FormLabelWithTooltip - Convenience component combining label and tooltip
 *
 * Usage:
 * ```tsx
 * <FormLabelWithTooltip metadata={INPUT_TOOLTIPS.purchasePrice}>
 *   Purchase Price
 * </FormLabelWithTooltip>
 * ```
 */
interface FormLabelWithTooltipProps {
  children: React.ReactNode;
  metadata?: TooltipMetadata;
  className?: string;
}

export const FormLabelWithTooltip: React.FC<FormLabelWithTooltipProps> = ({
  children,
  metadata,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span>{children}</span>
      {metadata && <EnhancedTooltip metadata={metadata} />}
    </div>
  );
};
