import { useI18n } from "@/contexts/AppProviders";
import { Logo } from "./Logo";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="bg-[#1A1D2E] py-16 text-white/75">
      <div className="mx-auto w-full max-w-[1160px] px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-3"><Logo /></div>
            <p className="max-w-[260px] text-sm leading-relaxed text-white/65">{t("footer.desc")}</p>
          </div>
          <div>
            <div className="mb-4 text-xs font-bold uppercase tracking-wider text-white">{t("footer.product")}</div>
            <a className="mb-2 block text-sm hover:text-white" href="#features">{t("nav.features")}</a>
            <a className="mb-2 block text-sm hover:text-white" href="#how">{t("nav.how")}</a>
            <a className="mb-2 block text-sm hover:text-white" href="#testimonials">{t("nav.testimonials")}</a>
          </div>
          <div>
            <div className="mb-4 text-xs font-bold uppercase tracking-wider text-white">{t("footer.company")}</div>
            <a className="mb-2 block text-sm hover:text-white" href="#contact">{t("nav.contact")}</a>
            <a className="mb-2 block text-sm hover:text-white" href="#">About</a>
          </div>
          <div>
            <div className="mb-4 text-xs font-bold uppercase tracking-wider text-white">{t("footer.support")}</div>
            <a className="mb-2 block text-sm hover:text-white" href="#contact">{t("contact.email")}</a>
            <a className="mb-2 block text-sm hover:text-white" href="#">FAQ</a>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-sm text-white/60">
          <span>{t("footer.copy")}</span>
        </div>
      </div>
    </footer>
  );
}