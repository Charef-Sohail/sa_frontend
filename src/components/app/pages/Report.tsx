import * as React from "react";
import { toast } from "sonner";
import { AlertTriangle, Trash2 } from "lucide-react";

export type Report = {
  id: string;
  category: "BUG" | "FEATURE" | "ACCOUNT" | "OTHER";
  subject: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
  userEmail: string;
};

export const REPORTS_KEY = "sc-reports";

function load(): Report[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(REPORTS_KEY) ?? "[]"); } catch { return []; }
}
function save(list: Report[]) { localStorage.setItem(REPORTS_KEY, JSON.stringify(list)); }

const CATS: { v: Report["category"]; label: string; emoji: string }[] = [
  { v: "BUG", label: "Bug / Erreur", emoji: "🐛" },
  { v: "FEATURE", label: "Suggestion", emoji: "💡" },
  { v: "ACCOUNT", label: "Compte", emoji: "🔐" },
  { v: "OTHER", label: "Autre", emoji: "❓" },
];

export function ReportPage() {
  const [list, setList] = React.useState<Report[]>([]);
  const [category, setCategory] = React.useState<Report["category"]>("BUG");
  const [subject, setSubject] = React.useState("");
  const [description, setDescription] = React.useState("");

  React.useEffect(() => setList(load()), []);

  function getEmail(): string {
    try {
      const p = JSON.parse(localStorage.getItem("sc-profile") ?? "{}");
      return p.email || "anonyme@etudiant.ma";
    } catch { return "anonyme@etudiant.ma"; }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (subject.trim().length < 3) return toast.error("Sujet trop court");
    if (description.trim().length < 10) return toast.error("Description trop courte (10+ caractères)");
    const r: Report = {
      id: crypto.randomUUID(),
      category, subject: subject.trim(), description: description.trim(),
      status: "OPEN", createdAt: new Date().toISOString(), userEmail: getEmail(),
    };
    const next = [r, ...list];
    setList(next); save(next);
    setSubject(""); setDescription("");
    toast.success("Problème signalé. L'équipe va vérifier ✅");
  }

  function remove(id: string) {
    const next = list.filter((r) => r.id !== id);
    setList(next); save(next);
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        <AlertTriangle className="text-warning" />
        <div>
          <h1 className="font-display text-[22px] font-extrabold">Signaler un problème</h1>
          <p className="text-sm text-muted-foreground">Décrivez votre problème, l'équipe d'administration le verra.</p>
        </div>
      </div>

      <form onSubmit={submit} className="rounded-2xl bg-surface-2 p-5 shadow-[0_4px_24px_rgba(79,110,247,.08)]">
        <label className="mb-2 block text-xs font-semibold">Catégorie</label>
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CATS.map((c) => (
            <button
              key={c.v}
              type="button"
              onClick={() => setCategory(c.v)}
              className={
                "rounded-lg border-[1.5px] px-3 py-2.5 text-sm font-semibold transition-colors " +
                (category === c.v ? "border-brand bg-brand-light text-brand" : "border-border bg-surface text-foreground hover:bg-brand-light")
              }
            >
              <span className="me-1">{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold">Sujet</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Résumé court du problème" maxLength={120}
            className="w-full rounded-lg border-[1.5px] border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand" />
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} maxLength={2000}
            placeholder="Décrivez le problème en détail (étapes, comportement attendu, etc.)"
            className="w-full rounded-lg border-[1.5px] border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand" />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
            Envoyer le signalement
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="mb-3 font-display text-base font-extrabold">Mes signalements</div>
        {list.length === 0 ? (
          <div className="rounded-2xl bg-surface-2 p-6 text-center text-sm text-muted-foreground">Aucun signalement pour le moment.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {list.map((r) => (
              <div key={r.id} className="rounded-2xl bg-surface-2 p-4 shadow-[0_4px_24px_rgba(79,110,247,.08)]">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <div className="font-semibold">{r.subject}</div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={r.status} />
                    <button onClick={() => remove(r.id)} aria-label="Supprimer" className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-[color-mix(in_oklab,var(--danger)_15%,transparent)] hover:text-[var(--danger)]">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">{CATS.find((c) => c.v === r.category)?.label} · {new Date(r.createdAt).toLocaleString()}</div>
                <div className="mt-2 text-sm">{r.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Report["status"] }) {
  const map = {
    OPEN: { c: "var(--warning)", l: "Ouvert" },
    IN_PROGRESS: { c: "var(--brand)", l: "En cours" },
    RESOLVED: { c: "var(--success)", l: "Résolu" },
  } as const;
  const m = map[status];
  return (
    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: `color-mix(in oklab, ${m.c} 15%, transparent)`, color: m.c }}>
      {m.l}
    </span>
  );
}