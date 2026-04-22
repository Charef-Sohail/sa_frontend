import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useI18n } from "@/contexts/AppProviders";
import { AuthLayout, AuthInput, GoogleButton } from "@/components/site/AuthLayout";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Mark first-time so survey opens on /app
    if (typeof window !== "undefined") {
      localStorage.setItem("sc-just-signed-up", "1");
      localStorage.removeItem("sc-onboarding-completed");
    }
    toast.success(t("auth.signup.success"));
    setTimeout(() => navigate({ to: "/app" }), 600);
  }
  return (
    <AuthLayout>
      <h1 className="mb-1 font-display text-3xl font-extrabold">{t("auth.signup.title")}</h1>
      <p className="mb-7 text-sm text-muted-foreground">
        {t("auth.signup.sub")}{" "}
        <Link to="/login" className="font-semibold text-brand hover:underline">
          {t("auth.signup.login")}
        </Link>
      </p>
      <GoogleButton>{t("auth.google")}</GoogleButton>
      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">{t("auth.divider")}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <AuthInput label={t("auth.firstname")} placeholder="Ahmed" />
          <AuthInput label={t("auth.lastname")} placeholder="Karimi" />
        </div>
        <AuthInput label={t("auth.email")} type="email" placeholder="vous@univ.ma" />
        <div className="mb-4">
          <label className="mb-1.5 block text-[13px] font-semibold">{t("auth.school")}</label>
          <select className="w-full rounded-lg border-[1.5px] border-border bg-surface-2 px-4 py-3 text-sm outline-none transition-colors focus:border-brand">
            <option>{t("auth.school.placeholder")}</option>
            <option>ENSIAS</option><option>ENSA Rabat</option>
            <option>FSR</option><option>FST</option><option>ENCG</option><option>Autre</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AuthInput label={t("auth.password")} type="password" placeholder="8+" />
          <AuthInput label={t("auth.password.confirm")} type="password" placeholder="…" />
        </div>
        <label className="mb-5 flex items-center gap-2 text-[13px] text-muted-foreground">
          <input type="checkbox" className="accent-[var(--brand)]" required /> {t("auth.terms")}
        </label>
        <button
          type="submit"
          className="w-full rounded-lg bg-brand px-4 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          {t("auth.signup.submit")}
        </button>
        <p className="mt-3 text-center text-xs text-muted-foreground">{t("auth.nocard")}</p>
      </form>
    </AuthLayout>
  );
}