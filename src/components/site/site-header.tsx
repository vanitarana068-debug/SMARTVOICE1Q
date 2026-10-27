import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BrandMark } from "@/components/site/brand-mark";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

type NavItem = { label: string; section: string; page?: "/pricing" };

const NAV: NavItem[] = [
  { label: "Product", section: "demo" },
  { label: "How it works", section: "how" },
  { label: "Pricing", section: "pricing", page: "/pricing" },
  { label: "FAQ", section: "faq" },
];

// Landing-page sections and the nav item each one belongs to.
const SECTION_TO_NAV: Record<string, string> = {
  demo: "demo",
  problem: "demo",
  compare: "demo",
  reminders: "demo",
  preview: "demo",
  features: "demo",
  how: "how",
  pricing: "pricing",
  faq: "faq",
  "get-started": "",
};

/** Tracks which landing-page section is in the middle of the viewport. */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === "undefined") return;
    const els = Object.keys(SECTION_TO_NAV)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(SECTION_TO_NAV[entry.target.id] ?? null);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [enabled]);

  return enabled ? active : null;
}

function NavLink({ item, active, className, onNavigate }: { item: NavItem; active: boolean; className?: string; onNavigate?: () => void }) {
  const shared = cn(
    "relative rounded-md px-1 py-1 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "after:absolute after:inset-x-1 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100",
    active && "text-foreground after:scale-x-100",
    className,
  );
  const ariaCurrent = active ? ("true" as const) : undefined;
  if (item.page) {
    return (
      <Link to={item.page} className={shared} aria-current={ariaCurrent} onClick={onNavigate}>
        {item.label}
      </Link>
    );
  }
  return (
    <Link to="/" hash={item.section} className={shared} aria-current={ariaCurrent} onClick={onNavigate}>
      {item.label}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";
  const activeSection = useActiveSection(isHome);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (item: NavItem) => (item.page && pathname === item.page) || activeSection === item.section;

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled ? "border-border bg-background/80 backdrop-blur-md" : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <BrandMark />

        <nav aria-label="Main" className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {NAV.map((item) => (
            <NavLink key={item.label} item={item} active={Boolean(isActive(item))} />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Button asChild size="sm">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/signup">Start free</Link>
              </Button>
            </>
          )}

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background">
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription className="sr-only">Site navigation</SheetDescription>
              <nav aria-label="Mobile" className="mt-6 flex flex-col gap-1 text-base font-medium text-muted-foreground">
                {NAV.map((item) => (
                  <NavLink
                    key={item.label}
                    item={item}
                    active={Boolean(isActive(item))}
                    className="px-2 py-2.5 after:hidden"
                    onNavigate={() => setMenuOpen(false)}
                  />
                ))}
              </nav>
              <div className="mt-8 grid gap-2">
                {user ? (
                  <SheetClose asChild>
                    <Button asChild size="lg">
                      <Link to="/dashboard">Go to dashboard</Link>
                    </Button>
                  </SheetClose>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Button asChild size="lg">
                        <Link to="/signup">Start free</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild size="lg" variant="outline">
                        <Link to="/login">Sign in</Link>
                      </Button>
                    </SheetClose>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
