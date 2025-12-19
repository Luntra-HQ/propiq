import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * PDF Export Utility for PropIQ Analysis
 *
 * Generates professional PDF reports from property analysis data
 */

/**
 * Sanitizes text for PDF export
 * Removes special characters and encoding issues that jsPDF can't handle
 */
const sanitizeTextForPDF = (text: string | undefined | null): string => {
  if (!text) return '';

  return text
    // Replace smart quotes with regular quotes
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    // Replace em/en dashes with regular dashes
    .replace(/[\u2013\u2014]/g, '-')
    // Replace ellipsis with three dots
    .replace(/\u2026/g, '...')
    // Remove other problematic Unicode characters
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Control characters
    .replace(/[\u2000-\u206F]/g, ' ') // Various spaces and special characters
    .replace(/[\uFEFF]/g, '') // Zero-width no-break space
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Sanitizes an array of strings for PDF export
 */
const sanitizeArrayForPDF = (arr: string[] | undefined | null): string[] => {
  if (!arr || !Array.isArray(arr)) return [];
  return arr
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map(sanitizeTextForPDF)
    .filter(item => item.length > 0);
};

export interface PropertyAnalysis {
  address: string;
  propertyType?: string;
  purchasePrice?: number;
  monthlyRent?: number;
  summary?: string;
  location?: {
    neighborhood: string;
    marketScore: number;
    marketTrend: string;
  };
  financials?: {
    estimatedValue: number;
    estimatedRent: number;
    cashFlow: number;
    capRate: number;
    roi: number;
    monthlyMortgage?: number;
  };
  investment?: {
    recommendation: string;
    confidenceScore: number;
    riskLevel: string;
  };
  pros?: string[];
  cons?: string[];
  keyInsights?: string[];
  nextSteps?: string[];
  dealCalculator?: DealCalculatorData;
  analyzedAt?: string;
}

export interface DealCalculatorData {
  purchasePrice: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTerm: number;
  monthlyRent: number;
  propertyTax: number;
  insurance: number;
  maintenance: number;
  vacancy: number;
  propertyManagement: number;
  dealScore: number;
  dealRating: string;
  monthlyCashFlow: number;
  capRate: number;
  cashOnCash: number;
  onePercentRule: boolean;
  totalCashInvested: number;
  monthlyPITI: number;
}

/**
 * Generates a professional PDF report from property analysis data
 */
export const generatePDF = async (analysis: PropertyAnalysis): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  let yPosition = margin;

  // Header - PropIQ branding
  pdf.setFillColor(139, 92, 246); // violet-500
  pdf.rect(0, 0, pageWidth, 40, 'F');

  pdf.setFontSize(28);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PropIQ', margin, 20);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Property Investment Analysis Report', margin, 30);

  yPosition = 55;

  // Property Address
  pdf.setFontSize(20);
  pdf.setTextColor(31, 41, 55); // slate-800
  pdf.setFont('helvetica', 'bold');
  pdf.text(sanitizeTextForPDF(analysis.address), margin, yPosition);
  yPosition += 10;

  // Analysis Date
  pdf.setFontSize(10);
  pdf.setTextColor(107, 114, 128); // gray-500
  pdf.setFont('helvetica', 'normal');
  const analysisDate = analysis.analyzedAt || new Date().toLocaleDateString();
  pdf.text(`Analyzed on: ${analysisDate}`, margin, yPosition);
  yPosition += 15;

  // Executive Summary Section
  if (analysis.summary) {
    addSectionHeader(pdf, 'Executive Summary', yPosition, margin);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setTextColor(55, 65, 81); // gray-700
    const summaryLines = pdf.splitTextToSize(sanitizeTextForPDF(analysis.summary), contentWidth);
    pdf.text(summaryLines, margin, yPosition);
    yPosition += summaryLines.length * 5 + 10;
  }

  // Investment Recommendation Box (if available)
  if (analysis.investment) {
    checkPageBreak(pdf, yPosition, pageHeight, margin);

    const boxHeight = 40;
    const recommendationColor = getRecommendationColor(analysis.investment.recommendation);

    pdf.setFillColor(...recommendationColor);
    pdf.roundedRect(margin, yPosition, contentWidth, boxHeight, 3, 3, 'F');

    pdf.setFontSize(14);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Investment Recommendation', margin + 5, yPosition + 10);

    pdf.setFontSize(20);
    pdf.text(analysis.investment.recommendation.replace(/_/g, ' ').toUpperCase(), margin + 5, yPosition + 22);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Confidence: ${analysis.investment.confidenceScore}%`, margin + 5, yPosition + 30);
    pdf.text(`Risk Level: ${analysis.investment.riskLevel}`, margin + 5, yPosition + 36);

    yPosition += boxHeight + 15;
  }

  // Key Metrics Section
  if (analysis.financials || analysis.location) {
    checkPageBreak(pdf, yPosition, pageHeight, margin);

    addSectionHeader(pdf, 'Key Metrics', yPosition, margin);
    yPosition += 10;

    const metricsData: Array<[string, string]> = [];

    if (analysis.location) {
      metricsData.push(['Market Score', `${analysis.location.marketScore}/100`]);
      metricsData.push(['Market Trend', analysis.location.marketTrend]);
      metricsData.push(['Neighborhood', analysis.location.neighborhood]);
    }

    if (analysis.financials) {
      if (analysis.financials.estimatedValue) {
        metricsData.push(['Estimated Value', `$${analysis.financials.estimatedValue.toLocaleString()}`]);
      }
      if (analysis.financials.estimatedRent) {
        metricsData.push(['Estimated Rent', `$${analysis.financials.estimatedRent.toLocaleString()}/mo`]);
      }
      if (analysis.financials.cashFlow) {
        metricsData.push(['Monthly Cash Flow', `$${analysis.financials.cashFlow.toLocaleString()}`]);
      }
      if (analysis.financials.capRate) {
        metricsData.push(['Cap Rate', `${analysis.financials.capRate.toFixed(2)}%`]);
      }
      if (analysis.financials.roi) {
        metricsData.push(['ROI', `${analysis.financials.roi.toFixed(2)}%`]);
      }
    }

    // Display metrics in two columns
    pdf.setFontSize(10);
    const colWidth = contentWidth / 2;
    metricsData.forEach(([label, value], index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const xPos = margin + (col * colWidth);
      const yPos = yPosition + (row * 8);

      pdf.setTextColor(107, 114, 128);
      pdf.setFont('helvetica', 'normal');
      pdf.text(label + ':', xPos, yPos);

      pdf.setTextColor(31, 41, 55);
      pdf.setFont('helvetica', 'bold');
      pdf.text(value, xPos + 45, yPos);
    });

    yPosition += Math.ceil(metricsData.length / 2) * 8 + 10;
  }

  // Deal Calculator Data
  if (analysis.dealCalculator) {
    checkPageBreak(pdf, yPosition, pageHeight, margin);

    addSectionHeader(pdf, 'Deal Calculator Results', yPosition, margin);
    yPosition += 10;

    const calc = analysis.dealCalculator;

    // Deal Score Badge
    const scoreColor = getDealScoreColor(calc.dealScore);
    pdf.setFillColor(...scoreColor);
    pdf.roundedRect(margin, yPosition, 60, 25, 3, 3, 'F');

    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Deal Score', margin + 30, yPosition + 8, { align: 'center' });
    pdf.setFontSize(18);
    pdf.text(`${calc.dealScore}/100`, margin + 30, yPosition + 18, { align: 'center' });

    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Rating: ${calc.dealRating}`, margin + 65, yPosition + 13);

    yPosition += 35;

    // Financial Details
    const calcMetrics: Array<[string, string]> = [
      ['Purchase Price', `$${calc.purchasePrice.toLocaleString()}`],
      ['Down Payment', `${calc.downPaymentPercent}%`],
      ['Interest Rate', `${calc.interestRate}%`],
      ['Monthly Rent', `$${calc.monthlyRent.toLocaleString()}`],
      ['Monthly Cash Flow', `$${calc.monthlyCashFlow.toLocaleString()}`],
      ['Cap Rate', `${calc.capRate.toFixed(2)}%`],
      ['Cash-on-Cash', `${calc.cashOnCash.toFixed(2)}%`],
      ['1% Rule', calc.onePercentRule ? 'Passes' : 'Does not pass'],
      ['Total Cash Invested', `$${calc.totalCashInvested.toLocaleString()}`],
      ['Monthly PITI', `$${calc.monthlyPITI.toLocaleString()}`],
    ];

    pdf.setFontSize(9);
    calcMetrics.forEach(([label, value], index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const xPos = margin + (col * contentWidth / 2);
      const yPos = yPosition + (row * 7);

      pdf.setTextColor(107, 114, 128);
      pdf.setFont('helvetica', 'normal');
      pdf.text(label + ':', xPos, yPos);

      pdf.setTextColor(31, 41, 55);
      pdf.setFont('helvetica', 'bold');
      pdf.text(value, xPos + 40, yPos);
    });

    yPosition += Math.ceil(calcMetrics.length / 2) * 7 + 10;
  }

  // Pros and Cons
  if (analysis.pros || analysis.cons) {
    checkPageBreak(pdf, yPosition, pageHeight, margin);

    addSectionHeader(pdf, 'Pros & Cons', yPosition, margin);
    yPosition += 10;

    const colWidth = contentWidth / 2 - 5;

    // Pros (left column)
    if (analysis.pros && analysis.pros.length > 0) {
      pdf.setFontSize(11);
      pdf.setTextColor(16, 185, 129); // emerald-500
      pdf.setFont('helvetica', 'bold');
      pdf.text('Pros', margin, yPosition);
      yPosition += 7;

      pdf.setFontSize(9);
      pdf.setTextColor(55, 65, 81);
      pdf.setFont('helvetica', 'normal');

      sanitizeArrayForPDF(analysis.pros).forEach((pro, index) => {
        const lines = pdf.splitTextToSize(`• ${pro}`, colWidth);
        pdf.text(lines, margin + 2, yPosition);
        yPosition += lines.length * 5;
      });
    }

    // Cons (right column) - reset yPosition
    let consYPosition = yPosition - (analysis.pros ? analysis.pros.length * 5 + 7 : 0);

    if (analysis.cons && analysis.cons.length > 0) {
      pdf.setFontSize(11);
      pdf.setTextColor(239, 68, 68); // red-500
      pdf.setFont('helvetica', 'bold');
      pdf.text('Cons', margin + contentWidth / 2 + 5, consYPosition);
      consYPosition += 7;

      pdf.setFontSize(9);
      pdf.setTextColor(55, 65, 81);
      pdf.setFont('helvetica', 'normal');

      sanitizeArrayForPDF(analysis.cons).forEach((con, index) => {
        const lines = pdf.splitTextToSize(`• ${con}`, colWidth);
        pdf.text(lines, margin + contentWidth / 2 + 7, consYPosition);
        consYPosition += lines.length * 5;
      });
    }

    yPosition = Math.max(yPosition, consYPosition) + 10;
  }

  // Key Insights
  if (analysis.keyInsights && analysis.keyInsights.length > 0) {
    checkPageBreak(pdf, yPosition, pageHeight, margin);

    addSectionHeader(pdf, 'Key Insights', yPosition, margin);
    yPosition += 10;

    pdf.setFontSize(9);
    pdf.setTextColor(55, 65, 81);
    pdf.setFont('helvetica', 'normal');

    sanitizeArrayForPDF(analysis.keyInsights).forEach((insight, index) => {
      const lines = pdf.splitTextToSize(`${index + 1}. ${insight}`, contentWidth);
      pdf.text(lines, margin, yPosition);
      yPosition += lines.length * 5 + 3;

      checkPageBreak(pdf, yPosition, pageHeight, margin);
    });

    yPosition += 5;
  }

  // Next Steps
  if (analysis.nextSteps && analysis.nextSteps.length > 0) {
    checkPageBreak(pdf, yPosition, pageHeight, margin);

    addSectionHeader(pdf, 'Recommended Next Steps', yPosition, margin);
    yPosition += 10;

    pdf.setFontSize(9);
    pdf.setTextColor(55, 65, 81);
    pdf.setFont('helvetica', 'normal');

    sanitizeArrayForPDF(analysis.nextSteps).forEach((step, index) => {
      const lines = pdf.splitTextToSize(`${index + 1}. ${step}`, contentWidth);
      pdf.text(lines, margin, yPosition);
      yPosition += lines.length * 5 + 3;

      checkPageBreak(pdf, yPosition, pageHeight, margin);
    });
  }

  // Footer on all pages
  const pageCount = (pdf as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(156, 163, 175); // gray-400
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      'Generated by PropIQ - AI-Powered Real Estate Investment Analysis',
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    pdf.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  }

  // Save the PDF
  const fileName = `PropIQ_Analysis_${analysis.address.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};

/**
 * Exports a DOM element as PDF (useful for calculator results)
 */
export const exportElementAsPDF = async (elementId: string, fileName: string): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id '${elementId}' not found`);
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth - 20; // 10mm margin on each side
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 10;

  // Add first page
  pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  // Add additional pages if content is longer than one page
  while (heightLeft > 0) {
    position = heightLeft - imgHeight + 10;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(fileName);
};

// Helper Functions

function addSectionHeader(pdf: jsPDF, title: string, yPosition: number, margin: number): void {
  pdf.setFontSize(14);
  pdf.setTextColor(139, 92, 246); // violet-500
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, margin, yPosition);

  // Underline
  pdf.setDrawColor(139, 92, 246);
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPosition + 2, margin + 50, yPosition + 2);
}

function checkPageBreak(pdf: jsPDF, yPosition: number, pageHeight: number, margin: number): number {
  if (yPosition > pageHeight - 30) {
    pdf.addPage();
    return margin;
  }
  return yPosition;
}

function getRecommendationColor(recommendation: string): [number, number, number] {
  const rec = recommendation.toLowerCase();
  if (rec.includes('strong_buy') || rec.includes('strong buy')) {
    return [16, 185, 129]; // emerald-500
  } else if (rec.includes('buy')) {
    return [59, 130, 246]; // blue-500
  } else if (rec.includes('hold')) {
    return [234, 179, 8]; // yellow-500
  } else if (rec.includes('avoid')) {
    return [239, 68, 68]; // red-500
  }
  return [107, 114, 128]; // gray-500
}

function getDealScoreColor(score: number): [number, number, number] {
  if (score >= 80) {
    return [16, 185, 129]; // emerald-500 - Excellent
  } else if (score >= 65) {
    return [59, 130, 246]; // blue-500 - Good
  } else if (score >= 50) {
    return [234, 179, 8]; // yellow-500 - Fair
  } else if (score >= 35) {
    return [249, 115, 22]; // orange-500 - Poor
  } else {
    return [239, 68, 68]; // red-500 - Avoid
  }
}
