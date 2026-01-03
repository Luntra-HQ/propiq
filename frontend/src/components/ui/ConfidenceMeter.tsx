import * as React from "react"
import { cn } from "@/lib/utils"
import type { ConfidenceScore, InputQuality } from "@/utils/calculatorUtils"

interface ConfidenceMeterProps {
  confidence: ConfidenceScore
  inputQuality?: InputQuality
  onInputQualityChange?: (quality: InputQuality) => void
  className?: string
}

export const ConfidenceMeter = React.forwardRef<HTMLDivElement, ConfidenceMeterProps>(
  ({ confidence, inputQuality, onInputQualityChange, className }, ref) => {
    const { score, message, color } = confidence

    return (
      <div
        ref={ref}
        className={cn(
          "bg-surface-200/50 backdrop-blur-sm border border-glass-border rounded-xl p-5 space-y-4",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            Analysis Confidence
          </h4>
          <span className="text-2xl font-bold text-gray-100" style={{ color }}>
            {score}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-surface-300/50">
          <div
            className="h-full transition-all duration-700 ease-out rounded-full"
            style={{
              width: `${score}%`,
              backgroundColor: color,
              boxShadow: `0 0 10px ${color}40`,
            }}
          />
        </div>

        {/* Message */}
        <p className="text-sm text-gray-300">{message}</p>

        {/* Input Quality Selector (optional) */}
        {onInputQualityChange && (
          <div className="pt-2 border-t border-glass-border">
            <label className="text-xs text-gray-400 uppercase tracking-wide block mb-2">
              Data Quality
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['estimated', 'researched', 'verified'] as const).map((quality) => (
                <button
                  key={quality}
                  onClick={() => onInputQualityChange(quality)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                    inputQuality === quality
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "bg-surface-300 text-gray-400 hover:bg-surface-300/70 hover:text-gray-300"
                  )}
                >
                  {quality.charAt(0).toUpperCase() + quality.slice(1)}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {inputQuality === 'verified' && 'Rent confirmed by landlord or property manager'}
              {inputQuality === 'researched' && 'Rent based on comparable properties'}
              {inputQuality === 'estimated' && 'Rough estimate, needs verification'}
            </p>
          </div>
        )}
      </div>
    )
  }
)
ConfidenceMeter.displayName = "ConfidenceMeter"
