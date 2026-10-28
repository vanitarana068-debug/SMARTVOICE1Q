import { Link } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Proposed plans. Paid checkout isn't connected yet: every plan's button leads to sign-up. */
export const tiers = [
  {
    name: "Free",
    plan: "free",
    price: "₹0",
    tagline: "For getting started",
    features: ["Basic invoice creation", "Limited client records (up to 5)", "Manual payment tracking"],
    cta: "Start free",
  },
  {
    name: "Starter",
    plan: "starter",
    price: "₹499",
    tagline: "For busy freelancers",
    features: ["More invoices and clients", "Payment tracking", "Reminder scheduling"],
    cta: "Choose Starter",
  },
  {
    name: "Growth",
    plan: "growth",
    price: "₹2,499",
    tagline: "For growing agencies",
    features: ["Advanced workflows", "More automation", "Reporting and team features"],
    cta: "Choose Growth",
  },
] as const;

export type TierName = (typeof tiers)[number]["name"];
export type PlanSlug = (typeof tiers)[number]["plan"];

export function PricingTiers({ recommended = "Starter", badge = "Recommended" }: { recommended?: TierName; badge?: string }) {
  return (
    <div>
      <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3 md:items-stretch">
        {tiers.map((tier) => {
          const highlighted = tier.name === recommended;
          return (
            <div
              key={tier.name}
              className={cn(
                "glass relative flex flex-col rounded-3xl p-6 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 motion-reduce:hover:translate-y-0 sm:p-8",
                highlighted && "border-[#3b82f6]/60 bg-[linear-gradient(180deg,rgb(59_130_246/0.14),rgb(16_26_44/0.75))] shadow-[0_24px_60px_-28px_rgb(59_130_246/0.6)]",
              )}
            >
              {highlighted ? (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  <Sparkles className="h-3 w-3" /> {badge}
                </span>
              ) : null}
              <h3 className="text-lg font-semibold text-foreground">{tier.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{tier.tagline}</p>
              <p className="mt-6">
                <span className="text-5xl font-bold tracking-tight text-foreground">{tier.price}</span>
                <span className="ml-1 text-sm text-muted-foreground">/month</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8" size="lg" variant={highlighted ? "default" : "outline"}>
                <Link to="/signup" search={{ plan: tier.plan }}>
                  {tier.cta}
                </Link>
              </Button>
            </div>
          );
        })}
      </div>
      <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">
        Proposed pricing. Paid plans aren&apos;t available to buy yet, so every account starts on Free, and you&apos;ll choose a paid plan once checkout opens.
      </p>
    </div>
  );
}
