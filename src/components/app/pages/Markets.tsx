import * as React from "react";
import { Plus, Search, MapPin, Navigation, ThumbsUp, Check } from "lucide-react";
import { useI18n } from "@/contexts/AppProviders";
import { toast } from "sonner";
import { placesApi, recommendationsApi, tryApi, isAuthenticated, type Place } from "@/lib/api";

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
  address?: string;
  phone?: string;
  website?: string | null;
  url?: string | null;
  categories?: string[];
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
  const [priceInfo, setPriceInfo] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [userLocation, setUserLocation] = React.useState<{ latitude: number; longitude: number } | null>(null);
  // Marchés déjà recommandés par cet utilisateur (par placeId)
  const [recommended, setRecommended] = React.useState<Set<string>>(new Set());
  const [recoLoading, setRecoLoading] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("sc-recommended-places");
      if (raw) setRecommended(new Set(JSON.parse(raw)));
    } catch {}
    try {
      const rawLoc = localStorage.getItem("sc-location");
      if (rawLoc) {
        const parsed = JSON.parse(rawLoc);
        if (parsed?.latitude && parsed?.longitude) {
          setUserLocation({ latitude: Number(parsed.latitude), longitude: Number(parsed.longitude) });
        }
      }
    } catch {}
  }, []);

  function persistReco(next: Set<string>) {
    setRecommended(new Set(next));
    localStorage.setItem("sc-recommended-places", JSON.stringify([...next]));
  }

  async function recommend(s: Store) {
    if (recommended.has(s.id)) {
      toast.info("Vous avez déjà recommandé ce marché.");
      return;
    }
    setRecoLoading(s.id);
    const payload = {
      product,
      placeId: s.id,
      name: s.name,
      address: s.address ?? `${s.city}`,
      latitude: s.lat,
      longitude: s.lng,
      phone: s.phone ?? "",
      website: s.website ?? null,
      url: s.url ?? null,
      categories: s.categories ?? [],
    };
    if (isAuthenticated()) {
      try {
        await recommendationsApi.create(payload);
      } catch (err: any) {
        toast.error("Impossible d'envoyer la recommandation au serveur");
      }
    }
    const next = new Set(recommended); next.add(s.id); persistReco(next);
    setRecoLoading(null);
    toast.success(`👍 ${s.name} recommandé !`);
  }

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setPriceInfo(null);
    // 1) Essayer l'API PITEAM POST /api/places/search
    let remote: any = null;
    try {
      remote = await placesApi.search({
        product,
        budget,
        maxResults: 10,
        latitude: userLocation?.latitude,
        longitude: userLocation?.longitude,
      });
    } catch (e) {
      remote = null;
    }
    if (remote?.success && remote.data?.places?.length) {
      const mapped: Store[] = remote.data.places.map((p: Place) => ({
        id: p.id,
        name: p.name,
        product,
        price: 0,
        distance: Math.round(p.distance ?? 0),
        city: (p.address?.split(",").slice(-2)[0] || "").trim() || "—",
        rating: 4.2,
        lat: p.latitude,
        lng: p.longitude,
        address: p.address,
        phone: p.phone,
        website: p.website,
        url: p.url,
        categories: p.categories,
      }));
      setResults(mapped);
      setPriceInfo(remote.data.price);
      setSelected(null);
      setLoading(false);
      toast.success(`${mapped.length} marché(s) trouvé(s)`);
      return;
    }
    // 2) Fallback local catalogue
    const r = CATALOG.filter(
      (s) => s.product.toLowerCase().includes(product.toLowerCase()) && s.price <= budget,
    ).sort((a, b) => a.price - b.price);
    setResults(r);
    setSelected(null);
    setLoading(false);
    if (r.length === 0) toast.error("Aucun marché ne correspond à votre budget.");
    else toast.success(`${r.length} marché(s) trouvé(s) (mode hors-ligne)`);
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
          onClick={async () => {
            if (userLocation) {
              toast.success(t("toast.geoloc"));
              return;
            }
            if (typeof navigator === "undefined" || !navigator.geolocation) {
              toast.error("Géolocalisation non disponible.");
              return;
            }
            try {
              const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000 });
              });
              const saved = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                timestamp: Date.now(),
              };
              localStorage.setItem("sc-location", JSON.stringify(saved));
              setUserLocation({ latitude: saved.latitude, longitude: saved.longitude });
              toast.success(t("toast.geoloc"));
            } catch {
              toast.error("Impossible de récupérer votre localisation.");
            }
          }}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          {userLocation ? "Géolocalisation activée" : t("markets.near")}
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
          <button type="submit" disabled={loading} className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
            {loading ? "…" : "Rechercher"}
          </button>
        </div>

        {priceInfo && (
          <div className="mt-4 rounded-xl border border-brand/30 bg-brand-light/40 p-3 text-xs leading-relaxed">
            <div className="mb-1 text-[11px] font-bold uppercase text-brand">💡 Estimation prix (IA)</div>
            <div className="whitespace-pre-line text-foreground">{priceInfo}</div>
          </div>
        )}

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
              const isReco = recommended.has(s.id);
              return (
                <div
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className={
                    "flex cursor-pointer flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors " +
                    (active ? "border-brand bg-brand-light" : "border-border bg-surface hover:border-brand")
                  }
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="font-semibold">{s.name}</div>
                    {s.price > 0 && <div className="font-display text-base font-extrabold text-brand">{s.price} MAD</div>}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{s.product} · {s.distance} m · ★ {s.rating}</div>
                  <div className="mt-2 flex w-full items-center justify-between gap-2">
                    <a
                      href={s.url || `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`}
                      target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Navigation size={11} /> Itinéraire
                    </a>
                    <button
                      type="button"
                      disabled={isReco || recoLoading === s.id}
                      onClick={(e) => { e.stopPropagation(); recommend(s); }}
                      className={
                        "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors " +
                        (isReco
                          ? "bg-success/15 text-success cursor-default"
                          : "bg-brand text-white hover:bg-brand-dark disabled:opacity-60")
                      }
                    >
                      {isReco ? <><Check size={11} /> Recommandé</> : <><ThumbsUp size={11} /> {recoLoading === s.id ? "…" : "Recommander"}</>}
                    </button>
                  </div>
                </div>
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
        <FeaturedMarketCard
          store={{ id: "demo-marjane", name: "Marjane Agdal", product: "Lait 1L", price: 6.5, distance: 320, city: "Rabat", rating: 4.4, lat: 33.9985, lng: -6.8498, address: "Avenue Fal Ould Oumeir, Rabat", categories: ["Supermarché"] }}
          recommended={recommended} loadingId={recoLoading} onRecommend={recommend}
        />
        <FeaturedMarketCard
          store={{ id: "demo-carrefour", name: "Carrefour Market", product: "Lait 1L", price: 7.2, distance: 600, city: "Rabat", rating: 4.6, lat: 33.9716, lng: -6.8498, address: "Hay Riad, Rabat", categories: ["Supermarché"] }}
          recommended={recommended} loadingId={recoLoading} onRecommend={recommend}
        />
        <button
          onClick={() => toast.info("Recherchez un produit ci-dessus puis cliquez sur Recommander.")}
          className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface-2 text-center"
        >
          <Plus size={28} className="text-brand" strokeWidth={1.5} />
          <div className="text-[13px] font-bold text-brand">Recommander un marché</div>
          <div className="text-[11px] text-muted-foreground">Recherche un produit, puis 1 clic = recommandation</div>
        </button>
      </div>
    </div>
  );
}

function FeaturedMarketCard({
  store, recommended, loadingId, onRecommend,
}: { store: Store; recommended: Set<string>; loadingId: string | null; onRecommend: (s: Store) => void }) {
  const { t } = useI18n();
  const isReco = recommended.has(store.id);
  return (
    <div className="rounded-2xl bg-surface-2 p-4 shadow-[0_4px_24px_rgba(79,110,247,.08)]">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-bold">{store.name}</div>
          <div className="text-[11px] text-muted-foreground">{(store.categories?.[0] ?? "Marché")} · {store.distance}m</div>
        </div>
        <span className="rounded bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
          {t("markets.open")}
        </span>
      </div>
      <div className="mb-2 flex items-center gap-1 text-[11px] text-warning">
        ★★★★☆ <span className="text-muted-foreground">({store.rating})</span>
      </div>
      {store.price > 0 && (
        <div className="mb-2 text-[11px] font-semibold text-brand">Prix moyen : {store.price} MAD</div>
      )}
      <button
        onClick={() => onRecommend(store)}
        disabled={isReco || loadingId === store.id}
        className={
          "mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-bold transition-colors " +
          (isReco
            ? "bg-success/15 text-success cursor-default"
            : "bg-brand text-white hover:bg-brand-dark disabled:opacity-60")
        }
      >
        {isReco
          ? <><Check size={14} /> Recommandé</>
          : <><ThumbsUp size={14} /> {loadingId === store.id ? "…" : "Recommander"}</>}
      </button>
    </div>
  );
}