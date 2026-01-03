import * as React from "react"
import { cn } from "@/lib/utils"

interface Step {
  number: number
  label: string
  completed: boolean
}

interface WizardStepsProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export const WizardSteps = React.forwardRef<HTMLDivElement, WizardStepsProps>(
  ({ steps, currentStep, className }, ref) => {
    return (
      <div ref={ref} className={cn("w-full", className)}>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              {/* Step Circle */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                    step.completed || currentStep === step.number
                      ? "border-primary bg-primary text-white shadow-lg shadow-primary/50"
                      : "border-glass-border bg-surface-200 text-gray-400"
                  )}
                >
                  {step.completed ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-sm font-semibold">{step.number}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium transition-colors",
                    step.completed || currentStep === step.number
                      ? "text-gray-200"
                      : "text-gray-500"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2 -mt-6">
                  <div className="h-0.5 bg-surface-200 relative overflow-hidden rounded">
                    <div
                      className={cn(
                        "h-full bg-primary transition-all duration-500",
                        step.completed ? "w-full" : "w-0"
                      )}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }
)
WizardSteps.displayName = "WizardSteps"
