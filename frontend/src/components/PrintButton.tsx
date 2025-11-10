import React, { useState } from 'react';
import { Printer, Loader2, Check } from 'lucide-react';
import { printElement, PrintOptions } from '../utils/printReport';

interface PrintButtonProps {
  elementId: string;
  printOptions?: PrintOptions;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  showIcon?: boolean;
  disabled?: boolean;
  className?: string;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
}

export const PrintButton: React.FC<PrintButtonProps> = ({
  elementId,
  printOptions = {},
  variant = 'outline',
  size = 'md',
  fullWidth = false,
  showIcon = true,
  disabled = false,
  className = '',
  onBeforePrint,
  onAfterPrint,
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [justPrinted, setJustPrinted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePrint = async () => {
    setIsPrinting(true);
    setError(null);

    try {
      // Call optional before print callback
      if (onBeforePrint) {
        onBeforePrint();
      }

      // Add listeners for print events
      const beforePrintHandler = () => {
        console.log('Print dialog opened');
      };

      const afterPrintHandler = () => {
        console.log('Print dialog closed');
        setJustPrinted(true);
        setTimeout(() => setJustPrinted(false), 2000);

        if (onAfterPrint) {
          onAfterPrint();
        }
      };

      window.addEventListener('beforeprint', beforePrintHandler);
      window.addEventListener('afterprint', afterPrintHandler);

      // Trigger print
      printElement(elementId, printOptions);

      // Cleanup listeners after a delay
      setTimeout(() => {
        window.removeEventListener('beforeprint', beforePrintHandler);
        window.removeEventListener('afterprint', afterPrintHandler);
      }, 5000);

    } catch (err) {
      console.error('Print failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to print report');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsPrinting(false);
    }
  };

  // Variant styles
  const variantClasses = {
    primary: 'bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white shadow-lg shadow-violet-500/50 hover:shadow-xl hover:shadow-violet-500/60',
    secondary: 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60',
    outline: 'bg-transparent border-2 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500',
  };

  // Size styles
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
  };

  // Icon size
  const iconSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className={fullWidth ? 'w-full' : 'inline-block'}>
      <button
        onClick={handlePrint}
        disabled={disabled || isPrinting}
        className={`
          inline-flex items-center justify-center space-x-2
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          font-semibold rounded-xl transition-all duration-200
          hover:scale-[1.02] focus:outline-none focus:ring-4
          ${variant === 'primary' ? 'focus:ring-violet-300' : variant === 'secondary' ? 'focus:ring-blue-300' : 'focus:ring-slate-300/50'}
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          ${className}
        `}
        title="Print this report"
      >
        {isPrinting ? (
          <>
            <Loader2 className={`${iconSize[size]} animate-spin`} />
            <span>Preparing...</span>
          </>
        ) : justPrinted ? (
          <>
            <Check className={`${iconSize[size]} text-emerald-400`} />
            <span>Ready!</span>
          </>
        ) : (
          <>
            {showIcon && <Printer className={iconSize[size]} />}
            <span>Print Report</span>
          </>
        )}
      </button>

      {error && (
        <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400 flex items-center space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Compact icon-only print button
 */
export const PrintIconButton: React.FC<{
  elementId: string;
  printOptions?: PrintOptions;
  className?: string;
  tooltipText?: string;
}> = ({ elementId, printOptions = {}, className = '', tooltipText = 'Print Report' }) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      printElement(elementId, printOptions);
      // Reset after print dialog is handled
      setTimeout(() => setIsPrinting(false), 1000);
    } catch (err) {
      console.error('Print failed:', err);
      setIsPrinting(false);
    }
  };

  return (
    <button
      onClick={handlePrint}
      disabled={isPrinting}
      title={tooltipText}
      className={`
        p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700
        border border-slate-700 hover:border-blue-500/50
        text-blue-300 hover:text-blue-200
        transition-all duration-200 hover:scale-105
        focus:outline-none focus:ring-2 focus:ring-blue-500/50
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isPrinting ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Printer className="h-5 w-5" />
      )}
    </button>
  );
};

/**
 * Print card component - can be placed in a dashboard or results section
 */
export const PrintCard: React.FC<{
  elementId: string;
  printOptions?: PrintOptions;
  className?: string;
}> = ({ elementId, printOptions = {}, className = '' }) => {
  return (
    <div className={`p-6 bg-slate-800 rounded-xl shadow-xl border border-slate-700 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
            <Printer className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Print Analysis</h3>
            <p className="text-sm text-gray-300">Print or save as PDF</p>
          </div>
        </div>
      </div>

      <p className="text-gray-300 text-sm mb-4">
        Use your browser's print function to print this analysis or save it as a PDF.
        Print-optimized formatting is automatically applied.
      </p>

      <PrintButton
        elementId={elementId}
        printOptions={printOptions}
        variant="secondary"
        size="md"
        fullWidth
      />
    </div>
  );
};
