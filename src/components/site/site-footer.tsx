import { Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/site/brand-mark";

const linkClass = "rounded transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <BrandMark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Invoicing, payment tracking and polite automated follow-ups for freelancers, consultants and small agencies.
          </p>
        </div>
        <nav aria-label="Product">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">Product</h2>
          <ul className="mt-4 grid gap-2.5 text-sm text-muted-foreground">
            <li><Link to="/" hash="demo" className={linkClass}>Try the invoice demo</Link></li>
            <li><Link to="/" hash="how" className={linkClass}>How it works</Link></li>
            <li><Link to="/pricing" className={linkClass}>Pricing</Link></li>
            <li><Link to="/" hash="faq" className={linkClass}>FAQ</Link></li>
          </ul>
        </nav>
        <nav aria-label="Account">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">Account</h2>
          <ul className="mt-4 grid gap-2.5 text-sm text-muted-foreground">
            <li><Link to="/signup" className={linkClass}>Create a free account</Link></li>
            <li><Link to="/login" className={linkClass}>Sign in</Link></li>
            <li><Link to="/forgot-password" className={linkClass}>Reset your password</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} SmartInvoice. Prices shown in Indian rupees.
        </p>
      </div>
    </footer>
  );
}
