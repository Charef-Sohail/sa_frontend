import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useI18n } from "@/contexts/AppProviders";
import { AuthLayout, AuthInput, GoogleButton } from "@/components/site/AuthLayout";
import { authApi, isTokenValid, auth } from "@/lib/api";
import * as React from "react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string; general?: string }>({});
  const [role, setRole] = React.useState<"STUDENT" | "ADMIN">("STUDENT");
  const [remember, setRemember] = React.useState(true);
  const [forgotMode, setForgotMode] = React.useState(false);
  const [forgotEmail, setForgotEmail] = React.useState("");
  const [forgotLoading, setForgotLoading] = React.useState(false);
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    // Frontend validation
    if (!email) {
      setErrors({ email: "Email requis" }); setLoading(false); return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setErrors({ email: "Format d'email invalide" }); setLoading(false); return;
    }
    if (!password) { setErrors({ password: "Mot de passe requis" }); setLoading(false); return; }

    try {
      const res = await authApi.login({ email, password }, remember);
      // Debug: inspect backend response and stored token
      if (typeof window !== "undefined") try { console.debug("login response:", res, "stored token:", auth.getToken()); } catch {}
      setLoading(false);
      if (!auth.getToken()) {
        setErrors({ general: "Réponse d'authentification invalide" });
        return;
      }
      toast.success(t("auth.login.success"));
      const backendRole = res?.role ?? auth.getRole();
      const finalRole = backendRole ?? (role === "ADMIN" ? "ROLE_ADMIN" : "ROLE_STUDENT");
      const isAdmin = finalRole === "ROLE_ADMIN" || finalRole === "ADMIN";
      navigate({ to: isAdmin ? "/admin" : "/app" });
    } catch (err: any) {
      console.error("Erreur complète:", err);
      console.error("Response data:", err?.response?.data);
      const msg = err?.response?.data?.message || err?.message || "Erreur";
      setLoading(false);
      setErrors({ general: msg });
      toast.error("Échec de la connexion");
    }
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
        {forgotMode ? (
          <>
            <div className="mb-4 text-sm text-muted-foreground">Entrez votre email pour recevoir un lien de réinitialisation.</div>
            <AuthInput label={t("auth.email")} type="email" placeholder="vous@univ.ma" value={forgotEmail} onChange={(e: any) => setForgotEmail(e.target.value)} />
            {errors.email && <div className="text-sm text-destructive mt-1 mb-2">{errors.email}</div>}
            {errors.general && <div className="text-sm text-destructive mb-3">{errors.general}</div>}
            <div className="mb-5 flex items-center justify-between text-[13px]">
              <button type="button" onClick={() => { setForgotMode(false); setErrors({}); }} className="text-sm font-semibold text-brand hover:underline">
                Retour
              </button>
            </div>
            <button
              type="button"
              disabled={forgotLoading}
              onClick={async () => {
                setForgotLoading(true);
                setErrors({});
                if (!forgotEmail) {
                  setErrors({ email: "Email requis" });
                  setForgotLoading(false);
                  return;
                }
                if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(forgotEmail)) {
                  setErrors({ email: "Format d'email invalide" });
                  setForgotLoading(false);
                  return;
                }
                try {
                  await authApi.forgotPassword(forgotEmail);
                  toast.success("Un lien de réinitialisation a été envoyé si ce compte existe.");
                  setForgotMode(false);
                } catch (err: any) {
                  setErrors({ general: err?.message ?? "Impossible d'envoyer l'email" });
                }
                setForgotLoading(false);
              }}
              className="w-full rounded-lg bg-brand px-4 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
            >
              {forgotLoading ? "…" : "Envoyer"}
            </button>
          </>
        ) : (
          <>
            <div className="mb-4">
              <div className="mb-2 text-[13px] font-semibold">Se connecter en tant que</div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setRole("STUDENT")} className={"rounded-lg border-[1.5px] px-3 py-3 text-sm font-semibold " + (role === "STUDENT" ? "border-brand bg-brand-light text-brand" : "border-border bg-surface-2")}>Étudiant</button>
                <button type="button" onClick={() => setRole("ADMIN")} className={"rounded-lg border-[1.5px] px-3 py-3 text-sm font-semibold " + (role === "ADMIN" ? "border-brand bg-brand-light text-brand" : "border-border bg-surface-2")}>Administrateur</button>
              </div>
            </div>
            <AuthInput label={t("auth.email")} type="email" placeholder="vous@univ.ma" value={email} onChange={(e: any) => setEmail(e.target.value)} />
            {errors.email && <div className="text-sm text-destructive mt-1 mb-2">{errors.email}</div>}
            <AuthInput label={t("auth.password")} type="password" placeholder="••••••••" value={password} onChange={(e: any) => setPassword(e.target.value)} />
            {errors.password && <div className="text-sm text-destructive mt-1 mb-2">{errors.password}</div>}
            {errors.general && <div className="text-sm text-destructive mb-3">{errors.general}</div>}
            <div className="mb-5 flex items-center justify-between text-[13px]">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-[var(--brand)]" /> {t("auth.remember")}
              </label>
              <button type="button" onClick={() => { setForgotMode(true); setErrors({}); }} className="font-semibold text-brand hover:underline">
                {t("auth.forgot")}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand px-4 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
            >
              {loading ? "…" : t("auth.login.submit")}
            </button>
          </>
        )}
      </form>
    </AuthLayout>
  );
}