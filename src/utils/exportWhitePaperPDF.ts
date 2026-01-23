import jsPDF from "jspdf";
import { 
  masterWhitePaperSections, 
  DOCUMENT_TITLE, 
  DOCUMENT_SUBTITLE,
  PLATFORM_VERSION, 
  type WhitePaperSection 
} from "@/components/whitepaper/masterWhitePaperSections";

interface PDFExportOptions {
  includeTableOfContents?: boolean;
  includeCoverPage?: boolean;
  pageSize?: 'a4' | 'letter';
  fontSizeBase?: number;
}

const DEFAULT_OPTIONS: PDFExportOptions = {
  includeTableOfContents: true,
  includeCoverPage: true,
  pageSize: 'a4',
  fontSizeBase: 10
};

// Strip markdown formatting for plain text rendering
function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s*/g, '') // Remove headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    .replace(/\*([^*]+)\*/g, '$1') // Italic
    .replace(/`([^`]+)`/g, '$1') // Code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/^\s*[-*+]\s*/gm, '• ') // List items
    .replace(/^\s*\d+\.\s*/gm, '') // Numbered lists
    .trim();
}

// Parse content into structured paragraphs
function parseContent(content: string): { type: 'header' | 'subheader' | 'text' | 'bullet'; text: string }[] {
  const lines = content.split('\n');
  const parsed: { type: 'header' | 'subheader' | 'text' | 'bullet'; text: string }[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('# ')) {
      parsed.push({ type: 'header', text: trimmed.substring(2) });
    } else if (trimmed.startsWith('## ')) {
      parsed.push({ type: 'subheader', text: trimmed.substring(3) });
    } else if (trimmed.startsWith('### ')) {
      parsed.push({ type: 'subheader', text: trimmed.substring(4) });
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      parsed.push({ type: 'subheader', text: trimmed.replace(/\*\*/g, '') });
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
      parsed.push({ type: 'bullet', text: stripMarkdown(trimmed.substring(2)) });
    } else if (/^\d+\./.test(trimmed)) {
      const textContent = trimmed.replace(/^\d+\.\s*/, '');
      parsed.push({ type: 'bullet', text: stripMarkdown(textContent) });
    } else {
      parsed.push({ type: 'text', text: stripMarkdown(trimmed) });
    }
  }

  return parsed;
}

export function generateWhitePaperPDF(options: PDFExportOptions = {}): jsPDF {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: opts.pageSize
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  const fontSize = {
    title: opts.fontSizeBase! + 8,
    subtitle: opts.fontSizeBase! + 4,
    header: opts.fontSizeBase! + 3,
    subheader: opts.fontSizeBase! + 1,
    body: opts.fontSizeBase!,
    small: opts.fontSizeBase! - 1
  };

  const lineHeight = {
    title: 12,
    subtitle: 8,
    header: 7,
    subheader: 6,
    body: 5,
    small: 4
  };

  // Helper to check page break
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin - 15) {
      addFooter();
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Add footer to current page
  const addFooter = () => {
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(
      `Page ${pageCount} | ${DOCUMENT_TITLE} | v${PLATFORM_VERSION}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.setTextColor(0);
  };

  // Helper to add wrapped text
  const addText = (text: string, size: number, height: number, isBold: boolean = false, indent: number = 0) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    const totalHeight = lines.length * height;
    
    checkPageBreak(totalHeight);
    
    doc.text(lines, margin + indent, yPosition);
    yPosition += totalHeight + 2;
  };

  // Cover page
  if (opts.includeCoverPage) {
    yPosition = pageHeight / 3;
    
    doc.setFontSize(fontSize.title + 6);
    doc.setFont('helvetica', 'bold');
    doc.text(DOCUMENT_TITLE, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += lineHeight.title + 10;

    doc.setFontSize(fontSize.subtitle);
    doc.setFont('helvetica', 'normal');
    const subtitleLines = doc.splitTextToSize(DOCUMENT_SUBTITLE, contentWidth - 20);
    doc.text(subtitleLines, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += subtitleLines.length * lineHeight.subtitle + 20;

    doc.setFontSize(fontSize.body);
    doc.text(`Version ${PLATFORM_VERSION}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += lineHeight.body + 5;

    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`, pageWidth / 2, yPosition, { align: 'center' });

    // Platform statistics
    yPosition += 30;
    doc.setFontSize(fontSize.small);
    doc.setTextColor(100);
    const stats = [
      '260+ Business Development Tools',
      '71+ Enterprise Services',
      '208+ Database Tables',
      'AI-First Architecture'
    ];
    stats.forEach(stat => {
      doc.text(stat, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += lineHeight.small + 2;
    });
    doc.setTextColor(0);

    // Confidentiality notice
    yPosition = pageHeight - 40;
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text('CONFIDENTIAL - For authorized recipients only', pageWidth / 2, yPosition, { align: 'center' });
    doc.text('© ' + new Date().getFullYear() + ' Biz Dev Platform. All rights reserved.', pageWidth / 2, yPosition + 5, { align: 'center' });
    doc.setTextColor(0);

    addFooter();
    doc.addPage();
    yPosition = margin;
  }

  // Table of Contents
  if (opts.includeTableOfContents) {
    doc.setFontSize(fontSize.header + 4);
    doc.setFont('helvetica', 'bold');
    doc.text('Table of Contents', margin, yPosition);
    yPosition += lineHeight.header + 10;

    doc.setFontSize(fontSize.body);
    doc.setFont('helvetica', 'normal');

    let tocNumber = 1;
    masterWhitePaperSections.forEach((section) => {
      checkPageBreak(lineHeight.body * 2);
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${tocNumber}. ${section.name}`, margin, yPosition);
      yPosition += lineHeight.body + 2;

      if (section.subsections) {
        doc.setFont('helvetica', 'normal');
        section.subsections.forEach((sub, subIdx) => {
          checkPageBreak(lineHeight.body);
          doc.text(`   ${tocNumber}.${subIdx + 1} ${sub.name}`, margin, yPosition);
          yPosition += lineHeight.body + 1;
        });
      }

      tocNumber++;
    });

    addFooter();
    doc.addPage();
    yPosition = margin;
  }

  // Content sections
  let sectionNumber = 1;
  for (const section of masterWhitePaperSections) {
    // Section header
    checkPageBreak(30);
    
    doc.setFontSize(fontSize.header + 2);
    doc.setFont('helvetica', 'bold');
    doc.text(`${sectionNumber}. ${section.name}`, margin, yPosition);
    yPosition += lineHeight.header + 5;

    // Draw separator line
    doc.setDrawColor(200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    // Parse and render content
    const parsed = parseContent(section.content);
    for (const item of parsed) {
      switch (item.type) {
        case 'header':
          checkPageBreak(15);
          addText(item.text, fontSize.header, lineHeight.header, true);
          break;
        case 'subheader':
          checkPageBreak(12);
          yPosition += 3;
          addText(item.text, fontSize.subheader, lineHeight.subheader, true);
          break;
        case 'bullet':
          addText(`• ${item.text}`, fontSize.body, lineHeight.body, false, 5);
          break;
        case 'text':
          addText(item.text, fontSize.body, lineHeight.body);
          break;
      }
    }

    // Subsections
    if (section.subsections) {
      let subNumber = 1;
      for (const sub of section.subsections) {
        checkPageBreak(20);
        yPosition += 5;
        
        doc.setFontSize(fontSize.subheader + 1);
        doc.setFont('helvetica', 'bold');
        doc.text(`${sectionNumber}.${subNumber} ${sub.name}`, margin, yPosition);
        yPosition += lineHeight.subheader + 3;

        const subParsed = parseContent(sub.content);
        for (const item of subParsed) {
          switch (item.type) {
            case 'header':
              checkPageBreak(12);
              addText(item.text, fontSize.subheader, lineHeight.subheader, true);
              break;
            case 'subheader':
              checkPageBreak(10);
              yPosition += 2;
              addText(item.text, fontSize.body + 1, lineHeight.body, true);
              break;
            case 'bullet':
              addText(`• ${item.text}`, fontSize.body, lineHeight.body, false, 5);
              break;
            case 'text':
              addText(item.text, fontSize.body, lineHeight.body);
              break;
          }
        }

        subNumber++;
      }
    }

    yPosition += 10;
    sectionNumber++;
  }

  // Add footer to last page
  addFooter();

  return doc;
}

export function downloadWhitePaperPDF(options: PDFExportOptions = {}) {
  const doc = generateWhitePaperPDF(options);
  const filename = `BizDev-Platform-White-Paper-v${PLATFORM_VERSION}.pdf`;
  doc.save(filename);
}

export function getWhitePaperPDFBlob(options: PDFExportOptions = {}): Blob {
  const doc = generateWhitePaperPDF(options);
  return doc.output('blob');
}

// Plain text export for maximum compatibility
export function getWhitePaperPlainText(): string {
  let content = '';
  const separator = '='.repeat(80);
  const subSeparator = '-'.repeat(60);

  // Header
  content += separator + '\n';
  content += DOCUMENT_TITLE.toUpperCase() + '\n';
  content += separator + '\n\n';
  content += DOCUMENT_SUBTITLE + '\n\n';
  content += `Version: ${PLATFORM_VERSION}\n`;
  content += `Generated: ${new Date().toISOString()}\n\n`;
  content += separator + '\n\n';

  // Platform stats
  content += 'PLATFORM OVERVIEW:\n';
  content += '- 260+ Business Development Tools\n';
  content += '- 71+ Enterprise Services\n';
  content += '- 208+ Database Tables\n';
  content += '- AI-First Architecture\n\n';
  content += separator + '\n\n';

  // Table of Contents
  content += 'TABLE OF CONTENTS\n';
  content += subSeparator + '\n\n';
  let tocNum = 1;
  masterWhitePaperSections.forEach(section => {
    content += `${tocNum}. ${section.name}\n`;
    if (section.subsections) {
      section.subsections.forEach((sub, idx) => {
        content += `   ${tocNum}.${idx + 1} ${sub.name}\n`;
      });
    }
    tocNum++;
  });
  content += '\n' + separator + '\n\n';

  // Content
  let sectionNum = 1;
  for (const section of masterWhitePaperSections) {
    content += `${sectionNum}. ${section.name.toUpperCase()}\n`;
    content += subSeparator + '\n\n';
    content += stripMarkdown(section.content) + '\n\n';

    if (section.subsections) {
      let subNum = 1;
      for (const sub of section.subsections) {
        content += `${sectionNum}.${subNum} ${sub.name}\n`;
        content += '-'.repeat(40) + '\n';
        content += stripMarkdown(sub.content) + '\n\n';
        subNum++;
      }
    }

    content += '\n';
    sectionNum++;
  }

  // Footer
  content += separator + '\n';
  content += 'END OF DOCUMENT\n';
  content += separator + '\n\n';
  content += 'CONFIDENTIAL - For authorized recipients only\n';
  content += `© ${new Date().getFullYear()} Biz Dev Platform. All rights reserved.\n`;

  return content;
}

export function downloadWhitePaperPlainText() {
  const content = getWhitePaperPlainText();
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BizDev-Platform-White-Paper-v${PLATFORM_VERSION}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
