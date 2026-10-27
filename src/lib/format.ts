export type InvoiceStatus = "draft" | "sent" | "partially_paid" | "paid";

export const INR = "INR";

export function formatMoney(amount: number | string | null | undefined, currency = INR): string {
  const value = typeof amount === "string" ? Number(amount) : (amount ?? 0);
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(safe);
}

export function formatMoneyCompact(amount: number | string | null | undefined, currency = INR): string {
  const value = typeof amount === "string" ? Number(amount) : (amount ?? 0);
  const safe = Number.isFinite(value) ? value : 0;
  if (Math.abs(safe) >= 10000000) return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 1, notation: "compact" }).format(safe);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(safe);
}

export function formatDate(input: string | Date | null | undefined): string {
  if (!input) return "—";
  const d = typeof input === "string" ? new Date(input + (input.length === 10 ? "T00:00:00" : "")) : input;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(iso: string, from = todayISO()): number {
  const a = new Date(iso + "T00:00:00").getTime();
  const b = new Date(from + "T00:00:00").getTime();
  return Math.round((b - a) / 86400000);
}

/** Effective display status: overdue is derived from due date. */
export function effectiveStatus(
  status: string,
  dueDate: string | null | undefined,
  from = todayISO(),
): "draft" | "sent" | "partially_paid" | "paid" | "overdue" {
  if (status === "paid" || status === "draft") return status;
  if (dueDate && daysBetween(dueDate, from) > 0) return "overdue";
  return status === "partially_paid" ? "partially_paid" : "sent";
}

export const statusMeta: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  sent: { label: "Sent", className: "bg-primary/10 text-primary" },
  partially_paid: { label: "Partially paid", className: "bg-warning/15 text-warning" },
  paid: { label: "Paid", className: "bg-success/15 text-success" },
  overdue: { label: "Overdue", className: "bg-destructive/10 text-destructive" },
};

export const reminderStageLabels: Record<string, string> = {
  before_due: "3 days before due date",
  on_due: "On the due date",
  overdue_3: "3 days overdue",
  overdue_7: "7 days overdue",
  overdue_14: "14 days overdue",
};

export const paymentMethods = [
  { value: "upi", label: "UPI" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "card", label: "Card" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "other", label: "Other" },
];

export function methodLabel(value: string): string {
  return paymentMethods.find((m) => m.value === value)?.label ?? value;
}

export function num(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}
