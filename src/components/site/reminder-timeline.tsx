import { useState } from "react";
import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
  {
    id: "before",
    short: "−3",
    when: "3 days before the due date",
    tone: "Friendly heads-up",
    subject: "Quick heads-up: INV-0007 is due on Friday",
    body: "Hi Aarav, just a friendly note that invoice INV-0007 for ₹48,000 is due this Friday. The invoice is attached for easy reference. Thanks!",
  },
  {
    id: "due",
    short: "Due",
    when: "On the due date",
    tone: "Clear and polite",
    subject: "INV-0007 is due today",
    body: "Hi Aarav, invoice INV-0007 for ₹48,000 is due today. If it's already on its way, please ignore this note. Thank you!",
  },
  {
    id: "plus3",
    short: "+3",
    when: "3 days overdue",
    tone: "Gentle nudge",
    subject: "Reminder: invoice INV-0007 is overdue",
    body: "Hi Aarav, invoice INV-0007 for ₹48,000 was due on 12 Sep and appears to be outstanding. Could you take a look when you get a moment?",
  },
  {
    id: "plus7",
    short: "+7",
    when: "7 days overdue",
    tone: "Firmer, still courteous",
    subject: "Following up on INV-0007 (₹48,000)",
    body: "Hi Aarav, following up on invoice INV-0007 for ₹48,000, now a week past due. Could you share an expected payment date?",
  },
  {
    id: "plus14",
    short: "+14",
    when: "14 days overdue",
    tone: "Final, opens a conversation",
    subject: "INV-0007 is two weeks overdue",
    body: "Hi Aarav, invoice INV-0007 for ₹48,000 is now two weeks overdue. If something is holding it up, reply to this email and we can sort it out together.",
  },
];

/** Stage scrubber: pick a point on the follow-up timeline to read that stage's email. */
export function ReminderTimeline() {
  const [index, setIndex] = useState(2);
  const stage = STAGES[index] ?? STAGES[0]!;
  const progress = (index / (STAGES.length - 1)) * 100;

  return (
    <div>
      <div role="tablist" aria-label="Reminder stages" className="relative">
        <div aria-hidden className="absolute left-0 right-0 top-[1.15rem] h-px bg-border" />
        <div aria-hidden className="absolute left-0 top-[1.15rem] h-px bg-primary transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
        <div className="relative flex justify-between">
          {STAGES.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              id={`stage-tab-${s.id}`}
              aria-selected={i === index}
              aria-controls="stage-panel"
              tabIndex={i === index ? 0 : -1}
              onClick={() => setIndex(i)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  const next = (i + (e.key === "ArrowRight" ? 1 : -1) + STAGES.length) % STAGES.length;
                  setIndex(next);
                  document.getElementById(`stage-tab-${STAGES[next]?.id}`)?.focus();
                }
              }}
              className="group flex flex-col items-center gap-2 rounded-md px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                className={cn(
                  "flex h-[2.3rem] w-[2.3rem] items-center justify-center rounded-full border text-[0.7rem] font-semibold transition-all duration-300",
                  i <= index ? "border-primary bg-primary text-primary-foreground" : "bg-background text-muted-foreground group-hover:border-primary/60 group-hover:text-foreground",
                  i === index && "scale-110 shadow-[0_0_0_6px_color-mix(in_oklab,var(--primary)_25%,transparent)]",
                )}
              >
                {s.short}
              </span>
              <span className={cn("hidden text-xs sm:block", i === index ? "text-foreground" : "text-muted-foreground")}>{s.when}</span>
            </button>
          ))}
        </div>
      </div>

      <div id="stage-panel" role="tabpanel" aria-labelledby={`stage-tab-${stage.id}`} className="mt-8">
        <div key={stage.id} className="animate-rise rounded-2xl bg-paper p-5 text-paper-foreground shadow-paper sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-paper-line pb-3 text-xs text-paper-muted">
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> To: Aarav · Sent automatically
            </span>
            <span className="rounded-full bg-paper-foreground/5 px-2 py-0.5 font-medium text-paper-foreground">{stage.tone}</span>
          </div>
          <p className="mt-4 font-semibold">{stage.subject}</p>
          <p className="mt-2 text-sm leading-relaxed text-paper-muted">{stage.body}</p>
          <p className="mt-4 text-xs text-paper-muted">Sample copy. Every message is an editable template.</p>
        </div>
      </div>
    </div>
  );
}
