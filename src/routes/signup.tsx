import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useI18n } from "@/contexts/AppProviders";
import { AuthLayout, AuthInput, GoogleButton } from "@/components/site/AuthLayout";
import { GraduationCap, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [role, setRole] = React.useState<"STUDENT" | "ADMIN">("STUDENT");
  const [school, setSchool] = React.useState("ENSET");
  const [birthDate, setBirthDate] = React.useState("");
  const maxBirthDate = new Date().toISOString().slice(0, 10);

  function getAgeFromBirthDate(date: string) {
    const birth = new Date(date);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return String(Math.max(age, 0));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("sc-role", role);
      try {
        const raw = localStorage.getItem("sc-profile");
        const prev = raw ? JSON.parse(raw) : {};
        const age = birthDate ? getAgeFromBirthDate(birthDate) : prev.age ?? "";
        localStorage.setItem(
          "sc-profile",
          JSON.stringify({ ...prev, school, birthDate, age }),
        );
      } catch {}
      if (role === "STUDENT") {
        localStorage.setItem("sc-just-signed-up", "1");
        localStorage.removeItem("sc-onboarding-completed");
      }
    }
    toast.success(t("auth.signup.success"));
    setTimeout(
      () => navigate({ to: role === "ADMIN" ? "/admin" : "/app" }),
      600,
    );
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

      {/* Role selector */}
      <div className="mb-5">
        <div className="mb-2 text-[13px] font-semibold">Type de compte</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRole("STUDENT")}
            className={
              "flex items-center gap-2 rounded-lg border-[1.5px] px-3 py-3 text-sm font-semibold transition-colors " +
              (role === "STUDENT"
                ? "border-brand bg-brand-light text-brand"
                : "border-border bg-surface-2 text-foreground hover:bg-brand-light")
            }
          >
            <GraduationCap size={18} /> Étudiant
          </button>
          <button
            type="button"
            onClick={() => setRole("ADMIN")}
            className={
              "flex items-center gap-2 rounded-lg border-[1.5px] px-3 py-3 text-sm font-semibold transition-colors " +
              (role === "ADMIN"
                ? "border-brand bg-brand-light text-brand"
                : "border-border bg-surface-2 text-foreground hover:bg-brand-light")
            }
          >
            <ShieldCheck size={18} /> Administrateur
          </button>
        </div>
      </div>

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
        <div className="grid grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="mb-1.5 block text-[13px] font-semibold">Établissement</label>
            <input
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="Ex: ENSET Mohammedia"
              className="w-full rounded-lg border-[1.5px] border-border bg-surface-2 px-4 py-3 text-sm outline-none focus:border-brand"
            />
          </div>
          <div className="mb-4">
            <label className="mb-1.5 block text-[13px] font-semibold">Date de naissance</label>
            <input
              type="date"
              min="1950-01-01"
              max={maxBirthDate}
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full rounded-lg border-[1.5px] border-border bg-surface-2 px-4 py-3 text-sm outline-none focus:border-brand"
            />
          </div>
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