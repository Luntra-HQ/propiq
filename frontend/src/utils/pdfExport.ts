import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * PDF Export Utility for PropIQ Analysis
 *
 * Generates professional PDF reports from property analysis data
 */

export interface PropertyAnalysis {
  address: string;
  propertyType?: string;
  purchasePrice?: number;
  downPayment?: number;
  monthlyRent?: number;
  summary?: string;
  recommendation?: string;
  dealScore?: number;
  strengths?: string[];
  risks?: string[];
  cashFlow?: {
    monthly: number;
    annual: number;
  };
  roi?: {
    year1: number;
    year5: number;
  };
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
  images?: Array<{
    s3Url: string;
    filename: string;
    width?: number;
    height?: number;
  }>;
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
  pdf.text(analysis.address, margin, yPosition);
  yPosition += 10;

  // Analysis Date
  pdf.setFontSize(10);
  pdf.setTextColor(107, 114, 128); // gray-500
  pdf.setFont('helvetica', 'normal');
  const analysisDate = analysis.analyzedAt || new Date().toLocaleDateString();
  pdf.text(`Analyzed on: ${analysisDate}`, margin, yPosition);
  yPosition += 15;

  // Property Images Section
  if (analysis.images && analysis.images.length > 0) {
    checkPageBreak(pdf, yPosition, pageHeight, margin);

    addSectionHeader(pdf, 'Property Photos', yPosition, margin);
    yPosition += 10;

    // Load and embed images (max 3 for PDF size)
    const imagesToInclude = analysis.images.slice(0, 3);
    const imageWidth = contentWidth / 3 - 4;
    const imageHeight = 40;

    try {
      for (let i = 0; i < imagesToInclude.length; i++) {
        const img = imagesToInclude[i];
        const xPos = margin + (i * (imageWidth + 6));

        try {
          // Load image from S3 URL (presigned URL should work)
          const response = await fetch(img.s3Url);
          const blob = await response.blob();
          const imageDataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });

          pdf.addImage(imageDataUrl, 'JPEG', xPos, yPosition, imageWidth, imageHeight);
        } catch (imgError) {
          console.warn(`Failed to load image ${img.filename}:`, imgError);
          // Draw placeholder rectangle if image fails
          pdf.setDrawColor(200, 200, 200);
          pdf.setFillColor(240, 240, 240);
          pdf.rect(xPos, yPosition, imageWidth, imageHeight, 'FD');
          pdf.setFontSize(8);
          pdf.setTextColor(150, 150, 150);
          pdf.text('Image unavailable', xPos + imageWidth / 2, yPosition + imageHeight / 2, { align: 'center' });
        }
      }

      yPosition += imageHeight + 5;

      // Caption
      pdf.setFontSize(8);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`${analysis.images.length} image${analysis.images.length > 1 ? 's' : ''} uploaded${analysis.images.length > 3 ? ` (showing first 3)` : ''}`, margin, yPosition);
      yPosition += 10;
    } catch (error) {
      console.warn('Failed to add images to PDF:', error);
      // Continue without images
    }
  }

  // Executive Summary Section
  if (analysis.summary) {
    addSectionHeader(pdf, 'Executive Summary', yPosition, margin);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setTextColor(55, 65, 81); // gray-700
    const summaryLines = pdf.splitTextToSize(analysis.summary, contentWidth);
    pdf.text(summaryLines, margin, yPosition);
    yPosition += summaryLines.length * 5 + 10;
  }

  // Investment Recommendation Box (new Convex format)
  if (analysis.recommendation && analysis.dealScore !== undefined) {
    checkPageBreak(pdf, yPosition, pageHeight, margin);

    const boxHeight = 35;
    const recommendationColor = getDealScoreColor(analysis.dealScore);

    pdf.setFillColor(...recommendationColor);
    pdf.roundedRect(margin, yPosition, contentWidth, boxHeight, 3, 3, 'F');

    pdf.setFontSize(14);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Investment Recommendation', margin + 5, yPosition + 10);

    pdf.setFontSize(20);
    pdf.text(analysis.recommendation.toUpperCase(), margin + 5, yPosition + 22);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Deal Score: ${analysis.dealScore}/100`, margin + 5, yPosition + 30);

    yPosition += boxHeight + 15;
  }
  // Investment Recommendation Box (legacy format)
  else if (analysis.investment) {
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

  // Cash Flow & ROI Section (new Convex format)
  if (analysis.cashFlow || analysis.roi) {
    checkPageBreak(pdf, yPosition, pageHeight, margin);

    addSectionHeader(pdf, 'Financial Projections', yPosition, margin);
    yPosition += 10;

    const metricsData: Array<[string, string]> = [];

    if (analysis.cashFlow) {
      if (analysis.cashFlow.monthly !== undefined) {
        metricsData.push(['Monthly Cash Flow', `$${analysis.cashFlow.monthly.toLocaleString()}`]);
      }
      if (analysis.cashFlow.annual !== undefined) {
        metricsData.push(['Annual Cash Flow', `$${analysis.cashFlow.annual.toLocaleString()}`]);
      }
    }

    if (analysis.roi) {
      if (analysis.roi.year1 !== undefined) {
        metricsData.push(['Year 1 ROI', `${analysis.roi.year1.toFixed(2)}%`]);
      }
      if (analysis.roi.year5 !== undefined) {
        metricsData.push(['Year 5 ROI', `${analysis.roi.year5.toFixed(2)}%`]);
      }
    }

    pdf.setFontSize(9);
    metricsData.forEach(([label, value], index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const colWidth = contentWidth / 2;
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

  // Key Metrics Section (legacy format)
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

  // Strengths and Risks (new Convex format) OR Pros and Cons (legacy)
  if (analysis.strengths || analysis.risks || analysis.pros || analysis.cons) {
    checkPageBreak(pdf, yPosition, pageHeight, margin);

    addSectionHeader(pdf, analysis.strengths ? 'Strengths & Risks' : 'Pros & Cons', yPosition, margin);
    yPosition += 10;

    const colWidth = contentWidth / 2 - 5;

    const strengthsList = analysis.strengths || analysis.pros || [];
    const risksList = analysis.risks || analysis.cons || [];
    const maxItems = Math.max(strengthsList.length, risksList.length);

    // Render Headers
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');

    // Left Header
    pdf.setTextColor(16, 185, 129); // emerald-500
    pdf.text(analysis.strengths ? 'Strengths' : 'Pros', margin, yPosition);

    // Right Header
    pdf.setTextColor(239, 68, 68); // red-500
    pdf.text(analysis.risks ? 'Risks' : 'Cons', margin + contentWidth / 2 + 5, yPosition);

    yPosition += 7;

    // Render Items Row by Row
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(55, 65, 81); // gray-700

    for (let i = 0; i < maxItems; i++) {
      const sItem = strengthsList[i];
      const rItem = risksList[i];

      const sLines = sItem ? pdf.splitTextToSize(`• ${sItem}`, colWidth) : [];
      const rLines = rItem ? pdf.splitTextToSize(`• ${rItem}`, colWidth) : [];

      const rowHeight = Math.max(sLines.length, rLines.length) * 5;

      // Check Page Break
      if (yPosition + rowHeight > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
        // Optionally reprint headers here if desired, simpler to just continue list
      }

      if (sLines.length > 0) {
        pdf.text(sLines, margin + 2, yPosition);
      }

      if (rLines.length > 0) {
        pdf.text(rLines, margin + contentWidth / 2 + 5, yPosition);
      }

      yPosition += rowHeight + 2; // spacing
    }
  }

  // Key Insights
  if (analysis.keyInsights && analysis.keyInsights.length > 0) {
    checkPageBreak(pdf, yPosition, pageHeight, margin);

    addSectionHeader(pdf, 'Key Insights', yPosition, margin);
    yPosition += 10;

    pdf.setFontSize(9);
    pdf.setTextColor(55, 65, 81);
    pdf.setFont('helvetica', 'normal');

    analysis.keyInsights.forEach((insight, index) => {
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

    analysis.nextSteps.forEach((step, index) => {
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
