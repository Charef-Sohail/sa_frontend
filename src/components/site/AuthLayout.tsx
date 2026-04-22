import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "@/contexts/AppProviders";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="grid min-h-screen grid-cols-1 bg-surface lg:grid-cols-2">
      {/* Left side */}
      <div
        className="relative hidden flex-col justify-between overflow-hidden p-14 text-white lg:flex"
        style={{ background: "linear-gradient(160deg,#1A1D2E 0%,#2D3150 50%,#1a3040 100%)" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 80% 30%, rgba(79,110,247,.3) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 10% 80%, rgba(0,212,170,.2) 0%, transparent 70%)",
          }}
        />
        <div className="relative">
          <Logo />
          <h2 className="mt-12 font-display text-[clamp(28px,3vw,40px)] font-extrabold leading-tight text-white">
            {t("auth.left.title.1")}
            <br />
            {t("auth.left.title.2")}{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg,#7B93FF,#00D4AA)" }}
            >
              {t("auth.left.title.3")}
            </span>
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/65">{t("auth.left.desc")}</p>
          <ul className="mt-8 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                <span className="h-2 w-2 rounded-full bg-success" />
                {t(`auth.left.feat${i}`)}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative text-xs text-white/40">© 2025 Smart Calendar SA</div>
      </div>

      {/* Right side */}
      <div className="flex flex-col bg-surface-2">
        <div className="flex items-center justify-between px-6 pt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand"
          >
            <ArrowLeft size={16} /> {t("auth.back")}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-[440px]">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function AuthInput({
  label, type = "text", placeholder, name,
}: { label: string; type?: string; placeholder?: string; name?: string }) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-[13px] font-semibold">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-lg border-[1.5px] border-border bg-surface-2 px-4 py-3 text-sm outline-none transition-colors focus:border-brand"
      />
    </div>
  );
}

export function GoogleButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-2.5 rounded-lg border-[1.5px] border-border bg-surface-2 px-4 py-3 text-sm font-medium transition-colors hover:border-brand hover:bg-brand-light"
    >
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      {children}
    </button>
  );
}