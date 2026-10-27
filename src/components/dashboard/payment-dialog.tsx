import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, NativeSelect } from "@/components/dashboard/fields";
import { useRecordPayment } from "@/components/dashboard/use-dashboard-data";
import { formatMoney, num, paymentMethods, todayISO } from "@/lib/format";

export type PaymentTarget = { id: string; number: string; balance: number };

export function PaymentDialog({ uid, target, onClose }: { uid: string; target: PaymentTarget | null; onClose: () => void }) {
  const record = useRecordPayment(uid);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [method, setMethod] = useState("upi");
  const [reference, setReference] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!target) return;
    setAmount(String(target.balance));
    setDate(todayISO());
    setMethod("upi");
    setReference("");
    setSubmitted(false);
  }, [target]);

  const value = num(amount);
  const error = amount.trim() === "" || value <= 0 ? "Enter an amount above ₹0" : target && value > target.balance + 0.005 ? `That's more than the ${formatMoney(target.balance)} still due` : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!target || error) return;
    try {
      await record.mutateAsync({ invoiceId: target.id, amount: Math.round(value * 100) / 100, paymentDate: date, method, reference });
      toast.success(value >= target.balance ? `${target.number} is fully paid` : `Payment recorded on ${target.number}`);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't record the payment");
    }
  };

  return (
    <Dialog open={target !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-popover sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record a payment</DialogTitle>
          <DialogDescription>
            {target ? `${target.number} · ${formatMoney(target.balance)} still due.` : null} Paying the full balance marks the invoice paid and cancels its remaining reminders.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="p-amount" label="Amount (₹)" error={submitted ? error : null}>
              <Input id="p-amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} aria-invalid={Boolean(submitted && error)} autoFocus />
            </Field>
            <Field id="p-date" label="Received on">
              <Input id="p-date" type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field id="p-method" label="Method">
              <NativeSelect id="p-method" value={method} onChange={(e) => setMethod(e.target.value)}>
                {paymentMethods.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field id="p-ref" label="Reference" hint="UTR, cheque no., etc.">
              <Input id="p-ref" value={reference} onChange={(e) => setReference(e.target.value)} />
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={record.isPending}>
              {record.isPending ? "Saving…" : "Record payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
