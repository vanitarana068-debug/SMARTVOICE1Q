import { describe, expect, it } from "vitest";
import { computeInvoice, SAMPLE_INVOICE, type InvoiceDoc } from "@/lib/invoice-doc";
import { buildInvoicePdf, toPdfText } from "@/lib/invoice-pdf";

describe("computeInvoice", () => {
  it("totals the hero sample to exactly ₹24,999 with 18% GST split in halves", () => {
    const c = computeInvoice(SAMPLE_INVOICE);
    expect(c.subtotal).toBe(21185.59);
    expect(c.gst).toBe(3813.41);
    expect(c.cgst + c.sgst).toBeCloseTo(3813.41, 2);
    expect(c.total).toBe(24999);
  });

  it("puts all GST on IGST for inter-state supply", () => {
    const doc: InvoiceDoc = { ...SAMPLE_INVOICE, supply: "inter", gstRate: 12, lines: [{ description: "A", quantity: 3, unitPrice: 1000 }] };
    const c = computeInvoice(doc);
    expect(c).toMatchObject({ subtotal: 3000, gst: 360, igst: 360, cgst: 0, sgst: 0, total: 3360 });
  });
});

describe("buildInvoicePdf", () => {
  const pdf = buildInvoicePdf({ ...SAMPLE_INVOICE, clientName: "Café (Mumbai) ₹ test" });

  it("is a well-formed PDF whose xref offsets point at each object", () => {
    expect(pdf.startsWith("%PDF-1.4")).toBe(true);
    expect(pdf.trimEnd().endsWith("%%EOF")).toBe(true);
    const startxref = Number(pdf.match(/startxref\n(\d+)/)![1]);
    expect(pdf.slice(startxref, startxref + 4)).toBe("xref");
    const offsets = [...pdf.matchAll(/^(\d{10}) 00000 n $/gm)].map((m) => Number(m[1]));
    expect(offsets).toHaveLength(6);
    offsets.forEach((o, i) => expect(pdf.slice(o, o + `${i + 1} 0 obj`.length)).toBe(`${i + 1} 0 obj`));
    expect(/^[\x00-\x7F]*$/.test(pdf)).toBe(true);
  });

  it("writes the amounts and escapes text", () => {
    expect(pdf).toContain("(Rs. 24,999.00)");
    expect(pdf).toContain("Caf? \\(Mumbai\\) Rs. test");
    expect(toPdfText("₹100 — ok")).toBe("Rs. 100 - ok");
  });
});
