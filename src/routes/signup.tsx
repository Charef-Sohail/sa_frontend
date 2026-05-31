import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useI18n } from "@/contexts/AppProviders";
import { AuthLayout, AuthInput, GoogleButton } from "@/components/site/AuthLayout";
import { GraduationCap } from "lucide-react";
import { authApi, profileApi, auth } from "@/lib/api";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  // Signup restricted to students only
  const [university, setUniversity] = React.useState("ENSET");
  const [birthDate, setBirthDate] = React.useState("");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<{ [k: string]: string }>({});

  async function promptLocationOptIn() {
    if (typeof window === "undefined" || !navigator?.geolocation) return;
    const accept = window.confirm("Activer la localisation pour trouver des marchés proches de vous ?");
    if (!accept) return;
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
        });
      });
      localStorage.setItem(
        "sc-location",
        JSON.stringify({ latitude: position.coords.latitude, longitude: position.coords.longitude, timestamp: Date.now() }),
      );
      toast.success(t("toast.geoloc"));
    } catch {
      toast.error("Impossible de récupérer la localisation.");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const parsedBirthDate = birthDate ? new Date(birthDate) : undefined;
    const age = parsedBirthDate ? new Date().getFullYear() - parsedBirthDate.getFullYear() : undefined;
    setErrors({});
    // Frontend validation
    if (!name) { setErrors({ name: "Nom complet requis" }); setLoading(false); return; }
    if (!email) { setErrors({ email: "Email requis" }); setLoading(false); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setErrors({ email: "Format d'email invalide" }); setLoading(false); return; }
    if (!password || password.length < 8) { setErrors({ password: "Mot de passe trop court (8+)" }); setLoading(false); return; }
    if (birthDate) {
      if (!parsedBirthDate || Number.isNaN(parsedBirthDate.getTime())) {
        setErrors({ birthDate: "Date de naissance invalide" }); setLoading(false); return;
      }
      const ageNum = new Date().getFullYear() - parsedBirthDate.getFullYear();
      if (ageNum < 13 || ageNum > 120) { setErrors({ birthDate: "Date de naissance invalide" }); setLoading(false); return; }
    }

    try {
      const reg = await authApi.register({ name, email, password, age, birthDate, university });
      // Debug: inspect backend response
      if (typeof window !== "undefined") try { console.debug("signup response:", reg); } catch {}
      setLoading(false);
      if (!auth.getToken()) {
        toast.success("Inscription réussie. Veuillez vous connecter.");
        navigate({ to: "/login" });
        return;
      }
      toast.success(t("auth.signup.success"));
      const roleFromBackend = reg?.role;
      const isAdmin = roleFromBackend === "ROLE_ADMIN" || roleFromBackend === "ADMIN";
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("sc-profile");
          const prev = raw ? JSON.parse(raw) : {};
          const ageStr = age != null ? String(age) : prev.age ?? "";
          localStorage.setItem("sc-profile", JSON.stringify({ ...prev, name, email, university, birthDate, age: ageStr }));
        } catch {}
        if (!isAdmin) { localStorage.setItem("sc-just-signed-up", "1"); localStorage.removeItem("sc-onboarding-completed"); }
      }
      if (!isAdmin) {
        await promptLocationOptIn();
      }
      navigate({ to: isAdmin ? "/admin" : "/app" });
    } catch (err: any) {
      console.error("Erreur complète:", err);
      console.error("Response data:", err?.response?.data);
      const msg = err?.response?.data?.message || err?.message || "Erreur";
      setLoading(false);
      setErrors({ general: msg });
      toast.error("Échec de l'inscription");
    }
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

      {/* Signup is student-only (backend expects student registration) */}

      {authApi.googleEnabled && (
        <>
          <GoogleButton onClick={() => authApi.googleLogin()}>{t("auth.google")}</GoogleButton>
          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">{t("auth.divider")}</span>
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-4">
          <AuthInput label="Nom complet" placeholder="Ahmed Karimi" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <AuthInput label={t("auth.email")} type="email" placeholder="vous@univ.ma" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="mb-1.5 block text-[13px] font-semibold">Université</label>
            <input
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="Ex: ENSET Mohammedia"
              className="w-full rounded-lg border-[1.5px] border-border bg-surface-2 px-4 py-3 text-sm outline-none focus:border-brand"
            />
          </div>
          <div className="mb-4">
            <label className="mb-1.5 block text-[13px] font-semibold">Date de naissance</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full rounded-lg border-[1.5px] border-border bg-surface-2 px-4 py-3 text-sm outline-none focus:border-brand"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <AuthInput label={t("auth.password")} type="password" placeholder="8+" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {errors.name && <div className="text-sm text-destructive mt-1 mb-2">{errors.name}</div>}
        {errors.password && <div className="text-sm text-destructive mt-1 mb-2">{errors.password}</div>}
        {errors.birthDate && <div className="text-sm text-destructive mt-1 mb-2">{errors.birthDate}</div>}
        {errors.general && <div className="text-sm text-destructive mb-3">{errors.general}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand px-4 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? "…" : t("auth.signup.submit")}
        </button>
        <p className="mt-3 text-center text-xs text-muted-foreground">{t("auth.nocard")}</p>
      </form>
    </AuthLayout>
  );
}