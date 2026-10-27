import { useEffect, type CSSProperties } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingTiers } from "@/components/pricing-tiers";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { InvoicePlayground } from "@/components/site/invoice-playground";
import { ChasingCalculator } from "@/components/site/chasing-calculator";
import { ReminderTimeline } from "@/components/site/reminder-timeline";
import { FeatureBento } from "@/components/site/feature-bento";
import { HowItWorks } from "@/components/site/how-it-works";
import { Faq } from "@/components/site/faq";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { BeforeAfter } from "@/components/site/before-after";
import { DashboardPreview } from "@/components/site/dashboard-preview";
import { TrustStrip } from "@/components/site/trust-strip";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SmartInvoice — Create invoices faster, get paid on time" },
      { name: "description", content: "Professional invoices, payment tracking and automated reminders for freelancers, consultants and small agencies. Create invoices faster and stop chasing clients manually." },
      { property: "og:title", content: "SmartInvoice — Create invoices faster, get paid on time" },
      { property: "og:description", content: "Professional invoices, payment tracking and automated reminders — from ₹0 to ₹2,499/month." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

const REMINDER_POINTS = ["Never two reminders at the same stage", "Pauses automatically when an invoice is paid", "Full delivery history for every invoice", "Your own message templates"];

function LandingPage() {
  // Signed-in users treat the site's front page as their workspace.
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) void navigate({ to: "/dashboard", replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        {/* Hero: the promise, then the product itself, editable in place */}
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 sm:pt-20">
          <div className="mx-auto max-w-4xl text-center">
            <p className="animate-rise mx-auto w-fit rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success" style={delay(0)}>
              For freelancers, consultants &amp; small agencies
            </p>
            <h1 className="animate-rise mt-6 font-display text-5xl leading-[0.98] tracking-tight text-foreground sm:text-7xl lg:text-[5.5rem]" style={delay(80)}>
              Get paid on time,
              <br />
              <em className="bg-gradient-to-r from-[#23476a] via-[#2a68a8] to-[#4a95db] bg-clip-text pr-2 text-transparent">without the chasing.</em>
            </h1>
            <p className="animate-rise mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground" style={delay(180)}>
              Create a GST-ready invoice in minutes. SmartInvoice tracks every payment and sends polite follow-ups on your schedule, and stops the moment your client pays.
            </p>
            <div className="animate-rise mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row" style={delay(260)}>
              <Button asChild size="lg" className="h-12 min-w-48 px-8 text-base">
                <Link to="/signup">
                  Start free <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="h-12 min-w-48 text-base">
                <a href="#demo">
                  Try the live invoice <ArrowDown />
                </a>
              </Button>
            </div>
            <p className="animate-rise mt-4 text-xs text-muted-foreground" style={delay(320)}>
              Free plan · no card required · upgrade from ₹499/month
            </p>
          </div>

          <div id="demo" className="animate-rise mt-16 scroll-mt-24 sm:mt-20" style={delay(420)}>
            <InvoicePlayground />
          </div>

          <div className="mt-16 sm:mt-20">
            <TrustStrip />
          </div>
        </section>

        {/* Problem: the visitor quantifies their own chasing time */}
        <section id="problem" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28">
          <SectionHeading eyebrow="The problem" title={<>Chasing payments is unpaid work.</>}>
            Every late invoice means another reminder to write, another call to make, another bank check. Put in your own numbers.
          </SectionHeading>
          <Reveal className="mt-12" delay={120}>
            <ChasingCalculator />
          </Reveal>
        </section>

        {/* Differentiation: the manual routine vs SmartInvoice, side by side */}
        <section id="compare" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28">
          <SectionHeading eyebrow="Why it's different" title={<>Same work, <em>none of the admin.</em></>}>
            Flip between how invoicing usually goes and how it goes here.
          </SectionHeading>
          <Reveal className="mt-12" delay={120}>
            <BeforeAfter />
          </Reveal>
        </section>

        {/* Solution: the follow-up series, stage by stage */}
        <section id="reminders" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.4fr] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <SectionHeading eyebrow="Automated follow-ups" title={<>The follow-up you never have to <em>write</em>.</>}>
                Pick when reminders go out. Each one is polite, includes the amount and due date, and the series stops when payment lands.
              </SectionHeading>
              <Reveal delay={120}>
                <ul className="mt-8 grid gap-3 text-sm">
                  {REMINDER_POINTS.map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span className="text-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
            <Reveal delay={160} className="rounded-3xl border bg-card/50 p-5 backdrop-blur-sm sm:p-8">
              <p className="mb-6 text-sm text-muted-foreground">Select a stage to read the email your client receives.</p>
              <ReminderTimeline />
            </Reveal>
          </div>
        </section>

        {/* Features in varied compositions */}
        <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28">
          <SectionHeading eyebrow="Everything in one place" title="Bill, track and collect.">
            No payroll. No ERP. Just focused tools for invoicing, payments and follow-ups. Each one below is interactive.
          </SectionHeading>
          <div className="mt-12">
            <FeatureBento />
          </div>
        </section>

        <section id="preview" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.6fr] lg:items-center lg:gap-14">
            <SectionHeading eyebrow="Your dashboard" title={<>Everything owed to you, <em>on one screen.</em></>}>
              This is the dashboard you get after signing up, shown with sample data. Filter the list, mark a draft as sent, or record a payment and watch the totals move.
            </SectionHeading>
            <Reveal delay={120}>
              <DashboardPreview />
            </Reveal>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28">
          <SectionHeading eyebrow="How it works" title="Three steps, then it runs itself." />
          <div className="mt-14">
            <HowItWorks />
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28">
          <SectionHeading align="center" eyebrow="Pricing" title="Simple pricing in rupees.">
            Start free. Upgrade when your billing outgrows it.
          </SectionHeading>
          <Reveal className="mt-14" delay={120}>
            <PricingTiers compact />
          </Reveal>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Not sure which plan fits?{" "}
            <Link to="/pricing" className="font-medium text-primary underline-offset-4 hover:underline">
              Answer four quick questions
            </Link>
          </p>
        </section>

        <section id="faq" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.4fr] lg:gap-16">
            <SectionHeading eyebrow="FAQ" title="Questions, answered.">
              Can&apos;t find what you need?{" "}
              <Link to="/signup" className="text-primary underline-offset-4 hover:underline">
                Start free
              </Link>{" "}
              and look around. There&apos;s no card to enter.
            </SectionHeading>
            <Reveal delay={120}>
              <Faq />
            </Reveal>
          </div>
        </section>

        {/* Final CTA */}
        <section id="get-started" className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6">
          <Reveal className="relative overflow-hidden rounded-[2rem] border border-primary/40 bg-gradient-to-br from-primary/30 via-card to-card px-6 py-16 text-center shadow-lifted sm:px-12 sm:py-20">
            <h2 className="mx-auto max-w-3xl font-display text-4xl leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              Send the invoice. <em>Let the follow-ups handle themselves.</em>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-muted-foreground">Set up your business in a few minutes and send your first invoice today.</p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 min-w-48 px-8 text-base">
                <Link to="/signup">
                  Create your free account <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 min-w-48 text-base">
                <Link to="/pricing">Compare plans</Link>
              </Button>
            </div>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
