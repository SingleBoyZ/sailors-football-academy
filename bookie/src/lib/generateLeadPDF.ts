import type { jsPDF } from "jspdf";
import type { LeadFormData } from "../types/lead";
import { siteConfig } from "../config/siteConfig";

const PAGE_MARGIN = 48;
const FOOTER_RESERVED_HEIGHT = 40;
const NAVY = "#0f1d34";
const GOLD = "#cc8f24";
const BODY_TEXT = "#1f2937";
const MUTED_TEXT = "#6b7280";
const DIVIDER = "#d9dee7";

interface PdfCursor {
  y: number;
}

function sanitizeFileNameSegment(value: string): string {
  const cleaned = value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return cleaned.length > 0 ? cleaned : "Guest";
}

function buildFileName(fullName: string, submittedAt: Date): string {
  const safeName = sanitizeFileNameSegment(fullName);
  const isoDate = submittedAt.toISOString().slice(0, 10);
  return `Exhibition_Lead_${safeName}_${isoDate}.pdf`;
}

function addFooter(doc: jsPDF, pageNumber: number, generatedLabel: string): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerY = pageHeight - 24;

  doc.setDrawColor(DIVIDER);
  doc.setLineWidth(0.5);
  doc.line(PAGE_MARGIN, footerY - 10, pageWidth - PAGE_MARGIN, footerY - 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(MUTED_TEXT);
  doc.text(generatedLabel, PAGE_MARGIN, footerY);
  doc.text(`Page ${pageNumber}`, pageWidth - PAGE_MARGIN, footerY, { align: "right" });
}

function ensureSpace(doc: jsPDF, cursor: PdfCursor, needed: number): void {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (cursor.y + needed > pageHeight - FOOTER_RESERVED_HEIGHT) {
    doc.addPage();
    cursor.y = PAGE_MARGIN;
  }
}

function drawSectionHeading(doc: jsPDF, cursor: PdfCursor, title: string): void {
  ensureSpace(doc, cursor, 28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(NAVY);
  doc.text(title.toUpperCase(), PAGE_MARGIN, cursor.y);
  cursor.y += 6;

  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setDrawColor(GOLD);
  doc.setLineWidth(1.2);
  doc.line(PAGE_MARGIN, cursor.y, PAGE_MARGIN + 32, cursor.y);
  doc.setDrawColor(DIVIDER);
  doc.setLineWidth(0.5);
  doc.line(PAGE_MARGIN + 32, cursor.y, pageWidth - PAGE_MARGIN, cursor.y);
  cursor.y += 16;
}

function drawRow(doc: jsPDF, cursor: PdfCursor, label: string, value: string): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const labelWidth = 150;
  const valueWidth = pageWidth - PAGE_MARGIN * 2 - labelWidth;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const valueLines = doc.splitTextToSize(value || "—", valueWidth);
  const rowHeight = Math.max(16, valueLines.length * 13 + 6);

  ensureSpace(doc, cursor, rowHeight);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(MUTED_TEXT);
  doc.text(label, PAGE_MARGIN, cursor.y);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(BODY_TEXT);
  doc.text(valueLines, PAGE_MARGIN + labelWidth, cursor.y);

  cursor.y += rowHeight;

  doc.setDrawColor(DIVIDER);
  doc.setLineWidth(0.4);
  doc.line(PAGE_MARGIN, cursor.y - 4, pageWidth - PAGE_MARGIN, cursor.y - 4);
  cursor.y += 6;
}

function drawParagraph(doc: jsPDF, cursor: PdfCursor, text: string): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - PAGE_MARGIN * 2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(BODY_TEXT);
  const lines = doc.splitTextToSize(text, maxWidth);
  const lineHeight = 14;

  for (const line of lines) {
    ensureSpace(doc, cursor, lineHeight);
    doc.text(line, PAGE_MARGIN, cursor.y);
    cursor.y += lineHeight;
  }
}

/**
 * Builds a professional, multi-page-safe PDF summarizing a single lead
 * submission and triggers an immediate browser download. Runs entirely
 * client-side — nothing is uploaded anywhere.
 */
export async function generateLeadPDF(data: LeadFormData): Promise<void> {
  const { jsPDF: JsPDF } = await import("jspdf");

  const submittedAt = new Date();
  const dateLabel = submittedAt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeLabel = submittedAt.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const doc = new JsPDF({ unit: "pt", format: "a4" });
  doc.setProperties({
    title: "Exhibition Lead Submission",
    subject: `Lead submission — ${data.fullName}`,
    creator: siteConfig.companyName,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const cursor: PdfCursor = { y: PAGE_MARGIN };

  // Header band
  doc.setFillColor(NAVY);
  doc.rect(0, 0, pageWidth, 96, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(GOLD);
  doc.text(siteConfig.companyName.toUpperCase(), PAGE_MARGIN, 34);
  doc.setTextColor("#c7d2e3");
  doc.text(siteConfig.eventTitle.toUpperCase(), pageWidth - PAGE_MARGIN, 34, {
    align: "right",
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor("#ffffff");
  doc.text("Exhibition Lead Submission", PAGE_MARGIN, 68);

  cursor.y = 96 + 36;

  // Submission Details
  drawSectionHeading(doc, cursor, "Submission Details");
  drawRow(doc, cursor, "Date", dateLabel);
  drawRow(doc, cursor, "Time", timeLabel);
  cursor.y += 10;

  // Contact Information
  drawSectionHeading(doc, cursor, "Contact Information");
  drawRow(doc, cursor, "Full Name", data.fullName);
  drawRow(doc, cursor, "Company Name", data.companyName);
  drawRow(doc, cursor, "Job Title / Designation", data.jobTitle);
  drawRow(doc, cursor, "Business Email", data.email);
  drawRow(doc, cursor, "Mobile / WhatsApp", data.phone);
  cursor.y += 10;

  // Lead Qualification
  drawSectionHeading(doc, cursor, "Lead Qualification");
  drawRow(doc, cursor, "Industry / Sector", data.industry);
  drawRow(
    doc,
    cursor,
    "Primary Area of Interest",
    data.areasOfInterest.length > 0 ? data.areasOfInterest.join(", ") : "—",
  );
  drawRow(doc, cursor, "Purchasing Timeframe", data.purchasingTimeframe);
  drawRow(doc, cursor, "Preferred Follow-up", data.followUpMethod);
  cursor.y += 10;

  // Additional Notes
  drawSectionHeading(doc, cursor, "Additional Notes");
  const notes = data.additionalNotes.trim();
  drawParagraph(doc, cursor, notes.length > 0 ? notes : "No additional notes provided.");

  // Footers on every page
  const generatedLabel = `Generated ${dateLabel} at ${timeLabel} · ${siteConfig.companyName}`;
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    addFooter(doc, page, generatedLabel);
  }

  doc.save(buildFileName(data.fullName, submittedAt));
}
