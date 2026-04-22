import { Globe } from "lucide-react";
import { useI18n } from "@/contexts/AppProviders";
import type { Lang } from "@/i18n/translations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OPTIONS: { code: Lang; label: string; flag: string }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
];

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  const current = OPTIONS.find((o) => o.code === lang) ?? OPTIONS[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("nav.lang")}
          className={
            "inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 text-sm font-medium text-foreground transition-colors hover:bg-brand-light hover:text-brand " +
            className
          }
        >
          <Globe size={14} />
          <span className="hidden sm:inline">{current.flag}</span>
          <span className="uppercase">{current.code}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {OPTIONS.map((o) => (
          <DropdownMenuItem
            key={o.code}
            onClick={() => setLang(o.code)}
            className={lang === o.code ? "bg-brand-light text-brand" : ""}
          >
            <span className="mr-2">{o.flag}</span>
            {o.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}