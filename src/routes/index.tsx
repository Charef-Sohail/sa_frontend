import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Sparkles,
  ShoppingCart,
  SmilePlus,
  Bell,
  MessageCircle,
  CalendarDays,
  Mail,
  Phone,
  MapPin,
  Check,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useI18n } from "@/contexts/AppProviders";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-surface text-foreground">
      <Navbar />
      <main>
        <Hero />
        <LogosBar />
        <Features />
        <HowItWorks />
        <Testimonials />
        <CTA />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

function Hero() {
  const { t } = useI18n();
  return (
    <section
      className="relative overflow-hidden pb-20 pt-36 md:pt-40"
      style={{
        background:
          "linear-gradient(160deg, color-mix(in oklab, var(--brand-light) 80%, var(--surface)) 0%, color-mix(in oklab, var(--success) 12%, var(--surface)) 50%, color-mix(in oklab, var(--danger) 10%, var(--surface)) 100%)",
      }}
    >
      <div className="mx-auto grid w-full max-w-[1160px] grid-cols-1 items-center gap-14 px-6 lg:grid-cols-2">
        <div>
          <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-brand/10 px-3.5 py-1.5 text-[13px] font-semibold text-brand">
            <Sparkles size={14} /> {t("hero.tag")}
          </span>
          <h1 className="font-display text-[clamp(36px,4.5vw,58px)] font-extrabold leading-[1.12] text-foreground">
            {t("hero.title.1")}
            <br />
            {t("hero.title.2")}{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, var(--brand), var(--success))" }}
            >
              {t("hero.title.3")}
            </span>
          </h1>
          <p className="mt-5 max-w-[480px] text-[17px] leading-relaxed text-muted-foreground">{t("hero.desc")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-8 py-3.5 text-[15px] font-semibold text-white shadow-[0_6px_20px_rgba(79,110,247,.25)] transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
            >
              {t("hero.cta.primary")} <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center rounded-lg border-2 border-brand px-8 py-3.5 text-[15px] font-semibold text-brand transition-colors hover:bg-brand-light"
            >
              {t("hero.cta.secondary")}
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-7">
            <Stat value="2 500+" label={t("hero.stat.students")} color="var(--brand)" />
            <span className="hidden h-10 w-px bg-border md:block" />
            <Stat value="87%" label={t("hero.stat.productivity")} color="var(--success)" />
            <span className="hidden h-10 w-px bg-border md:block" />
            <Stat value="350 MAD" label={t("hero.stat.savings")} color="var(--warning)" />
          </div>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div>
      <div className="font-display text-[26px] font-extrabold" style={{ color }}>{value}</div>
      <div className="text-[13px] text-muted-foreground">{label}</div>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative">
      <div className="relative z-10 rounded-3xl bg-surface-2 p-6 shadow-[0_20px_60px_rgba(79,110,247,.16)]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="font-display text-[15px] font-extrabold">Planning du jour</div>
            <div className="text-xs text-muted-foreground">Lundi 9 Juin · Motivé 🚀</div>
          </div>
          <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand">IA Optimisé</span>
        </div>
        <div className="flex flex-col gap-2.5">
          <TaskRow color="var(--success)" title="Révision BDD" sub="14:00 · 3h" progress={60} />
          <TaskRow color="var(--danger)" title="Projet React" sub="17:00 · 2h" badge="Urgent" />
          <TaskRow color="var(--brand)" title="Rapport de stage" sub="19:00 · 1h" progress={20} />
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-brand-light px-3.5 py-2.5 text-xs font-semibold text-brand">
          <Sparkles size={14} /> Planning auto-optimisé par OR-Tools ✨
        </div>
      </div>
      <FloatCard
        className="-right-3 -top-5 sm:-right-5"
        label="Tâches complétées"
        value="62%"
        sub="ce matin"
        color="var(--success)"
      />
      <FloatCard
        className="-bottom-3 -left-3 sm:-left-5"
        label="Meilleur prix Lait 1L"
        value="6.50 MAD"
        sub="Marjane · 320m"
        color="var(--success)"
      />
    </div>
  );
}

function TaskRow({
  color, title, sub, progress, badge,
}: { color: string; title: string; sub: string; progress?: number; badge?: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-surface px-3 py-2.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      <div className="flex-1">
        <div className="text-[13px] font-semibold text-foreground">{title}</div>
        <div className="text-[11px] text-muted-foreground">{sub}</div>
      </div>
      {progress !== undefined && (
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, var(--brand), var(--success))" }}
          />
        </div>
      )}
      {badge && (
        <span className="rounded-full bg-danger/15 px-2 py-0.5 text-[10px] font-bold text-danger">{badge}</span>
      )}
    </div>
  );
}

function FloatCard({
  className = "", label, value, sub, color,
}: { className?: string; label: string; value: string; sub: string; color: string }) {
  return (
    <div
      className={"absolute z-20 hidden min-w-[160px] rounded-2xl bg-surface-2 px-4 py-3 shadow-[0_8px_32px_rgba(79,110,247,.16)] sm:block " + className}
    >
      <div className="mb-1 text-[11px] text-muted-foreground">{label}</div>
      <div className="font-display text-[20px] font-extrabold" style={{ color }}>{value}</div>
      <div className="text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function LogosBar() {
  const { t } = useI18n();
  return (
    <div className="border-b border-border bg-surface-2 py-7">
      <div className="mx-auto w-full max-w-[1160px] px-6">
        <div className="mb-5 text-center text-[13px] font-medium text-muted-foreground">{t("logos.title")}</div>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 opacity-60">
          {["ENSIAS", "ENSA", "FSR", "ENCG", "FST"].map((n) => (
            <span key={n} className="font-display text-base font-extrabold text-foreground">{n}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionHead({ label, title, desc }: { label: string; title: string; desc?: string }) {
  return (
    <div className="mx-auto mb-14 max-w-2xl text-center">
      <div className="mb-3 text-[13px] font-bold uppercase tracking-[.08em] text-brand">{label}</div>
      <h2 className="font-display text-[clamp(26px,3vw,40px)] font-extrabold text-foreground">{title}</h2>
      {desc && <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">{desc}</p>}
    </div>
  );
}

function Features() {
  const { t } = useI18n();
  const items = [
    { Icon: CalendarDays, key: "f1", bg: "var(--brand-light)", color: "var(--brand)" },
    { Icon: ShoppingCart, key: "f2", bg: "color-mix(in oklab, var(--success) 18%, transparent)", color: "var(--success)" },
    { Icon: SmilePlus, key: "f3", bg: "color-mix(in oklab, var(--warning) 18%, transparent)", color: "var(--warning)" },
    { Icon: Bell, key: "f4", bg: "color-mix(in oklab, var(--success) 12%, transparent)", color: "var(--success)" },
    { Icon: MessageCircle, key: "f5", bg: "color-mix(in oklab, var(--brand) 14%, transparent)", color: "var(--brand)" },
    { Icon: Sparkles, key: "f6", bg: "color-mix(in oklab, var(--danger) 14%, transparent)", color: "var(--danger)" },
  ];
  return (
    <section id="features" className="bg-surface-2 py-24">
      <div className="mx-auto w-full max-w-[1160px] px-6">
        <SectionHead
          label={t("features.label")}
          title={t("features.title")}
          desc={t("features.desc")}
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ Icon, key, bg, color }) => (
            <div
              key={key}
              className="group rounded-3xl border-[1.5px] border-border p-7 transition-all hover:-translate-y-1 hover:border-brand hover:shadow-[0_8px_32px_rgba(79,110,247,.12)]"
            >
              <div
                className="mb-4 inline-flex h-13 w-13 items-center justify-center rounded-2xl"
                style={{ background: bg, width: 52, height: 52, color }}
              >
                <Icon size={22} />
              </div>
              <div className="mb-2 font-display text-lg font-bold text-foreground">{t(`features.${key}.title`)}</div>
              <p className="text-sm leading-relaxed text-muted-foreground">{t(`features.${key}.desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const { t } = useI18n();
  const steps = [
    { n: 1, color: "var(--brand)", key: "s1" },
    { n: 2, color: "var(--success)", key: "s2" },
    { n: 3, color: "var(--warning)", key: "s3" },
  ];
  return (
    <section id="how" className="bg-surface py-24">
      <div className="mx-auto grid w-full max-w-[1160px] grid-cols-1 items-center gap-14 px-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 text-[13px] font-bold uppercase tracking-[.08em] text-brand">{t("how.label")}</div>
          <h2 className="font-display text-[clamp(26px,3vw,40px)] font-extrabold text-foreground">{t("how.title")}</h2>
          <p className="mb-10 mt-4 max-w-md text-base leading-relaxed text-muted-foreground">{t("how.desc")}</p>
          <div className="flex flex-col gap-7">
            {steps.map((s) => (
              <div key={s.n} className="flex items-start gap-5">
                <span
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full font-display text-lg font-extrabold text-white"
                  style={{ background: s.color }}
                >
                  {s.n}
                </span>
                <div>
                  <div className="mb-1.5 font-display text-[17px] font-bold text-foreground">{t(`how.${s.key}.title`)}</div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{t(`how.${s.key}.desc`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl bg-surface-2 p-7 shadow-[0_12px_48px_rgba(79,110,247,.12)]">
          <div className="mb-4 font-display text-[15px] font-extrabold">Import emploi du temps</div>
          <div className="mb-4 cursor-pointer rounded-2xl border-2 border-dashed border-border bg-surface p-7 text-center transition-colors hover:border-brand">
            <CalendarDays className="mx-auto mb-2.5 text-brand" size={36} strokeWidth={1.8} />
            <div className="text-sm font-semibold text-brand">Glissez votre fichier .ics</div>
            <div className="mt-1.5 text-xs text-muted-foreground">ou cliquez pour parcourir</div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5 rounded-lg bg-success/10 px-3.5 py-2.5">
              <Check size={16} className="text-success" />
              <span className="text-[13px] font-semibold">12 événements importés</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg bg-brand-light px-3.5 py-2.5">
              <Sparkles size={16} className="text-brand" />
              <span className="text-[13px] font-semibold">Planning optimisé en 2 secondes ⚡</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const { t } = useI18n();
  const items = [
    { key: "t1", name: "Sara M.", initial: "S", grad: "linear-gradient(135deg, var(--brand), var(--success))" },
    { key: "t2", name: "Karim B.", initial: "K", grad: "linear-gradient(135deg, var(--success), #00B4D8)", featured: true },
    { key: "t3", name: "Layla A.", initial: "L", grad: "linear-gradient(135deg, var(--danger), var(--warning))" },
  ];
  return (
    <section id="testimonials" className="bg-surface-2 py-24">
      <div className="mx-auto w-full max-w-[1160px] px-6">
        <SectionHead label={t("testi.label")} title={t("testi.title")} desc={t("testi.desc")} />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {items.map((it) => (
            <div
              key={it.key}
              className={
                "rounded-3xl border-[1.5px] p-7 transition-all " +
                (it.featured
                  ? "border-brand shadow-[0_8px_24px_rgba(79,110,247,.12)]"
                  : "border-border hover:border-brand-light hover:shadow-[0_4px_24px_rgba(79,110,247,.10)]")
              }
            >
              <div className="mb-3.5 text-[14px] text-warning">★★★★★</div>
              <p className="mb-4 text-[15px] leading-relaxed text-foreground">"{t(`testi.${it.key}`)}"</p>
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: it.grad }}
                >
                  {it.initial}
                </span>
                <div>
                  <div className="text-sm font-bold text-foreground">{it.name}</div>
                  <div className="text-xs text-muted-foreground">{t(`testi.${it.key}.role`)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden py-24 text-white" style={{
      background: "linear-gradient(135deg,#1A1D2E 0%,#2D3150 60%,#1a3040 100%)",
    }}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 80% 50%, rgba(79,110,247,.25) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 10% 80%, rgba(0,212,170,.15) 0%, transparent 70%)",
        }}
      />
      <div className="relative mx-auto w-full max-w-[1160px] px-6 text-center">
        <span className="mb-5 inline-flex items-center rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/90">
          {t("cta.badge")}
        </span>
        <h2 className="font-display text-[clamp(28px,4vw,50px)] font-extrabold leading-tight">
          {t("cta.title.1")}
          <br />
          {t("cta.title.2")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[17px] text-white/70">{t("cta.desc")}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3.5">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-[15px] font-semibold text-brand transition-transform hover:-translate-y-0.5"
          >
            {t("cta.primary")} <ArrowRight size={16} />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center rounded-lg border-[1.5px] border-white/30 bg-white/10 px-8 py-3.5 text-[15px] font-semibold text-white hover:bg-white/15"
          >
            {t("cta.secondary")}
          </Link>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const { t } = useI18n();
  return (
    <section id="contact" className="bg-surface py-24">
      <div className="mx-auto grid w-full max-w-[1160px] grid-cols-1 gap-14 px-6 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <div className="mb-3 text-[13px] font-bold uppercase tracking-[.08em] text-brand">{t("contact.label")}</div>
          <h2 className="font-display text-[clamp(26px,3vw,40px)] font-extrabold text-foreground">{t("contact.title")}</h2>
          <p className="mb-10 mt-4 max-w-md text-base leading-relaxed text-muted-foreground">{t("contact.desc")}</p>

          <ContactItem Icon={Mail} label={t("contact.email")} value="contact@smartcalendar-sa.ma" />
          <ContactItem Icon={Phone} label={t("contact.phone")} value="+212 6 XX XX XX XX" />
          <ContactItem Icon={MapPin} label={t("contact.address")} value="Rabat, Maroc" />
        </div>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="rounded-3xl bg-surface-2 p-7 shadow-[0_4px_24px_rgba(79,110,247,.10)]"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t("contact.form.name")} placeholder="Ahmed Karimi" />
            <Field label={t("contact.form.email")} type="email" placeholder="vous@exemple.com" />
          </div>
          <Field label={t("contact.form.subject")} placeholder="Sujet" />
          <div className="mt-4">
            <label className="mb-2 block text-[13px] font-semibold">{t("contact.form.message")}</label>
            <textarea
              className="min-h-[140px] w-full rounded-lg border-[1.5px] border-border bg-surface-2 px-4 py-3 text-sm outline-none transition-colors focus:border-brand"
              placeholder="Votre message..."
            />
          </div>
          <button
            type="submit"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            {t("contact.form.submit")} <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({ label, placeholder, type = "text" }: { label: string; placeholder?: string; type?: string }) {
  return (
    <div className="mt-4">
      <label className="mb-2 block text-[13px] font-semibold">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-lg border-[1.5px] border-border bg-surface-2 px-4 py-3 text-sm outline-none transition-colors focus:border-brand"
      />
    </div>
  );
}

function ContactItem({
  Icon, label, value,
}: { Icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string }) {
  return (
    <div className="mb-7 flex items-start gap-4">
      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
        <Icon size={20} />
      </span>
      <div>
        <div className="mb-1 text-[13px] font-medium text-muted-foreground">{label}</div>
        <div className="text-[15px] font-bold text-foreground">{value}</div>
      </div>
    </div>
  );
}
