import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth-shell";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset password — SmartInvoice" },
      { name: "description", content: "Request a password reset link for your SmartInvoice account." },
      { property: "og:title", content: "Reset password — SmartInvoice" },
      { property: "og:description", content: "Request a password reset link for your SmartInvoice account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      setSent(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a secure link to set a new password."
      footer={
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-sm text-foreground">
          <p className="font-medium">Reset link sent</p>
          <p className="mt-1 text-muted-foreground">If an account exists for {email}, you'll receive an email with a reset link.</p>
        </div>
      ) : (
        <form onSubmit={send} className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" />
          </div>
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
