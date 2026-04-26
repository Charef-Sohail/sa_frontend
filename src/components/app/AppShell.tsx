import * as React from "react";
import { Link } from "@tanstack/react-router";
import {
  LayoutGrid, CalendarDays, CheckSquare, ShoppingCart, MessageCircle,
  LogOut, Bell, Search, Menu, X,
} from "lucide-react";
import { useI18n } from "@/contexts/AppProviders";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { Logo } from "@/components/site/Logo";
import { toast } from "sonner";

export type SubPage = "overview" | "planning" | "tasks" | "markets" | "faq";

const MOODS: { key: string; emoji: string; tk: string }[] = [
  { key: "motivated", emoji: "🚀", tk: "app.mood.motivated" },
  { key: "normal", emoji: "😊", tk: "app.mood.normal" },
  { key: "tired", emoji: "😴", tk: "app.mood.tired" },
  { key: "stressed", emoji: "😰", tk: "app.mood.stressed" },
];

export function AppShell({
  page, onPageChange, children,
}: { page: SubPage; onPageChange: (p: SubPage) => void; children: React.ReactNode }) {
  const { t } = useI18n();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [mood, setMood] = React.useState("motivated");

  const items: { key: SubPage; label: string; Icon: React.ComponentType<{ size?: number }>; badge?: string }[] = [
    { key: "overview", label: t("app.nav.dashboard"), Icon: LayoutGrid },
    { key: "planning", label: t("app.nav.planning"), Icon: CalendarDays },
    { key: "tasks", label: t("app.nav.tasks"), Icon: CheckSquare, badge: "3" },
    { key: "markets", label: t("app.nav.markets"), Icon: ShoppingCart },
    { key: "faq", label: t("app.nav.faq"), Icon: MessageCircle },
  ];

  function pickMood(m: typeof MOODS[number]) {
    setMood(m.key);
    toast.success(t("toast.mood.updated") + " " + m.emoji);
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* Topbar */}
      <header className="sticky top-0 z-30 flex h-15 items-center border-b border-border bg-surface-2 py-3">
        <div className="flex w-full items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface lg:hidden"
            >
              {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
            <Logo size={32} asLink />
          </div>

          <div className="hidden flex-1 px-4 md:block md:max-w-[400px]">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder={t("app.search")}
                className="w-full rounded-lg border-[1.5px] border-border bg-surface px-4 py-2 ps-9 text-[13px] outline-none transition-colors focus:border-brand focus:bg-surface-2"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              aria-label={t("app.notif")}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface"
            >
              <Bell size={15} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border border-surface-2 bg-danger" />
            </button>
            <Link
              to="/"
              onClick={() => toast(t("toast.logout"))}
              className="hidden rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-brand-light hover:text-brand sm:inline-flex"
            >
              <LogOut size={15} className="me-1.5" /> {t("app.logout")}
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={
            "fixed inset-y-15 start-0 z-20 w-[240px] flex-col gap-1 overflow-y-auto border-e border-border bg-surface-2 p-3 transition-transform lg:sticky lg:top-15 lg:flex lg:h-[calc(100vh-3.75rem)] lg:translate-x-0 " +
            (sidebarOpen ? "flex translate-x-0" : "hidden -translate-x-full")
          }
          style={{ top: "60px" }}
        >
          <div className="mb-2 rounded-xl bg-surface px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand to-success text-sm font-bold text-white">
                A
              </span>
              <div>
                <div className="text-[13px] font-bold">Ahmed K.</div>
                <div className="text-[11px] text-muted-foreground">M1 Info · ENSIAS</div>
              </div>
            </div>
          </div>

          <div className="mt-2 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {t("app.section.main")}
          </div>
          {items.map((it) => {
            const active = page === it.key;
            return (
              <button
                key={it.key}
                onClick={() => { onPageChange(it.key); setSidebarOpen(false); }}
                className={
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors " +
                  (active
                    ? "bg-brand-light font-bold text-brand"
                    : "text-muted-foreground hover:bg-brand-light hover:text-brand")
                }
              >
                <it.Icon size={15} />
                <span className="flex-1 text-start">{it.label}</span>
                {it.badge && (
                  <span className="rounded-full bg-danger px-2 py-0.5 text-[10px] font-bold text-white">
                    {it.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="mt-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {t("app.section.account")}
          </div>
          <Link
            to="/"
            onClick={() => toast(t("toast.logout"))}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium text-muted-foreground hover:bg-brand-light hover:text-brand"
          >
            <LogOut size={15} /> {t("app.logout")}
          </Link>

          <div
            className="mt-auto rounded-2xl p-4 text-white"
            style={{ background: "linear-gradient(135deg,var(--brand),var(--brand-2))" }}
          >
            <div className="mb-2 text-xs font-bold">{t("app.mood.title")}</div>
            <div className="flex gap-1.5">
              {MOODS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => pickMood(m)}
                  title={t(m.tk)}
                  className={
                    "flex-1 rounded-lg px-2 py-1.5 text-base transition-all " +
                    (mood === m.key ? "scale-110 bg-white/30" : "bg-white/15 hover:bg-white/25")
                  }
                >
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-5 sm:p-7">{children}</main>
      </div>
    </div>
  );
}