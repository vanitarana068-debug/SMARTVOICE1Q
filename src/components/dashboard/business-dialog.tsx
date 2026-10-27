import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/dashboard/fields";
import { useUpdateProfile, type Profile } from "@/components/dashboard/use-dashboard-data";
import { num } from "@/lib/format";

type Form = { business_name: string; owner_name: string; phone: string; gstin: string; address: string; invoice_prefix: string; payment_terms_days: string; default_tax_rate: string };

const fromProfile = (p: Profile): Form => ({
  business_name: p.business_name,
  owner_name: p.owner_name ?? "",
  phone: p.phone ?? "",
  gstin: p.gstin ?? "",
  address: p.address ?? "",
  invoice_prefix: p.invoice_prefix,
  payment_terms_days: String(p.payment_terms_days),
  default_tax_rate: String(p.default_tax_rate),
});

export function BusinessDialog({ uid, profile, open, onOpenChange }: { uid: string; profile: Profile; open: boolean; onOpenChange: (o: boolean) => void }) {
  const update = useUpdateProfile(uid);
  const [form, setForm] = useState<Form>(() => fromProfile(profile));
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(fromProfile(profile));
      setSubmitted(false);
    }
  }, [open, profile]);

  const set = (key: keyof Form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const terms = Number(form.payment_terms_days);
  const tax = Number(form.default_tax_rate);
  const errors = {
    business_name: form.business_name.trim() === "" ? "Enter your business name" : null,
    invoice_prefix: form.invoice_prefix.trim() === "" ? "Enter a prefix, e.g. INV-" : null,
    payment_terms_days: !Number.isInteger(terms) || terms < 0 || terms > 365 ? "Use 0–365 days" : null,
    default_tax_rate: !Number.isFinite(tax) || tax < 0 || tax > 100 ? "Use 0–100%" : null,
  };
  const show = (k: keyof typeof errors) => (submitted ? errors[k] : null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;
    const blank = (v: string) => (v.trim() === "" ? null : v.trim());
    try {
      await update.mutateAsync({
        business_name: form.business_name.trim(),
        owner_name: blank(form.owner_name),
        phone: blank(form.phone),
        gstin: blank(form.gstin)?.toUpperCase() ?? null,
        address: blank(form.address),
        invoice_prefix: form.invoice_prefix.trim(),
        payment_terms_days: terms,
        default_tax_rate: num(tax),
        onboarding_done: true,
      });
      toast.success("Business details saved");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save your details");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-popover sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Business details</DialogTitle>
          <DialogDescription>These appear on every invoice you send.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="b-name" label="Business name" error={show("business_name")}>
              <Input id="b-name" value={form.business_name} onChange={set("business_name")} aria-invalid={Boolean(show("business_name"))} />
            </Field>
            <Field id="b-owner" label="Your name">
              <Input id="b-owner" value={form.owner_name} onChange={set("owner_name")} />
            </Field>
            <Field id="b-gstin" label="GSTIN">
              <Input id="b-gstin" value={form.gstin} onChange={set("gstin")} maxLength={15} className="uppercase" />
            </Field>
            <Field id="b-phone" label="Phone">
              <Input id="b-phone" type="tel" value={form.phone} onChange={set("phone")} />
            </Field>
          </div>
          <Field id="b-address" label="Address">
            <Textarea id="b-address" value={form.address} onChange={set("address")} rows={2} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="b-prefix" label="Invoice prefix" error={show("invoice_prefix")}>
              <Input id="b-prefix" value={form.invoice_prefix} onChange={set("invoice_prefix")} maxLength={10} />
            </Field>
            <Field id="b-terms" label="Payment terms (days)" error={show("payment_terms_days")}>
              <Input id="b-terms" inputMode="numeric" value={form.payment_terms_days} onChange={set("payment_terms_days")} />
            </Field>
            <Field id="b-tax" label="Default GST %" error={show("default_tax_rate")}>
              <Input id="b-tax" inputMode="decimal" value={form.default_tax_rate} onChange={set("default_tax_rate")} />
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? "Saving…" : "Save details"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
