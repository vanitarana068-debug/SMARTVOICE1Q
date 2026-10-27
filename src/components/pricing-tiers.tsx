import { Link } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const tiers = [
  {
    name: "Free",
    price: "₹0",
    tagline: "For getting started",
    features: ["Up to 5 customers", "Unlimited drafts", "PDF download", "Payment tracking"],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: "₹499",
    tagline: "For busy freelancers",
    features: ["Unlimited customers", "Automated reminders", "Recurring invoices", "Your logo and branding"],
    cta: "Upgrade to Pro",
  },
  {
    name: "Agency",
    price: "₹2,499",
    tagline: "For small agencies",
    features: ["Everything in Pro", "Multiple team members", "Receivables dashboard", "Priority support"],
    cta: "Choose Agency",
  },
] as const;

export type TierName = (typeof tiers)[number]["name"];

export function PricingTiers({ compact = false, recommended = "Pro", badge = "Recommended" }: { compact?: boolean; recommended?: TierName; badge?: string }) {
  return (
    <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3 md:items-stretch">
      {tiers.map((tier) => {
        const highlighted = tier.name === recommended;
        return (
          <div
            key={tier.name}
            className={cn(
              "relative flex flex-col rounded-3xl border bg-card/70 p-6 shadow-card backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lifted motion-reduce:hover:translate-y-0 sm:p-7",
              highlighted && "border-primary/70 bg-card shadow-lifted ring-1 ring-primary/60 md:-translate-y-2 md:hover:-translate-y-3",
            )}
          >
            {highlighted ? (
              <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[0.7rem] font-semibold text-primary-foreground">
                <Sparkles className="h-3 w-3" /> {badge}
              </span>
            ) : null}
            <h3 className="text-lg font-semibold text-foreground">{tier.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{tier.tagline}</p>
            <p className="mt-5">
              <span className="font-display text-5xl tracking-tight text-foreground">{tier.price}</span>
              <span className="ml-1 text-sm text-muted-foreground">/month</span>
            </p>
            <ul className={cn("mt-6 flex-1 space-y-2.5 text-sm", compact && "space-y-2")}>
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-7" size="lg" variant={highlighted ? "default" : "outline"}>
              <Link to="/signup">{tier.cta}</Link>
            </Button>
          </div>
        );
      })}
    </div>
  );
}
