import * as React from "react";
import { useI18n } from "@/contexts/AppProviders";
import { toast } from "sonner";

type Msg = { from: "bot" | "user"; text: string };

export function Faq() {
  const { t } = useI18n();
  const [input, setInput] = React.useState("");
  const [msgs, setMsgs] = React.useState<Msg[]>([
    { from: "bot", text: t("faq.welcome") },
    { from: "user", text: "Comment ajouter une tâche ?" },
    { from: "bot", text: t("faq.bot.reply") },
  ]);

  function send(text?: string) {
    const value = (text ?? input).trim();
    if (!value) return;
    setMsgs((m) => [...m, { from: "user", text: value }]);
    setInput("");
    toast(t("toast.faq.sent"));
    setTimeout(() => {
      setMsgs((m) => [...m, { from: "bot", text: t("faq.bot.reply") }]);
    }, 600);
  }

  const questions = [
    "Comment ajouter une tâche ?",
    "Comment importer un .ics ?",
    "Planification automatique ?",
    "Ajouter un avis marché ?",
    "Activer les notifications ?",
  ];

  return (
    <div>
      <h1 className="mb-5 font-display text-[22px] font-extrabold">{t("faq.title")} 💬</h1>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]" style={{ minHeight: 520 }}>
        <div className="overflow-y-auto rounded-2xl bg-surface-2 p-4 shadow-[0_4px_24px_rgba(79,110,247,.08)]">
          <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {t("faq.questions")}
          </div>
          <div className="flex flex-col gap-1">
            {questions.map((q, i) => (
              <button
                key={q}
                onClick={() => send(q)}
                className={
                  "rounded-lg px-3 py-2 text-start text-[13px] transition-colors " +
                  (i === 0
                    ? "bg-brand-light font-semibold text-brand"
                    : "text-muted-foreground hover:bg-surface")
                }
              >
                {q}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col rounded-2xl bg-surface-2 p-4 shadow-[0_4px_24px_rgba(79,110,247,.08)]">
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-3">
            {msgs.map((m, i) =>
              m.from === "bot" ? (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-light text-sm">
                    🤖
                  </span>
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-brand-light px-4 py-2.5 text-[13px]">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex items-start justify-end gap-2.5">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-brand px-4 py-2.5 text-[13px] text-white">
                    {m.text}
                  </div>
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-success text-xs font-bold text-white">
                    A
                  </span>
                </div>
              ),
            )}
          </div>
          <div className="mt-2 flex gap-2 border-t border-border pt-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={t("faq.placeholder")}
              className="flex-1 rounded-lg border-[1.5px] border-border bg-surface px-4 py-2.5 text-[13px] outline-none transition-colors focus:border-brand"
            />
            <button
              onClick={() => send()}
              className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              {t("faq.send")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}