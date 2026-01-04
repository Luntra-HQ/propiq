import React from 'react';

interface ConfidenceMeterProps {
  score: number;
  message: string;
  color: string;
}

/**
 * ConfidenceMeter - Visual indicator for deal analysis confidence
 *
 * Displays a horizontal bar meter with score percentage, color-coded message,
 * and tooltip explaining what confidence means.
 */
export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({ score, message, color }) => {
  return (
    <div className="confidence-meter bg-surface-200/50 backdrop-blur-sm border border-glass-border rounded-xl p-6 mb-4">
      {/* Header with score */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium text-gray-400">Deal Confidence</div>
          <div
            className="group relative cursor-help"
            title="Confidence score measures data quality and deal strength"
          >
            <svg
              className="h-4 w-4 text-gray-500 hover:text-gray-300 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 shadow-xl">
              <div className="font-semibold mb-1">What is Confidence Score?</div>
              <div className="text-gray-300">
                Combines deal metrics (70%) and input data quality (30%) to show how reliable this analysis is.
                Higher scores = better data + stronger fundamentals.
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                <div className="border-4 border-transparent border-t-slate-800"></div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="text-3xl font-bold tabular-nums"
          style={{ color }}
        >
          {score}%
        </div>
      </div>

      {/* Progress bar */}
      <div className="meter-bar h-4 bg-surface-300 rounded-full overflow-hidden mb-4 shadow-inner">
        <div
          className="meter-fill h-full relative"
          style={{
            width: `${score}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}40`
          }}
        >
          {/* Animated shine effect - DISABLED to prevent flashing */}
          {/* <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
            style={{
              animation: 'shine 2s infinite',
            }}
          /> */}
        </div>
      </div>

      {/* Message */}
      <div
        className="meter-message text-sm font-medium flex items-center gap-2"
        style={{ color }}
      >
        {message}
      </div>
    </div>
  );
};
