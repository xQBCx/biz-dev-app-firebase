import { jsPDF } from 'jspdf';

interface Term {
  id: string;
  section_type: string;
  title: string;
  content: string;
  is_required: boolean;
  agreed_by: Record<string, boolean> | null;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  user_id: string | null;
  is_company?: boolean;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
}

interface DealRoomData {
  id: string;
  name: string;
  description: string | null;
  category: string;
  status: string;
  expected_deal_size_min: number | null;
  expected_deal_size_max: number | null;
  time_horizon: string;
  voting_rule: string;
  created_at: string;
}

export interface PDFExportOptions {
  dealRoom: DealRoomData;
  terms: Term[];
  participants: Participant[];
  transactions?: Transaction[];
  includeAgreementStatus?: boolean;
  includeSignatureLines?: boolean;
}

const sectionTypeLabels: Record<string, string> = {
  recitals: "RECITALS",
  definitions: "DEFINITIONS",
  representations: "REPRESENTATIONS & WARRANTIES",
  covenants: "COVENANTS",
  conditions: "CONDITIONS PRECEDENT",
  payment_terms: "PAYMENT TERMS",
  ip_ownership: "INTELLECTUAL PROPERTY",
  confidentiality: "CONFIDENTIALITY",
  termination: "TERMINATION",
  dispute_resolution: "DISPUTE RESOLUTION",
  miscellaneous: "MISCELLANEOUS",
};

const categoryLabels: Record<string, string> = {
  sales: "Sales Agreement",
  platform_build: "Platform Development",
  joint_venture: "Joint Venture",
  licensing: "Licensing Agreement",
  services: "Services Contract",
  infrastructure: "Infrastructure Deal",
  ip_creation: "IP Creation Agreement",
};

const votingRuleLabels: Record<string, string> = {
  unanimous: "Unanimous consent required",
  majority: "Majority vote",
  weighted: "Weighted by contribution",
  founder_override: "Founder has final authority",
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDealSize = (min: number | null, max: number | null): string => {
  if (!min && !max) return "To be determined";
  if (min && max) return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  if (min) return `${formatCurrency(min)}+`;
  return `Up to ${formatCurrency(max!)}`;
};

export const generateDealRoomPDF = ({
  dealRoom,
  terms,
  participants,
  transactions = [],
  includeAgreementStatus = true,
  includeSignatureLines = true,
}: PDFExportOptions): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;

  const addPage = () => {
    doc.addPage();
    yPos = margin;
  };

  const checkPageBreak = (requiredHeight: number) => {
    if (yPos + requiredHeight > pageHeight - margin) {
      addPage();
    }
  };

  // Helper to add text with word wrap
  const addText = (text: string, fontSize: number, isBold = false, align: 'left' | 'center' | 'right' = 'left') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    const lines = doc.splitTextToSize(text, contentWidth);
    const lineHeight = fontSize * 0.4;
    
    checkPageBreak(lines.length * lineHeight);
    
    lines.forEach((line: string) => {
      let xPos = margin;
      if (align === 'center') {
        xPos = pageWidth / 2;
      } else if (align === 'right') {
        xPos = pageWidth - margin;
      }
      doc.text(line, xPos, yPos, { align });
      yPos += lineHeight;
    });
  };

  const addHorizontalLine = () => {
    checkPageBreak(5);
    doc.setLineWidth(0.3);
    doc.setDrawColor(100);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 5;
  };

  const addSpacer = (height: number = 5) => {
    yPos += height;
  };

  // ===== COVER PAGE =====
  yPos = 60;
  
  addText('OPERATING AGREEMENT', 24, true, 'center');
  addSpacer(10);
  addText(dealRoom.name.toUpperCase(), 18, true, 'center');
  addSpacer(15);
  
  doc.setLineWidth(1);
  doc.setDrawColor(60, 60, 60);
  doc.line(margin + 40, yPos, pageWidth - margin - 40, yPos);
  yPos += 15;

  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  addText(`Effective Date: ${date}`, 12, false, 'center');
  addSpacer(5);
  addText(`Document Generated: ${new Date().toLocaleString()}`, 10, false, 'center');
  
  addSpacer(30);
  addText(categoryLabels[dealRoom.category] || dealRoom.category, 14, true, 'center');
  
  if (dealRoom.description) {
    addSpacer(10);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    const descLines = doc.splitTextToSize(dealRoom.description, contentWidth - 40);
    descLines.forEach((line: string) => {
      doc.text(line, pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
    });
  }

  // Footer on cover page
  yPos = pageHeight - 40;
  addText('CONFIDENTIAL', 10, true, 'center');
  addText('This document contains confidential information.', 8, false, 'center');
  addText('Unauthorized disclosure is prohibited.', 8, false, 'center');

  // ===== PARTIES PAGE =====
  addPage();
  addText('PARTIES TO THIS AGREEMENT', 16, true, 'center');
  addSpacer(10);
  addHorizontalLine();
  addSpacer(5);

  participants.forEach((p, index) => {
    checkPageBreak(20);
    addText(`${index + 1}. ${p.name}`, 12, true);
    addText(`   Email: ${p.email}`, 10);
    if (p.is_company) {
      addText('   Type: Business Entity', 10);
    }
    addSpacer(5);
  });

  // ===== DEAL OVERVIEW =====
  addSpacer(10);
  addText('DEAL OVERVIEW', 16, true, 'center');
  addSpacer(5);
  addHorizontalLine();
  addSpacer(5);

  const overviewItems = [
    ['Category', categoryLabels[dealRoom.category] || dealRoom.category],
    ['Expected Deal Size', formatDealSize(dealRoom.expected_deal_size_min, dealRoom.expected_deal_size_max)],
    ['Time Horizon', dealRoom.time_horizon.replace(/_/g, ' ').toUpperCase()],
    ['Voting Rule', votingRuleLabels[dealRoom.voting_rule] || dealRoom.voting_rule],
    ['Status', dealRoom.status.toUpperCase()],
    ['Created', new Date(dealRoom.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
  ];

  overviewItems.forEach(([label, value]) => {
    checkPageBreak(8);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 50, yPos);
    yPos += 6;
  });

  // ===== TERMS AND CONDITIONS =====
  if (terms.length > 0) {
    addPage();
    addText('TERMS AND CONDITIONS', 16, true, 'center');
    addSpacer(10);
    addHorizontalLine();

    // Group terms by section
    const termsBySection = terms.reduce((acc, term) => {
      if (!acc[term.section_type]) {
        acc[term.section_type] = [];
      }
      acc[term.section_type].push(term);
      return acc;
    }, {} as Record<string, Term[]>);

    const sectionOrder = [
      'recitals', 'definitions', 'representations', 'covenants',
      'conditions', 'payment_terms', 'ip_ownership', 'confidentiality',
      'termination', 'dispute_resolution', 'miscellaneous'
    ];

    sectionOrder.forEach((sectionType) => {
      const sectionTerms = termsBySection[sectionType];
      if (!sectionTerms || sectionTerms.length === 0) return;

      checkPageBreak(25);
      addSpacer(8);
      
      const sectionLabel = sectionTypeLabels[sectionType] || sectionType.toUpperCase();
      addText(sectionLabel, 14, true);
      addSpacer(3);
      
      doc.setLineWidth(0.2);
      doc.line(margin, yPos, margin + 60, yPos);
      yPos += 5;

      sectionTerms.forEach((term, index) => {
        checkPageBreak(30);
        
        const termTitle = `${index + 1}. ${term.title}${term.is_required ? ' *' : ''}`;
        addText(termTitle, 11, true);
        addSpacer(2);
        
        addText(term.content, 10);

        if (includeAgreementStatus && term.agreed_by) {
          addSpacer(3);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(100);
          
          const agreedParticipants = participants
            .filter(p => p.user_id && term.agreed_by?.[p.user_id])
            .map(p => p.name);
          
          if (agreedParticipants.length > 0) {
            doc.text(`Agreed by: ${agreedParticipants.join(', ')}`, margin, yPos);
            yPos += 4;
          }
          
          doc.setTextColor(0);
        }

        addSpacer(5);
      });
    });
  }

  // ===== FINANCIAL TRANSACTIONS =====
  if (transactions.length > 0) {
    addPage();
    addText('FINANCIAL TRANSACTIONS', 16, true, 'center');
    addSpacer(10);
    addHorizontalLine();
    addSpacer(5);

    transactions.forEach((tx, index) => {
      checkPageBreak(25);
      
      addText(`Transaction #${index + 1}`, 11, true);
      addText(`Type: ${tx.type}`, 10);
      addText(`Amount: ${formatCurrency(tx.amount)}`, 10);
      addText(`Description: ${tx.description}`, 10);
      addText(`Status: ${tx.status}`, 10);
      addText(`Date: ${new Date(tx.created_at).toLocaleDateString()}`, 10);
      addSpacer(5);
    });
  }

  // ===== SIGNATURE PAGE =====
  if (includeSignatureLines) {
    addPage();
    addText('SIGNATURES', 16, true, 'center');
    addSpacer(5);
    addText('IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.', 10, false, 'center');
    addSpacer(15);
    addHorizontalLine();
    addSpacer(10);

    participants.forEach((p) => {
      checkPageBreak(40);

      addText(p.name, 12, true);
      addSpacer(15);
      
      doc.setLineWidth(0.3);
      doc.line(margin, yPos, margin + 80, yPos);
      yPos += 5;
      addText('Signature', 9);
      addSpacer(10);
      
      doc.line(margin, yPos, margin + 80, yPos);
      yPos += 5;
      addText('Date', 9);
      addSpacer(15);
    });
  }

  // ===== FOOTER ON ALL PAGES =====
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128);
    
    // Page number
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Document ID
    doc.text(`Document ID: ${dealRoom.id.substring(0, 8).toUpperCase()}`, margin, pageHeight - 10);
    
    // Confidential notice
    doc.text('CONFIDENTIAL', pageWidth - margin, pageHeight - 10, { align: 'right' });
    
    doc.setTextColor(0);
  }

  return doc;
};

export const downloadDealRoomPDF = (options: PDFExportOptions) => {
  const doc = generateDealRoomPDF(options);
  const filename = `${options.dealRoom.name.replace(/\s+/g, '_')}_Agreement.pdf`;
  doc.save(filename);
};

export const getDealRoomPDFBlob = (options: PDFExportOptions): Blob => {
  const doc = generateDealRoomPDF(options);
  return doc.output('blob');
};
