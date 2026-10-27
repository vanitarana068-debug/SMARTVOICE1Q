import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Is the free plan actually free?",
    a: "Yes. The free plan costs ₹0 and needs no card. It includes up to five customers, unlimited drafts, PDF download and payment tracking. Upgrade only when you outgrow it.",
  },
  {
    q: "When do the automatic reminders go out?",
    a: "You choose the stages: before the due date, on it, and at 3, 7 and 14 days overdue. A reminder is never sent twice for the same stage.",
  },
  {
    q: "Will my client keep getting reminders after they pay?",
    a: "No. As soon as you record the payment and the invoice is marked paid, the remaining reminders in the series are cancelled.",
  },
  {
    q: "What if a client pays only part of the invoice?",
    a: "Record the partial payment. SmartInvoice shows the remaining balance and keeps the invoice open until it's fully paid.",
  },
  {
    q: "Can I change what the reminders say?",
    a: "Yes. Every reminder uses a message template you can edit, so follow-ups sound like you.",
  },
  {
    q: "Who can see my invoices and clients?",
    a: "Only your account. Row-level security scopes every business record to its owner.",
  },
];

export function Faq() {
  return (
    <Accordion type="single" collapsible defaultValue="item-0" className="divide-y rounded-3xl border bg-card/60 px-5 backdrop-blur-sm sm:px-8">
      {FAQS.map((item, i) => (
        <AccordionItem key={item.q} value={`item-${i}`} className="border-b-0">
          <AccordionTrigger className="py-5 text-base font-medium text-foreground hover:no-underline hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="pb-5 pr-8 leading-relaxed text-muted-foreground">{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
