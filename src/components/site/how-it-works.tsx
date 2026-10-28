import type { CSSProperties } from "react";
import { useInView } from "@/components/site/reveal";

const STEPS = [
  { title: "Add your client and invoice details", body: "Save your business details once, add the client, then list the work with quantities, prices and the GST rate." },
  { title: "Generate and send a professional invoice", body: "SmartInvoice calculates the GST and totals. Preview it, download the PDF and send it to your client." },
  { title: "Track payments and follow up", body: "Record payments as they arrive. Overdue invoices stand out on your dashboard so you know who to follow up with." },
];

export function HowItWorks() {
  const { ref, inView } = useInView<HTMLDivElement>("0px 0px -20% 0px");
  return (
    <div ref={ref} className="relative">
      {/* Connector line that draws itself across the three steps on desktop. */}
      <div aria-hidden className="absolute left-[1.375rem] right-[1.375rem] top-[1.375rem] hidden h-px bg-border md:block" />
      <div
        aria-hidden
        className="absolute left-[1.375rem] right-[1.375rem] top-[1.375rem] hidden h-px origin-left bg-primary transition-transform duration-[1600ms] ease-out motion-reduce:transition-none md:block"
        style={{ transform: inView ? "scaleX(1)" : "scaleX(0)" }}
      />
      <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
        {STEPS.map((step, i) => (
          <li key={step.title} className="reveal" data-inview={inView} style={{ "--delay": `${i * 250}ms` } as CSSProperties}>
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/60 bg-background font-display text-2xl text-foreground">
              {i + 1}
            </span>
            <h3 className="mt-5 text-lg font-semibold text-foreground">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
