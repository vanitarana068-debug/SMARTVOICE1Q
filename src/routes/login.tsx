import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, SocialButtons } from "@/components/auth-shell";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { next?: string } => (typeof search["next"] === "string" ? { next: search["next"] } : {}),
  head: () => ({
    meta: [
      { title: "Sign in — SmartInvoice" },
      { name: "description", content: "Sign in to SmartInvoice to create invoices, track payments and automate follow-ups." },
      { property: "og:title", content: "Sign in — SmartInvoice" },
      { property: "og:description", content: "Sign in to SmartInvoice to create invoices, track payments and automate follow-ups." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function safeNext(value: string | null | undefined): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/dashboard";
}

function LoginPage() {
  const navigate = useNavigate();
  const next = Route.useSearch().next;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
        return;
      }
      await navigate({ to: safeNext(next) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your invoicing workspace."
      footer={
        <>
          New to SmartInvoice?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <SocialButtons />
      <form onSubmit={signIn} className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}
