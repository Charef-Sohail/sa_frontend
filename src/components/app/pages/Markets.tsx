import * as React from "react";
import { Plus, Search, MapPin, Navigation, X, Star } from "lucide-react";
import { useI18n } from "@/contexts/AppProviders";
import { toast } from "sonner";

type Store = {
  id: string;
  name: string;
  product: string;
  price: number; // MAD
  distance: number; // meters
  city: string;
  rating: number;
  lat: number;
  lng: number;
};

const CATALOG: Store[] = [
  { id: "1", name: "Marjane Agdal", product: "Lait 1L", price: 6.5, distance: 320, city: "Rabat", rating: 4.4, lat: 33.9985, lng: -6.8498 },
  { id: "2", name: "Carrefour Market", product: "Lait 1L", price: 7.2, distance: 600, city: "Rabat", rating: 4.6, lat: 33.9716, lng: -6.8498 },
  { id: "3", name: "BIM", product: "Lait 1L", price: 7.0, distance: 450, city: "Rabat", rating: 4.1, lat: 34.0091, lng: -6.8326 },
  { id: "4", name: "Épicerie Hassan", product: "Lait 1L", price: 8.0, distance: 150, city: "Rabat", rating: 3.8, lat: 33.9931, lng: -6.8498 },
  { id: "5", name: "Marjane Hay Riad", product: "Pain 400g", price: 3.0, distance: 1500, city: "Rabat", rating: 4.5, lat: 33.9550, lng: -6.8730 },
  { id: "6", name: "Aswak Assalam", product: "Riz 1kg", price: 14.5, distance: 2200, city: "Rabat", rating: 4.2, lat: 33.9700, lng: -6.8900 },
  { id: "7", name: "Acima", product: "Huile 1L", price: 22.0, distance: 800, city: "Rabat", rating: 4.0, lat: 34.0010, lng: -6.8400 },
  { id: "8", name: "Hanouty Karim", product: "Lait 1L", price: 7.5, distance: 200, city: "Rabat", rating: 3.9, lat: 33.9960, lng: -6.8470 },
];

export function Markets() {
  const { t } = useI18n();
  const [product, setProduct] = React.useState("Lait 1L");
  const [budget, setBudget] = React.useState<number>(10);
  const [results, setResults] = React.useState<Store[]>(CATALOG.filter((s) => s.product.toLowerCase().includes("lait") && s.price <= 10));
  const [selected, setSelected] = React.useState<Store | null>(null);
  const [reviewFor, setReviewFor] = React.useState<string | null>(null);
  const [reviews, setReviews] = React.useState<Record<string, { name: string; rating: number; comment: string; at: string }[]>>({});

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("sc-market-reviews");
      if (raw) setReviews(JSON.parse(raw));
    } catch {}
  }, []);

  function addReview(market: string, rating: number, comment: string) {
    setReviews((prev) => {
      const next = {
        ...prev,
        [market]: [
          ...(prev[market] ?? []),
          { name: "Vous", rating, comment, at: new Date().toLocaleDateString() },
        ],
      };
      localStorage.setItem("sc-market-reviews", JSON.stringify(next));
      return next;
    });
    toast.success("Avis ajouté ✅");
  }

  function search(e?: React.FormEvent) {
    e?.preventDefault();
    const r = CATALOG.filter(
      (s) => s.product.toLowerCase().includes(product.toLowerCase()) && s.price <= budget,
    ).sort((a, b) => a.price - b.price);
    setResults(r);
    setSelected(null);
    if (r.length === 0) toast.error("Aucun marché ne correspond à votre budget.");
    else toast.success(`${r.length} marché(s) trouvé(s)`);
  }

  const nearest = results.length ? [...results].sort((a, b) => a.distance - b.distance)[0] : null;
  const cheapest = results.length ? results[0] : null;

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

      {/* Search by product + budget */}
      <form onSubmit={search} className="mb-5 rounded-2xl bg-surface-2 p-5 shadow-[0_4px_24px_rgba(79,110,247,.08)]">
        <div className="mb-3 text-sm font-bold">🔍 Rechercher un produit selon votre budget</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_200px_auto]">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="Ex: Lait 1L, Pain, Riz..."
              className="w-full rounded-lg border-[1.5px] border-border bg-surface px-4 py-2.5 ps-9 text-sm outline-none focus:border-brand"
            />
          </div>
          <div className="relative">
            <input
              type="number"
              min={0}
              step="0.5"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value) || 0)}
              placeholder="Budget max"
              className="w-full rounded-lg border-[1.5px] border-border bg-surface px-4 py-2.5 pe-12 text-sm outline-none focus:border-brand"
            />
            <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">MAD</span>
          </div>
          <button type="submit" className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
            Rechercher
          </button>
        </div>

        {results.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {cheapest && (
              <div className="rounded-xl border-2 border-success/30 bg-[color-mix(in_oklab,var(--success)_8%,transparent)] p-3">
                <div className="text-[11px] font-bold uppercase text-success">⭐ Meilleur prix</div>
                <div className="text-sm font-bold">{cheapest.name}</div>
                <div className="text-xs text-muted-foreground">{cheapest.price} MAD · {cheapest.distance} m</div>
              </div>
            )}
            {nearest && (
              <div className="rounded-xl border-2 border-brand/30 bg-brand-light p-3">
                <div className="text-[11px] font-bold uppercase text-brand">📍 Le plus proche</div>
                <div className="text-sm font-bold">{nearest.name}</div>
                <div className="text-xs text-muted-foreground">{nearest.price} MAD · {nearest.distance} m</div>
              </div>
            )}
          </div>
        )}

        {/* Results list */}
        {results.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((s) => {
              const active = selected?.id === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelected(s)}
                  className={
                    "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors " +
                    (active ? "border-brand bg-brand-light" : "border-border bg-surface hover:border-brand")
                  }
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="font-semibold">{s.name}</div>
                    <div className="font-display text-base font-extrabold text-brand">{s.price} MAD</div>
                  </div>
                  <div className="text-[11px] text-muted-foreground">{s.product} · {s.distance} m · ★ {s.rating}</div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`}
                    target="_blank" rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Navigation size={11} /> Itinéraire
                  </a>
                </button>
              );
            })}
          </div>
        )}

        {/* Map preview */}
        {selected && (
          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <div className="flex items-center justify-between bg-surface px-3 py-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MapPin size={14} className="text-brand" /> {selected.name}
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selected.lat},${selected.lng}`}
                target="_blank" rel="noreferrer"
                className="text-xs font-semibold text-brand hover:underline"
              >
                Ouvrir dans Google Maps →
              </a>
            </div>
            <iframe
              title={`Carte ${selected.name}`}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${selected.lng - 0.01}%2C${selected.lat - 0.01}%2C${selected.lng + 0.01}%2C${selected.lat + 0.01}&layer=mapnik&marker=${selected.lat}%2C${selected.lng}`}
              className="h-72 w-full border-0"
              loading="lazy"
            />
          </div>
        )}
      </form>

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
        <MarketCard name="Marjane Agdal" type="Supermarché · 320m" stars="★★★★☆" reviews={128} avg="7.2 MAD" recos={3} onReview={() => setReviewFor("Marjane Agdal")} userReviews={reviews["Marjane Agdal"] ?? []} />
        <MarketCard name="Carrefour Market" type="Supermarché · 600m" stars="★★★★★" reviews={204} avg="8.1 MAD" recos={7} onReview={() => setReviewFor("Carrefour Market")} userReviews={reviews["Carrefour Market"] ?? []} />
        <button
          onClick={() => toast(t("markets.add.review"))}
          className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface-2 text-center"
        >
          <Plus size={28} className="text-brand" strokeWidth={1.5} />
          <div className="text-[13px] font-bold text-brand">{t("markets.add.review")}</div>
          <div className="text-[11px] text-muted-foreground">Prix · Produit · Site · Localisation</div>
        </button>
      </div>

      {reviewFor && (
        <ReviewDialog
          market={reviewFor}
          existing={reviews[reviewFor] ?? []}
          onClose={() => setReviewFor(null)}
          onSubmit={(rating, comment) => {
            addReview(reviewFor, rating, comment);
          }}
        />
      )}
    </div>
  );
}

function MarketCard({
  name, type, stars, reviews, avg, recos, onReview, userReviews = [],
}: { name: string; type: string; stars: string; reviews: number; avg: string; recos: number; onReview?: () => void; userReviews?: { name: string; rating: number; comment: string; at: string }[] }) {
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
      <div className="mb-3 text-[11px] text-muted-foreground">{recos + userReviews.length} recommandations étudiants</div>
      <button
        onClick={onReview}
        className="w-full rounded-lg border-2 border-brand px-3 py-2 text-[13px] font-semibold text-brand hover:bg-brand-light"
      >
        {t("markets.reviews")}
      </button>
    </div>
  );
}

function ReviewDialog({
  market, existing, onClose, onSubmit,
}: { market: string; existing: { name: string; rating: number; comment: string; at: string }[]; onClose: () => void; onSubmit: (rating: number, comment: string) => void }) {
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState("");
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-[480px] rounded-2xl bg-surface-2 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg font-extrabold">Avis · {market}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-surface" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 max-h-40 overflow-auto rounded-lg bg-surface p-3">
          {existing.length === 0 ? (
            <div className="text-xs text-muted-foreground">Aucun avis pour le moment. Soyez le premier !</div>
          ) : (
            <ul className="space-y-2">
              {existing.map((r, i) => (
                <li key={i} className="text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{r.name}</span>
                    <span className="text-warning">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  </div>
                  <p className="mt-0.5 text-muted-foreground">{r.comment}</p>
                  <div className="text-[10px] text-muted-foreground">{r.at}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!comment.trim()) {
              toast.error("Ajoutez un commentaire");
              return;
            }
            onSubmit(rating, comment.trim());
            setComment("");
            setRating(5);
            onClose();
          }}
        >
          <div className="mb-3">
            <label className="mb-1.5 block text-xs font-semibold">Note</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} étoiles`}>
                  <Star
                    size={22}
                    className={n <= rating ? "fill-warning text-warning" : "text-muted-foreground"}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold">Commentaire</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Partagez votre expérience..."
              className="w-full rounded-lg border-[1.5px] border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold">
              Annuler
            </button>
            <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
              Publier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}