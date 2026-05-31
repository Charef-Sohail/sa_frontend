import * as React from "react";
import { translations, type Lang } from "@/i18n/translations";

type Theme = "light" | "dark";

type ThemeCtx = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
};

type LangCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
};

const ThemeContext = React.createContext<ThemeCtx | null>(null);
const LangContext = React.createContext<LangCtx | null>(null);

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("sc-theme") as Theme | null;
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "fr";
  const saved = localStorage.getItem("sc-lang") as Lang | null;
  if (saved === "fr" || saved === "en" || saved === "ar") return saved;
  return "fr";
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("light");
  const [lang, setLangState] = React.useState<Lang>("fr");

  // Hydrate from localStorage on client only
  React.useEffect(() => {
    setThemeState(getInitialTheme());
    setLangState(getInitialLang());
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("sc-theme", theme);
  }, [theme]);

  React.useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("sc-lang", lang);
  }, [lang]);

  const setTheme = React.useCallback((t: Theme) => setThemeState(t), []);
  const toggleTheme = React.useCallback(
    () => setThemeState((prev) => (prev === "dark" ? "light" : "dark")),
    [],
  );
  const setLang = React.useCallback((l: Lang) => setLangState(l), []);
  const t = React.useCallback(
    (key: string) => translations[lang][key] ?? translations.fr[key] ?? key,
    [lang],
  );

  const themeValue = React.useMemo(() => ({ theme, toggleTheme, setTheme }), [theme, toggleTheme, setTheme]);
  const langValue = React.useMemo<LangCtx>(
    () => ({ lang, setLang, t, dir: lang === "ar" ? "rtl" : "ltr" }),
    [lang, setLang, t],
  );

  return (
    <ThemeContext.Provider value={themeValue}>
      <LangContext.Provider value={langValue}>{children}</LangContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside AppProviders");
  return ctx;
}

export function useI18n() {
  const ctx = React.useContext(LangContext);
  if (!ctx) throw new Error("useI18n must be used inside AppProviders");
  return ctx;
}