import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { BellRing, Check, Eye, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { computeInvoice, formatDocDate, formatINR, SAMPLE_INVOICE } from "@/lib/invoice-doc";
import { cn } from "@/lib/utils";

/**
 * One floating card: an outer layer for mouse parallax, a middle layer for the entrance,
 * and an inner layer for the idle float, so the three transforms never fight.
 */
function FloatCard({
  depth,
  delay,
  floatClass,
  floatDelay,
  className,
  children,
}: {
  depth: number;
  delay: number;
  floatClass: string;
  floatDelay: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("absolute transition-transform duration-500 ease-out motion-reduce:transition-none", className)}
      style={{ transform: `translate3d(calc(var(--mx, 0) * ${depth}px), calc(var(--my, 0) * ${depth}px), 0)` }}
    >
      <div className="animate-rise" style={{ "--delay": `${delay}ms` } as CSSProperties}>
        <div className={floatClass} style={{ "--float-delay": floatDelay } as CSSProperties}>
          {children}
        </div>
      </div>
    </div>
  );
}

const BARS = [38, 52, 44, 66, 58, 78, 92];

export function HeroVisual({ onViewInvoice, onCreateInvoice }: { onViewInvoice: () => void; onCreateInvoice: () => void }) {
  const stage = useRef<HTMLDivElement>(null);
  const sample = computeInvoice(SAMPLE_INVOICE);

  // Mouse parallax on desktop pointers only, never with reduced motion. Updates two CSS variables per frame at most.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const mq = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference) and (min-width: 1024px)");
    if (!mq.matches) return;
    let frame = 0;
    let nx = 0;
    let ny = 0;
    const apply = () => {
      frame = 0;
      el.style.setProperty("--mx", nx.toFixed(3));
      el.style.setProperty("--my", ny.toFixed(3));
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      nx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      ny = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      nx = 0;
      ny = 0;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <figure className="relative mx-auto w-full max-w-[600px]">
      <div ref={stage} className="relative h-[640px] sm:h-[580px]">
        {/* Soft blue light behind the dashboard */}
        <div aria-hidden className="pointer-events-none absolute inset-x-[8%] top-[14%] h-[62%] rounded-full bg-[#3b82f6]/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute right-[6%] top-[40%] h-[36%] w-[40%] rounded-full bg-[#22d3ee]/10 blur-3xl" />

        {/* Invoice card */}
        <FloatCard depth={10} delay={250} floatClass="float-invoice" floatDelay="0s" className="left-0 top-0 z-20 w-[94%] sm:top-[3%] sm:w-[62%]">
          <div className="glass rounded-2xl p-5 shadow-lifted sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Invoice</p>
                <p className="mt-1 font-semibold text-foreground">{SAMPLE_INVOICE.invoiceNumber}</p>
              </div>
              <span className="rounded-full border border-[#3b82f6]/40 bg-[#3b82f6]/15 px-2.5 py-1 text-xs font-semibold text-[#93c5fd]">Sent</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Billed to</p>
            <p className="font-medium text-foreground">{SAMPLE_INVOICE.clientName}</p>
            <p className="mt-3 text-4xl font-bold tracking-tight text-foreground tabular-nums">₹24,999</p>
            <dl className="mt-4 grid grid-cols-[1fr_auto] gap-y-1.5 border-t border-border pt-4 text-sm">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="text-right tabular-nums text-foreground">{formatINR(sample.subtotal)}</dd>
              <dt className="text-muted-foreground">GST 18% (CGST + SGST)</dt>
              <dd className="text-right tabular-nums text-foreground">{formatINR(sample.gst)}</dd>
              <dt className="text-muted-foreground">Due date</dt>
              <dd className="text-right text-foreground">{formatDocDate(SAMPLE_INVOICE.dueDate)}</dd>
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={onViewInvoice}>
                <Eye /> View Invoice
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={onCreateInvoice}>
                <PenLine /> Create Invoice
              </Button>
            </div>
          </div>
        </FloatCard>

        {/* Payment received */}
        <FloatCard
          depth={22}
          delay={650}
          floatClass="float-payment"
          floatDelay="-1.2s"
          className="right-0 top-[408px] z-30 w-[74%] sm:top-[5%] sm:w-[40%]"
        >
          <div className="glass flex items-center gap-3 rounded-2xl p-4 shadow-lifted">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#34d399]/15 text-[#34d399]">
              <Check className="h-5 w-5" strokeWidth={3} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Payment received.</p>
              <p className="text-sm tabular-nums text-[#34d399]">₹24,999</p>
            </div>
          </div>
        </FloatCard>

        {/* Revenue statistics */}
        <FloatCard
          depth={16}
          delay={500}
          floatClass="float-stats"
          floatDelay="-2s"
          className="right-0 top-[30%] z-10 hidden w-[40%] sm:block"
        >
          <div className="glass rounded-2xl p-5 shadow-lifted">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">This month</p>
            <dl className="mt-3 grid gap-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Outstanding</dt>
                <dd className="font-semibold tabular-nums text-[#fbbf24]">₹48,500</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Paid</dt>
                <dd className="font-semibold tabular-nums text-[#34d399]">₹1,26,000</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Collection rate</dt>
                <dd className="font-semibold tabular-nums text-foreground">72%</dd>
              </div>
            </dl>
            <div aria-hidden className="mt-4 flex h-16 items-end gap-1.5">
              {BARS.map((h, i) => (
                <span
                  key={i}
                  className="animate-bar flex-1 rounded-t-md bg-gradient-to-t from-[#3b82f6]/40 to-[#22d3ee]"
                  style={{ height: `${h}%`, "--delay": `${800 + i * 70}ms` } as CSSProperties}
                />
              ))}
            </div>
          </div>
        </FloatCard>

        {/* Friendly reminder */}
        <FloatCard
          depth={26}
          delay={800}
          floatClass="float-reminder"
          floatDelay="-3s"
          className="left-0 top-[504px] z-30 w-[90%] sm:left-[6%] sm:top-auto sm:bottom-[2%] sm:w-[60%]"
        >
          <div className="glass flex items-start gap-3 rounded-2xl p-4 shadow-lifted">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fbbf24]/15 text-[#fbbf24]">
              <BellRing className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Friendly payment reminder sent.</p>
              <p className="mt-0.5 text-sm text-muted-foreground">“Just a quick reminder that your invoice is due.”</p>
            </div>
          </div>
        </FloatCard>
      </div>
      <figcaption className="mt-3 text-center text-xs text-muted-foreground">Illustration with sample data</figcaption>
    </figure>
  );
}
