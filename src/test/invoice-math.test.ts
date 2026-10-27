import { describe, expect, it } from "vitest";
import { formatInvoiceNumber, invoiceTotals, receivablesSummary } from "@/lib/invoice-math";

describe("invoiceTotals", () => {
  it("adds GST per line and rounds to paise", () => {
    expect(
      invoiceTotals([
        { description: "Design", quantity: 2, unitPrice: 10000, taxRate: 18 },
        { description: "Hosting", quantity: 1, unitPrice: 999.99, taxRate: 0 },
      ]),
    ).toEqual({ subtotal: 20999.99, taxTotal: 3600, total: 24599.99 });
  });
});

describe("formatInvoiceNumber", () => {
  it("pads the running number", () => {
    expect(formatInvoiceNumber("INV-", 7)).toBe("INV-0007");
  });
});

describe("receivablesSummary", () => {
  const today = "2026-10-27";
  const invoices = [
    { id: "a", status: "draft", due_date: "2026-10-01", total: 5000 },
    { id: "b", status: "sent", due_date: "2026-10-20", total: 10000 }, // overdue, unpaid
    { id: "c", status: "partially_paid", due_date: "2026-11-10", total: 8000 }, // 3000 paid
    { id: "d", status: "paid", due_date: "2026-10-01", total: 2000 },
  ];
  const paid = new Map([
    ["c", 3000],
    ["d", 2000],
  ]);

  it("ignores drafts and splits outstanding from overdue", () => {
    expect(receivablesSummary(invoices, paid, today)).toEqual({
      invoiced: 20000,
      collected: 5000,
      outstanding: 15000,
      overdue: 10000,
      overdueCount: 1,
    });
  });
});
