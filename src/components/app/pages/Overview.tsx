import { useI18n } from "@/contexts/AppProviders";
import { toast } from "sonner";
import type { SubPage } from "../AppShell";

export function Overview({ go }: { go: (p: SubPage) => void }) {
  const { t } = useI18n();
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">{t("app.greeting")}, Ahmed 👋</h1>
          <p className="text-sm text-muted-foreground">
            Lundi 9 Juin 2025 · <span className="font-semibold text-success">Motivé 🚀</span>
          </p>
        </div>
        <button
          onClick={() => toast.success(t("toast.task.added"))}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          {t("app.new.task")}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label={t("app.today.tasks")} value="5" suffix="/ 8" progress={62} sub={`62% ${t("app.completed")}`} color="var(--brand)" />
        <Kpi label={t("app.today.studytime")} value="4h30" sub="↑ +45 min" color="var(--success)" />
        <Kpi label={t("app.today.score")} value="87" suffix="/100" sub="↑ En hausse" color="var(--brand)" />
        <Kpi label={t("app.today.streak")} value="12" suffix="jours" sub="🔥 Excellent" color="var(--warning)" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-5">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div className="font-display text-base font-extrabold">{t("app.today.tasks")}</div>
              <button onClick={() => go("tasks")} className="text-[13px] font-semibold text-brand hover:underline">
                {t("app.see.all")}
              </button>
            </div>
            <div className="flex flex-col gap-2.5">
              <TaskItem done title="Rapport TP Algorithmique" sub="09:00 · 2h · Terminée" badge="Cours" tone="success" />
              <TaskItem title="Révision Bases de données" sub="14:00 · 3h · En cours" badge="Examen" tone="warning" />
              <TaskItem title="Projet React – Maquette" sub="17:00 · 2h · Urgente" badge="Projet" tone="danger" />
            </div>
          </Card>

          <Card>
            <div className="mb-4 font-display text-base font-extrabold">Activité hebdomadaire</div>
            <div className="grid grid-cols-7 gap-2">
              {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => {
                const h = [70, 50, 85, 40, 65, 30, 20][i];
                return (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div className="flex h-24 w-full items-end overflow-hidden rounded-lg bg-surface">
                      <div
                        className="w-full rounded-lg"
                        style={{ height: `${h}%`, background: "linear-gradient(180deg,var(--brand),var(--success))" }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">{d}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <div className="font-display text-sm font-extrabold">Juin 2025</div>
              <div className="flex gap-1">
                <button className="h-7 w-7 rounded bg-surface text-brand">‹</button>
                <button className="h-7 w-7 rounded bg-surface text-brand">›</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {["Lu","Ma","Me","Je","Ve","Sa","Di"].map((d) => (
                <div key={d} className="py-1 text-[10px] font-bold text-muted-foreground">{d}</div>
              ))}
              {Array.from({ length: 30 }).map((_, i) => {
                const d = i + 1;
                const today = d === 9;
                const has = [2, 5, 9, 12, 17, 20, 25].includes(d);
                return (
                  <div
                    key={d}
                    className={
                      "relative mx-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-xs transition-colors " +
                      (today
                        ? "bg-brand font-bold text-white"
                        : "hover:bg-brand-light hover:text-brand")
                    }
                  >
                    {d}
                    {has && !today && (
                      <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-success" />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <div className="mb-3 font-display text-sm font-extrabold">{t("app.upcoming")}</div>
            <div className="flex flex-col gap-2.5">
              <UpcomingItem color="var(--danger)" title="Examen BDD" date={`${t("app.tomorrow")} · 09:00`} badge={t("app.urgent")} />
              <UpcomingItem color="var(--success)" title="Rendu Projet React" date="Mer 11 · 23:59" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl bg-surface-2 p-5 shadow-[0_4px_24px_rgba(79,110,247,.08)]">{children}</div>;
}

function Kpi({
  label, value, suffix, progress, sub, color,
}: { label: string; value: string; suffix?: string; progress?: number; sub?: string; color: string }) {
  return (
    <div className="rounded-2xl bg-surface-2 p-4 shadow-[0_4px_24px_rgba(79,110,247,.08)]">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-[26px] font-extrabold leading-tight" style={{ color }}>
        {value}
        {suffix && <span className="ms-1 text-sm font-medium text-muted-foreground">{suffix}</span>}
      </div>
      {progress !== undefined && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg,var(--brand),var(--success))" }}
          />
        </div>
      )}
      {sub && <div className="mt-1.5 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function TaskItem({
  title, sub, badge, tone, done,
}: { title: string; sub: string; badge: string; tone: "success" | "warning" | "danger"; done?: boolean }) {
  const bgs = {
    success: "color-mix(in oklab, var(--success) 12%, transparent)",
    warning: "color-mix(in oklab, var(--warning) 14%, transparent)",
    danger: "color-mix(in oklab, var(--danger) 12%, transparent)",
  } as const;
  const colors = {
    success: "var(--success)",
    warning: "var(--warning)",
    danger: "var(--danger)",
  } as const;
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-3" style={{ background: bgs[tone], borderInlineStart: `3px solid ${colors[tone]}` }}>
      <span
        className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full"
        style={{
          background: done ? colors[tone] : "transparent",
          border: done ? "none" : `2px solid ${colors[tone]}`,
        }}
      >
        {done && <span className="text-[10px] text-white">✓</span>}
      </span>
      <div className="flex-1">
        <div className={"text-[13px] font-semibold " + (done ? "text-muted-foreground line-through" : "text-foreground")}>{title}</div>
        <div className="text-[11px] text-muted-foreground">{sub}</div>
      </div>
      <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: bgs[tone], color: colors[tone] }}>
        {badge}
      </span>
    </div>
  );
}

function UpcomingItem({ color, title, date, badge }: { color: string; title: string; date: string; badge?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-9 w-1 rounded" style={{ background: color }} />
      <div className="flex-1">
        <div className="text-xs font-bold">{title}</div>
        <div className="text-[11px] text-muted-foreground">{date}</div>
      </div>
      {badge && (
        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: `color-mix(in oklab, ${color} 15%, transparent)`, color }}>
          {badge}
        </span>
      )}
    </div>
  );
}