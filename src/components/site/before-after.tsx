import { useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ROWS = [
  { task: "Making the invoice", before: "Copy last month's spreadsheet, fix the dates, redo the GST maths", after: "Pick the client, add line items, GST and totals calculate themselves" },
  { task: "Knowing who owes you", before: "Scroll through sent emails and your bank app to piece it together", after: "One list of outstanding and overdue invoices, with balances" },
  { task: "Following up", before: "Remember to nudge, write it again, feel awkward about the tone", after: "Polite reminders go out before, on and after the due date" },
  { task: "Part payments", before: "Note it somewhere, then work out what's still due", after: "Record it and the remaining balance updates" },
  { task: "When they pay", before: "Hope you remember to stop chasing", after: "Marked paid, remaining reminders cancelled" },
];

type Side = "before" | "after";

function Panel({ side }: { side: Side }) {
  const after = side === "after";
  return (
    <div className={cn("h-full p-6 sm:p-10", after ? "bg-paper text-paper-foreground" : "bg-muted")}>
      <p className={cn("text-xs font-semibold uppercase tracking-[0.16em]", after ? "text-paper-muted" : "text-muted-foreground")}>
        {after ? "With SmartInvoice" : "The usual routine"}
      </p>
      <ul className="mt-7 grid gap-6">
        {ROWS.map((row) => (
          <li key={row.task} className="grid gap-1.5 sm:grid-cols-[11rem_1fr] sm:gap-6">
            <span className="text-sm font-semibold">{row.task}</span>
            <span className={cn("flex items-start gap-2.5 text-sm leading-relaxed", after ? "text-paper-muted" : "text-muted-foreground")}>
              {after ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden /> : <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />}
              {after ? row.after : row.before}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Flip between the manual routine and SmartInvoice. The SmartInvoice card wipes in over the
 * other one, and each side always rests fully readable.
 */
export function BeforeAfter() {
  const [side, setSide] = useState<Side>("before");
  const showAfter = side === "after";

  return (
    <div>
      <div role="group" aria-label="Compare" className="mb-6 inline-flex rounded-full border bg-card/70 p-1 backdrop-blur-sm">
        {(["before", "after"] as const).map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={side === s}
            onClick={() => setSide(s)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              side === s ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {s === "before" ? "The usual routine" : "With SmartInvoice"}
          </button>
        ))}
      </div>

      {/* Both panels share one grid cell, so the frame is as tall as the longer one. */}
      <div className="grid overflow-hidden rounded-3xl border shadow-lifted">
        <div className="[grid-area:1/1]" aria-hidden={showAfter} inert={showAfter || undefined}>
          <Panel side="before" />
        </div>
        <div
          className="[grid-area:1/1] transition-[clip-path] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
          style={{ clipPath: showAfter ? "inset(0 0 0 0)" : "inset(0 0 0 100%)" }}
          aria-hidden={!showAfter}
          inert={!showAfter || undefined}
        >
          <Panel side="after" />
        </div>
      </div>
    </div>
  );
}
