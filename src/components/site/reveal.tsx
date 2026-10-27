import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Reports once when the element first scrolls into view. */
export function useInView<T extends Element>(rootMargin = "0px 0px -10% 0px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, rootMargin]);

  return { ref, inView };
}

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} data-inview={inView} className={cn("reveal", className)} style={{ "--delay": `${delay}ms` } as CSSProperties}>
      {children}
    </div>
  );
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Eases a displayed number toward `target` so changing values feel continuous. */
export function useAnimatedNumber(target: number, duration = 500) {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);

  useEffect(() => {
    if (prefersReducedMotion()) {
      fromRef.current = target;
      setValue(target);
      return;
    }
    const from = fromRef.current;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (target - from) * eased;
      fromRef.current = next;
      setValue(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    // Background tabs pause animation frames; make sure the final value still lands.
    const settle = window.setTimeout(() => {
      fromRef.current = target;
      setValue(target);
    }, duration + 100);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
    };
  }, [target, duration]);

  return value;
}
