import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useI18n } from "@/contexts/AppProviders";
import { AuthLayout, AuthInput, GoogleButton } from "@/components/site/AuthLayout";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success(t("auth.login.success"));
    setTimeout(() => {
      const role = typeof window !== "undefined" ? localStorage.getItem("sc-role") : null;
      navigate({ to: role === "ADMIN" ? "/admin" : "/app" });
    }, 600);
  }
  return (
    <AuthLayout>
      <h1 className="mb-1 font-display text-3xl font-extrabold">{t("auth.login.title")}</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        {t("auth.login.sub")}{" "}
        <Link to="/signup" className="font-semibold text-brand hover:underline">
          {t("auth.login.signup")}
        </Link>
      </p>
      <GoogleButton>{t("auth.google")}</GoogleButton>
      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">{t("auth.divider")}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <form onSubmit={onSubmit}>
        <AuthInput label={t("auth.email")} type="email" placeholder="vous@univ.ma" />
        <AuthInput label={t("auth.password")} type="password" placeholder="••••••••" />
        <div className="mb-5 flex items-center justify-between text-[13px]">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="accent-[var(--brand)]" /> {t("auth.remember")}
          </label>
          <a className="font-semibold text-brand hover:underline" href="#">
            {t("auth.forgot")}
          </a>
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-brand px-4 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          {t("auth.login.submit")}
        </button>
      </form>
    </AuthLayout>
  );
}