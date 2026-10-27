import { useEffect, useMemo, useState } from "react";
import { CircleDollarSign, Check, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addDaysISO, effectiveStatus, formatMoney, formatMoneyCompact, statusMeta, todayISO } from "@/lib/format";
import { receivablesSummary } from "@/lib/invoice-math";
import { cn } from "@/lib/utils";

// Sample data only. Due dates are relative to today so the statuses always make sense.
const SAMPLE = [
  { id: "1", number: "INV-0012", client: "Aarav Design Studio", total: 48000, dueIn: -9, status: "sent", paid: 0 },
  { id: "2", number: "INV-0013", client: "Meera Kapoor · Kapoor Interiors", total: 23600, dueIn: 5, status: "partially_paid", paid: 10000 },
  { id: "3", number: "INV-0014", client: "Northwind Foods", total: 70800, dueIn: 12, status: "sent", paid: 0 },
  { id: "4", number: "INV-0011", client: "Rohan Iyer", total: 15340, dueIn: -20, status: "paid", paid: 15340 },
  { id: "5", number: "INV-0015", client: "Sana Qureshi", total: 9440, dueIn: 15, status: "draft", paid: 0 },
];

type Filter = "all" | "unpaid" | "overdue" | "paid" | "draft";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unpaid", label: "Unpaid" },
  { id: "overdue", label: "Overdue" },
  { id: "paid", label: "Paid" },
  { id: "draft", label: "Drafts" },
];

/** A working miniature of the real /dashboard, so visitors can see what they get before signing up. */
export function DashboardPreview() {
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(todayISO()), []);
  const [invoices, setInvoices] = useState(SAMPLE);
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(() => {
    const t = today ?? "2026-01-15";
    return invoices.map((inv) => {
      const due = addDaysISO(t, inv.dueIn);
      return { ...inv, due, view: effectiveStatus(inv.status, due, t), balance: inv.total - inv.paid };
    });
  }, [invoices, today]);

  const summary = useMemo(() => {
    const t = today ?? "2026-01-15";
    return receivablesSummary(
      rows.map((r) => ({ id: r.id, status: r.status, due_date: r.due, total: r.total })),
      new Map(rows.map((r) => [r.id, r.paid])),
      t,
    );
  }, [rows, today]);

  const isUnpaid = (v: string) => v === "sent" || v === "partially_paid" || v === "overdue";
  const visible = rows.filter((r) => (filter === "all" ? true : filter === "unpaid" ? isUnpaid(r.view) : r.view === filter));
  const count = (f: Filter) => rows.filter((r) => (f === "all" ? true : f === "unpaid" ? isUnpaid(r.view) : r.view === f)).length;

  const payInFull = (id: string) => setInvoices((list) => list.map((i) => (i.id === id ? { ...i, paid: i.total, status: "paid" } : i)));
  const markSent = (id: string) => setInvoices((list) => list.map((i) => (i.id === id ? { ...i, status: "sent" } : i)));

  return (
    <div className="overflow-hidden rounded-3xl border bg-background/70 shadow-lifted backdrop-blur-sm">
      {/* Window chrome */}
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
        </div>
        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Preview · sample data</p>
        <button
          type="button"
          onClick={() => {
            setInvoices(SAMPLE);
            setFilter("all");
          }}
          className="rounded text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Reset
        </button>
      </div>

      <div className="p-4 sm:p-6">
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Invoiced", value: summary.invoiced, tone: "text-foreground" },
            { label: "Collected", value: summary.collected, tone: "text-success" },
            { label: "Outstanding", value: summary.outstanding, tone: "text-primary" },
            { label: "Overdue", value: summary.overdue, tone: "text-destructive" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border bg-card/70 p-4">
              <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{s.label}</dt>
              <dd className={cn("mt-1.5 font-display text-2xl tabular-nums transition-colors sm:text-3xl", s.tone)}>{formatMoneyCompact(s.value)}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 rounded-2xl border bg-card/70">
          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold">Invoices</p>
            <div role="group" aria-label="Filter sample invoices" className="-mx-1 flex gap-1 overflow-x-auto px-1">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    filter === f.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {f.label} <span className="tabular-nums opacity-70">{count(f.id)}</span>
                </button>
              ))}
            </div>
          </div>
          {visible.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">Nothing matches this filter.</p>
          ) : (
            <ul className="divide-y" aria-live="polite">
              {visible.map((r) => {
                const meta = statusMeta[r.view] ?? { label: r.view, className: "" };
                return (
                  <li key={r.id} className="grid gap-3 p-4 transition-colors hover:bg-secondary/30 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] sm:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{r.number}</span>
                        <span className={cn("rounded-full px-2 py-0.5 text-[0.7rem] font-medium", meta.className)}>{meta.label}</span>
                      </div>
                      <p className="mt-1 truncate text-sm text-muted-foreground">{r.client}</p>
                    </div>
                    <div className="text-sm">
                      <p className="tabular-nums">{formatMoney(r.total)}</p>
                      <p className={cn("text-xs", r.view === "overdue" ? "text-destructive" : "text-muted-foreground")}>
                        {r.view === "paid" ? "Settled" : r.view === "draft" ? "Not sent yet" : r.dueIn < 0 ? `${-r.dueIn} days overdue` : `Due in ${r.dueIn} days`}
                        {r.paid > 0 && r.balance > 0 ? ` · ${formatMoneyCompact(r.balance)} left` : ""}
                      </p>
                    </div>
                    <div className="flex sm:justify-end">
                      {r.view === "draft" ? (
                        <Button size="sm" variant="secondary" onClick={() => markSent(r.id)}>
                          <Send /> Mark as sent
                        </Button>
                      ) : r.view !== "paid" ? (
                        <Button size="sm" variant="secondary" onClick={() => payInFull(r.id)}>
                          <CircleDollarSign /> Record payment
                        </Button>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-success">
                          <Check className="h-3.5 w-3.5" /> Settled
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
