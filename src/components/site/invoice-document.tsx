import { computeInvoice, formatDocDate, formatINR, gstLabels, type InvoiceDoc } from "@/lib/invoice-doc";
import { cn } from "@/lib/utils";

/** The invoice as a sheet of paper: used by the live demo and the "View Invoice" preview. */
export function InvoiceDocument({ doc, className, badge }: { doc: InvoiceDoc; className?: string; badge?: string | undefined }) {
  const c = computeInvoice(doc);
  const labels = gstLabels(doc);
  return (
    <article aria-label={`Invoice ${doc.invoiceNumber || ""}`} className={cn("overflow-hidden rounded-2xl bg-paper text-paper-foreground shadow-paper", className)}>
      <header className="flex items-start justify-between gap-4 bg-[#3b82f6] px-6 py-5 text-white sm:px-8">
        <div className="min-w-0">
          <p className="text-2xl font-bold tracking-tight">INVOICE</p>
          <p className="mt-0.5 truncate text-sm text-white/85">{doc.invoiceNumber || "—"}</p>
        </div>
        <div className="min-w-0 text-right">
          <p className="truncate font-semibold">{doc.fromName || "Your Business"}</p>
          <p className="text-sm text-white/85">Tax invoice</p>
        </div>
      </header>

      <div className="px-6 py-6 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-paper-muted">Bill to</p>
            <p className="mt-1 truncate text-base font-semibold">{doc.clientName || "—"}</p>
            {doc.clientEmail ? <p className="truncate text-sm text-paper-muted">{doc.clientEmail}</p> : null}
          </div>
          <dl className="grid grid-cols-[auto_auto] gap-x-6 gap-y-1 text-sm">
            <dt className="text-paper-muted">Invoice date</dt>
            <dd className="text-right font-medium">{formatDocDate(doc.invoiceDate)}</dd>
            <dt className="text-paper-muted">Due date</dt>
            <dd className="text-right font-medium">{formatDocDate(doc.dueDate)}</dd>
            {badge ? (
              <>
                <dt className="text-paper-muted">Status</dt>
                <dd className="text-right">
                  <span className="rounded-full bg-[#dbeafe] px-2 py-0.5 text-xs font-semibold text-[#1d4ed8]">{badge}</span>
                </dd>
              </>
            ) : null}
          </dl>
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="bg-[#f1f5f9] text-left text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-paper-muted">
              <th className="rounded-l-lg px-3 py-2">Description</th>
              <th className="px-3 py-2 text-right">Qty</th>
              <th className="hidden px-3 py-2 text-right sm:table-cell">Rate</th>
              <th className="rounded-r-lg px-3 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {c.lines.map((l, i) => (
              <tr key={i} className="border-b border-paper-line">
                <td className="max-w-0 truncate px-3 py-2.5">{l.description || <span className="text-paper-muted">Item description</span>}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{l.quantity}</td>
                <td className="hidden px-3 py-2.5 text-right tabular-nums sm:table-cell">{formatINR(l.unitPrice)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{formatINR(l.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="ml-auto mt-5 grid max-w-xs grid-cols-[1fr_auto] gap-x-6 gap-y-1.5 text-sm">
          <dt className="text-paper-muted">Subtotal</dt>
          <dd className="text-right tabular-nums">{formatINR(c.subtotal)}</dd>
          {doc.supply === "intra" ? (
            <>
              <dt className="text-paper-muted">{labels.cgst}</dt>
              <dd className="text-right tabular-nums">{formatINR(c.cgst)}</dd>
              <dt className="text-paper-muted">{labels.sgst}</dt>
              <dd className="text-right tabular-nums">{formatINR(c.sgst)}</dd>
            </>
          ) : (
            <>
              <dt className="text-paper-muted">{labels.igst}</dt>
              <dd className="text-right tabular-nums">{formatINR(c.igst)}</dd>
            </>
          )}
          <dt className="mt-2 border-t border-paper-foreground/80 pt-2 font-semibold">Total due</dt>
          <dd className="mt-2 border-t border-paper-foreground/80 pt-2 text-right text-lg font-bold tabular-nums">{formatINR(c.total)}</dd>
        </dl>

        {doc.notes ? <p className="mt-6 border-t border-paper-line pt-4 text-sm text-paper-muted">{doc.notes}</p> : null}
      </div>
    </article>
  );
}
