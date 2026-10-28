import { lineAmounts } from "@/lib/invoice-math";

/** How GST is split on an invoice. Which applies depends on the place of supply. */
export type SupplyType = "intra" | "inter";

/** `taxRate` overrides the invoice's GST rate for one line (dashboard invoices can mix rates). */
export type InvoiceDocLine = { description: string; quantity: number; unitPrice: number; taxRate?: number | undefined };

/** Everything needed to render or export one invoice, independent of where it came from. */
export type InvoiceDoc = {
  fromName: string;
  clientName: string;
  clientEmail?: string | undefined;
  invoiceNumber: string;
  invoiceDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  gstRate: number; // percent
  supply: SupplyType;
  lines: InvoiceDocLine[];
  notes?: string | undefined;
};

export type InvoiceComputed = {
  lines: (InvoiceDocLine & { amount: number })[];
  subtotal: number;
  gst: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export function computeInvoice(doc: InvoiceDoc): InvoiceComputed {
  let subtotal = 0;
  let gst = 0;
  const lines = doc.lines.map((l) => {
    const { net, tax } = lineAmounts({ description: l.description, quantity: l.quantity, unitPrice: l.unitPrice, taxRate: l.taxRate ?? doc.gstRate });
    subtotal += net;
    gst += tax;
    return { ...l, amount: net };
  });
  subtotal = round2(subtotal);
  gst = round2(gst);
  // Split intra-state GST into equal halves that still add up to the exact total.
  const cgst = doc.supply === "intra" ? round2(gst / 2) : 0;
  const sgst = doc.supply === "intra" ? round2(gst - cgst) : 0;
  const igst = doc.supply === "inter" ? gst : 0;
  return { lines, subtotal, gst, cgst, sgst, igst, total: round2(subtotal + gst) };
}

/** GST labels: show the percentage only when every line uses the same rate. */
export function gstLabels(doc: InvoiceDoc) {
  const rates = new Set(doc.lines.map((l) => l.taxRate ?? doc.gstRate));
  const single = rates.size <= 1 ? (rates.values().next().value ?? doc.gstRate) : null;
  if (single === null) return { rate: "Mixed rates", cgst: "CGST", sgst: "SGST", igst: "IGST" };
  return { rate: `${single}%`, cgst: `CGST (${single / 2}%)`, sgst: `SGST (${single / 2}%)`, igst: `IGST (${single}%)` };
}

export function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export function formatDocDate(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "—";
  const d = new Date(iso + "T00:00:00");
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

/** The sample shown in the hero's floating invoice card. */
export const SAMPLE_INVOICE: InvoiceDoc = {
  fromName: "Your Studio",
  clientName: "Acme Creative Studio",
  clientEmail: "accounts@acmecreative.example",
  invoiceNumber: "INV-2026-001",
  invoiceDate: "2026-10-12",
  dueDate: "2026-10-27",
  gstRate: 18,
  supply: "intra",
  lines: [{ description: "Brand identity design", quantity: 1, unitPrice: 21185.59 }],
  notes: "Sample invoice for illustration.",
};
