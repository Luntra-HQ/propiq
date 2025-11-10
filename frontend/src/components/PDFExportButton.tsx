import React, { useState } from 'react';
import { Download, Loader2, FileText } from 'lucide-react';
import { generatePDF, PropertyAnalysis } from '../utils/pdfExport';

interface PDFExportButtonProps {
  analysis: PropertyAnalysis;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  showIcon?: boolean;
  disabled?: boolean;
  className?: string;
}

export const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  analysis,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  showIcon = true,
  disabled = false,
  className = '',
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      await generatePDF(analysis);
    } catch (err) {
      console.error('PDF generation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  // Variant styles
  const variantClasses = {
    primary: 'bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white shadow-lg shadow-violet-500/50 hover:shadow-xl hover:shadow-violet-500/60',
    secondary: 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/60',
    outline: 'bg-transparent border-2 border-violet-500 text-violet-300 hover:bg-violet-500/10 hover:border-violet-400',
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
        onClick={handleExport}
        disabled={disabled || isGenerating}
        className={`
          inline-flex items-center justify-center space-x-2
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          font-semibold rounded-xl transition-all duration-200
          hover:scale-[1.02] focus:outline-none focus:ring-4
          ${variant === 'primary' ? 'focus:ring-violet-300' : variant === 'secondary' ? 'focus:ring-emerald-300' : 'focus:ring-violet-300/50'}
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          ${className}
        `}
      >
        {isGenerating ? (
          <>
            <Loader2 className={`${iconSize[size]} animate-spin`} />
            <span>Generating PDF...</span>
          </>
        ) : (
          <>
            {showIcon && <Download className={iconSize[size]} />}
            <span>Export to PDF</span>
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
 * Compact icon-only PDF export button
 */
export const PDFExportIconButton: React.FC<{
  analysis: PropertyAnalysis;
  className?: string;
  tooltipText?: string;
}> = ({ analysis, className = '', tooltipText = 'Export to PDF' }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    setIsGenerating(true);
    try {
      await generatePDF(analysis);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isGenerating}
      title={tooltipText}
      className={`
        p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700
        border border-slate-700 hover:border-violet-500/50
        text-violet-300 hover:text-violet-300
        transition-all duration-200 hover:scale-105
        focus:outline-none focus:ring-2 focus:ring-violet-500/50
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isGenerating ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <FileText className="h-5 w-5" />
      )}
    </button>
  );
};

/**
 * PDF Export card component - can be placed in a dashboard or results section
 */
export const PDFExportCard: React.FC<{
  analysis: PropertyAnalysis;
  className?: string;
}> = ({ analysis, className = '' }) => {
  return (
    <div className={`p-6 bg-slate-800 rounded-xl shadow-xl border border-slate-700 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/50">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Export Analysis</h3>
            <p className="text-sm text-gray-300">Save as PDF report</p>
          </div>
        </div>
      </div>

      <p className="text-gray-300 text-sm mb-4">
        Download a professional PDF report with all analysis details, metrics, and recommendations.
        Perfect for sharing with partners, lenders, or contractors.
      </p>

      <PDFExportButton
        analysis={analysis}
        variant="primary"
        size="md"
        fullWidth
      />
    </div>
  );
};
