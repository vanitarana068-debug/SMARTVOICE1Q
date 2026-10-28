import { computeInvoice, formatDocDate, gstLabels, type InvoiceDoc } from "@/lib/invoice-doc";

/*
 * A small, dependency-free PDF writer for one-page invoices.
 * It uses the PDF standard fonts (Helvetica), which only cover Latin text,
 * so the rupee sign is written as "Rs." and other non-ASCII characters are simplified.
 */

const PAGE_W = 595; // A4 in points
const PAGE_H = 842;
const MARGIN = 48;
export const PDF_MAX_LINES = 14;

// Helvetica glyph widths (per 1000 em) for printable ASCII, from the standard AFM metrics.
const WIDTHS: Record<string, number> = {};
const widthRows: [string, number][] = [
  [" !", 278], ['"', 355], ["#$", 556], ["%", 889], ["&", 667], ["'", 191], ["()", 333], ["*", 389], ["+", 584],
  [",", 278], ["-", 333], ["./", 278], ["0123456789", 556], [":;", 278], ["<=>", 584], ["?", 556], ["@", 1015],
  ["ABEKPSVXY", 667], ["CDHNRUw", 722], ["FTZ", 611], ["GOQ", 778], ["Ifjlit", 278], ["J", 500], ["L", 556],
  ["M", 833], ["W", 944], ["[\\]", 278], ["^", 469], ["_", 556], ["`", 333], ["abdeghnopqu", 556], ["ckvxyz", 500],
  ["m", 833], ["r", 333], ["s", 500], ["{}", 334], ["|", 260], ["~", 584],
];
for (const [chars, w] of widthRows) for (const c of chars) WIDTHS[c] = w;
// Narrower glyphs that the grouped rows above over-estimate.
WIDTHS["i"] = 222;
WIDTHS["j"] = 222;
WIDTHS["l"] = 222;
WIDTHS["f"] = 278;
WIDTHS["t"] = 278;

function textWidth(text: string, size: number, bold = false) {
  let w = 0;
  for (const c of text) w += WIDTHS[c] ?? 556;
  return (w / 1000) * size * (bold ? 1.06 : 1);
}

/** Map text to what the standard fonts can draw. */
export function toPdfText(text: string) {
  return text
    .replace(/₹\s?/g, "Rs. ")
    .replace(/[–—]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, "...")
    .replace(/[^\x20-\x7E]/g, "?");
}

const esc = (s: string) => toPdfText(s).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

export function pdfMoney(n: number) {
  return "Rs. " + new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

type RGB = [number, number, number];
const BLUE: RGB = [0.231, 0.51, 0.965];
const INK: RGB = [0.059, 0.09, 0.165];
const MUTED: RGB = [0.278, 0.333, 0.412];
const LINE: RGB = [0.886, 0.91, 0.941];
const WHITE: RGB = [1, 1, 1];
const TINT: RGB = [0.945, 0.961, 0.976];

class Page {
  private ops: string[] = [];
  text(x: number, y: number, s: string, opts: { size?: number; bold?: boolean; color?: RGB; align?: "left" | "right" } = {}) {
    const size = opts.size ?? 10;
    const bold = opts.bold ?? false;
    const clean = toPdfText(s);
    const tx = opts.align === "right" ? x - textWidth(clean, size, bold) : x;
    const [r, g, b] = opts.color ?? INK;
    this.ops.push(`BT ${r} ${g} ${b} rg /${bold ? "F2" : "F1"} ${size} Tf 1 0 0 1 ${tx.toFixed(2)} ${y.toFixed(2)} Tm (${esc(clean)}) Tj ET`);
  }
  rect(x: number, y: number, w: number, h: number, color: RGB) {
    this.ops.push(`${color[0]} ${color[1]} ${color[2]} rg ${x} ${y} ${w} ${h} re f`);
  }
  line(x1: number, y1: number, x2: number, y2: number, color: RGB = LINE, width = 0.8) {
    this.ops.push(`${color[0]} ${color[1]} ${color[2]} RG ${width} w ${x1} ${y1} m ${x2} ${y2} l S`);
  }
  stream() {
    return this.ops.join("\n");
  }
}

/** Fit a string into a column width, adding "..." when it is too long. */
function clip(s: string, maxWidth: number, size: number, bold = false) {
  let out = toPdfText(s);
  if (textWidth(out, size, bold) <= maxWidth) return out;
  while (out.length > 1 && textWidth(out + "...", size, bold) > maxWidth) out = out.slice(0, -1);
  return out + "...";
}

export function buildInvoicePdf(doc: InvoiceDoc): string {
  const c = computeInvoice(doc);
  const labels = gstLabels(doc);
  const p = new Page();
  const right = PAGE_W - MARGIN;

  // Header band
  p.rect(0, PAGE_H - 120, PAGE_W, 120, BLUE);
  p.text(MARGIN, PAGE_H - 62, "INVOICE", { size: 26, bold: true, color: WHITE });
  p.text(MARGIN, PAGE_H - 84, doc.invoiceNumber, { size: 11, color: WHITE });
  p.text(right, PAGE_H - 62, clip(doc.fromName || "Your Business", 260, 14, true), { size: 14, bold: true, color: WHITE, align: "right" });
  p.text(right, PAGE_H - 84, "Tax invoice", { size: 10, color: WHITE, align: "right" });

  // Bill to + dates
  let y = PAGE_H - 160;
  p.text(MARGIN, y, "BILL TO", { size: 8, bold: true, color: MUTED });
  p.text(MARGIN, y - 18, clip(doc.clientName || "-", 280, 13, true), { size: 13, bold: true });
  if (doc.clientEmail) p.text(MARGIN, y - 34, clip(doc.clientEmail, 280, 10), { size: 10, color: MUTED });
  p.text(right - 110, y, "Invoice date", { size: 9, color: MUTED });
  p.text(right, y, formatDocDate(doc.invoiceDate), { size: 9, bold: true, align: "right" });
  p.text(right - 110, y - 16, "Due date", { size: 9, color: MUTED });
  p.text(right, y - 16, formatDocDate(doc.dueDate), { size: 9, bold: true, align: "right" });
  p.text(right - 110, y - 32, "GST rate", { size: 9, color: MUTED });
  p.text(right, y - 32, labels.rate, { size: 9, bold: true, align: "right" });

  // Item table
  y = PAGE_H - 240;
  const colQty = 360;
  const colRate = 450;
  p.rect(MARGIN, y - 8, PAGE_W - MARGIN * 2, 24, TINT);
  p.text(MARGIN + 10, y, "DESCRIPTION", { size: 8, bold: true, color: MUTED });
  p.text(colQty, y, "QTY", { size: 8, bold: true, color: MUTED, align: "right" });
  p.text(colRate, y, "RATE", { size: 8, bold: true, color: MUTED, align: "right" });
  p.text(right - 10, y, "AMOUNT", { size: 8, bold: true, color: MUTED, align: "right" });
  y -= 30;
  for (const l of c.lines.slice(0, PDF_MAX_LINES)) {
    p.text(MARGIN + 10, y, clip(l.description || "-", colQty - MARGIN - 70, 10), { size: 10 });
    p.text(colQty, y, String(l.quantity), { size: 10, align: "right" });
    p.text(colRate, y, pdfMoney(l.unitPrice), { size: 10, align: "right" });
    p.text(right - 10, y, pdfMoney(l.amount), { size: 10, align: "right" });
    p.line(MARGIN, y - 10, right, y - 10);
    y -= 26;
  }

  // Totals
  y -= 10;
  const labelX = colRate - 80;
  // The total is set larger, so its label sits further left to keep clear of the amount.
  const totalLabelX = colQty - 70;
  const row = (label: string, value: string, bold = false, size = 10) => {
    p.text(bold ? totalLabelX : labelX, y, label, { size, bold, color: bold ? INK : MUTED });
    p.text(right - 10, y, value, { size, bold, align: "right" });
    y -= size + 8;
  };
  row("Subtotal", pdfMoney(c.subtotal));
  if (doc.supply === "intra") {
    row(labels.cgst, pdfMoney(c.cgst));
    row(labels.sgst, pdfMoney(c.sgst));
  } else {
    row(labels.igst, pdfMoney(c.igst));
  }
  p.line(totalLabelX, y + 6, right, y + 6, INK, 1);
  y -= 8;
  row("Total due", pdfMoney(c.total), true, 14);

  if (doc.notes) {
    y -= 18;
    p.text(MARGIN, y, "NOTES", { size: 8, bold: true, color: MUTED });
    p.text(MARGIN, y - 16, clip(doc.notes, PAGE_W - MARGIN * 2, 10), { size: 10, color: MUTED });
  }

  p.line(MARGIN, 64, right, 64);
  p.text(MARGIN, 46, "Amounts in Indian rupees (INR). GST rate and type as entered on this invoice.", { size: 8, color: MUTED });
  p.text(right, 46, "Created with SmartInvoice", { size: 8, color: MUTED, align: "right" });

  return assemble(p.stream());
}

/** Wrap one content stream into a complete PDF file with a valid cross-reference table. */
function assemble(content: string): string {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>`,
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
  ];
  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const o of offsets) out += `${String(o).padStart(10, "0")} 00000 n \n`;
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return out;
}

/** Build the PDF and hand it to the browser as a download. */
export function downloadInvoicePdf(doc: InvoiceDoc) {
  const pdf = buildInvoicePdf(doc);
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(doc.invoiceNumber || "invoice").replace(/[^\w.-]+/g, "_")}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
