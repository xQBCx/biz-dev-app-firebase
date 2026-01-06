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
}

interface ExportOptions {
  dealName: string;
  terms: Term[];
  participants: Participant[];
  includeAgreementStatus?: boolean;
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

export const generateTermsDocument = ({
  dealName,
  terms,
  participants,
  includeAgreementStatus = true,
}: ExportOptions): string => {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Group terms by section
  const termsBySection = terms.reduce((acc, term) => {
    if (!acc[term.section_type]) {
      acc[term.section_type] = [];
    }
    acc[term.section_type].push(term);
    return acc;
  }, {} as Record<string, Term[]>);

  // Build document
  let doc = `
================================================================================
                        OPERATING AGREEMENT
================================================================================

                           ${dealName.toUpperCase()}

                        Effective Date: ${date}

================================================================================

PARTIES:
${participants.map((p, i) => `${i + 1}. ${p.name} (${p.email})`).join('\n')}

================================================================================

`;

  // Add each section
  const sectionOrder = [
    'recitals', 'definitions', 'representations', 'covenants', 
    'conditions', 'payment_terms', 'ip_ownership', 'confidentiality',
    'termination', 'dispute_resolution', 'miscellaneous'
  ];

  sectionOrder.forEach((sectionType) => {
    const sectionTerms = termsBySection[sectionType];
    if (!sectionTerms || sectionTerms.length === 0) return;

    const sectionLabel = sectionTypeLabels[sectionType] || sectionType.toUpperCase();
    
    doc += `
--------------------------------------------------------------------------------
                        ${sectionLabel}
--------------------------------------------------------------------------------

`;

    sectionTerms.forEach((term, index) => {
      doc += `${index + 1}. ${term.title}${term.is_required ? ' *' : ''}
${'-'.repeat(term.title.length + 3)}
${term.content}

`;

      if (includeAgreementStatus && term.agreed_by) {
        const agreementStatus = participants
          .filter(p => p.user_id)
          .map(p => {
            const agreed = term.agreed_by?.[p.user_id!];
            return `   ${agreed ? '✓' : '○'} ${p.name}`;
          })
          .join('\n');
        
        if (agreementStatus) {
          doc += `Agreement Status:
${agreementStatus}

`;
        }
      }
    });
  });

  doc += `
================================================================================
                        SIGNATURES
================================================================================

${participants.map(p => `
${p.name}
_________________________________
Signature

_________________________________
Date
`).join('\n')}

================================================================================
                        END OF DOCUMENT
================================================================================

* Required terms must be agreed to by all parties.
Generated on ${new Date().toISOString()}
`;

  return doc;
};

export const downloadTermsAsText = (options: ExportOptions) => {
  const content = generateTermsDocument(options);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${options.dealName.replace(/\s+/g, '_')}_Operating_Agreement.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const copyTermsToClipboard = async (options: ExportOptions): Promise<boolean> => {
  const content = generateTermsDocument(options);
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};
