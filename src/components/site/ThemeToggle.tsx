import { Moon, Sun } from "lucide-react";
import { useTheme, useI18n } from "@/contexts/AppProviders";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? t("nav.theme.light") : t("nav.theme.dark")}
      title={isDark ? t("nav.theme.light") : t("nav.theme.dark")}
      className={
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-2 text-foreground transition-colors hover:bg-brand-light hover:text-brand " +
        className
      }
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}