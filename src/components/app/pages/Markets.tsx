import { Plus } from "lucide-react";
import { useI18n } from "@/contexts/AppProviders";
import { toast } from "sonner";

export function Markets() {
  const { t } = useI18n();
  const stores = [
    { name: "Marjane", price: "6.50", dist: "320m", best: true, bg: "color-mix(in oklab, var(--success) 14%, transparent)", color: "var(--success)" },
    { name: "Carrefour", price: "7.20", dist: "600m", note: "Moy. Google", bg: "var(--surface)" },
    { name: "BIM", price: "7.00", dist: "450m", bg: "var(--surface)" },
    { name: "Épicerie", price: "8.00", dist: "150m", expensive: true, bg: "color-mix(in oklab, var(--warning) 14%, transparent)", color: "var(--warning)" },
  ];
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[22px] font-extrabold">{t("markets.title")} 🛒</h1>
        <button
          onClick={() => toast.success(t("toast.geoloc"))}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          {t("markets.near")}
        </button>
      </div>

      <div className="mb-5 rounded-2xl bg-surface-2 p-5 shadow-[0_4px_24px_rgba(79,110,247,.08)]">
        <div className="mb-4 text-sm font-bold">
          {t("markets.compare")} · <span className="text-brand">Lait 1L</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {stores.map((s) => (
            <div
              key={s.name}
              className="rounded-xl p-3 text-center"
              style={{
                background: s.bg,
                border: s.best ? "2px solid var(--success)" : undefined,
              }}
            >
              <div className="text-[10px] text-muted-foreground">{s.name}</div>
              <div className="font-display text-[20px] font-extrabold" style={{ color: s.color }}>
                {s.price}
              </div>
              <div className="text-[10px] text-muted-foreground">MAD · {s.dist}</div>
              {s.best && <div className="mt-1.5 text-[10px] font-bold text-success">{t("markets.best")}</div>}
              {s.expensive && <div className="mt-1.5 text-[10px] text-warning">{t("markets.expensive")}</div>}
              {s.note && <div className="mt-1.5 text-[10px] text-muted-foreground">{s.note}</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MarketCard name="Marjane Agdal" type="Supermarché · 320m" stars="★★★★☆" reviews={128} avg="7.2 MAD" recos={3} />
        <MarketCard name="Carrefour Market" type="Supermarché · 600m" stars="★★★★★" reviews={204} avg="8.1 MAD" recos={7} />
        <button
          onClick={() => toast(t("markets.add.review"))}
          className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface-2 text-center"
        >
          <Plus size={28} className="text-brand" strokeWidth={1.5} />
          <div className="text-[13px] font-bold text-brand">{t("markets.add.review")}</div>
          <div className="text-[11px] text-muted-foreground">Prix · Produit · Site · Localisation</div>
        </button>
      </div>
    </div>
  );
}

function MarketCard({
  name, type, stars, reviews, avg, recos,
}: { name: string; type: string; stars: string; reviews: number; avg: string; recos: number }) {
  const { t } = useI18n();
  return (
    <div className="rounded-2xl bg-surface-2 p-4 shadow-[0_4px_24px_rgba(79,110,247,.08)]">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-bold">{name}</div>
          <div className="text-[11px] text-muted-foreground">{type}</div>
        </div>
        <span className="rounded bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
          {t("markets.open")}
        </span>
      </div>
      <div className="mb-2 text-[11px] text-warning">
        {stars} <span className="text-muted-foreground">({reviews})</span>
      </div>
      <div className="mb-2 text-[11px] font-semibold text-brand">Prix moyen Google: {avg}</div>
      <div className="mb-3 text-[11px] text-muted-foreground">{recos} recommandations étudiants</div>
      <button
        onClick={() => toast(name)}
        className="w-full rounded-lg border-2 border-brand px-3 py-2 text-[13px] font-semibold text-brand hover:bg-brand-light"
      >
        {t("markets.reviews")}
      </button>
    </div>
  );
}