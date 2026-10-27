import { effectiveStatus, num } from "@/lib/format";

export type LineInput = { description: string; quantity: number; unitPrice: number; taxRate: number };

export function lineAmounts(line: LineInput) {
  const net = round2(num(line.quantity) * num(line.unitPrice));
  const tax = round2((net * num(line.taxRate)) / 100);
  return { net, tax };
}

/** Invoice totals from its line items (no discounts yet). */
export function invoiceTotals(lines: LineInput[]) {
  let subtotal = 0;
  let taxTotal = 0;
  for (const line of lines) {
    const { net, tax } = lineAmounts(line);
    subtotal += net;
    taxTotal += tax;
  }
  subtotal = round2(subtotal);
  taxTotal = round2(taxTotal);
  return { subtotal, taxTotal, total: round2(subtotal + taxTotal) };
}

export function formatInvoiceNumber(prefix: string, next: number) {
  return `${prefix}${String(next).padStart(4, "0")}`;
}

export type InvoiceForSummary = { id: string; status: string; due_date: string; total: number | string };

/** Dashboard figures. Drafts are excluded: they haven't been billed yet. */
export function receivablesSummary(invoices: InvoiceForSummary[], paidByInvoice: Map<string, number>, today?: string) {
  let invoiced = 0;
  let collected = 0;
  let outstanding = 0;
  let overdue = 0;
  let overdueCount = 0;
  for (const inv of invoices) {
    if (inv.status === "draft") continue;
    const total = num(inv.total);
    const paid = Math.min(total, paidByInvoice.get(inv.id) ?? 0);
    const balance = round2(total - paid);
    invoiced += total;
    collected += paid;
    if (balance > 0 && inv.status !== "paid") {
      outstanding += balance;
      if (effectiveStatus(inv.status, inv.due_date, today) === "overdue") {
        overdue += balance;
        overdueCount += 1;
      }
    }
  }
  return { invoiced: round2(invoiced), collected: round2(collected), outstanding: round2(outstanding), overdue: round2(overdue), overdueCount };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
