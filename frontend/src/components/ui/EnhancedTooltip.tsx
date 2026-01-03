import * as React from "react"
import { HelpCircle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { TooltipMetadata } from "@/data/tooltipData"

interface EnhancedTooltipProps {
  metadata: TooltipMetadata;
  className?: string;
}

export const EnhancedTooltip = React.forwardRef<
  HTMLButtonElement,
  EnhancedTooltipProps
>(({ metadata, className }, ref) => {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild ref={ref}>
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center w-4 h-4 ml-1.5 text-gray-400 hover:text-primary transition-colors cursor-help",
              className
            )}
            onClick={(e) => e.preventDefault()}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          className="max-w-xs bg-surface-300/95 backdrop-blur-md border-glass-border p-4 shadow-xl"
          sideOffset={5}
        >
          <div className="space-y-3">
            {/* Title */}
            <h4 className="font-semibold text-gray-100 text-sm">
              {metadata.title}
            </h4>

            {/* Main Help Text */}
            <p className="text-sm text-gray-300 leading-relaxed">
              {metadata.help}
            </p>

            {/* Interpretation (for metrics) */}
            {metadata.interpretation && (
              <div className="bg-blue-500/10 border-l-2 border-blue-500 pl-3 py-2">
                <p className="text-xs text-blue-300">
                  <span className="font-semibold">📊 Interpretation:</span>{" "}
                  {metadata.interpretation}
                </p>
              </div>
            )}

            {/* Good/Concern Ranges (for metrics) */}
            {(metadata.goodRange || metadata.concernRange) && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                {metadata.goodRange && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded px-2 py-1">
                    <div className="text-emerald-400 font-medium">✅ Good</div>
                    <div className="text-emerald-300">{metadata.goodRange}</div>
                  </div>
                )}
                {metadata.concernRange && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded px-2 py-1">
                    <div className="text-red-400 font-medium">⚠️ Concern</div>
                    <div className="text-red-300">{metadata.concernRange}</div>
                  </div>
                )}
              </div>
            )}

            {/* Warning */}
            {metadata.warning && (
              <div className="bg-yellow-500/10 border-l-2 border-yellow-500 pl-3 py-2">
                <p className="text-xs text-yellow-300">
                  <span className="font-semibold">⚠️ Warning:</span>{" "}
                  {metadata.warning}
                </p>
              </div>
            )}

            {/* Example */}
            {metadata.example && (
              <div className="bg-primary/10 border-l-2 border-primary pl-3 py-2">
                <p className="text-xs text-gray-300">
                  <span className="font-semibold text-primary">💡 Example:</span>{" "}
                  {metadata.example}
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})
EnhancedTooltip.displayName = "EnhancedTooltip"

/**
 * Inline version for use directly in FormLabel
 */
interface FormLabelWithTooltipProps {
  label: string;
  tooltipKey: string;
  tooltipData: Record<string, TooltipMetadata>;
  className?: string;
}

export const FormLabelWithTooltip: React.FC<FormLabelWithTooltipProps> = ({
  label,
  tooltipKey,
  tooltipData,
  className,
}) => {
  const metadata = tooltipData[tooltipKey];

  if (!metadata) {
    return <span className={className}>{label}</span>;
  }

  return (
    <span className={cn("inline-flex items-center", className)}>
      {label}
      <EnhancedTooltip metadata={metadata} />
    </span>
  );
};
