import { BellRing, FileDown, FileText, LayoutDashboard, Users, Wallet } from "lucide-react";
import { Reveal } from "@/components/site/reveal";

const FEATURES = [
  {
    icon: FileText,
    title: "GST-Ready Invoices",
    body: "Add line items and a GST rate; tax and totals are calculated for you and split as CGST + SGST or IGST.",
  },
  {
    icon: Users,
    title: "Client Management",
    body: "Keep each client's company, email, phone, GSTIN and billing address in one place.",
  },
  {
    icon: Wallet,
    title: "Payment Tracking",
    body: "Record full or partial payments by UPI, bank transfer, card, cash or cheque. Balances update themselves.",
  },
  {
    icon: BellRing,
    title: "Automated Payment Reminders",
    body: "Reminder stages before and after the due date that stop once an invoice is paid. Email delivery needs an email service connected.",
  },
  {
    icon: LayoutDashboard,
    title: "Outstanding Payment Dashboard",
    body: "See invoiced, collected, outstanding and overdue amounts at a glance, and filter to what needs attention.",
  },
  {
    icon: FileDown,
    title: "Invoice PDF Downloads",
    body: "Download a clean PDF of any invoice to send, print or keep for your records.",
  },
];

export function FeatureGrid() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
      {FEATURES.map((f, i) => (
        <li key={f.title}>
          <Reveal delay={(i % 3) * 80} className="h-full">
            <article className="group glass h-full rounded-2xl p-6 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-[#3b82f6]/50 hover:shadow-[0_18px_44px_-20px_rgb(59_130_246/0.55)] motion-reduce:hover:translate-y-0 sm:p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#3b82f6]/30 bg-[#3b82f6]/12 text-[#60a5fa] transition-colors duration-300 group-hover:text-[#22d3ee]">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </article>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
