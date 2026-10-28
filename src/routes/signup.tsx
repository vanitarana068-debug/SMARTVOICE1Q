import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, SocialButtons } from "@/components/auth-shell";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

const PLAN_NAMES = { free: "Free", starter: "Starter", growth: "Growth" } as const;
type PlanSlug = keyof typeof PLAN_NAMES;

export const Route = createFileRoute("/signup")({
  validateSearch: (search: Record<string, unknown>): { plan?: PlanSlug } =>
    typeof search["plan"] === "string" && search["plan"] in PLAN_NAMES ? { plan: search["plan"] as PlanSlug } : {},
  head: () => ({
    meta: [
      { title: "Create your account — SmartInvoice" },
      { name: "description", content: "Sign up for SmartInvoice — professional invoices, payment tracking and automated reminders." },
      { property: "og:title", content: "Create your account — SmartInvoice" },
      { property: "og:description", content: "Sign up for SmartInvoice — professional invoices, payment tracking and automated reminders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const plan = Route.useSearch().plan;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: name },
        },
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      if (data.session) {
        await navigate({ to: "/dashboard" });
        return;
      }
      setAwaitingConfirm(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free plan includes 5 customers and unlimited drafts."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {awaitingConfirm ? (
        <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-sm text-foreground">
          <p className="font-medium">Check your email to confirm your account</p>
          <p className="mt-1 text-muted-foreground">
            We sent a confirmation link to {email}. Click it, then sign in here.
          </p>
        </div>
      ) : (
        <>
          {plan && plan !== "free" ? (
            <div role="note" className="mb-6 rounded-xl border border-primary/40 bg-primary/10 p-4 text-sm text-foreground">
              <p className="font-medium">You picked the {PLAN_NAMES[plan]} plan</p>
              <p className="mt-1 text-muted-foreground">
                Paid plans aren&apos;t available to buy yet, so your account starts on Free at ₹0. Nothing will be charged.
              </p>
            </div>
          ) : null}
          <SocialButtons />
          <form onSubmit={signUp} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Your name</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Priya Sharma" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <p className="text-xs text-muted-foreground">At least 8 characters.</p>
            </div>
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
