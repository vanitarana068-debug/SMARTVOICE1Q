import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  {
    q: "What is SmartInvoice?",
    a: "An invoicing app for freelancers, consultants and small agencies. Create GST-ready invoices, keep your client records, record payments and see what's outstanding, all from one dashboard.",
  },
  {
    q: "Can I create GST invoices?",
    a: "Yes. Each invoice line carries a GST rate, and SmartInvoice calculates the tax and the totals for you. Which rate applies, and whether it's CGST + SGST or IGST, depends on what you sell and where, so confirm it for your business.",
  },
  {
    q: "Can I track overdue payments?",
    a: "Yes. Any invoice past its due date with money still owed is marked Overdue on your dashboard, next to your outstanding and collected totals. Record full or partial payments as they come in and the balance updates.",
  },
  {
    q: "How do payment reminders work?",
    a: "Each account has reminder stages: before the due date, on it, and at 3, 7 and 14 days overdue, each with a polite message. Recording a full payment cancels the remaining reminders for that invoice. Delivering reminders by email requires an email service to be connected to SmartInvoice.",
  },
  {
    q: "Can I download invoices as PDFs?",
    a: "Yes. Download any invoice as a PDF from your dashboard. You can also try it now in the live demo on this page, no account needed.",
  },
  {
    q: "Can I cancel my subscription?",
    a: "Paid plans aren't on sale yet, so there's nothing to cancel: every account currently uses the Free plan at ₹0. Cancellation terms will be published before paid plans launch.",
  },
];

/** Single-open accordion; Radix handles keyboard navigation (Enter, Space, arrow keys). */
export function Faq() {
  return (
    <Accordion type="single" collapsible defaultValue="item-0" className="glass divide-y divide-border rounded-3xl px-5 sm:px-8">
      {FAQS.map((item, i) => (
        <AccordionItem key={item.q} value={`item-${i}`} className="border-b-0">
          <AccordionTrigger className="rounded-md py-5 text-base font-medium text-foreground hover:no-underline hover:text-[var(--primary-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="pb-5 pr-8 leading-relaxed text-muted-foreground">{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
