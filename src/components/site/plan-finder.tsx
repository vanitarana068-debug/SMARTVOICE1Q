import { useId, type Dispatch, type SetStateAction } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { TierName } from "@/components/pricing-tiers";

export type PlanAnswers = { customers: number; reminders: boolean; recurring: boolean; team: boolean };

export function recommendPlan(a: PlanAnswers): { plan: TierName; reason: string } {
  if (a.team) return { plan: "Growth", reason: "Team features are planned for Growth." };
  if (a.customers > 5) return { plan: "Starter", reason: `The free plan covers 5 clients and you bill ${a.customers}.` };
  if (a.reminders || a.recurring) return { plan: "Starter", reason: "Reminder scheduling is part of Starter." };
  return { plan: "Free", reason: "Up to 5 customers with manual follow-ups fits the free plan." };
}

export function PlanFinder({ answers, onChange }: { answers: PlanAnswers; onChange: Dispatch<SetStateAction<PlanAnswers>> }) {
  const id = useId();
  const { plan, reason } = recommendPlan(answers);
  const toggles: { key: "reminders" | "recurring" | "team"; label: string }[] = [
    { key: "reminders", label: "I want reminders sent automatically" },
    { key: "recurring", label: "I bill monthly retainers" },
    { key: "team", label: "Teammates need access too" },
  ];

  return (
    <div className="grid gap-8 rounded-3xl border bg-card/70 p-6 shadow-card backdrop-blur-sm sm:p-8 md:grid-cols-[1.4fr_1fr] md:items-center">
      <div className="grid gap-6">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor={`${id}-customers`} className="text-sm font-medium text-foreground">
              How many clients do you bill?
            </label>
            <output htmlFor={`${id}-customers`} className="font-display text-2xl tabular-nums text-foreground">
              {answers.customers}
              {answers.customers >= 50 ? "+" : ""}
            </output>
          </div>
          <input
            id={`${id}-customers`}
            type="range"
            min={1}
            max={50}
            value={answers.customers}
            onChange={(e) => {
              const customers = Number(e.target.value);
              onChange((a) => ({ ...a, customers }));
            }}
            className="mt-3 w-full cursor-pointer accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        {toggles.map((t) => (
          <div key={t.key} className="flex items-center justify-between gap-4">
            <Label htmlFor={`${id}-${t.key}`} className="font-normal text-foreground">
              {t.label}
            </Label>
            <Switch id={`${id}-${t.key}`} checked={answers[t.key]} onCheckedChange={(v) => onChange((a) => ({ ...a, [t.key]: v }))} />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-primary/40 bg-primary/10 p-6" aria-live="polite">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Best fit for you</p>
        <p key={plan} className="mt-2 animate-rise font-display text-5xl text-foreground">
          {plan}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{reason}</p>
        <p className="mt-3 text-xs text-muted-foreground">Highlighted in the plans below.</p>
      </div>
    </div>
  );
}
