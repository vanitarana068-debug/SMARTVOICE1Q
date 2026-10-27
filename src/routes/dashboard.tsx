import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { AlertTriangle, BellRing, Building2, Check, CircleDollarSign, FilePlus2, LogOut, Send, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandMark } from "@/components/site/brand-mark";
import { BusinessDialog } from "@/components/dashboard/business-dialog";
import { CustomerDialog } from "@/components/dashboard/customer-dialog";
import { InvoiceDialog } from "@/components/dashboard/invoice-dialog";
import { PaymentDialog, type PaymentTarget } from "@/components/dashboard/payment-dialog";
import {
  useCustomers,
  useInvoices,
  useMarkSent,
  usePayments,
  useProfile,
  useUpcomingReminders,
  type InvoiceRow,
} from "@/components/dashboard/use-dashboard-data";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { daysBetween, effectiveStatus, formatDate, formatMoney, formatMoneyCompact, num, reminderStageLabels, statusMeta } from "@/lib/format";
import { receivablesSummary } from "@/lib/invoice-math";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — SmartInvoice" }, { name: "robots", content: "noindex" }],
  }),
  component: DashboardRoute,
});

/** Sessions live in the browser, so the guard runs on the client. */
function DashboardRoute() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/login", search: { next: "/dashboard" }, replace: true });
  }, [loading, user, navigate]);

  if (loading || !user) return <DashboardSkeleton />;
  return <Dashboard user={user} />;
}

type Filter = "all" | "unpaid" | "overdue" | "paid" | "draft";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unpaid", label: "Unpaid" },
  { id: "overdue", label: "Overdue" },
  { id: "paid", label: "Paid" },
  { id: "draft", label: "Drafts" },
];

function Dashboard({ user }: { user: User }) {
  const uid = user.id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const profile = useProfile(uid);
  const customers = useCustomers(uid);
  const invoices = useInvoices(uid);
  const payments = usePayments(uid);
  const reminders = useUpcomingReminders(uid);
  const markSent = useMarkSent(uid);

  const [filter, setFilter] = useState<Filter>("all");
  const [customerOpen, setCustomerOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [businessOpen, setBusinessOpen] = useState(false);
  const [newCustomerId, setNewCustomerId] = useState<string | null>(null);
  // Set when "New invoice" had to ask for a client first, so we continue to the invoice afterwards.
  const [continueToInvoice, setContinueToInvoice] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<PaymentTarget | null>(null);

  const paid = payments.data ?? new Map<string, number>();
  const rows = useMemo(
    () =>
      (invoices.data ?? []).map((inv) => {
        const total = num(inv.total);
        const balance = Math.max(0, Math.round((total - (paid.get(inv.id) ?? 0)) * 100) / 100);
        return { inv, total, balance, status: effectiveStatus(inv.status, inv.due_date) };
      }),
    [invoices.data, paid],
  );
  const summary = useMemo(() => receivablesSummary(invoices.data ?? [], paid), [invoices.data, paid]);
  const counts: Record<Filter, number> = {
    all: rows.length,
    unpaid: rows.filter((r) => r.status === "sent" || r.status === "partially_paid" || r.status === "overdue").length,
    overdue: rows.filter((r) => r.status === "overdue").length,
    paid: rows.filter((r) => r.status === "paid").length,
    draft: rows.filter((r) => r.status === "draft").length,
  };
  const visible = rows.filter((r) =>
    filter === "all" ? true : filter === "unpaid" ? r.status === "sent" || r.status === "partially_paid" || r.status === "overdue" : r.status === filter,
  );

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    queryClient.clear();
    await navigate({ to: "/" });
  };

  const openInvoice = () => {
    if ((customers.data ?? []).length === 0) {
      toast.info("Add a client first, then create their invoice.");
      setContinueToInvoice(true);
      setCustomerOpen(true);
      return;
    }
    setInvoiceOpen(true);
  };

  const loadError = profile.error ?? invoices.error ?? customers.error ?? payments.error;
  if (loadError) {
    return (
      <Shell onSignOut={signOut} businessName={null}>
        <div role="alert" className="mx-auto mt-16 max-w-md rounded-2xl border border-destructive/40 bg-card p-8 text-center">
          <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
          <h1 className="mt-3 text-lg font-semibold">We couldn&apos;t load your workspace</h1>
          <p className="mt-2 text-sm text-muted-foreground">{loadError.message}</p>
          <Button className="mt-6" onClick={() => void queryClient.invalidateQueries()}>
            Try again
          </Button>
        </div>
      </Shell>
    );
  }
  if (!profile.data || !invoices.data || !customers.data || !payments.data) {
    return <DashboardSkeleton />;
  }

  const p = profile.data;
  const setupSteps = [
    { done: p.onboarding_done, label: "Add your business details", action: () => setBusinessOpen(true) },
    { done: customers.data.length > 0, label: "Add your first client", action: () => setCustomerOpen(true) },
    { done: invoices.data.length > 0, label: "Create your first invoice", action: openInvoice },
  ];
  const setupDone = setupSteps.every((s) => s.done);

  return (
    <Shell onSignOut={signOut} businessName={p.business_name} onBusiness={() => setBusinessOpen(true)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Dashboard</p>
          <h1 className="mt-2 font-display text-4xl leading-none tracking-tight sm:text-5xl">{p.business_name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Signed in as {user.email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCustomerOpen(true)}>
            <UserPlus /> New client
          </Button>
          <Button onClick={openInvoice}>
            <FilePlus2 /> New invoice
          </Button>
        </div>
      </div>

      {!setupDone ? (
        <section aria-labelledby="setup-heading" className="mt-8 rounded-2xl border border-primary/40 bg-primary/10 p-5 sm:p-6">
          <h2 id="setup-heading" className="font-semibold">
            Get set up · {setupSteps.filter((s) => s.done).length} of {setupSteps.length} done
          </h2>
          <ol className="mt-4 grid gap-2 sm:grid-cols-3">
            {setupSteps.map((step, i) => (
              <li key={step.label}>
                <button
                  type="button"
                  onClick={step.action}
                  disabled={step.done}
                  className="flex w-full items-center gap-3 rounded-xl border bg-card/70 p-3 text-left text-sm transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:opacity-70 disabled:hover:border-border"
                >
                  <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs", step.done ? "border-success bg-success/20 text-success" : "border-primary/60")}>
                    {step.done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span className={cn(step.done && "line-through text-muted-foreground")}>{step.label}</span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section aria-label="Receivables" className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Invoiced" value={summary.invoiced} hint="Excludes drafts" />
        <Stat label="Collected" value={summary.collected} tone="text-success" />
        <Stat label="Outstanding" value={summary.outstanding} tone="text-primary" />
        <Stat label="Overdue" value={summary.overdue} tone="text-destructive" hint={`${summary.overdueCount} ${summary.overdueCount === 1 ? "invoice" : "invoices"}`} />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section aria-labelledby="invoices-heading" className="rounded-2xl border bg-card/70 backdrop-blur-sm">
          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <h2 id="invoices-heading" className="font-semibold">
              Invoices
            </h2>
            <div role="group" aria-label="Filter invoices" className="-mx-1 flex gap-1 overflow-x-auto px-1">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    filter === f.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {f.label} <span className="tabular-nums opacity-70">{counts[f.id]}</span>
                </button>
              ))}
            </div>
          </div>

          {rows.length === 0 ? (
            <EmptyState
              title="No invoices yet"
              body={customers.data.length === 0 ? "Add a client, then create your first invoice. It takes about a minute." : "Create your first invoice. GST and totals are calculated for you."}
              action={
                <Button onClick={openInvoice}>
                  <FilePlus2 /> {customers.data.length === 0 ? "Add a client to start" : "Create an invoice"}
                </Button>
              }
            />
          ) : visible.length === 0 ? (
            <EmptyState title={`No ${FILTERS.find((f) => f.id === filter)?.label.toLowerCase()} invoices`} body="Nothing matches this filter right now." />
          ) : (
            <ul className="divide-y">
              {visible.map(({ inv, total, balance, status }) => (
                <InvoiceListItem
                  key={inv.id}
                  inv={inv}
                  total={total}
                  balance={balance}
                  status={status}
                  sending={markSent.isPending && markSent.variables === inv.id}
                  onMarkSent={() =>
                    markSent.mutate(inv.id, {
                      onSuccess: () => toast.success(`${inv.invoice_number} marked as sent`),
                      onError: (err) => toast.error(err.message),
                    })
                  }
                  onRecordPayment={() => setPaymentTarget({ id: inv.id, number: inv.invoice_number, balance })}
                />
              ))}
            </ul>
          )}
        </section>

        <aside className="grid content-start gap-6">
          <section aria-labelledby="followups-heading" className="rounded-2xl border bg-card/70 p-5 backdrop-blur-sm">
            <h2 id="followups-heading" className="flex items-center gap-2 font-semibold">
              <BellRing className="h-4 w-4 text-primary" /> Upcoming follow-ups
            </h2>
            {reminders.isLoading ? (
              <Skeleton className="mt-4 h-16" />
            ) : reminders.error ? (
              <p className="mt-3 text-sm text-muted-foreground">Couldn&apos;t load follow-ups.</p>
            ) : (reminders.data ?? []).length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No reminders scheduled right now.</p>
            ) : (
              <ul className="mt-4 grid gap-3 text-sm">
                {(reminders.data ?? []).map((r) => (
                  <li key={r.id} className="flex justify-between gap-3">
                    <span>
                      <span className="font-medium">{r.invoices?.invoice_number}</span>
                      <span className="block text-xs text-muted-foreground">{reminderStageLabels[r.stage_key] ?? r.stage_key}</span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatDate(r.scheduled_for)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="clients-heading" className="rounded-2xl border bg-card/70 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <h2 id="clients-heading" className="font-semibold">
                Clients <span className="text-sm font-normal text-muted-foreground">{customers.data.length}</span>
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setCustomerOpen(true)}>
                <UserPlus /> Add
              </Button>
            </div>
            {customers.data.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Your clients will appear here.</p>
            ) : (
              <ul className="mt-3 grid gap-2 text-sm">
                {customers.data.slice(0, 6).map((c) => (
                  <li key={c.id} className="truncate">
                    {c.name}
                    {c.company ? <span className="text-muted-foreground"> · {c.company}</span> : null}
                  </li>
                ))}
                {customers.data.length > 6 ? <li className="text-xs text-muted-foreground">+ {customers.data.length - 6} more</li> : null}
              </ul>
            )}
            {p.plan === "free" ? <p className="mt-4 text-xs text-muted-foreground">Free plan: up to 5 clients.</p> : null}
          </section>
        </aside>
      </div>

      <CustomerDialog
        uid={uid}
        open={customerOpen}
        onOpenChange={(o) => {
          setCustomerOpen(o);
          if (!o) setContinueToInvoice(false);
        }}
        onCreated={(id) => {
          setNewCustomerId(id);
          if (continueToInvoice) setInvoiceOpen(true);
        }}
      />
      <InvoiceDialog
        uid={uid}
        profile={p}
        customers={customers.data}
        open={invoiceOpen}
        onOpenChange={(o) => {
          setInvoiceOpen(o);
          if (!o) setNewCustomerId(null);
        }}
        onAddCustomer={() => setCustomerOpen(true)}
        preselectCustomerId={newCustomerId}
      />
      <PaymentDialog uid={uid} target={paymentTarget} onClose={() => setPaymentTarget(null)} />
      <BusinessDialog uid={uid} profile={p} open={businessOpen} onOpenChange={setBusinessOpen} />
    </Shell>
  );
}

function Shell({ children, businessName, onSignOut, onBusiness }: { children: ReactNode; businessName: string | null; onSignOut: () => void; onBusiness?: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <BrandMark />
          <div className="flex items-center gap-1">
            {onBusiness ? (
              <Button variant="ghost" size="sm" onClick={onBusiness} className="max-w-[12rem]">
                <Building2 /> <span className="hidden truncate sm:inline">{businessName ?? "Business"}</span>
                <span className="sr-only sm:hidden">Business details</span>
              </Button>
            ) : null}
            <Button variant="ghost" size="sm" onClick={onSignOut}>
              <LogOut /> <span className="hidden sm:inline">Sign out</span>
              <span className="sr-only sm:hidden">Sign out</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">{children}</main>
    </div>
  );
}

function Stat({ label, value, tone, hint }: { label: string; value: number; tone?: string; hint?: string }) {
  return (
    <div className="rounded-2xl border bg-card/70 p-4 backdrop-blur-sm sm:p-5">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className={cn("mt-2 font-display text-3xl tabular-nums sm:text-4xl", tone ?? "text-foreground")} title={formatMoney(value)}>
        {formatMoneyCompact(value)}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function dueLabel(status: string, dueDate: string) {
  if (status === "paid") return `Due ${formatDate(dueDate)}`;
  const late = daysBetween(dueDate);
  if (late > 0) return `${late} ${late === 1 ? "day" : "days"} overdue`;
  if (late === 0) return "Due today";
  return `Due in ${-late} ${late === -1 ? "day" : "days"}`;
}

function InvoiceListItem({
  inv,
  total,
  balance,
  status,
  sending,
  onMarkSent,
  onRecordPayment,
}: {
  inv: InvoiceRow;
  total: number;
  balance: number;
  status: string;
  sending: boolean;
  onMarkSent: () => void;
  onRecordPayment: () => void;
}) {
  const meta = statusMeta[status] ?? { label: status, className: "bg-muted text-muted-foreground" };
  return (
    <li className="grid gap-3 p-4 transition-colors hover:bg-secondary/30 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] sm:items-center sm:p-5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{inv.invoice_number}</span>
          <span className={cn("rounded-full px-2 py-0.5 text-[0.7rem] font-medium", meta.className)}>{meta.label}</span>
        </div>
        <p className="mt-1 truncate text-sm text-muted-foreground">
          {inv.customers?.name ?? "Unknown client"}
          {inv.customers?.company ? ` · ${inv.customers.company}` : ""}
        </p>
      </div>
      <div className="text-sm">
        <p className="tabular-nums">{formatMoney(total)}</p>
        <p className={cn("text-xs", status === "overdue" ? "text-destructive" : "text-muted-foreground")}>
          {status === "draft" ? `Issued ${formatDate(inv.issue_date)}` : dueLabel(status, inv.due_date)}
          {balance > 0 && balance < total && status !== "draft" ? ` · ${formatMoney(balance)} left` : ""}
        </p>
      </div>
      <div className="flex gap-2 sm:justify-end">
        {status === "draft" ? (
          <Button size="sm" variant="secondary" onClick={onMarkSent} disabled={sending}>
            <Send /> {sending ? "Updating…" : "Mark as sent"}
          </Button>
        ) : status !== "paid" && balance > 0 ? (
          <Button size="sm" variant="secondary" onClick={onRecordPayment}>
            <CircleDollarSign /> Record payment
          </Button>
        ) : (
          <span className="flex items-center gap-1 text-xs text-success">
            <Check className="h-3.5 w-3.5" /> Settled
          </span>
        )}
      </div>
    </li>
  );
}

function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background" aria-busy="true" aria-label="Loading your dashboard">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-16 h-12 w-72" />
        <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="mt-8 h-72 rounded-2xl" />
      </div>
    </div>
  );
}
