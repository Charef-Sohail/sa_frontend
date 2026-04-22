import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/contexts/AppProviders";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Navbar() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links: { id: string; label: string }[] = [
    { id: "features", label: t("nav.features") },
    { id: "how", label: t("nav.how") },
    { id: "testimonials", label: t("nav.testimonials") },
    { id: "contact", label: t("nav.contact") },
  ];

  return (
    <header
      className={
        "fixed inset-x-0 top-0 z-50 border-b border-border/70 backdrop-blur-md transition-shadow " +
        (scrolled ? "shadow-[0_2px_24px_rgba(79,110,247,.08)]" : "")
      }
      style={{ background: "color-mix(in oklab, var(--surface-2) 92%, transparent)" }}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1160px] items-center justify-between px-6">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1.5 md:flex">
          {links.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-brand-light hover:text-brand"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link
            to="/login"
            className="hidden rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-brand-light hover:text-brand md:inline-flex"
          >
            {t("nav.login")}
          </Link>
          <Link
            to="/signup"
            className="hidden rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark md:inline-flex"
          >
            {t("nav.signup")}
          </Link>
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-2 md:hidden"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-surface-2 px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-1.5">
            {links.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground hover:bg-brand-light hover:text-brand"
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground hover:bg-brand-light hover:text-brand"
            >
              {t("nav.login")}
            </Link>
            <Link
              to="/signup"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-lg bg-brand px-4 py-2 text-center text-sm font-semibold text-white"
            >
              {t("nav.signup")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}