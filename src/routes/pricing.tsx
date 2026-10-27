import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PricingTiers } from "@/components/pricing-tiers";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { SectionHeading } from "@/components/site/section-heading";
import { PlanFinder, recommendPlan, type PlanAnswers } from "@/components/site/plan-finder";
import { Faq } from "@/components/site/faq";
import { Reveal } from "@/components/site/reveal";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — SmartInvoice" },
      { name: "description", content: "Simple pricing in rupees. Start free, then upgrade from ₹499/month when your billing outgrows it." },
      { property: "og:title", content: "Pricing — SmartInvoice" },
      { property: "og:description", content: "Plans from ₹0 to ₹2,499/month for freelancers, consultants and small agencies." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const [answers, setAnswers] = useState<PlanAnswers>({ customers: 8, reminders: true, recurring: false, team: false });
  const { plan } = recommendPlan(answers);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="pb-12 pt-14 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="animate-rise text-xs font-semibold uppercase tracking-[0.18em] text-primary">Pricing</p>
            <h1 className="animate-rise mt-3 font-display text-5xl leading-[1] tracking-tight text-foreground sm:text-7xl" style={{ animationDelay: "80ms" }}>
              Simple pricing <em>in rupees.</em>
            </h1>
            <p className="animate-rise mx-auto mt-5 max-w-xl text-lg text-muted-foreground" style={{ animationDelay: "160ms" }}>
              Start free with no card required. Upgrade when your billing outgrows it.
            </p>
          </div>
        </section>

        <section aria-labelledby="finder-heading" className="pb-16">
          <h2 id="finder-heading" className="sr-only">
            Find your plan
          </h2>
          <div className="animate-rise" style={{ animationDelay: "240ms" }}>
            <PlanFinder answers={answers} onChange={setAnswers} />
          </div>
        </section>

        <section aria-label="Plans" className="pb-24 pt-6">
          <PricingTiers recommended={plan} badge="Fits your answers" />
        </section>

        <section className="grid gap-10 pb-24 lg:grid-cols-[0.8fr_1.4fr] lg:gap-16">
          <SectionHeading eyebrow="FAQ" title="Before you choose." />
          <Reveal delay={120}>
            <Faq />
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
