import { forwardRef, type ReactNode, type SelectHTMLAttributes } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const NativeSelect = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-9 w-full cursor-pointer rounded-md border border-input bg-background px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      className,
    )}
    {...props}
  />
));
NativeSelect.displayName = "NativeSelect";

export function Field({ id, label, error, hint, children, className }: { id: string; label: string; error?: string | null; hint?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
