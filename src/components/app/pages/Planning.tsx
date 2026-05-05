import * as React from "react";
import { Upload, Sparkles, Check } from "lucide-react";
import { useI18n } from "@/contexts/AppProviders";
import { toast } from "sonner";

export function Planning() {
  const { t } = useI18n();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [imported, setImported] = React.useState<{ name: string; count: number; events: { summary: string; start: string }[] } | null>(null);

  function parseICS(text: string) {
    const events: { summary: string; start: string }[] = [];
    const blocks = text.split(/BEGIN:VEVENT/).slice(1);
    for (const b of blocks) {
      const end = b.indexOf("END:VEVENT");
      const body = end >= 0 ? b.slice(0, end) : b;
      const sm = body.match(/SUMMARY[^:]*:([^\r\n]+)/);
      const dt = body.match(/DTSTART[^:]*:([^\r\n]+)/);
      events.push({ summary: sm?.[1]?.trim() ?? "(sans titre)", start: dt?.[1]?.trim() ?? "" });
    }
    return events;
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/\.ics$/i.test(f.name)) {
      toast.error("Veuillez sélectionner un fichier .ics");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const events = parseICS(String(reader.result || ""));
      setImported({ name: f.name, count: events.length, events: events.slice(0, 10) });
      toast.success(`${events.length} événement(s) importé(s) depuis ${f.name}`);
    };
    reader.readAsText(f);
  }

  const slots = [
    { time: "08:00", title: "Révision Algorithmique", sub: "2h · Moyen", tone: "neutral" },
    { time: "10:00", title: "✅ Rapport TP", sub: "Terminée", tone: "success" },
    { time: "14:00", title: "📚 Révision BDD", sub: "3h · Difficile · Examen demain", tone: "brand" },
    { time: "17:00", title: "🎨 Projet React", sub: "Urgent · Deadline: 11 Juin", tone: "danger" },
    { time: "19:00", title: "Lecture article ML", sub: "1h · Détente", tone: "warning" },
  ];
  const palette = {
    neutral: { bg: "var(--surface)", border: "transparent" },
    success: { bg: "color-mix(in oklab, var(--success) 12%, transparent)", border: "var(--success)" },
    brand: { bg: "var(--brand-light)", border: "var(--brand)" },
    danger: { bg: "color-mix(in oklab, var(--danger) 12%, transparent)", border: "var(--danger)" },
    warning: { bg: "color-mix(in oklab, var(--warning) 14%, transparent)", border: "var(--warning)" },
  } as const;
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[22px] font-extrabold">{t("planning.title")} 📅</h1>
        <button
          onClick={() => toast.success(t("toast.optimized"))}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          {t("planning.optimize")}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        <div className="rounded-2xl bg-surface-2 p-5 shadow-[0_4px_24px_rgba(79,110,247,.08)]">
          <div className="mb-4 flex flex-wrap gap-2">
            <button className="rounded-lg bg-brand px-3.5 py-1.5 text-[13px] font-semibold text-white">
              {t("planning.today")}
            </button>
            <button className="rounded-lg px-3.5 py-1.5 text-[13px] font-semibold text-muted-foreground hover:bg-brand-light hover:text-brand">
              {t("planning.week")}
            </button>
            <button className="rounded-lg px-3.5 py-1.5 text-[13px] font-semibold text-muted-foreground hover:bg-brand-light hover:text-brand">
              {t("planning.month")}
            </button>
          </div>
          <div className="mb-2.5 text-xs font-bold text-muted-foreground">Lundi 9 Juin 2025</div>
          <div className="flex flex-col">
            {slots.map((s) => {
              const p = palette[s.tone as keyof typeof palette];
              return (
                <div key={s.time} className="flex items-stretch gap-3 py-1.5">
                  <div className="w-10 flex-shrink-0 pt-1 text-end text-[11px] font-semibold text-muted-foreground">
                    {s.time}
                  </div>
                  <div
                    className="flex-1 rounded-xl px-4 py-2.5"
                    style={{ background: p.bg, borderInlineStart: `3px solid ${p.border}` }}
                  >
                    <div className="text-[13px] font-semibold">{s.title}</div>
                    <div className="text-[11px] text-muted-foreground">{s.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-surface-2 p-5 shadow-[0_4px_24px_rgba(79,110,247,.08)]">
            <div className="mb-3 text-sm font-bold">{t("planning.import")}</div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-surface px-4 py-5 transition-colors hover:border-brand"
            >
              <Upload size={24} className="text-brand" />
              <span className="text-xs font-semibold text-brand">Importer .ics</span>
              <span className="text-[11px] text-muted-foreground">Glissez ou cliquez pour parcourir</span>
            </button>
            <input ref={fileRef} type="file" accept=".ics,text/calendar" className="hidden" onChange={onPickFile} />
            {imported && (
              <div className="mt-3 rounded-lg bg-success/10 p-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-success">
                  <Check size={14} /> {imported.count} événement(s) — {imported.name}
                </div>
                {imported.events.length > 0 && (
                  <ul className="mt-2 max-h-40 space-y-1 overflow-auto text-[11px] text-muted-foreground">
                    {imported.events.map((ev, i) => (
                      <li key={i} className="truncate">• <span className="text-foreground">{ev.summary}</span> {ev.start && <span className="opacity-70">— {ev.start}</span>}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <div className="rounded-2xl bg-surface-2 p-5 shadow-[0_4px_24px_rgba(79,110,247,.08)]">
            <div className="mb-3 text-sm font-bold">{t("planning.week")}</div>
            <div className="flex flex-col gap-2 text-xs">
              {[
                { day: "Lundi", info: "4 tâches", strong: true },
                { day: "Mardi", info: "Examen BDD", danger: true },
                { day: "Mercredi", info: "2 tâches" },
                { day: "Jeudi", info: "3 tâches" },
                { day: "Vendredi", info: "1 tâche" },
              ].map((d) => (
                <div key={d.day} className="flex justify-between">
                  <span className={d.strong ? "font-semibold text-brand" : ""}>{d.day}</span>
                  <span className={d.danger ? "font-semibold text-danger" : "text-muted-foreground"}>{d.info}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-brand-light p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand">
              <Sparkles size={14} /> Optimisé par OR-Tools en 2s
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}