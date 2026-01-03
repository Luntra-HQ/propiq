import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number // 0-100
  className?: string
  showPercentage?: boolean
}

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value, className, showPercentage = false }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value))

    return (
      <div
        ref={ref}
        className={cn("w-full space-y-2", className)}
      >
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-200/50 backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
            style={{ width: `${clampedValue}%` }}
          />
        </div>
        {showPercentage && (
          <div className="text-xs text-gray-400 text-right">
            {clampedValue}%
          </div>
        )}
      </div>
    )
  }
)
ProgressBar.displayName = "ProgressBar"
