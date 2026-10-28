import { useEffect, useState, type CSSProperties } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingTiers } from "@/components/pricing-tiers";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { HeroVisual } from "@/components/site/hero-visual";
import { InvoicePreviewDialog } from "@/components/site/invoice-preview-dialog";
import { FeatureGrid } from "@/components/site/feature-grid";
import { HowItWorks } from "@/components/site/how-it-works";
import { InvoiceDemo } from "@/components/site/invoice-demo";
import { Faq } from "@/components/site/faq";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal, prefersReducedMotion } from "@/components/site/reveal";
import { useAuth } from "@/hooks/use-auth";
import { SAMPLE_INVOICE } from "@/lib/invoice-doc";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SmartInvoice — Get paid on time, without the chasing" },
      {
        name: "description",
        content:
          "Create professional GST-ready invoices, track payments, and automate polite overdue reminders, all from one simple dashboard. Built for freelancers, consultants and growing agencies.",
      },
      { property: "og:title", content: "SmartInvoice — Get paid on time, without the chasing" },
      { property: "og:description", content: "GST-ready invoices, payment tracking and polite reminders for freelancers and agencies. Try the live demo, no sign-up needed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

/** One container and one vertical rhythm for every section. */
const CONTAINER = "mx-auto w-full max-w-6xl px-5 sm:px-8";
const SECTION = "scroll-mt-24 py-24 sm:py-28";
const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

/** Scroll to the live demo; optionally put the cursor in its first field. */
function goToDemo(focus = false) {
  const el = document.getElementById("demo");
  if (!el) return;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", "#demo");
  if (focus) window.setTimeout(() => el.querySelector<HTMLInputElement>("form input")?.focus({ preventScroll: true }), 600);
}

function LandingPage() {
  // Signed-in users treat the site's front page as their workspace.
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) void navigate({ to: "/dashboard", replace: true });
  }, [user, navigate]);

  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className={cn(CONTAINER, "grid items-center gap-14 pb-20 pt-10 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12 lg:pb-28 lg:pt-20")}>
          <div className="max-w-xl">
            <p className="animate-rise inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-3 py-1 text-xs font-medium text-muted-foreground" style={delay(0)}>
              <span className="h-1.5 w-1.5 rounded-full bg-[#22d3ee]" /> GST-ready invoicing for India
            </p>
            <h1 className="animate-rise mt-6 font-display text-[2.75rem] leading-[1.05] text-foreground sm:text-6xl lg:text-[4rem]" style={delay(80)}>
              Get Paid On Time, <em>Without the Chasing.</em>
            </h1>
            <p className="animate-rise mt-6 text-lg leading-relaxed text-muted-foreground" style={delay(160)}>
              Create professional GST-ready invoices, track payments, and automate polite overdue reminders — all from one simple dashboard.
            </p>
            <div className="animate-rise mt-9 flex flex-col gap-3 sm:flex-row" style={delay(240)}>
              <Button asChild size="lg" className="h-12 px-7 text-base">
                <Link to="/signup">
                  Start Free <ArrowRight />
                </Link>
              </Button>
              <Button type="button" size="lg" variant="outline" className="h-12 px-7 text-base" onClick={() => goToDemo(true)}>
                <PlayCircle /> Try Live Demo
              </Button>
            </div>
            <p className="animate-rise mt-6 flex items-center gap-2 text-sm text-muted-foreground" style={delay(320)}>
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#34d399]" />
              Built for freelancers, consultants and growing agencies.
            </p>
          </div>

          <HeroVisual onViewInvoice={() => setPreviewOpen(true)} onCreateInvoice={() => goToDemo(true)} />
        </section>

        {/* Product features */}
        <section id="product" className={cn(CONTAINER, SECTION)}>
          <SectionHeading eyebrow="Product" title={<>Everything you need to <em>bill and get paid.</em></>}>
            Focused tools for invoicing, payments and follow-ups. No payroll, no ERP.
          </SectionHeading>
          <div className="mt-12">
            <FeatureGrid />
          </div>
        </section>

        {/* How it works */}
        <section id="how" className={cn(CONTAINER, SECTION)}>
          <SectionHeading eyebrow="How it works" title={<>From finished work to <em>money in.</em></>} />
          <div className="mt-14">
            <HowItWorks />
          </div>
        </section>

        {/* Interactive demo */}
        <section id="demo" className={cn(CONTAINER, SECTION)}>
          <SectionHeading eyebrow="Live demo" title={<>Create an invoice. <em>No sign-up needed.</em></>}>
            Fill in the details and watch the invoice build itself, with GST and totals calculated from what you enter. Download it as a PDF when you&apos;re done.
          </SectionHeading>
          <div className="mt-12">
            <InvoiceDemo />
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className={cn(CONTAINER, SECTION)}>
          <SectionHeading align="center" eyebrow="Pricing" title={<>Simple pricing <em>in rupees.</em></>}>
            Start free. Move up when your billing grows.
          </SectionHeading>
          <Reveal className="mt-14" delay={100}>
            <PricingTiers />
          </Reveal>
          <p className="mt-4 text-center text-sm">
            <Link to="/pricing" className="font-medium text-[var(--primary-text)] underline-offset-4 hover:underline">
              Not sure which plan fits? Answer four quick questions →
            </Link>
          </p>
        </section>

        {/* FAQ */}
        <section id="faq" className={cn(CONTAINER, SECTION)}>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] lg:gap-16">
            <SectionHeading eyebrow="FAQ" title="Questions, answered.">
              Still unsure? Try the live demo above. There&apos;s nothing to sign up for.
            </SectionHeading>
            <Reveal delay={100}>
              <Faq />
            </Reveal>
          </div>
        </section>

        {/* Final call to action */}
        <section id="get-started" className={cn(CONTAINER, "pb-28 pt-8")}>
          <Reveal className="relative overflow-hidden rounded-[2rem] border border-border bg-[#0b1220] px-6 py-16 text-center sm:px-12 sm:py-20">
            <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[46rem] max-w-[140%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(59_130_246/0.45),rgb(34_211_238/0.15),transparent)] blur-2xl" />
            <div className="relative">
              <h2 className="mx-auto max-w-3xl font-display text-4xl leading-[1.08] text-foreground sm:text-5xl">
                Spend Less Time <em>Chasing Payments.</em>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">Create your first invoice and build a smoother payment workflow.</p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 px-7 text-base">
                  <Link to="/signup">
                    Start Free <ArrowRight />
                  </Link>
                </Button>
                <Button type="button" size="lg" variant="outline" className="h-12 px-7 text-base" onClick={() => goToDemo(true)}>
                  <PlayCircle /> Explore Live Demo
                </Button>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <SiteFooter />

      <InvoicePreviewDialog doc={SAMPLE_INVOICE} badge="Sent" open={previewOpen} onOpenChange={setPreviewOpen} onCreateOwn={() => goToDemo(true)} />
    </div>
  );
}
