import { useState, type ReactNode } from "react";
import { CalendarClock, Pause, Play, ReceiptText, RotateCcw, ShieldCheck, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { formatMoneyCompact } from "@/lib/format";
import { cn } from "@/lib/utils";

function Tile({ icon, title, body, children, className, delay }: { icon: ReactNode; title: string; body: string; children?: ReactNode; className?: string; delay?: number }) {
  return (
    <Reveal delay={delay ?? 0} className={cn("group flex flex-col rounded-3xl border bg-card/70 p-6 shadow-card backdrop-blur-sm transition-colors duration-300 hover:border-primary/40 sm:p-7", className)}>
      <div className="flex items-center gap-2.5 text-primary">
        {icon}
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
      </div>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{body}</p>
      {children ? <div className="mt-6 flex-1">{children}</div> : null}
    </Reveal>
  );
}

const LINE_ITEMS = [
  { name: "Discovery workshop", amount: 18000 },
  { name: "Logo & wordmark", amount: 22000 },
  { name: "Brand guidelines", amount: 8000 },
];

function InvoiceSketch() {
  return (
    <div className="rounded-xl bg-paper p-4 text-paper-foreground shadow-paper transition-transform duration-500 group-hover:-translate-y-1 sm:p-5">
      {LINE_ITEMS.map((li) => (
        <div key={li.name} className="flex justify-between border-b border-paper-line py-2 text-sm last:border-0">
          <span>{li.name}</span>
          <span className="tabular-nums text-paper-muted">{formatMoneyCompact(li.amount)}</span>
        </div>
      ))}
      <div className="mt-2 flex items-baseline justify-between border-t border-paper-foreground/80 pt-3">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-paper-muted">Subtotal</span>
        <span className="font-display text-2xl tabular-nums">{formatMoneyCompact(48000)}</span>
      </div>
    </div>
  );
}

function PartialPayments() {
  const total = 48000;
  const step = 12000;
  const [received, setReceived] = useState(12000);
  const done = received >= total;
  const pct = Math.min(100, (received / total) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted-foreground">Received</span>
        <span className="tabular-nums text-foreground">
          {formatMoneyCompact(received)} <span className="text-muted-foreground">of {formatMoneyCompact(total)}</span>
        </span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Amount received" aria-valuemin={0} aria-valuemax={total} aria-valuenow={received}>
        <div className={cn("h-full rounded-full transition-[width] duration-700 ease-out", done ? "bg-success" : "bg-primary")} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
        {done ? "Fully paid — status updated automatically." : `Partially paid · ${formatMoneyCompact(total - received)} remaining`}
      </p>
      <Button type="button" size="sm" variant="secondary" className="mt-4" onClick={() => setReceived((r) => (r >= total ? 0 : Math.min(total, r + step)))}>
        {done ? (
          <>
            <RotateCcw /> Start over
          </>
        ) : (
          <>Record {formatMoneyCompact(step)} payment</>
        )}
      </Button>
    </div>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function RecurringSchedule() {
  const [paused, setPaused] = useState(false);
  const sentThrough = 4; // sample: Jan–May already issued
  return (
    <div>
      <ul className="grid grid-cols-6 gap-1.5" aria-label="Monthly retainer schedule">
        {MONTHS.map((m, i) => {
          const sent = i <= sentThrough;
          const skipped = !sent && paused;
          return (
            <li
              key={m}
              className={cn(
                "rounded-md border py-1.5 text-center text-[0.68rem] transition-all duration-300",
                sent && "border-primary/50 bg-primary/20 text-foreground",
                !sent && !paused && "border-dashed text-muted-foreground",
                skipped && "border-dashed opacity-30",
              )}
            >
              {m}
              <span className="sr-only">{sent ? " issued" : paused ? " paused" : " scheduled"}</span>
            </li>
          );
        })}
      </ul>
      <Button type="button" size="sm" variant="secondary" className="mt-4" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
        {paused ? (
          <>
            <Play /> Resume retainer
          </>
        ) : (
          <>
            <Pause /> Pause retainer
          </>
        )}
      </Button>
    </div>
  );
}

const RECEIVABLES = [
  { label: "Invoiced", value: 312000, tone: "bg-foreground/80" },
  { label: "Collected", value: 228000, tone: "bg-success" },
  { label: "Outstanding", value: 84000, tone: "bg-primary" },
  { label: "Overdue", value: 36000, tone: "bg-warning" },
];

function ReceivablesSketch() {
  const max = RECEIVABLES[0]?.value ?? 1;
  return (
    <div>
      <dl className="grid gap-3">
        {RECEIVABLES.map((r) => (
          <div key={r.label} className="grid grid-cols-[6.5rem_1fr_auto] items-center gap-3 text-sm">
            <dt className="text-muted-foreground">{r.label}</dt>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className={cn("h-full rounded-full", r.tone)} style={{ width: `${(r.value / max) * 100}%` }} />
            </div>
            <dd className="tabular-nums text-foreground">{formatMoneyCompact(r.value)}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs text-muted-foreground">Sample figures for illustration.</p>
    </div>
  );
}

export function FeatureBento() {
  return (
    <div className="grid gap-4 lg:grid-cols-6">
      <Tile
        className="lg:col-span-4"
        icon={<ReceiptText className="h-5 w-5" />}
        title="Invoices in minutes"
        body="Clean, GST-ready invoices with line items, taxes and your branding. Save drafts, preview, download a PDF, or send."
      >
        <div className="grid items-end gap-6 sm:grid-cols-[1fr_1.2fr]">
          <ul className="grid gap-2 text-sm text-muted-foreground">
            <li>· Line items with quantities and rates</li>
            <li>· GST added for you</li>
            <li>· Drafts saved until you&apos;re ready</li>
          </ul>
          <InvoiceSketch />
        </div>
      </Tile>
      <Tile delay={80} className="lg:col-span-2" icon={<Wallet className="h-5 w-5" />} title="Every payment tracked" body="Record full or partial payments and the balance and status update themselves.">
        <PartialPayments />
      </Tile>
      <Tile delay={0} className="lg:col-span-2" icon={<CalendarClock className="h-5 w-5" />} title="Recurring invoices" body="Monthly retainers generate their invoices on schedule. Pause anytime.">
        <RecurringSchedule />
      </Tile>
      <Tile delay={80} className="lg:col-span-4" icon={<TrendingUp className="h-5 w-5" />} title="Receivables at a glance" body="One dashboard shows what you've invoiced, collected, what's outstanding and what's overdue.">
        <ReceivablesSketch />
      </Tile>
      <Reveal className="flex flex-col items-start gap-4 rounded-3xl border border-dashed p-6 sm:flex-row sm:items-center sm:p-7 lg:col-span-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-foreground">Your data, isolated</h3>
          <p className="mt-1 text-sm text-muted-foreground">Row-level security keeps every business record scoped to its owner. Your clients and invoices are visible only to your account.</p>
        </div>
      </Reveal>
    </div>
  );
}
