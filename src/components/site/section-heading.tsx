import type { ReactNode } from "react";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, children, align = "left", className }: { eyebrow: string; title: ReactNode; children?: ReactNode; align?: "left" | "center"; className?: string }) {
  return (
    <Reveal className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl">{title}</h2>
      {children ? <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{children}</p> : null}
    </Reveal>
  );
}
