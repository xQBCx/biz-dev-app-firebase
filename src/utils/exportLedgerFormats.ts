import { format } from "date-fns";
import jsPDF from "jspdf";
import type { ValueLedgerEntry, LedgerStats } from "@/hooks/useValueLedger";
import { toast } from "sonner";

/**
 * Export ledger entries to PDF with full branding
 */
export async function exportLedgerToPDF(
  entries: ValueLedgerEntry[],
  stats: LedgerStats,
  dealRoomName: string
): Promise<void> {
  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPos = 20;

    // Header
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text(dealRoomName.toUpperCase(), pageWidth / 2, yPos, { align: "center" });
    yPos += 10;

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "normal");
    pdf.text("VALUE LEDGER REPORT", pageWidth / 2, yPos, { align: "center" });
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text(`Generated: ${format(new Date(), "MMMM d, yyyy h:mm a")}`, pageWidth / 2, yPos, { align: "center" });
    yPos += 15;

    // Divider
    pdf.setDrawColor(200);
    pdf.line(20, yPos, pageWidth - 20, yPos);
    yPos += 15;

    // Executive Summary
    pdf.setTextColor(0);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("EXECUTIVE SUMMARY", 20, yPos);
    yPos += 10;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    
    const summaryItems = [
      ["Total Value Transacted:", `$${stats.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`],
      ["Total XDK Tokenized:", `${stats.totalXdk.toLocaleString("en-US", { minimumFractionDigits: 2 })} XDK`],
      ["Total Credits Earned:", stats.totalCredits.toLocaleString()],
      ["Transaction Count:", stats.entryCount.toString()],
      ["Unique Entities:", stats.uniqueEntities.toString()],
    ];

    summaryItems.forEach(([label, value]) => {
      pdf.text(label, 25, yPos);
      pdf.text(value, 100, yPos);
      yPos += 7;
    });

    yPos += 10;

    // Contribution Breakdown by Entity Type
    if (Object.keys(stats.byEntityType).length > 0) {
      pdf.setFont("helvetica", "bold");
      pdf.text("CONTRIBUTION BY ENTITY TYPE", 20, yPos);
      yPos += 10;

      pdf.setFont("helvetica", "normal");
      Object.entries(stats.byEntityType).forEach(([type, amount]) => {
        const percentage = stats.totalValue > 0 ? ((amount / stats.totalValue) * 100).toFixed(1) : "0";
        pdf.text(`${type.charAt(0).toUpperCase() + type.slice(1)}:`, 25, yPos);
        pdf.text(`$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} (${percentage}%)`, 100, yPos);
        yPos += 7;
      });
      yPos += 10;
    }

    // Transaction Ledger
    pdf.setFont("helvetica", "bold");
    pdf.text("TRANSACTION LEDGER", 20, yPos);
    yPos += 10;

    pdf.setFont("helvetica", "normal");

    entries.forEach((entry, index) => {
      // Check if we need a new page
      if (yPos > 260) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text(`[Entry ${index + 1} - ${format(new Date(entry.created_at), "MMM d, yyyy h:mm a")}]`, 25, yPos);
      yPos += 6;

      pdf.setFont("helvetica", "normal");
      pdf.text(`Type: ${entry.entry_type.replace(/_/g, " ").toUpperCase()}`, 30, yPos);
      yPos += 5;
      pdf.text(`From: ${entry.source_entity_name}`, 30, yPos);
      yPos += 5;
      if (entry.destination_entity_name) {
        pdf.text(`To: ${entry.destination_entity_name}`, 30, yPos);
        yPos += 5;
      }
      pdf.text(`Amount: $${Number(entry.amount).toFixed(2)}${entry.xdk_amount ? ` → ${Number(entry.xdk_amount).toFixed(2)} XDK` : ""}`, 30, yPos);
      yPos += 5;
      if (entry.purpose) {
        pdf.text(`Purpose: ${entry.purpose}`, 30, yPos);
        yPos += 5;
      }
      if (entry.xdk_tx_hash) {
        pdf.setFontSize(7);
        pdf.text(`TX: ${entry.xdk_tx_hash}`, 30, yPos);
        yPos += 5;
        pdf.setFontSize(9);
      }
      if (entry.contribution_credits > 0) {
        pdf.text(`Credits: +${entry.contribution_credits} ${entry.credit_category || ""}`, 30, yPos);
        yPos += 5;
      }
      yPos += 5;
    });

    // Footer - Verification Certificate
    if (yPos > 240) {
      pdf.addPage();
      yPos = 20;
    }

    yPos += 10;
    pdf.setDrawColor(200);
    pdf.line(20, yPos, pageWidth - 20, yPos);
    yPos += 10;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("VERIFICATION CERTIFICATE", 20, yPos);
    yPos += 8;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text("This ledger is anchored to XODIAK blockchain.", 25, yPos);
    yPos += 5;
    pdf.text(`Report ID: ${crypto.randomUUID()}`, 25, yPos);
    yPos += 5;
    pdf.text(`Entries validated: ${entries.filter(e => e.xdk_tx_hash).length} of ${entries.length}`, 25, yPos);

    // Save
    pdf.save(`${dealRoomName.replace(/\s+/g, "-").toLowerCase()}-value-ledger-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast.success("PDF report downloaded");
  } catch (error) {
    console.error("PDF export error:", error);
    toast.error("Failed to generate PDF");
  }
}

/**
 * Export ledger entries to CSV
 */
export function exportLedgerToCSV(entries: ValueLedgerEntry[], filename: string): void {
  const headers = [
    "Date",
    "Entry Type",
    "Source Entity",
    "Source Type",
    "Destination Entity",
    "Amount (USD)",
    "XDK Amount",
    "Credits Earned",
    "Credit Category",
    "Purpose",
    "TX Hash",
    "Verification Source",
  ];

  const rows = entries.map((entry) => [
    format(new Date(entry.created_at), "yyyy-MM-dd HH:mm:ss"),
    entry.entry_type,
    entry.source_entity_name,
    entry.source_entity_type,
    entry.destination_entity_name || "",
    entry.amount.toString(),
    entry.xdk_amount?.toString() || "",
    entry.contribution_credits.toString(),
    entry.credit_category || "",
    entry.purpose || "",
    entry.xdk_tx_hash || "",
    entry.verification_source || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  downloadFile(csvContent, `${filename}.csv`, "text/csv");
  toast.success("CSV file downloaded");
}

/**
 * Export ledger entries to JSON
 */
export function exportLedgerToJSON(entries: ValueLedgerEntry[], filename: string): void {
  const jsonContent = JSON.stringify(entries, null, 2);
  downloadFile(jsonContent, `${filename}.json`, "application/json");
  toast.success("JSON file downloaded");
}

/**
 * Export ledger entries to Markdown
 */
export function exportLedgerToMarkdown(
  entries: ValueLedgerEntry[],
  stats: LedgerStats,
  dealRoomName: string,
  filename: string
): void {
  let md = `# ${dealRoomName} - Value Ledger Report\n\n`;
  md += `**Generated:** ${format(new Date(), "MMMM d, yyyy h:mm a")}\n\n`;
  md += `---\n\n`;

  // Summary
  md += `## Executive Summary\n\n`;
  md += `| Metric | Value |\n`;
  md += `|--------|-------|\n`;
  md += `| Total Value | $${stats.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })} |\n`;
  md += `| Total XDK | ${stats.totalXdk.toLocaleString("en-US", { minimumFractionDigits: 2 })} XDK |\n`;
  md += `| Total Credits | ${stats.totalCredits.toLocaleString()} |\n`;
  md += `| Transactions | ${stats.entryCount} |\n`;
  md += `| Unique Entities | ${stats.uniqueEntities} |\n\n`;

  // Entries
  md += `## Transaction Ledger\n\n`;

  entries.forEach((entry, index) => {
    md += `### Entry ${index + 1} - ${format(new Date(entry.created_at), "MMM d, yyyy h:mm a")}\n\n`;
    md += `- **Type:** ${entry.entry_type.replace(/_/g, " ")}\n`;
    md += `- **From:** ${entry.source_entity_name} (${entry.source_entity_type})\n`;
    if (entry.destination_entity_name) {
      md += `- **To:** ${entry.destination_entity_name}\n`;
    }
    md += `- **Amount:** $${Number(entry.amount).toFixed(2)}`;
    if (entry.xdk_amount) {
      md += ` → ${Number(entry.xdk_amount).toFixed(2)} XDK`;
    }
    md += `\n`;
    if (entry.purpose) {
      md += `- **Purpose:** ${entry.purpose}\n`;
    }
    if (entry.contribution_credits > 0) {
      md += `- **Credits:** +${entry.contribution_credits} (${entry.credit_category || "general"})\n`;
    }
    if (entry.xdk_tx_hash) {
      md += `- **TX Hash:** \`${entry.xdk_tx_hash}\`\n`;
    }
    if (entry.narrative) {
      md += `\n> ${entry.narrative}\n`;
    }
    md += `\n`;
  });

  downloadFile(md, `${filename}.md`, "text/markdown");
  toast.success("Markdown file downloaded");
}

/**
 * Helper to download a file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
