import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BellRing, CheckCircle2, Download, Info, Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Field, NativeSelect } from "@/components/dashboard/fields";
import { InvoiceDocument } from "@/components/site/invoice-document";
import { computeInvoice, formatDocDate, formatINR, type InvoiceDoc, type SupplyType } from "@/lib/invoice-doc";
import { downloadInvoicePdf, PDF_MAX_LINES } from "@/lib/invoice-pdf";
import { addDaysISO, todayISO } from "@/lib/format";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "smartinvoice-demo-v1";
const MAX_ITEMS = Math.min(10, PDF_MAX_LINES);
const GST_OPTIONS = ["0", "5", "12", "18", "28", "custom"] as const;
type GstChoice = (typeof GST_OPTIONS)[number];

type DemoItem = { id: number; description: string; quantity: string; price: string };
type DemoState = {
  fromName: string;
  clientName: string;
  clientEmail: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  gstChoice: GstChoice;
  customRate: string;
  supply: SupplyType;
  items: DemoItem[];
  notes: string;
};

const DEFAULTS: DemoState = {
  fromName: "Your Studio",
  clientName: "Acme Creative Studio",
  clientEmail: "",
  invoiceNumber: "INV-2026-001",
  invoiceDate: "",
  dueDate: "",
  gstChoice: "18",
  customRate: "",
  supply: "intra",
  items: [
    { id: 1, description: "Website design", quantity: "1", price: "18000" },
    { id: 2, description: "Hosting (12 months)", quantity: "1", price: "4500" },
  ],
  notes: "Thank you for your business.",
};

const toNum = (v: string) => (v.trim() === "" ? NaN : Number(v));
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);

type Errors = Partial<Record<"clientName" | "clientEmail" | "invoiceNumber" | "invoiceDate" | "dueDate" | "gst" | "items", string>> & {
  rows?: Record<number, string>;
};

function validate(s: DemoState, needEmail: boolean): Errors {
  const e: Errors = {};
  if (!s.clientName.trim()) e.clientName = "Enter the client's name";
  if (needEmail && !s.clientEmail.trim()) e.clientEmail = "Add the client's email to preview a reminder";
  else if (s.clientEmail.trim() && !/^\S+@\S+\.\S+$/.test(s.clientEmail.trim())) e.clientEmail = "Enter a valid email address";
  if (!s.invoiceNumber.trim()) e.invoiceNumber = "Enter an invoice number";
  if (!isDate(s.invoiceDate)) e.invoiceDate = "Choose the invoice date";
  if (!isDate(s.dueDate)) e.dueDate = "Choose the due date";
  else if (isDate(s.invoiceDate) && s.dueDate < s.invoiceDate) e.dueDate = "Due date can't be before the invoice date";
  if (s.gstChoice === "custom") {
    const r = toNum(s.customRate);
    if (!Number.isFinite(r) || r < 0 || r > 100) e.gst = "Enter a rate between 0 and 100";
  }
  const rows: Record<number, string> = {};
  s.items.forEach((it) => {
    const q = toNum(it.quantity);
    const p = toNum(it.price);
    if (!it.description.trim()) rows[it.id] = "Describe the item";
    else if (!Number.isFinite(q) || q <= 0) rows[it.id] = "Quantity must be more than 0";
    else if (!Number.isFinite(p) || p < 0) rows[it.id] = "Enter a price of ₹0 or more";
  });
  if (Object.keys(rows).length) e.rows = rows;
  if (s.items.length === 0) e.items = "Add at least one item";
  return e;
}

const hasErrors = (e: Errors) => Object.keys(e).length > 0;

export function InvoiceDemo() {
  const id = useId();
  const [s, setS] = useState<DemoState>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const [attempt, setAttempt] = useState<"none" | "pdf" | "reminder">("none");
  const [reminderOpen, setReminderOpen] = useState(false);
  const [simulated, setSimulated] = useState(false);
  const nextId = useRef(100);

  // Restore saved demo data (this browser only) after hydration, and fill today's dates.
  useEffect(() => {
    let restored: DemoState | null = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) restored = { ...DEFAULTS, ...(JSON.parse(raw) as Partial<DemoState>) };
    } catch {
      restored = null;
    }
    const base = restored ?? DEFAULTS;
    const today = todayISO();
    setS({ ...base, invoiceDate: base.invoiceDate || today, dueDate: base.dueDate || addDaysISO(today, 15) });
    nextId.current = Math.max(100, ...base.items.map((i) => i.id + 1));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      // Storage can be unavailable (private mode); the demo still works without it.
    }
  }, [s, loaded]);

  const gstRate = s.gstChoice === "custom" ? toNum(s.customRate) : Number(s.gstChoice);
  const doc: InvoiceDoc = useMemo(
    () => ({
      fromName: s.fromName.trim(),
      clientName: s.clientName.trim(),
      clientEmail: s.clientEmail.trim() || undefined,
      invoiceNumber: s.invoiceNumber.trim(),
      invoiceDate: s.invoiceDate,
      dueDate: s.dueDate,
      gstRate: Number.isFinite(gstRate) && gstRate >= 0 ? gstRate : 0,
      supply: s.supply,
      notes: s.notes.trim() || undefined,
      lines: s.items.map((it) => ({
        description: it.description.trim(),
        quantity: Number.isFinite(toNum(it.quantity)) ? toNum(it.quantity) : 0,
        unitPrice: Number.isFinite(toNum(it.price)) ? toNum(it.price) : 0,
      })),
    }),
    [s, gstRate],
  );
  const totals = computeInvoice(doc);
  const errors = attempt === "none" ? {} : validate(s, attempt === "reminder");

  const set = <K extends keyof DemoState>(key: K, value: DemoState[K]) => setS((prev) => ({ ...prev, [key]: value }));
  const setItem = (itemId: number, patch: Partial<DemoItem>) =>
    setS((prev) => ({ ...prev, items: prev.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) }));

  const focusFirstError = (e: Errors) => {
    const order: (keyof Errors)[] = ["clientName", "clientEmail", "invoiceNumber", "invoiceDate", "dueDate", "gst"];
    const first = order.find((k) => e[k]);
    const target = first ? `${id}-${first}` : e.rows ? `${id}-item-${Object.keys(e.rows)[0]}` : null;
    if (target) document.getElementById(target)?.focus();
  };

  const onDownload = () => {
    setAttempt("pdf");
    const e = validate(s, false);
    if (hasErrors(e) || totals.total <= 0) {
      toast.error(totals.total <= 0 && !hasErrors(e) ? "The invoice total must be more than ₹0" : "Fix the highlighted fields to download the PDF");
      focusFirstError(e);
      return;
    }
    downloadInvoicePdf(doc);
    toast.success(`${doc.invoiceNumber}.pdf downloaded`);
  };

  const onReminder = () => {
    setAttempt("reminder");
    const e = validate(s, true);
    if (hasErrors(e)) {
      toast.error("Fix the highlighted fields to preview a reminder");
      focusFirstError(e);
      return;
    }
    setSimulated(false);
    setReminderOpen(true);
  };

  const onReset = () => {
    const today = todayISO();
    setS({ ...DEFAULTS, invoiceDate: today, dueDate: addDaysISO(today, 15) });
    setAttempt("none");
    toast.success("Demo reset");
  };

  const addItem = () => {
    if (s.items.length >= MAX_ITEMS) return;
    const newId = nextId.current++;
    setS((prev) => ({ ...prev, items: [...prev.items, { id: newId, description: "", quantity: "1", price: "" }] }));
    requestAnimationFrame(() => document.getElementById(`${id}-item-${newId}`)?.focus());
  };

  const err = (k: keyof Omit<Errors, "rows">) => errors[k] ?? null;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-start lg:gap-10">
      {/* Form */}
      <form
        noValidate
        aria-label="Create a demo invoice"
        onSubmit={(e) => {
          e.preventDefault();
          onDownload();
        }}
        className="glass rounded-3xl p-5 shadow-lifted sm:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-foreground">Invoice details</h3>
          <Button type="button" variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw /> Reset demo
          </Button>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field id={`${id}-fromName`} label="Your business name">
            <Input id={`${id}-fromName`} value={s.fromName} maxLength={60} onChange={(e) => set("fromName", e.target.value)} />
          </Field>
          <Field id={`${id}-clientName`} label="Client name" error={err("clientName")}>
            <Input
              id={`${id}-clientName`}
              value={s.clientName}
              maxLength={60}
              aria-invalid={Boolean(err("clientName"))}
              aria-describedby={err("clientName") ? `${id}-clientName-error` : undefined}
              onChange={(e) => set("clientName", e.target.value)}
            />
          </Field>
          <Field id={`${id}-clientEmail`} label="Client email (optional)" error={err("clientEmail")} hint="Used only for the reminder preview">
            <Input
              id={`${id}-clientEmail`}
              type="email"
              value={s.clientEmail}
              placeholder="client@company.com"
              aria-invalid={Boolean(err("clientEmail"))}
              onChange={(e) => set("clientEmail", e.target.value)}
            />
          </Field>
          <Field id={`${id}-invoiceNumber`} label="Invoice number" error={err("invoiceNumber")}>
            <Input
              id={`${id}-invoiceNumber`}
              value={s.invoiceNumber}
              maxLength={30}
              aria-invalid={Boolean(err("invoiceNumber"))}
              onChange={(e) => set("invoiceNumber", e.target.value)}
            />
          </Field>
          <Field id={`${id}-invoiceDate`} label="Invoice date" error={err("invoiceDate")}>
            <Input id={`${id}-invoiceDate`} type="date" value={s.invoiceDate} aria-invalid={Boolean(err("invoiceDate"))} onChange={(e) => set("invoiceDate", e.target.value)} />
          </Field>
          <Field id={`${id}-dueDate`} label="Due date" error={err("dueDate")}>
            <Input
              id={`${id}-dueDate`}
              type="date"
              value={s.dueDate}
              min={s.invoiceDate || undefined}
              aria-invalid={Boolean(err("dueDate"))}
              onChange={(e) => set("dueDate", e.target.value)}
            />
          </Field>
        </div>

        {/* GST settings: example values the user should confirm for their business */}
        <fieldset className="mt-6 rounded-2xl border border-border p-4 sm:p-5">
          <legend className="px-1 text-sm font-medium text-foreground">GST settings</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id={`${id}-gst`} label="GST rate" error={err("gst")}>
              <div className="flex gap-2">
                <NativeSelect id={`${id}-gst`} value={s.gstChoice} onChange={(e) => set("gstChoice", e.target.value as GstChoice)}>
                  {GST_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o === "custom" ? "Custom rate" : `${o}%`}
                    </option>
                  ))}
                </NativeSelect>
                {s.gstChoice === "custom" ? (
                  <Input
                    aria-label="Custom GST rate in percent"
                    inputMode="decimal"
                    className="w-24"
                    placeholder="%"
                    value={s.customRate}
                    aria-invalid={Boolean(err("gst"))}
                    onChange={(e) => set("customRate", e.target.value)}
                  />
                ) : null}
              </div>
            </Field>
            <div className="grid gap-1.5">
              <span id={`${id}-supply-label`} className="text-sm font-medium leading-none">
                Place of supply
              </span>
              <div role="radiogroup" aria-labelledby={`${id}-supply-label`} className="grid grid-cols-2 gap-1 rounded-xl border border-input bg-white/[0.03] p-1">
                {(
                  [
                    ["intra", "Same state"],
                    ["inter", "Other state"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={s.supply === value}
                    onClick={() => set("supply", value)}
                    className={cn(
                      "rounded-lg px-2 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm",
                      s.supply === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{s.supply === "intra" ? "Split as CGST + SGST" : "Charged as IGST"}</p>
            </div>
          </div>
          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Example settings. The right GST rate and type depend on what you sell and where; confirm them for your business.
          </p>
        </fieldset>

        {/* Line items */}
        <fieldset className="mt-6">
          <legend className="text-sm font-medium text-foreground">Items</legend>
          <div className="mt-3 grid gap-3">
            {s.items.map((it, i) => {
              const rowErr = errors.rows?.[it.id];
              return (
                <div key={it.id} className="rounded-2xl border border-border bg-white/[0.02] p-3 sm:p-4">
                  <div className="grid grid-cols-[1fr_auto] gap-3 sm:grid-cols-[minmax(0,1fr)_5rem_7.5rem_auto] sm:items-end">
                    <div className="col-span-2 grid gap-1.5 sm:col-span-1">
                      <Label htmlFor={`${id}-item-${it.id}`}>Description</Label>
                      <Input
                        id={`${id}-item-${it.id}`}
                        value={it.description}
                        maxLength={80}
                        placeholder="e.g. Logo design"
                        aria-invalid={Boolean(rowErr)}
                        onChange={(e) => setItem(it.id, { description: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor={`${id}-qty-${it.id}`}>Qty</Label>
                      <Input id={`${id}-qty-${it.id}`} inputMode="decimal" value={it.quantity} onChange={(e) => setItem(it.id, { quantity: e.target.value })} />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor={`${id}-price-${it.id}`}>Price (₹)</Label>
                      <Input id={`${id}-price-${it.id}`} inputMode="decimal" value={it.price} placeholder="0" onChange={(e) => setItem(it.id, { price: e.target.value })} />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove item ${i + 1}`}
                      disabled={s.items.length === 1}
                      onClick={() => setS((prev) => ({ ...prev, items: prev.items.filter((x) => x.id !== it.id) }))}
                      className="self-end"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                  {rowErr ? (
                    <p role="alert" className="mt-2 text-xs text-destructive">
                      {rowErr}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button type="button" variant="secondary" size="sm" onClick={addItem} disabled={s.items.length >= MAX_ITEMS}>
              <Plus /> Add item
            </Button>
            {s.items.length >= MAX_ITEMS ? <span className="text-xs text-muted-foreground">Up to {MAX_ITEMS} items in the demo</span> : null}
          </div>
        </fieldset>

        <div className="mt-6">
          <Field id={`${id}-notes`} label="Notes (optional)">
            <Textarea id={`${id}-notes`} rows={2} maxLength={160} value={s.notes} onChange={(e) => set("notes", e.target.value)} />
          </Field>
        </div>

        {/* Totals, calculated from the entries above */}
        <dl className="mt-6 grid grid-cols-[1fr_auto] gap-y-2 rounded-2xl border border-border bg-white/[0.02] p-4 text-sm sm:p-5" aria-live="polite">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="text-right tabular-nums text-foreground">{formatINR(totals.subtotal)}</dd>
          <dt className="text-muted-foreground">
            {s.supply === "intra" ? `CGST + SGST (${doc.gstRate / 2}% + ${doc.gstRate / 2}%)` : `IGST (${doc.gstRate}%)`}
          </dt>
          <dd className="text-right tabular-nums text-foreground">{formatINR(totals.gst)}</dd>
          <dt className="border-t border-border pt-2 font-semibold text-foreground">Total</dt>
          <dd className="border-t border-border pt-2 text-right text-lg font-bold tabular-nums text-foreground">{formatINR(totals.total)}</dd>
        </dl>
      </form>

      {/* Live preview and actions */}
      <div className="lg:sticky lg:top-24">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">Live preview</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onReminder}>
              <BellRing /> Send Reminder
            </Button>
            <Button type="button" size="sm" onClick={onDownload}>
              <Download /> Download PDF
            </Button>
          </div>
        </div>
        <InvoiceDocument doc={doc} />
        <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Demo data is saved in this browser only and isn&apos;t linked to an account.{" "}
            <Link to="/signup" className="font-medium text-[var(--primary-text)] underline-offset-4 hover:underline">
              Start free
            </Link>{" "}
            to save real invoices.
          </span>
        </p>
      </div>

      <Dialog open={reminderOpen} onOpenChange={setReminderOpen}>
        <DialogContent className="border-border bg-[#0b1220] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Reminder preview</DialogTitle>
            <DialogDescription>This is a demo. Nothing is emailed from the demo.</DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl bg-paper p-5 text-sm text-paper-foreground">
            <p className="text-paper-muted">
              To: <span className="text-paper-foreground">{doc.clientEmail}</span>
            </p>
            <p className="mt-1 font-semibold">
              Reminder: invoice {doc.invoiceNumber} is due on {formatDocDate(doc.dueDate)}
            </p>
            <p className="mt-3 leading-relaxed">
              Hi {doc.clientName}, just a quick reminder that invoice {doc.invoiceNumber} for {formatINR(totals.total)} is due on {formatDocDate(doc.dueDate)}. Please
              let us know if you have any questions.
            </p>
            <p className="mt-3">Thank you,<br />{doc.fromName || "Your Business"}</p>
          </div>
          {simulated ? (
            <p role="status" className="flex items-start gap-2 rounded-xl border border-[#34d399]/40 bg-[#34d399]/10 p-3 text-sm text-foreground">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#34d399]" />
              Simulation complete. No email was sent: this is a demo. In a SmartInvoice account, reminders are scheduled from your dashboard.
            </p>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="ghost" onClick={() => setReminderOpen(false)}>
              Close
            </Button>
            <Button type="button" onClick={() => setSimulated(true)} disabled={simulated}>
              <BellRing /> {simulated ? "Simulated" : "Simulate send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
