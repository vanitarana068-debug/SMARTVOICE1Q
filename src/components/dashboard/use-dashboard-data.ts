import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { formatInvoiceNumber, invoiceTotals, lineAmounts, type LineInput } from "@/lib/invoice-math";
import { num, todayISO } from "@/lib/format";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

const keys = {
  profile: (uid: string) => ["profile", uid] as const,
  customers: (uid: string) => ["customers", uid] as const,
  invoices: (uid: string) => ["invoices", uid] as const,
  payments: (uid: string) => ["payments", uid] as const,
  reminders: (uid: string) => ["reminders", uid] as const,
};

function unwrap<T>(res: { data: T; error: { message: string } | null }): NonNullable<T> {
  if (res.error) throw new Error(res.error.message);
  if (res.data === null || res.data === undefined) throw new Error("We couldn't find that record. Try signing out and back in.");
  return res.data;
}

export function useProfile(uid: string) {
  return useQuery({
    queryKey: keys.profile(uid),
    queryFn: async () => unwrap(await supabase.from("profiles").select("*").eq("id", uid).maybeSingle()),
  });
}

export function useCustomers(uid: string) {
  return useQuery({
    queryKey: keys.customers(uid),
    queryFn: async () => unwrap(await supabase.from("customers").select("*").order("name")),
  });
}

export function useInvoices(uid: string) {
  return useQuery({
    queryKey: keys.invoices(uid),
    queryFn: async () =>
      unwrap(
        await supabase
          .from("invoices")
          .select("id, invoice_number, status, issue_date, due_date, total, currency, sent_at, customer_id, customers(name, company, email)")
          .order("issue_date", { ascending: false })
          .order("created_at", { ascending: false }),
      ),
  });
}

export type InvoiceRow = NonNullable<ReturnType<typeof useInvoices>["data"]>[number];

/** Total paid per invoice id. */
export function usePayments(uid: string) {
  return useQuery({
    queryKey: keys.payments(uid),
    queryFn: async () => {
      const rows = unwrap(await supabase.from("payments").select("invoice_id, amount"));
      const byInvoice = new Map<string, number>();
      for (const p of rows) byInvoice.set(p.invoice_id, (byInvoice.get(p.invoice_id) ?? 0) + num(p.amount));
      return byInvoice;
    },
  });
}

export function useUpcomingReminders(uid: string) {
  return useQuery({
    queryKey: keys.reminders(uid),
    queryFn: async () =>
      unwrap(
        await supabase
          .from("reminder_logs")
          .select("id, stage_key, status, scheduled_for, invoices(invoice_number)")
          .eq("status", "scheduled")
          .gte("scheduled_for", todayISO())
          .order("scheduled_for")
          .limit(5),
      ),
  });
}

function useInvalidate(uid: string) {
  const qc = useQueryClient();
  return (...which: (keyof typeof keys)[]) => Promise.all(which.map((k) => qc.invalidateQueries({ queryKey: keys[k](uid) })));
}

export function useUpdateProfile(uid: string) {
  const invalidate = useInvalidate(uid);
  return useMutation({
    mutationFn: async (patch: ProfileUpdate) => {
      const { error } = await supabase.from("profiles").update(patch).eq("id", uid);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => invalidate("profile"),
  });
}

export type NewCustomer = { name: string; company: string; email: string; phone: string; gstin: string; billing_address: string };

export function useCreateCustomer(uid: string) {
  const invalidate = useInvalidate(uid);
  return useMutation({
    mutationFn: async (c: NewCustomer) => {
      const blankToNull = (v: string) => (v.trim() === "" ? null : v.trim());
      return unwrap(
        await supabase
          .from("customers")
          .insert({
            user_id: uid,
            name: c.name.trim(),
            company: blankToNull(c.company),
            email: blankToNull(c.email),
            phone: blankToNull(c.phone),
            gstin: blankToNull(c.gstin),
            billing_address: blankToNull(c.billing_address),
          })
          .select("id")
          .single(),
      );
    },
    onSuccess: () => invalidate("customers"),
  });
}

export type NewInvoice = {
  customerId: string;
  issueDate: string;
  dueDate: string;
  notes: string;
  lines: LineInput[];
  markSent: boolean;
};

export function useCreateInvoice(uid: string) {
  const invalidate = useInvalidate(uid);
  return useMutation({
    mutationFn: async (input: NewInvoice) => {
      // Read the latest counter so two tabs don't reuse a number; the unique constraint is the backstop.
      const profile = unwrap(await supabase.from("profiles").select("invoice_prefix, invoice_next_number, currency").eq("id", uid).single());
      const number = formatInvoiceNumber(profile.invoice_prefix, profile.invoice_next_number);
      const totals = invoiceTotals(input.lines);

      const invoice = unwrap(
        await supabase
          .from("invoices")
          .insert({
            user_id: uid,
            customer_id: input.customerId,
            invoice_number: number,
            status: input.markSent ? "sent" : "draft",
            sent_at: input.markSent ? new Date().toISOString() : null,
            issue_date: input.issueDate,
            due_date: input.dueDate,
            currency: profile.currency,
            subtotal: totals.subtotal,
            tax_total: totals.taxTotal,
            total: totals.total,
            notes: input.notes.trim() || null,
          })
          .select("id, invoice_number")
          .single(),
      );

      const items = input.lines.map((line, position) => {
        const { net, tax } = lineAmounts(line);
        return {
          user_id: uid,
          invoice_id: invoice.id,
          position,
          description: line.description.trim(),
          quantity: line.quantity,
          unit_price: line.unitPrice,
          tax_rate: line.taxRate,
          line_total: Math.round((net + tax) * 100) / 100,
        };
      });
      const { error: itemsError } = await supabase.from("invoice_items").insert(items);
      if (itemsError) {
        // Don't leave an invoice without its lines behind.
        await supabase.from("invoices").delete().eq("id", invoice.id);
        throw new Error(itemsError.message);
      }

      const { error: counterError } = await supabase
        .from("profiles")
        .update({ invoice_next_number: profile.invoice_next_number + 1 })
        .eq("id", uid);
      if (counterError) throw new Error(counterError.message);

      return invoice;
    },
    onSuccess: () => invalidate("invoices", "profile"),
  });
}

export function useMarkSent(uid: string) {
  const invalidate = useInvalidate(uid);
  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const { error } = await supabase.from("invoices").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", invoiceId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => invalidate("invoices"),
  });
}

export type NewPayment = { invoiceId: string; amount: number; paymentDate: string; method: string; reference: string };

export function useRecordPayment(uid: string) {
  const invalidate = useInvalidate(uid);
  return useMutation({
    mutationFn: async (p: NewPayment) => {
      // A database trigger updates the invoice status and skips pending reminders once it's fully paid.
      const { error } = await supabase.from("payments").insert({
        user_id: uid,
        invoice_id: p.invoiceId,
        amount: p.amount,
        payment_date: p.paymentDate,
        method: p.method,
        reference: p.reference.trim() || null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => invalidate("payments", "invoices", "reminders"),
  });
}
