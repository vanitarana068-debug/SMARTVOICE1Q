import { useEffect, useId, useState } from "react";
import { BellRing, CheckCircle2, CircleSlash, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAnimatedNumber } from "@/components/site/reveal";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

const GST_RATE = 0.18;
const DUE_OPTIONS = [7, 14, 30] as const;
const REMINDER_STAGES = [
  { offset: -3, label: "Heads-up before due date" },
  { offset: 0, label: "On the due date" },
  { offset: 3, label: "3 days overdue" },
  { offset: 7, label: "7 days overdue" },
  { offset: 14, label: "14 days overdue" },
];

const shortDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Hero demo: edit a sample invoice and watch the totals, due date and reminder
 * schedule update. Marking it paid stamps the invoice and cancels pending reminders.
 */
export function InvoicePlayground() {
  const ids = useId();
  const [client, setClient] = useState("Aarav Design Studio");
  const [item, setItem] = useState("Brand identity, phase 1");
  const [amountText, setAmountText] = useState("48000");
  const [withGst, setWithGst] = useState(true);
  const [dueDays, setDueDays] = useState<(typeof DUE_OPTIONS)[number]>(14);
  const [paid, setPaid] = useState(false);
  // Dates depend on the visitor's clock, so they are filled in after hydration.
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);

  const parsed = Number(amountText.replace(/,/g, ""));
  const amountError = amountText.trim() === "" || !Number.isFinite(parsed) || parsed <= 0 ? "Enter an amount above ₹0" : parsed > 10_000_000 ? "Keep the demo under ₹1 crore" : null;
  const subtotal = amountError ? 0 : parsed;
  const gst = withGst ? subtotal * GST_RATE : 0;
  const total = subtotal + gst;
  const animatedTotal = useAnimatedNumber(total);
  const dueDate = today ? addDays(today, dueDays) : null;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)_minmax(0,16rem)] lg:items-start">
      {/* Controls */}
      <form className="order-2 rounded-2xl border bg-card/80 p-5 shadow-card backdrop-blur-sm lg:order-1" onSubmit={(e) => e.preventDefault()} aria-label="Edit the sample invoice">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Try it — edit the invoice</p>
        <div className="mt-4 grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor={`${ids}-client`}>Client</Label>
            <Input id={`${ids}-client`} value={client} maxLength={40} onChange={(e) => setClient(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`${ids}-item`}>Work billed</Label>
            <Input id={`${ids}-item`} value={item} maxLength={48} onChange={(e) => setItem(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`${ids}-amount`}>Amount (₹)</Label>
            <Input
              id={`${ids}-amount`}
              inputMode="decimal"
              value={amountText}
              aria-invalid={Boolean(amountError)}
              aria-describedby={amountError ? `${ids}-amount-error` : undefined}
              className={cn(amountError && "border-destructive focus-visible:ring-destructive")}
              onChange={(e) => setAmountText(e.target.value)}
            />
            {amountError ? (
              <p id={`${ids}-amount-error`} className="text-xs text-destructive">
                {amountError}
              </p>
            ) : null}
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor={`${ids}-gst`}>Add GST @ 18%</Label>
            <Switch id={`${ids}-gst`} checked={withGst} onCheckedChange={setWithGst} />
          </div>
          <fieldset className="grid gap-1.5">
            <legend className="mb-1.5 text-sm font-medium">Payment terms</legend>
            <div className="grid grid-cols-3 gap-1 rounded-lg border bg-background/60 p-1">
              {DUE_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={dueDays === d}
                  onClick={() => setDueDays(d)}
                  className={cn(
                    "rounded-md py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    dueDays === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {d} days
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </form>

      {/* Live invoice on ivory paper */}
      <div className="order-1 lg:order-2">
        <article
          aria-label="Live invoice preview"
          className="relative mx-auto max-w-md overflow-hidden rounded-xl bg-paper p-6 text-paper-foreground shadow-paper transition-transform duration-500 sm:p-8 lg:-rotate-1 lg:hover:rotate-0"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-3xl leading-none">Invoice</p>
              <p className="mt-1 text-xs text-paper-muted">INV-0008</p>
            </div>
            <div className="text-right text-xs text-paper-muted">
              <p>Issued {today ? shortDate.format(today) : "today"}</p>
              <p className="mt-0.5 font-medium text-paper-foreground">Due {dueDate ? shortDate.format(dueDate) : `in ${dueDays} days`}</p>
            </div>
          </div>

          <div className="mt-6 border-t border-paper-line pt-4">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-paper-muted">Billed to</p>
            <p className="mt-1 truncate font-medium">{client.trim() || "Your client"}</p>
          </div>

          <div className="mt-5 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 border-t border-paper-line pt-4 text-sm">
            <span className="truncate">{item.trim() || "Services"}</span>
            <span className="tabular-nums">{formatMoney(subtotal)}</span>
            <span className={cn("text-paper-muted transition-opacity", !withGst && "opacity-40 line-through")}>GST 18%</span>
            <span className={cn("tabular-nums text-paper-muted transition-opacity", !withGst && "opacity-40")}>{formatMoney(gst)}</span>
          </div>

          <div className="mt-4 flex items-baseline justify-between border-t border-paper-foreground/80 pt-4">
            <span className="text-sm font-semibold">Total due</span>
            <span className="font-display text-3xl tabular-nums sm:text-4xl">{formatMoney(animatedTotal)}</span>
          </div>

          {paid ? (
            <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="animate-stamp rounded-lg border-4 border-success px-6 py-2 font-display text-5xl tracking-widest text-success opacity-90 mix-blend-multiply">
                PAID
              </span>
            </div>
          ) : null}
        </article>
      </div>

      {/* Reminder schedule derived from the due date */}
      <div className="order-3 rounded-2xl border bg-card/80 p-5 shadow-card backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <BellRing className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Follow-ups</p>
        </div>
        <ol className="mt-4 grid gap-3" aria-live="polite">
          {REMINDER_STAGES.map((stage) => {
            const date = dueDate ? addDays(dueDate, stage.offset) : null;
            return (
              <li key={stage.offset} className="flex items-start gap-2.5 text-sm">
                {paid ? (
                  <CircleSlash className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_25%,transparent)]" />
                )}
                <div className={cn("min-w-0 transition-opacity", paid && "opacity-50")}>
                  <p className={cn("text-foreground", paid && "line-through")}>{stage.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {paid ? "Cancelled — invoice paid" : date ? `Scheduled · ${shortDate.format(date)}` : "Scheduled"}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
        <Button
          type="button"
          className="mt-5 w-full"
          variant={paid ? "outline" : "default"}
          disabled={!paid && Boolean(amountError)}
          onClick={() => setPaid((p) => !p)}
        >
          {paid ? (
            <>
              <RotateCcw /> Reset demo
            </>
          ) : (
            <>
              <CheckCircle2 /> Client pays the invoice
            </>
          )}
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {paid ? "Payment recorded. No more reminders go out." : "Reminders stop the moment payment lands."}
        </p>
      </div>
    </div>
  );
}
