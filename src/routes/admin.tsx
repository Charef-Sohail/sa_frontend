import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  ShoppingCart,
  MessageCircle,
  Settings,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Search,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/site/Logo";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { REPORTS_KEY, type Report as UserReport } from "@/components/app/pages/Report";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

/* ---------------- Types & storage ---------------- */
type Role = "STUDENT" | "ADMIN";
type AdminUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
};

type AdminMarket = {
  id: string;
  name: string;
  city: string;
  category: string;
  active: boolean;
};

type AdminFaq = {
  id: string;
  question: string;
  answer: string;
};

const USERS_KEY = "sc-admin-users";
const MARKETS_KEY = "sc-admin-markets";
const FAQS_KEY = "sc-admin-faqs";

function loadOrSeed<T>(key: string, seed: () => T[]): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const v = seed();
      localStorage.setItem(key, JSON.stringify(v));
      return v;
    }
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function save<T>(key: string, list: T[]) {
  localStorage.setItem(key, JSON.stringify(list));
}

function seedUsers(): AdminUser[] {
  const now = new Date().toISOString();
  return [
    { id: crypto.randomUUID(), firstName: "Ahmed", lastName: "Karimi", email: "ahmed@ensias.ma", role: "STUDENT", status: "ACTIVE", createdAt: now },
    { id: crypto.randomUUID(), firstName: "Sara", lastName: "M.", email: "sara@fsr.ma", role: "STUDENT", status: "ACTIVE", createdAt: now },
    { id: crypto.randomUUID(), firstName: "Karim", lastName: "B.", email: "karim@ensa.ma", role: "STUDENT", status: "SUSPENDED", createdAt: now },
    { id: crypto.randomUUID(), firstName: "Admin", lastName: "Root", email: "admin@smartcalendar.ma", role: "ADMIN", status: "ACTIVE", createdAt: now },
  ];
}
function seedMarkets(): AdminMarket[] {
  return [
    { id: crypto.randomUUID(), name: "Marjane", city: "Rabat", category: "Hypermarché", active: true },
    { id: crypto.randomUUID(), name: "Carrefour", city: "Rabat", category: "Hypermarché", active: true },
    { id: crypto.randomUUID(), name: "BIM", city: "Rabat", category: "Discount", active: true },
    { id: crypto.randomUUID(), name: "Épicerie Hassan", city: "Rabat", category: "Épicerie", active: false },
  ];
}
function seedFaqs(): AdminFaq[] {
  return [
    { id: crypto.randomUUID(), question: "Comment ajouter une tâche ?", answer: "Allez dans Mes Tâches puis cliquez sur '+ Ajouter'." },
    { id: crypto.randomUUID(), question: "Comment importer mon emploi du temps ?", answer: "Cliquez sur 'Importer .ics' dans la page Planning." },
  ];
}

function seedReports(): UserReport[] {
  const now = Date.now();
  const mk = (mins: number) => new Date(now - mins * 60_000).toISOString();
  return [
    {
      id: crypto.randomUUID(),
      category: "BUG",
      subject: "Impossible de cocher une tâche terminée",
      description: "Quand je clique sur la case à cocher d'une tâche, rien ne se passe sur Chrome mobile.",
      status: "OPEN",
      createdAt: mk(30),
      userEmail: "ahmed@enset.ma",
    },
    {
      id: crypto.randomUUID(),
      category: "FEATURE",
      subject: "Ajouter un mode hors-ligne",
      description: "Ce serait super de pouvoir consulter mes tâches sans connexion internet dans le bus.",
      status: "IN_PROGRESS",
      createdAt: mk(60 * 5),
      userEmail: "sara@fsr.ma",
    },
    {
      id: crypto.randomUUID(),
      category: "ACCOUNT",
      subject: "Email de confirmation non reçu",
      description: "Je n'ai pas reçu l'email de confirmation après l'inscription, même dans les spams.",
      status: "OPEN",
      createdAt: mk(60 * 12),
      userEmail: "karim@ensa.ma",
    },
    {
      id: crypto.randomUUID(),
      category: "BUG",
      subject: "Importation .ics échoue",
      description: "L'import du fichier ICS de mon emploi du temps ENSET retourne une erreur 'format invalide'.",
      status: "RESOLVED",
      createdAt: mk(60 * 24 * 2),
      userEmail: "youssef@ensiat.ma",
    },
    {
      id: crypto.randomUUID(),
      category: "OTHER",
      subject: "Traduction manquante en arabe",
      description: "Plusieurs labels du dashboard ne sont pas traduits en arabe.",
      status: "OPEN",
      createdAt: mk(60 * 24 * 3),
      userEmail: "fatima@encg.ma",
    },
  ];
}

/* ---------------- Page principale ---------------- */
type Section = "dashboard" | "users" | "reports" | "markets" | "faqs" | "settings";

function AdminPage() {
  const navigate = useNavigate();
  const [section, setSection] = React.useState<Section>("dashboard");

  // protection minimale (localStorage role)
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const role = localStorage.getItem("sc-role");
    if (role !== "ADMIN") {
      // permettre l'accès libre en dev mais marquer
      localStorage.setItem("sc-role", "ADMIN");
    }
  }, []);

  function logout() {
    localStorage.removeItem("sc-role");
    toast("Déconnecté");
    navigate({ to: "/" });
  }

  const items: { key: Section; label: string; Icon: React.ComponentType<{ size?: number }> }[] = [
    { key: "dashboard", label: "Tableau de bord", Icon: LayoutDashboard },
    { key: "users", label: "Utilisateurs", Icon: Users },
    { key: "reports", label: "Signalements", Icon: AlertTriangle },
    { key: "markets", label: "Marchés", Icon: ShoppingCart },
    { key: "faqs", label: "FAQ", Icon: MessageCircle },
    { key: "settings", label: "Paramètres", Icon: Settings },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-30 flex h-15 items-center border-b border-border bg-surface-2 py-3">
        <div className="flex w-full items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-2">
            <Logo size={32} asLink />
            <span className="ms-2 inline-flex items-center gap-1 rounded-full bg-brand-light px-2.5 py-0.5 text-[11px] font-bold text-brand">
              <ShieldCheck size={12} /> ADMIN
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-brand-light hover:text-brand"
            >
              <LogOut size={15} /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="sticky top-15 hidden h-[calc(100vh-3.75rem)] w-[240px] flex-col gap-1 border-e border-border bg-surface-2 p-3 lg:flex" style={{ top: 60 }}>
          <div className="mb-3 mt-1 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Administration
          </div>
          {items.map((it) => {
            const active = section === it.key;
            return (
              <button
                key={it.key}
                onClick={() => setSection(it.key)}
                className={
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors " +
                  (active
                    ? "bg-brand-light font-bold text-brand"
                    : "text-muted-foreground hover:bg-brand-light hover:text-brand")
                }
              >
                <it.Icon size={15} />
                <span className="flex-1 text-start">{it.label}</span>
              </button>
            );
          })}

          <div className="mt-auto rounded-2xl p-4 text-white" style={{ background: "linear-gradient(135deg,var(--brand),var(--brand-2))" }}>
            <div className="text-xs font-bold">Smart Calendar SA</div>
            <div className="mt-1 text-[11px] opacity-80">Console d'administration v1.0</div>
            <Link to="/app" className="mt-3 inline-flex rounded-lg bg-white/20 px-3 py-1.5 text-[11px] font-semibold hover:bg-white/30">
              Vue étudiant →
            </Link>
          </div>
        </aside>

        <main className="flex-1 p-5 sm:p-7">
          {/* Mobile section selector */}
          <div className="mb-5 flex flex-wrap gap-2 lg:hidden">
            {items.map((it) => (
              <button
                key={it.key}
                onClick={() => setSection(it.key)}
                className={
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold " +
                  (section === it.key ? "bg-brand text-white" : "bg-surface-2 text-muted-foreground")
                }
              >
                <it.Icon size={13} /> {it.label}
              </button>
            ))}
          </div>

          {section === "dashboard" && <Dashboard onGo={setSection} />}
          {section === "users" && <UsersPanel />}
          {section === "reports" && <ReportsPanel />}
          {section === "markets" && <MarketsPanel />}
          {section === "faqs" && <FaqsPanel />}
          {section === "settings" && <SettingsPanel />}
        </main>
      </div>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */
function Dashboard({ onGo }: { onGo: (s: Section) => void }) {
  const users = loadOrSeed<AdminUser>(USERS_KEY, seedUsers);
  const markets = loadOrSeed<AdminMarket>(MARKETS_KEY, seedMarkets);
  const faqs = loadOrSeed<AdminFaq>(FAQS_KEY, seedFaqs);
  const reports: UserReport[] = loadOrSeed<UserReport>(REPORTS_KEY, seedReports);

  return (
    <div>
      <h1 className="mb-1 font-display text-[22px] font-extrabold">Tableau de bord 📊</h1>
      <p className="mb-5 text-sm text-muted-foreground">Vue d'ensemble de la plateforme.</p>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Utilisateurs" value={users.length} sub={`${users.filter((u) => u.status === "ACTIVE").length} actifs`} color="var(--brand)" onClick={() => onGo("users")} />
        <Kpi label="Signalements" value={reports.length} sub={`${reports.filter((r) => r.status === "OPEN").length} ouverts`} color="var(--danger)" onClick={() => onGo("reports")} />
        <Kpi label="Marchés" value={markets.length} sub={`${markets.filter((m) => m.active).length} actifs`} color="var(--warning)" onClick={() => onGo("markets")} />
        <Kpi label="FAQ" value={faqs.length} sub="entrées" color="var(--success)" onClick={() => onGo("faqs")} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Derniers utilisateurs">
          <ul className="flex flex-col gap-2">
            {users.slice(0, 5).map((u) => (
              <li key={u.id} className="flex items-center gap-3 rounded-lg bg-surface px-3 py-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-success text-xs font-bold text-white">
                  {u.firstName[0]}
                </span>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold">{u.firstName} {u.lastName}</div>
                  <div className="text-[11px] text-muted-foreground">{u.email}</div>
                </div>
                <RolePill role={u.role} />
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Derniers signalements">
          <ul className="flex flex-col gap-2">
            {reports.slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 rounded-lg bg-surface px-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold">{r.subject}</div>
                  <div className="text-[11px] text-muted-foreground">{r.userEmail}</div>
                </div>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{
                  background: "color-mix(in oklab, var(--warning) 15%, transparent)", color: "var(--warning)",
                }}>{r.category}</span>
              </li>
            ))}
            {reports.length === 0 && <li className="text-xs text-muted-foreground">Aucun signalement.</li>}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub, color, onClick }: { label: string; value: number; sub: string; color: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="rounded-2xl bg-surface-2 p-4 text-start shadow-[0_4px_24px_rgba(79,110,247,.08)] transition-transform hover:-translate-y-0.5">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-[26px] font-extrabold" style={{ color }}>{value}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>
    </button>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-surface-2 p-5 shadow-[0_4px_24px_rgba(79,110,247,.08)]">
      <div className="mb-3 font-display text-base font-extrabold">{title}</div>
      {children}
    </div>
  );
}

function RolePill({ role }: { role: Role }) {
  const isAdmin = role === "ADMIN";
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={{
        background: isAdmin ? "color-mix(in oklab, var(--danger) 15%, transparent)" : "var(--brand-light)",
        color: isAdmin ? "var(--danger)" : "var(--brand)",
      }}
    >
      {isAdmin ? "ADMIN" : "ÉTUDIANT"}
    </span>
  );
}


/* ---------------- Users ---------------- */
function UsersPanel() {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [q, setQ] = React.useState("");
  const [editing, setEditing] = React.useState<AdminUser | null>(null);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => setUsers(loadOrSeed(USERS_KEY, seedUsers)), []);

  function persist(next: AdminUser[]) { setUsers(next); save(USERS_KEY, next); }
  function remove(id: string) {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    persist(users.filter((u) => u.id !== id));
    toast.success("Utilisateur supprimé");
  }
  function toggleStatus(id: string) {
    persist(users.map((u) => u.id === id ? { ...u, status: u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" } : u));
  }
  function submitForm(payload: Omit<AdminUser, "id" | "createdAt">) {
    if (editing) {
      persist(users.map((u) => u.id === editing.id ? { ...u, ...payload } : u));
      toast.success("Utilisateur modifié");
    } else {
      persist([{ id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...payload }, ...users]);
      toast.success("Utilisateur ajouté");
    }
    setOpen(false); setEditing(null);
  }

  const filtered = users.filter((u) =>
    (u.firstName + " " + u.lastName + " " + u.email).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <PanelHeader
        title="Utilisateurs"
        emoji="👥"
        cta={<button onClick={() => { setEditing(null); setOpen(true); }} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"><Plus size={16} /> Ajouter</button>}
      />
      <SearchBar value={q} onChange={setQ} placeholder="Rechercher un utilisateur..." />

      <div className="overflow-x-auto rounded-2xl bg-surface-2 shadow-[0_4px_24px_rgba(79,110,247,.08)]">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-start text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <Th>Nom</Th><Th>Email</Th><Th>Rôle</Th><Th>Statut</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <Td>
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-success text-xs font-bold text-white">{u.firstName[0]}</span>
                    <span className="font-semibold">{u.firstName} {u.lastName}</span>
                  </div>
                </Td>
                <Td><span className="text-muted-foreground">{u.email}</span></Td>
                <Td><RolePill role={u.role} /></Td>
                <Td>
                  <button onClick={() => toggleStatus(u.id)} className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{
                    background: u.status === "ACTIVE" ? "color-mix(in oklab, var(--success) 15%, transparent)" : "color-mix(in oklab, var(--danger) 15%, transparent)",
                    color: u.status === "ACTIVE" ? "var(--success)" : "var(--danger)",
                  }}>
                    {u.status === "ACTIVE" ? "ACTIF" : "SUSPENDU"}
                  </button>
                </Td>
                <Td>
                  <div className="flex gap-1">
                    <IconBtn onClick={() => { setEditing(u); setOpen(true); }} label="Modifier"><Pencil size={14} /></IconBtn>
                    <IconBtn danger onClick={() => remove(u.id)} label="Supprimer"><Trash2 size={14} /></IconBtn>
                  </div>
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><Td colSpan={5}><div className="py-6 text-center text-sm text-muted-foreground">Aucun utilisateur</div></Td></tr>
            )}
          </tbody>
        </table>
      </div>

      <UserDialog
        open={open}
        initial={editing ?? undefined}
        onClose={() => { setOpen(false); setEditing(null); }}
        onSubmit={submitForm}
      />
    </div>
  );
}

function UserDialog({ open, initial, onClose, onSubmit }: {
  open: boolean; initial?: AdminUser; onClose: () => void;
  onSubmit: (u: Omit<AdminUser, "id" | "createdAt">) => void;
}) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<Role>("STUDENT");
  const [status, setStatus] = React.useState<"ACTIVE" | "SUSPENDED">("ACTIVE");

  React.useEffect(() => {
    if (!open) return;
    setFirstName(initial?.firstName ?? "");
    setLastName(initial?.lastName ?? "");
    setEmail(initial?.email ?? "");
    setRole(initial?.role ?? "STUDENT");
    setStatus(initial?.status ?? "ACTIVE");
  }, [open, initial]);

  if (!open) return null;
  return (
    <Modal title={initial ? "Modifier l'utilisateur" : "Nouvel utilisateur"} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); if (!firstName || !lastName || !email) { toast.error("Tous les champs sont requis"); return; } onSubmit({ firstName, lastName, email, role, status }); }}>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Prénom" value={firstName} onChange={setFirstName} />
          <Input label="Nom" value={lastName} onChange={setLastName} />
        </div>
        <Input label="Email" type="email" value={email} onChange={setEmail} />
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold">Rôle</label>
          <div className="grid grid-cols-2 gap-2">
            {(["STUDENT", "ADMIN"] as Role[]).map((r) => (
              <button key={r} type="button" onClick={() => setRole(r)} className={"rounded-lg border-[1.5px] px-3 py-2 text-sm font-semibold " + (role === r ? "border-brand bg-brand text-white" : "border-border bg-surface-2")}>
                {r === "ADMIN" ? "Administrateur" : "Étudiant"}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold">Statut</label>
          <div className="grid grid-cols-2 gap-2">
            {(["ACTIVE", "SUSPENDED"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setStatus(s)} className={"rounded-lg border-[1.5px] px-3 py-2 text-sm font-semibold " + (status === s ? "border-brand bg-brand text-white" : "border-border bg-surface-2")}>
                {s === "ACTIVE" ? "Actif" : "Suspendu"}
              </button>
            ))}
          </div>
        </div>
        <FormActions onCancel={onClose} submitLabel={initial ? "Enregistrer" : "Créer"} />
      </form>
    </Modal>
  );
}

/* ---------------- Reports (signalements) ---------------- */
function ReportsPanel() {
  const [list, setList] = React.useState<UserReport[]>([]);
  const [q, setQ] = React.useState("");

  React.useEffect(() => {
    setList(loadOrSeed<UserReport>(REPORTS_KEY, seedReports));
  }, []);

  function persist(next: UserReport[]) { setList(next); localStorage.setItem(REPORTS_KEY, JSON.stringify(next)); }
  function remove(id: string) {
    if (!confirm("Supprimer ce signalement ?")) return;
    persist(list.filter((r) => r.id !== id));
    toast.success("Signalement supprimé");
  }
  function setStatus(id: string, status: UserReport["status"]) {
    persist(list.map((r) => r.id === id ? { ...r, status } : r));
  }

  const filtered = list.filter((r) => (r.subject + " " + r.userEmail + " " + r.description).toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <PanelHeader title="Signalements" emoji="🚨" />
      <SearchBar value={q} onChange={setQ} placeholder="Rechercher un signalement..." />
      <div className="overflow-x-auto rounded-2xl bg-surface-2 shadow-[0_4px_24px_rgba(79,110,247,.08)]">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <Th>Sujet</Th><Th>Utilisateur</Th><Th>Catégorie</Th><Th>Date</Th><Th>Statut</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0 align-top">
                <Td>
                  <div className="font-semibold">{r.subject}</div>
                  <div className="mt-1 max-w-md text-[11px] text-muted-foreground line-clamp-2">{r.description}</div>
                </Td>
                <Td><span className="text-muted-foreground">{r.userEmail}</span></Td>
                <Td>{r.category}</Td>
                <Td><span className="text-[11px] text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</span></Td>
                <Td>
                  <select value={r.status} onChange={(e) => setStatus(r.id, e.target.value as UserReport["status"])} className="rounded-md border border-border bg-surface px-2 py-1 text-[11px]">
                    <option value="OPEN">Ouvert</option>
                    <option value="IN_PROGRESS">En cours</option>
                    <option value="RESOLVED">Résolu</option>
                  </select>
                </Td>
                <Td><IconBtn danger onClick={() => remove(r.id)} label="Supprimer"><Trash2 size={14} /></IconBtn></Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><Td colSpan={6}><div className="py-6 text-center text-sm text-muted-foreground">Aucun signalement</div></Td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Markets ---------------- */
function MarketsPanel() {
  const [markets, setMarkets] = React.useState<AdminMarket[]>([]);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AdminMarket | null>(null);
  React.useEffect(() => setMarkets(loadOrSeed(MARKETS_KEY, seedMarkets)), []);
  function persist(next: AdminMarket[]) { setMarkets(next); save(MARKETS_KEY, next); }
  function remove(id: string) { if (!confirm("Supprimer ce marché ?")) return; persist(markets.filter((m) => m.id !== id)); toast.success("Marché supprimé"); }
  function toggle(id: string) { persist(markets.map((m) => m.id === id ? { ...m, active: !m.active } : m)); }
  function submit(payload: Omit<AdminMarket, "id">) {
    if (editing) persist(markets.map((m) => m.id === editing.id ? { ...m, ...payload } : m));
    else persist([{ id: crypto.randomUUID(), ...payload }, ...markets]);
    toast.success(editing ? "Marché modifié" : "Marché ajouté");
    setOpen(false); setEditing(null);
  }
  return (
    <div>
      <PanelHeader title="Marchés" emoji="🛒"
        cta={<button onClick={() => { setEditing(null); setOpen(true); }} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"><Plus size={16} /> Ajouter</button>}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {markets.map((m) => (
          <div key={m.id} className="rounded-2xl bg-surface-2 p-4 shadow-[0_4px_24px_rgba(79,110,247,.08)]">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-display text-base font-extrabold">{m.name}</div>
              <button onClick={() => toggle(m.id)} className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{
                background: m.active ? "color-mix(in oklab, var(--success) 15%, transparent)" : "color-mix(in oklab, var(--danger) 15%, transparent)",
                color: m.active ? "var(--success)" : "var(--danger)",
              }}>
                {m.active ? "ACTIF" : "INACTIF"}
              </button>
            </div>
            <div className="text-xs text-muted-foreground">{m.category} · {m.city}</div>
            <div className="mt-3 flex justify-end gap-1">
              <IconBtn onClick={() => { setEditing(m); setOpen(true); }} label="Modifier"><Pencil size={14} /></IconBtn>
              <IconBtn danger onClick={() => remove(m.id)} label="Supprimer"><Trash2 size={14} /></IconBtn>
            </div>
          </div>
        ))}
      </div>
      <MarketDialog open={open} initial={editing ?? undefined} onClose={() => { setOpen(false); setEditing(null); }} onSubmit={submit} />
    </div>
  );
}
function MarketDialog({ open, initial, onClose, onSubmit }: {
  open: boolean; initial?: AdminMarket; onClose: () => void; onSubmit: (m: Omit<AdminMarket, "id">) => void;
}) {
  const [name, setName] = React.useState("");
  const [city, setCity] = React.useState("");
  const [category, setCategory] = React.useState("Hypermarché");
  const [active, setActive] = React.useState(true);
  React.useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? ""); setCity(initial?.city ?? ""); setCategory(initial?.category ?? "Hypermarché"); setActive(initial?.active ?? true);
  }, [open, initial]);
  if (!open) return null;
  return (
    <Modal title={initial ? "Modifier le marché" : "Nouveau marché"} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); if (!name || !city) { toast.error("Champs requis"); return; } onSubmit({ name, city, category, active }); }}>
        <Input label="Nom" value={name} onChange={setName} />
        <Input label="Ville" value={city} onChange={setCity} />
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold">Catégorie</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border-[1.5px] border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand">
            {["Hypermarché", "Supermarché", "Discount", "Épicerie", "Marché"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <label className="mb-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-[var(--brand)]" /> Actif
        </label>
        <FormActions onCancel={onClose} submitLabel={initial ? "Enregistrer" : "Créer"} />
      </form>
    </Modal>
  );
}

/* ---------------- FAQ ---------------- */
function FaqsPanel() {
  const [faqs, setFaqs] = React.useState<AdminFaq[]>([]);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AdminFaq | null>(null);
  React.useEffect(() => setFaqs(loadOrSeed(FAQS_KEY, seedFaqs)), []);
  function persist(next: AdminFaq[]) { setFaqs(next); save(FAQS_KEY, next); }
  function remove(id: string) { if (!confirm("Supprimer cette entrée ?")) return; persist(faqs.filter((f) => f.id !== id)); toast.success("Entrée supprimée"); }
  function submit(payload: Omit<AdminFaq, "id">) {
    if (editing) persist(faqs.map((f) => f.id === editing.id ? { ...f, ...payload } : f));
    else persist([{ id: crypto.randomUUID(), ...payload }, ...faqs]);
    toast.success(editing ? "Entrée modifiée" : "Entrée ajoutée");
    setOpen(false); setEditing(null);
  }
  return (
    <div>
      <PanelHeader title="FAQ" emoji="💬"
        cta={<button onClick={() => { setEditing(null); setOpen(true); }} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"><Plus size={16} /> Ajouter</button>}
      />
      <div className="flex flex-col gap-3">
        {faqs.map((f) => (
          <div key={f.id} className="rounded-2xl bg-surface-2 p-4 shadow-[0_4px_24px_rgba(79,110,247,.08)]">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div className="font-semibold text-foreground">{f.question}</div>
              <div className="flex gap-1">
                <IconBtn onClick={() => { setEditing(f); setOpen(true); }} label="Modifier"><Pencil size={14} /></IconBtn>
                <IconBtn danger onClick={() => remove(f.id)} label="Supprimer"><Trash2 size={14} /></IconBtn>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">{f.answer}</div>
          </div>
        ))}
      </div>
      <FaqDialog open={open} initial={editing ?? undefined} onClose={() => { setOpen(false); setEditing(null); }} onSubmit={submit} />
    </div>
  );
}
function FaqDialog({ open, initial, onClose, onSubmit }: {
  open: boolean; initial?: AdminFaq; onClose: () => void; onSubmit: (f: Omit<AdminFaq, "id">) => void;
}) {
  const [question, setQuestion] = React.useState("");
  const [answer, setAnswer] = React.useState("");
  React.useEffect(() => { if (!open) return; setQuestion(initial?.question ?? ""); setAnswer(initial?.answer ?? ""); }, [open, initial]);
  if (!open) return null;
  return (
    <Modal title={initial ? "Modifier l'entrée" : "Nouvelle entrée FAQ"} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); if (!question || !answer) { toast.error("Champs requis"); return; } onSubmit({ question, answer }); }}>
        <Input label="Question" value={question} onChange={setQuestion} />
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold">Réponse</label>
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4} className="w-full resize-none rounded-lg border-[1.5px] border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand" />
        </div>
        <FormActions onCancel={onClose} submitLabel={initial ? "Enregistrer" : "Créer"} />
      </form>
    </Modal>
  );
}

/* ---------------- Settings ---------------- */
function SettingsPanel() {
  function reset(key: string, label: string) {
    if (!confirm(`Réinitialiser ${label} ?`)) return;
    localStorage.removeItem(key);
    toast.success(`${label} réinitialisé. Rechargez la page.`);
  }
  return (
    <div>
      <PanelHeader title="Paramètres" emoji="⚙️" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          { k: USERS_KEY, l: "Utilisateurs" },
          { k: REPORTS_KEY, l: "Signalements" },
          { k: MARKETS_KEY, l: "Marchés" },
          { k: FAQS_KEY, l: "FAQ" },
        ].map((x) => (
          <div key={x.k} className="flex items-center justify-between rounded-2xl bg-surface-2 p-4 shadow-[0_4px_24px_rgba(79,110,247,.08)]">
            <div>
              <div className="font-semibold">{x.l}</div>
              <div className="text-xs text-muted-foreground">Réinitialiser les données locales</div>
            </div>
            <button onClick={() => reset(x.k, x.l)} className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-[var(--danger)] hover:bg-[color-mix(in_oklab,var(--danger)_10%,transparent)]">
              Réinitialiser
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- UI helpers ---------------- */
function PanelHeader({ title, emoji, cta }: { title: string; emoji?: string; cta?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-display text-[22px] font-extrabold">{title} {emoji}</h1>
      {cta}
    </div>
  );
}
function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="mb-4 relative max-w-md">
      <Search size={14} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-lg border-[1.5px] border-border bg-surface-2 px-4 py-2 ps-9 text-sm outline-none focus:border-brand" />
    </div>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-start font-semibold">{children}</th>;
}
function Td({ children, colSpan }: { children: React.ReactNode; colSpan?: number }) {
  return <td className="px-4 py-3 align-middle" colSpan={colSpan}>{children}</td>;
}
function IconBtn({ children, onClick, label, danger }: { children: React.ReactNode; onClick: () => void; label: string; danger?: boolean }) {
  return (
    <button onClick={onClick} aria-label={label} className={"inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground " + (danger ? "hover:bg-[color-mix(in_oklab,var(--danger)_15%,transparent)] hover:text-[var(--danger)]" : "hover:bg-brand-light hover:text-brand")}>
      {children}
    </button>
  );
}
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-[520px] rounded-3xl bg-surface-2 p-6 shadow-[0_20px_60px_rgba(0,0,0,.3)]" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-5 font-display text-xl font-extrabold">{title}</h2>
        {children}
      </div>
    </div>
  );
}
function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-xs font-semibold">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border-[1.5px] border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand" />
    </div>
  );
}
function FormActions({ onCancel, submitLabel }: { onCancel: () => void; submitLabel: string }) {
  return (
    <div className="mt-2 flex items-center justify-end gap-3">
      <button type="button" onClick={onCancel} className="rounded-lg border border-border bg-surface-2 px-5 py-2.5 text-sm font-semibold hover:bg-brand-light">Annuler</button>
      <button type="submit" className="rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">{submitLabel}</button>
    </div>
  );
}