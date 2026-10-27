import { Link } from "@tanstack/react-router";
import { ReceiptText } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import "@lovable.dev/cloud-auth-js/styles.css";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-16 sm:py-24">
      <div className="w-full max-w-[30rem]">
        <Link to="/" className="mb-10 flex items-center justify-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ReceiptText className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-foreground">SmartInvoice</span>
        </Link>
        <div className="rounded-3xl border bg-card px-7 py-9 shadow-lifted sm:px-11 sm:py-12">
          <h1 className="font-display text-4xl leading-tight tracking-tight text-foreground">{title}</h1>
          <p className="mt-2 text-[0.95rem] text-muted-foreground">{subtitle}</p>
          <div className="mt-9 [&_button]:h-11 [&_button]:rounded-xl [&_input]:h-11 [&_input]:rounded-xl [&_input]:px-4">{children}</div>
        </div>
        {footer ? <div className="mt-8 text-center text-sm text-muted-foreground">{footer}</div> : null}
      </div>
    </div>
  );
}

/**
 * Google/Lovable sign-in goes through Lovable's OAuth broker at /~oauth/*, which only
 * exists on Lovable hosting. On a local dev server that path is our 404 page.
 */
function isLocalDevHost() {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host.endsWith(".localhost");
}

async function socialSignIn(provider: "google" | "lovable") {
  if (isLocalDevHost()) {
    toast.info(`${provider === "google" ? "Google" : "Lovable"} sign-in only works on your published Lovable site. Locally, please use email and password below.`, {
      duration: 8000,
    });
    return;
  }
  const result = await lovable.auth.signInWithOAuth(provider, {
    redirect_uri: window.location.origin,
  });
  if (result.error) {
    toast.error(result.error.message || "Sign-in failed. Please try again.");
    return;
  }
  if (result.redirected) return;
  // Tokens returned and session already set — let the caller handle navigation.
  window.location.href = "/dashboard";
}

export function SocialButtons() {
  const [busy, setBusy] = useState<string | null>(null);
  return (
    <div className="grid gap-3">
      <Button
        type="button"
        variant="outline"
        disabled={busy !== null}
        onClick={async () => {
          setBusy("google");
          try {
            await socialSignIn("google");
          } finally {
            setBusy(null);
          }
        }}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z" />
          <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3a7.2 7.2 0 0 1-10.8-3.8H1.2v3.1A12 12 0 0 0 12 24Z" />
          <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.2a12 12 0 0 0 0 10.8l4.1-3.1Z" />
          <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8L20 3.2A12 12 0 0 0 1.2 6.6l4.1 3.1A7.2 7.2 0 0 1 12 4.8Z" />
        </svg>
        {busy === "google" ? "Connecting…" : "Continue with Google"}
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={busy !== null}
        onClick={async () => {
          setBusy("lovable");
          try {
            await socialSignIn("lovable");
          } finally {
            setBusy(null);
          }
        }}
      >
        <span className="text-sm font-medium">
          {busy === "lovable" ? "Connecting…" : "Continue with Lovable"}
        </span>
      </Button>
      <div className="relative my-4 text-center">
        <span className="relative z-10 bg-card px-2 text-xs text-muted-foreground">or use email</span>
        <span className="absolute inset-x-0 top-1/2 h-px bg-border" aria-hidden />
      </div>
    </div>
  );
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = "/login";
}
