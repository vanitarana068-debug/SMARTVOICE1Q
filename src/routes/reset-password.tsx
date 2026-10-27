import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth-shell";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — SmartInvoice" },
      { name: "description", content: "Set a new password for your SmartInvoice account." },
      { property: "og:title", content: "Set a new password — SmartInvoice" },
      { property: "og:description", content: "Set a new password for your SmartInvoice account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const isRecovery = typeof window !== "undefined" && (window.location.hash.includes("type=recovery") || window.location.search.includes("type=recovery"));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Password updated. You're signed in.");
      await navigate({ to: "/dashboard" });
    } finally {
      setBusy(false);
    }
  };

  if (!isRecovery) {
    return (
      <AuthShell title="Set a new password" subtitle="This link isn't valid.">
        <p className="text-sm text-muted-foreground">
          This page is only for password-reset links. If you need to change your password, request a new reset email.
        </p>
        <Button asChild className="mt-4 w-full">
          <a href="/forgot-password">Request reset link</a>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose a password of at least 8 characters.">
      <form onSubmit={submit} className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Updating…" : "Update password"}
        </Button>
      </form>
    </AuthShell>
  );
}
