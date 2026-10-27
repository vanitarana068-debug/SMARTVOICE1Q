import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, NativeSelect } from "@/components/dashboard/fields";
import { useCreateInvoice, type Customer, type Profile } from "@/components/dashboard/use-dashboard-data";
import { addDaysISO, formatMoney, num, todayISO } from "@/lib/format";
import { formatInvoiceNumber, invoiceTotals } from "@/lib/invoice-math";

type LineDraft = { key: number; description: string; quantity: string; unitPrice: string; taxRate: string };

let lineKey = 0;
const newLine = (taxRate: number): LineDraft => ({ key: ++lineKey, description: "", quantity: "1", unitPrice: "", taxRate: String(taxRate) });

export function InvoiceDialog({
  uid,
  profile,
  customers,
  open,
  onOpenChange,
  onAddCustomer,
  preselectCustomerId,
}: {
  uid: string;
  profile: Profile;
  customers: Customer[];
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onAddCustomer: () => void;
  preselectCustomerId?: string | null;
}) {
  const create = useCreateInvoice(uid);
  const taxDefault = num(profile.default_tax_rate);
  const [customerId, setCustomerId] = useState("");
  const [issueDate, setIssueDate] = useState(todayISO());
  const [dueDate, setDueDate] = useState(addDaysISO(todayISO(), profile.payment_terms_days));
  const [notes, setNotes] = useState(profile.default_notes);
  const [lines, setLines] = useState<LineDraft[]>(() => [newLine(taxDefault)]);
  const [submitted, setSubmitted] = useState(false);

  // Fresh form each time it opens, picking up the latest business defaults.
  useEffect(() => {
    if (!open) return;
    const today = todayISO();
    setCustomerId(preselectCustomerId ?? customers[0]?.id ?? "");
    setIssueDate(today);
    setDueDate(addDaysISO(today, profile.payment_terms_days));
    setNotes(profile.default_notes);
    setLines([newLine(taxDefault)]);
    setSubmitted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open && preselectCustomerId) setCustomerId(preselectCustomerId);
  }, [open, preselectCustomerId]);

  const parsed = lines.map((l) => ({ description: l.description, quantity: num(l.quantity), unitPrice: num(l.unitPrice), taxRate: num(l.taxRate) }));
  const totals = invoiceTotals(parsed);
  const lineErrors = lines.map((l, i) => {
    const p = parsed[i]!;
    if (l.description.trim() === "") return "Describe the work";
    if (p.quantity <= 0) return "Quantity must be above 0";
    if (l.unitPrice.trim() === "" || p.unitPrice < 0) return "Enter a rate";
    if (p.taxRate < 0 || p.taxRate > 100) return "Tax rate must be 0–100%";
    return null;
  });
  const customerError = customerId === "" ? "Choose a client" : null;
  const dateError = dueDate < issueDate ? "Due date can't be before the issue date" : null;
  const hasErrors = Boolean(customerError || dateError || lineErrors.some(Boolean) || totals.total <= 0);

  const updateLine = (key: number, patch: Partial<LineDraft>) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const save = async (markSent: boolean) => {
    setSubmitted(true);
    if (hasErrors) return;
    try {
      const inv = await create.mutateAsync({ customerId, issueDate, dueDate, notes, markSent, lines: parsed });
      toast.success(`${inv.invoice_number} ${markSent ? "created and marked as sent" : "saved as a draft"}`);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't create the invoice");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto bg-popover sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New invoice · {formatInvoiceNumber(profile.invoice_prefix, profile.invoice_next_number)}</DialogTitle>
          <DialogDescription>Totals and GST update as you type.</DialogDescription>
        </DialogHeader>

        <form
          noValidate
          className="grid gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            void save(false);
          }}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="inv-customer" label="Client" error={submitted ? customerError : null} className="sm:col-span-3">
              <div className="flex gap-2">
                <NativeSelect id="inv-customer" value={customerId} onChange={(e) => setCustomerId(e.target.value)} aria-invalid={Boolean(submitted && customerError)}>
                  {customers.length === 0 ? <option value="">No clients yet</option> : null}
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.company ? ` · ${c.company}` : ""}
                    </option>
                  ))}
                </NativeSelect>
                <Button type="button" variant="outline" onClick={onAddCustomer} className="shrink-0">
                  <Plus /> New client
                </Button>
              </div>
            </Field>
            <Field id="inv-issue" label="Issue date">
              <Input id="inv-issue" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            </Field>
            <Field id="inv-due" label="Due date" error={dateError} className="sm:col-span-2">
              <Input id="inv-due" type="date" value={dueDate} min={issueDate} onChange={(e) => setDueDate(e.target.value)} aria-invalid={Boolean(dateError)} />
            </Field>
          </div>

          <fieldset className="grid gap-3">
            <legend className="mb-2 text-sm font-medium">Line items</legend>
            {lines.map((line, i) => {
              const err = submitted ? lineErrors[i] : null;
              return (
                <div key={line.key} className="rounded-lg border p-3">
                  <div className="grid gap-2 sm:grid-cols-[1fr_4.5rem_7rem_4.5rem_auto] sm:items-end">
                    <Field id={`li-desc-${line.key}`} label="Description">
                      <Input id={`li-desc-${line.key}`} value={line.description} onChange={(e) => updateLine(line.key, { description: e.target.value })} placeholder="e.g. Website design" />
                    </Field>
                    <Field id={`li-qty-${line.key}`} label="Qty">
                      <Input id={`li-qty-${line.key}`} inputMode="decimal" value={line.quantity} onChange={(e) => updateLine(line.key, { quantity: e.target.value })} />
                    </Field>
                    <Field id={`li-rate-${line.key}`} label="Rate (₹)">
                      <Input id={`li-rate-${line.key}`} inputMode="decimal" value={line.unitPrice} onChange={(e) => updateLine(line.key, { unitPrice: e.target.value })} />
                    </Field>
                    <Field id={`li-tax-${line.key}`} label="GST %">
                      <Input id={`li-tax-${line.key}`} inputMode="decimal" value={line.taxRate} onChange={(e) => updateLine(line.key, { taxRate: e.target.value })} />
                    </Field>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove line ${i + 1}`}
                      disabled={lines.length === 1}
                      onClick={() => setLines((ls) => ls.filter((l) => l.key !== line.key))}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                  {err ? <p className="mt-2 text-xs text-destructive">{err}</p> : null}
                </div>
              );
            })}
            <Button type="button" variant="secondary" size="sm" className="w-fit" onClick={() => setLines((ls) => [...ls, newLine(taxDefault)])}>
              <Plus /> Add line
            </Button>
          </fieldset>

          <dl className="ml-auto grid w-full max-w-xs gap-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatMoney(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <dt>GST</dt>
              <dd className="tabular-nums">{formatMoney(totals.taxTotal)}</dd>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-semibold text-foreground">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatMoney(totals.total)}</dd>
            </div>
          </dl>

          <Field id="inv-notes" label="Notes for your client">
            <Textarea id="inv-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </Field>

          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="outline" disabled={create.isPending}>
              Save draft
            </Button>
            <Button type="button" disabled={create.isPending} onClick={() => void save(true)}>
              {create.isPending ? "Saving…" : "Save as sent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
