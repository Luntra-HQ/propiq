/**
 * Print Utility for PropIQ Analysis Reports
 *
 * Provides functionality to print analysis reports using the browser's native print dialog
 * with optimized print-friendly styling
 */

export interface PrintOptions {
  title?: string;
  includeDate?: boolean;
  orientation?: 'portrait' | 'landscape';
}

/**
 * Prints a specific DOM element with print-friendly styling
 * @param elementId The ID of the element to print
 * @param options Print configuration options
 */
export const printElement = (elementId: string, options: PrintOptions = {}): void => {
  const element = document.getElementById(elementId);

  if (!element) {
    console.error(`Element with id '${elementId}' not found`);
    throw new Error(`Cannot print: Element with id '${elementId}' not found`);
  }

  const {
    title = 'PropIQ Analysis Report',
    includeDate = true,
    orientation = 'portrait'
  } = options;

  // Clone the element to avoid modifying the original
  const printContent = element.cloneNode(true) as HTMLElement;

  // Create a print-specific container
  const printWindow = document.createElement('div');
  printWindow.id = 'propiq-print-container';
  printWindow.style.display = 'none';

  // Add title and date if requested
  if (title || includeDate) {
    const header = document.createElement('div');
    header.className = 'print-header';

    if (title) {
      const titleEl = document.createElement('h1');
      titleEl.textContent = title;
      titleEl.style.fontSize = '24px';
      titleEl.style.fontWeight = 'bold';
      titleEl.style.marginBottom = '8px';
      titleEl.style.color = '#1f2937';
      header.appendChild(titleEl);
    }

    if (includeDate) {
      const dateEl = document.createElement('p');
      dateEl.textContent = `Generated on: ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`;
      dateEl.style.fontSize = '12px';
      dateEl.style.color = '#6b7280';
      dateEl.style.marginBottom = '16px';
      header.appendChild(dateEl);
    }

    printWindow.appendChild(header);
  }

  printWindow.appendChild(printContent);
  document.body.appendChild(printWindow);

  // Inject print-specific styles
  const printStyles = document.createElement('style');
  printStyles.id = 'propiq-print-styles';
  printStyles.textContent = `
    @media print {
      @page {
        size: ${orientation};
        margin: 1cm;
      }

      /* Hide everything except print container */
      body * {
        visibility: hidden;
      }

      #propiq-print-container,
      #propiq-print-container * {
        visibility: visible;
      }

      #propiq-print-container {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        display: block !important;
      }

      /* General print styles */
      .print-header h1 {
        page-break-after: avoid;
      }

      /* Avoid breaking inside important sections */
      .propiq-section {
        page-break-inside: avoid;
        margin-bottom: 16px;
      }

      /* Hide interactive elements */
      button,
      .propiq-close-btn,
      .propiq-actions {
        display: none !important;
      }

      /* Optimize colors for print */
      .propiq-results {
        background: white !important;
        color: black !important;
        padding: 0 !important;
        max-height: none !important;
        overflow: visible !important;
      }

      .propiq-section {
        background: white !important;
        border: 1px solid #e5e7eb !important;
        border-radius: 4px;
        padding: 12px;
        box-shadow: none !important;
      }

      /* Ensure metrics are readable */
      .propiq-metric-label {
        color: #6b7280 !important;
        font-size: 11px !important;
      }

      .propiq-metric-value {
        color: #1f2937 !important;
        font-size: 13px !important;
        font-weight: 600 !important;
      }

      .propiq-metric-value.positive {
        color: #059669 !important;
      }

      .propiq-metric-value.negative {
        color: #dc2626 !important;
      }

      /* Badges */
      .propiq-badge {
        border: 1px solid #e5e7eb !important;
        background: white !important;
        color: black !important;
        padding: 4px 8px;
        font-weight: 600;
      }

      .propiq-badge.excellent {
        border-color: #059669 !important;
        color: #059669 !important;
      }

      .propiq-badge.good {
        border-color: #2563eb !important;
        color: #2563eb !important;
      }

      .propiq-badge.fair {
        border-color: #d97706 !important;
        color: #d97706 !important;
      }

      .propiq-badge.poor {
        border-color: #dc2626 !important;
        color: #dc2626 !important;
      }

      /* Lists */
      .propiq-pros ul,
      .propiq-cons ul,
      .propiq-insights,
      .propiq-steps-list {
        list-style: none;
        padding-left: 0;
      }

      .propiq-pros li,
      .propiq-cons li {
        margin-bottom: 8px;
        font-size: 11px;
      }

      /* Icons - replace with text symbols */
      svg {
        display: none;
      }

      /* Section headers */
      .propiq-section-header h3 {
        font-size: 14px;
        font-weight: 700;
        color: #1f2937 !important;
        margin: 0;
      }

      /* Summary section */
      .propiq-summary p {
        font-size: 12px;
        line-height: 1.6;
        color: #374151 !important;
      }

      /* Metrics grid */
      .propiq-metrics {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      /* Footer */
      .print-footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 9px;
        color: #9ca3af;
        padding: 8px;
        border-top: 1px solid #e5e7eb;
      }
    }
  `;

  document.head.appendChild(printStyles);

  // Add footer
  const footer = document.createElement('div');
  footer.className = 'print-footer';
  footer.textContent = 'Generated by PropIQ - AI-Powered Real Estate Investment Analysis | propiq.luntra.one';
  printWindow.appendChild(footer);

  // Trigger print dialog
  setTimeout(() => {
    window.print();

    // Cleanup after print
    setTimeout(() => {
      document.body.removeChild(printWindow);
      const stylesEl = document.getElementById('propiq-print-styles');
      if (stylesEl) {
        document.head.removeChild(stylesEl);
      }
    }, 100);
  }, 250); // Small delay to ensure styles are applied
};

/**
 * Generates a print-friendly filename based on address and date
 */
export const generatePrintFileName = (address: string): string => {
  const cleanAddress = address.replace(/[^a-zA-Z0-9]/g, '_');
  const date = new Date().toISOString().split('T')[0];
  return `PropIQ_Analysis_${cleanAddress}_${date}`;
};
