import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { auth, isTokenValid } from "@/lib/api";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isTokenValid() || !auth.isAdmin()) {
      auth.clear();
      navigate({ to: "/login" });
    } else {
      setChecking(false);
    }
  }, []);

  if (checking) return <div className="flex min-h-screen items-center justify-center">Chargement…</div>;
  return <>{children}</>;
}
