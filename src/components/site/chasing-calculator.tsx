import { useId, useState } from "react";
import { useAnimatedNumber } from "@/components/site/reveal";

function RangeField({
  label,
  hint,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
        <output htmlFor={id} className="font-display text-2xl tabular-nums text-foreground">
          {value}
          <span className="ml-1 font-sans text-xs text-muted-foreground">{suffix}</span>
        </output>
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-foreground [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_45%,transparent)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
        style={{ background: `linear-gradient(to right, var(--primary) ${pct}%, var(--muted) ${pct}%)` }}
      />
    </div>
  );
}

/** "Chasing tax" estimator. Every figure comes from the visitor's own inputs. */
export function ChasingCalculator() {
  const [perMonth, setPerMonth] = useState(12);
  const [latePct, setLatePct] = useState(30);
  const [minutes, setMinutes] = useState(25);

  const lateInvoices = Math.round(perMonth * 12 * (latePct / 100));
  const hours = (lateInvoices * minutes) / 60;
  const days = hours / 8;
  const shownHours = useAnimatedNumber(hours);

  return (
    <div className="grid overflow-hidden rounded-3xl border bg-card/70 shadow-lifted backdrop-blur-sm lg:grid-cols-[1.1fr_1fr]">
      <div className="grid gap-7 p-6 sm:p-10">
        <RangeField label="Invoices you send a month" hint="Across all your clients" value={perMonth} min={1} max={60} suffix="/mo" onChange={setPerMonth} />
        <RangeField label="Share that get paid late" hint="Your best guess is fine" value={latePct} min={0} max={100} step={5} suffix="%" onChange={setLatePct} />
        <RangeField label="Minutes spent chasing each one" hint="Emails, calls, WhatsApp nudges, checking your bank" value={minutes} min={5} max={120} step={5} suffix="min" onChange={setMinutes} />
      </div>
      <div className="relative flex flex-col justify-center border-t bg-gradient-to-br from-primary/25 via-transparent to-transparent p-6 sm:p-10 lg:border-l lg:border-t-0">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Your chasing tax</p>
        <p className="mt-3 font-display text-7xl leading-none tabular-nums text-foreground sm:text-8xl" aria-live="polite">
          {Math.round(shownHours)}
          <span className="ml-2 align-top font-sans text-lg text-muted-foreground">hrs / year</span>
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          That&apos;s <strong className="font-semibold text-foreground">{lateInvoices} late invoices</strong> a year and roughly{" "}
          <strong className="font-semibold text-foreground">{days < 1 ? "less than one" : Math.round(days)} working {days >= 1.5 ? "days" : "day"}</strong> spent writing
          follow-ups instead of doing billable work.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-foreground">
          SmartInvoice sends the routine reminders on schedule, so your time goes only to the conversations that actually need you.
        </p>
      </div>
    </div>
  );
}
