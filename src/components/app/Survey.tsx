import * as React from "react";
import { X } from "lucide-react";
import { useI18n } from "@/contexts/AppProviders";
import { toast } from "sonner";

/** Payload exact attendu par l'API */
export type SurveyPayload = {
  wakeUpTime: string;            // "HH:MM"
  sleepTime: string;             // "HH:MM"
  peakProductivity: "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT";
  maxFocusMinutes: 30 | 60 | 120 | 180;
  defaultUnavailableDays: string[]; // ex: "MONDAY_MORNING"
};

const PEAK_OPTIONS: { v: SurveyPayload["peakProductivity"]; emoji: string; label: string; range: string }[] = [
  { v: "MORNING", emoji: "🌅", label: "Matin", range: "08h00 — 12h00" },
  { v: "AFTERNOON", emoji: "☀️", label: "Après-midi", range: "14h00 — 18h00" },
  { v: "EVENING", emoji: "🌆", label: "Soirée", range: "19h00 — 23h00" },
  { v: "NIGHT", emoji: "🦉", label: "Nuit", range: "23h00 — 04h00" },
];

const FOCUS_OPTIONS: { v: SurveyPayload["maxFocusMinutes"]; emoji: string; label: string; sub: string }[] = [
  { v: 30, emoji: "🍅", label: "30 minutes", sub: "Pomodoro" },
  { v: 60, emoji: "⏳", label: "1 heure", sub: "Standard" },
  { v: 120, emoji: "🧠", label: "2 heures", sub: "Deep work" },
  { v: 180, emoji: "🦾", label: "3h ou plus", sub: "Marathon" },
];

const DAYS = [
  { code: "MONDAY", label: "Lun" },
  { code: "TUESDAY", label: "Mar" },
  { code: "WEDNESDAY", label: "Mer" },
  { code: "THURSDAY", label: "Jeu" },
  { code: "FRIDAY", label: "Ven" },
  { code: "SATURDAY", label: "Sam" },
  { code: "SUNDAY", label: "Dim" },
];
const SLOTS = [
  { code: "MORNING", label: "Matin" },
  { code: "AFTERNOON", label: "Après-midi" },
];

export function Survey({ onComplete }: { onComplete: () => void }) {
  const { t } = useI18n();
  const [step, setStep] = React.useState(0);

  const [wakeUpTime, setWakeUpTime] = React.useState("07:30");
  const [sleepTime, setSleepTime] = React.useState("23:00");
  const [peakProductivity, setPeakProductivity] = React.useState<SurveyPayload["peakProductivity"]>("MORNING");
  const [maxFocusMinutes, setMaxFocusMinutes] = React.useState<SurveyPayload["maxFocusMinutes"]>(60);
  const [unavailable, setUnavailable] = React.useState<Set<string>>(new Set());

  const total = 4;
  const progress = ((step + 1) / total) * 100;

  function toggleSlot(code: string) {
    setUnavailable((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  function buildPayload(): SurveyPayload {
    return {
      wakeUpTime,
      sleepTime,
      peakProductivity,
      maxFocusMinutes,
      defaultUnavailableDays: Array.from(unavailable),
    };
  }

  function finish() {
    const payload = buildPayload();
    if (typeof window !== "undefined") {
      localStorage.setItem("sc-survey-payload", JSON.stringify(payload));
      localStorage.setItem("sc-onboarding-completed", "1");
      localStorage.removeItem("sc-just-signed-up");
    }
    toast.success(t("survey.done"));
    onComplete();
  }

  function skip() {
    if (typeof window !== "undefined") {
      localStorage.setItem("sc-onboarding-completed", "1");
      localStorage.removeItem("sc-just-signed-up");
    }
    onComplete();
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-[640px] rounded-3xl bg-surface-2 p-6 shadow-[0_20px_60px_rgba(0,0,0,.3)] sm:p-8">
        <button
          onClick={skip}
          aria-label="Skip"
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-brand-light hover:text-brand"
        >
          <X size={16} />
        </button>

        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>{t("survey.step")} {step + 1} {t("survey.of")} {total}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg,var(--brand),var(--success))" }}
            />
          </div>
        </div>

        <h2 className="mb-1 font-display text-2xl font-extrabold">{t("survey.title")}</h2>
        <p className="mb-7 text-sm text-muted-foreground">{t("survey.subtitle")}</p>

        <div className="min-h-[280px]">
          {step === 0 && (
            <Step
              title="Pour adapter votre planning, quelles sont vos heures habituelles de réveil et de coucher ?"
              hint="L'IA bloquera mathématiquement votre nuit dans le planning."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">⏰ Heure de réveil</label>
                  <input
                    type="time"
                    value={wakeUpTime}
                    onChange={(e) => setWakeUpTime(e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-border bg-surface px-4 py-3 text-sm outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">🌙 Heure de coucher</label>
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-border bg-surface px-4 py-3 text-sm outline-none focus:border-brand"
                  />
                </div>
              </div>
            </Step>
          )}

          {step === 1 && (
            <Step
              title="À quel moment de la journée vous sentez-vous le plus efficace et concentré ?"
              hint="Les tâches difficiles seront placées en priorité dans ce créneau."
            >
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {PEAK_OPTIONS.map((o) => {
                  const active = peakProductivity === o.v;
                  return (
                    <button
                      key={o.v}
                      onClick={() => setPeakProductivity(o.v)}
                      className={
                        "flex flex-col items-start gap-1 rounded-xl border-[1.5px] p-4 text-left transition-all " +
                        (active
                          ? "border-brand bg-brand-light text-brand"
                          : "border-border bg-surface-2 text-foreground hover:border-brand hover:bg-brand-light/50")
                      }
                    >
                      <span className="text-2xl">{o.emoji}</span>
                      <span className="text-sm font-bold">{o.label}</span>
                      <span className="text-[11px] text-muted-foreground">{o.range}</span>
                    </button>
                  );
                })}
              </div>
            </Step>
          )}

          {step === 2 && (
            <Step
              title="Combien de temps maximum pouvez-vous travailler sur une tâche difficile sans pause ?"
              hint="L'IA découpera automatiquement les longues tâches en blocs adaptés."
            >
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {FOCUS_OPTIONS.map((o) => {
                  const active = maxFocusMinutes === o.v;
                  return (
                    <button
                      key={o.v}
                      onClick={() => setMaxFocusMinutes(o.v)}
                      className={
                        "flex items-center gap-3 rounded-xl border-[1.5px] p-4 text-left transition-all " +
                        (active
                          ? "border-brand bg-brand-light text-brand"
                          : "border-border bg-surface-2 text-foreground hover:border-brand hover:bg-brand-light/50")
                      }
                    >
                      <span className="text-2xl">{o.emoji}</span>
                      <div className="flex-1">
                        <div className="text-sm font-bold">{o.label}</div>
                        <div className="text-[11px] text-muted-foreground">{o.sub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Step>
          )}

          {step === 3 && (
            <Step
              title="Avez-vous des créneaux où vous êtes systématiquement indisponible chaque semaine ?"
              hint="Cliquez sur les cases pour les marquer comme indisponibles."
            >
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-1 text-center text-xs">
                  <thead>
                    <tr>
                      <th></th>
                      {DAYS.map((d) => (
                        <th key={d.code} className="pb-1 text-[11px] font-semibold text-muted-foreground">
                          {d.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SLOTS.map((slot) => (
                      <tr key={slot.code}>
                        <td className="pe-2 text-end text-[11px] font-semibold text-muted-foreground">
                          {slot.label}
                        </td>
                        {DAYS.map((d) => {
                          const code = `${d.code}_${slot.code}`;
                          const off = unavailable.has(code);
                          return (
                            <td key={code}>
                              <button
                                onClick={() => toggleSlot(code)}
                                className={
                                  "h-10 w-full rounded-lg border-[1.5px] text-[10px] font-semibold transition-all " +
                                  (off
                                    ? "border-[var(--danger)] bg-[color-mix(in_oklab,var(--danger)_18%,transparent)] text-[var(--danger)]"
                                    : "border-border bg-surface-2 text-muted-foreground hover:border-brand hover:bg-brand-light")
                                }
                                aria-pressed={off}
                              >
                                {off ? "✕" : "—"}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {unavailable.size > 0 && (
                  <div className="mt-3 text-[11px] text-muted-foreground">
                    {unavailable.size} créneau(x) indisponible(s)
                  </div>
                )}
              </div>
            </Step>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="rounded-lg border border-border bg-surface-2 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-brand-light disabled:opacity-40 disabled:hover:bg-surface-2"
          >
            {t("survey.prev")}
          </button>
          {step < total - 1 ? (
            <button
              onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
              className="rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              {t("survey.next")} →
            </button>
          ) : (
            <button
              onClick={finish}
              className="rounded-lg bg-success px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              {t("survey.finish")}
            </button>
          )}
        </div>
        <button
          onClick={skip}
          className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
        >
          {t("survey.skip")}
        </button>
      </div>
    </div>
  );
}

function Step({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1 font-display text-lg font-bold">{title}</h3>
      {hint && <p className="mb-4 text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}
