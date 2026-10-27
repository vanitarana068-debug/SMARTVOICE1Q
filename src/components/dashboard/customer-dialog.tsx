import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/dashboard/fields";
import { useCreateCustomer, type NewCustomer } from "@/components/dashboard/use-dashboard-data";

const EMPTY: NewCustomer = { name: "", company: "", email: "", phone: "", gstin: "", billing_address: "" };

export function CustomerDialog({ uid, open, onOpenChange, onCreated }: { uid: string; open: boolean; onOpenChange: (o: boolean) => void; onCreated?: (id: string) => void }) {
  const [form, setForm] = useState<NewCustomer>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const create = useCreateCustomer(uid);

  const set = (key: keyof NewCustomer) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const nameError = submitted && form.name.trim() === "" ? "Enter the client's name" : null;
  const emailError = submitted && form.email.trim() !== "" && !/^\S+@\S+\.\S+$/.test(form.email.trim()) ? "Enter a valid email address" : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (form.name.trim() === "" || (form.email.trim() !== "" && !/^\S+@\S+\.\S+$/.test(form.email.trim()))) return;
    try {
      const created = await create.mutateAsync(form);
      toast.success(`${form.name.trim()} added`);
      setForm(EMPTY);
      setSubmitted(false);
      onOpenChange(false);
      onCreated?.(created.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save the client");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-popover sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a client</DialogTitle>
          <DialogDescription>Only the name is required. Email is used for invoices and reminders.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="c-name" label="Name" error={nameError}>
              <Input id="c-name" value={form.name} onChange={set("name")} aria-invalid={Boolean(nameError)} autoFocus />
            </Field>
            <Field id="c-company" label="Company">
              <Input id="c-company" value={form.company} onChange={set("company")} />
            </Field>
            <Field id="c-email" label="Email" error={emailError}>
              <Input id="c-email" type="email" value={form.email} onChange={set("email")} aria-invalid={Boolean(emailError)} />
            </Field>
            <Field id="c-phone" label="Phone">
              <Input id="c-phone" type="tel" value={form.phone} onChange={set("phone")} />
            </Field>
          </div>
          <Field id="c-gstin" label="GSTIN" hint="Optional, shown on their invoices">
            <Input id="c-gstin" value={form.gstin} onChange={set("gstin")} maxLength={15} className="uppercase" />
          </Field>
          <Field id="c-address" label="Billing address">
            <Textarea id="c-address" value={form.billing_address} onChange={set("billing_address")} rows={2} />
          </Field>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Saving…" : "Add client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
