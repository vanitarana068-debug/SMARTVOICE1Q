import { IndianRupee, Landmark, LockKeyhole, Sparkles } from "lucide-react";
import { Reveal } from "@/components/site/reveal";

// Only facts the product actually does today.
const FACTS = [
  { icon: IndianRupee, title: "Built for India", body: "Rupee pricing, GSTIN on invoices, GST at 18% or your own rate" },
  { icon: Landmark, title: "Every way you get paid", body: "Track UPI, bank transfer, card, cash and cheque payments" },
  { icon: LockKeyhole, title: "Private by design", body: "Row-level security scopes every record to your account" },
  { icon: Sparkles, title: "Free to start", body: "No card required. Up to 5 clients on the free plan" },
];

export function TrustStrip() {
  return (
    <Reveal>
      <ul className="grid gap-px overflow-hidden rounded-3xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {FACTS.map((f) => (
          <li key={f.title} className="flex gap-3 bg-background/80 p-5 backdrop-blur-sm sm:p-6">
            <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-foreground">{f.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
