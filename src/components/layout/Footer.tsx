import { Mail, Phone, MapPin, ArrowUpRight, Instagram, Twitter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { submitNewsletterEmail } from '@/lib/submissions';

const SOCIAL = [
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Twitter, label: 'X (Twitter)', href: '#' },
  {
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.27 8.27 0 004.84 1.55V6.85a4.85 4.85 0 01-1.07-.16z" />
      </svg>
    ),
    label: 'TikTok',
    href: '#',
  },
  {
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 6.628 5.373 12 12 12 6.628 0 12-5.372 12-12 0-6.627-5.372-12-12-12zm5.97 16.5c-.25.663-.937 1.232-1.784 1.391-.461.086-1.063.155-3.093-.598-2.56-.961-4.207-3.573-4.33-3.739-.124-.165-1.003-1.335-1.003-2.545 0-1.21.636-1.808.859-2.058a.914.914 0 01.662-.289c.165 0 .33.003.474.01.152.008.355.015.551.424.22.46.745 1.821.811 1.954.065.132.109.288.021.463-.087.175-.131.283-.262.437-.13.153-.274.342-.39.46-.13.129-.265.268-.114.526.152.257.674 1.112 1.447 1.8 1.002.893 1.845 1.168 2.109 1.296.264.13.417.108.57-.065.152-.174.65-.757.823-1.017.174-.26.348-.217.588-.13.24.086 1.52.717 1.782.848.261.13.435.195.5.304.065.109.065.63-.185 1.228z" />
      </svg>
    ),
    label: 'WhatsApp',
    href: '#',
  },
];

export default function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState(false);

  const shopLinks = [
    { label: t('footer.shopAbaya'), to: '/shop?category=abaya' },
    { label: t('footer.shopWomen'), to: '/shop?category=women' },
    { label: t('footer.shopKids'), to: '/shop?category=kids' },
    { label: t('footer.shopAcc'), to: '/shop?category=accessories' },
  ];

  const infoLinks = [
    { label: t('footer.about'), to: '/about' },
    { label: t('footer.contact'), to: '/contact' },
    { label: t('footer.shipping'), to: '/about' },
    { label: t('footer.returns'), to: '/about' },
    { label: t('footer.faq'), to: '/about' },
  ];

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(false);
    const res = await submitNewsletterEmail(email, 'footer', document.documentElement.lang || 'ar');
    if (res.ok) {
      setSubscribed(true);
      setEmail('');
    } else {
      setError(true);
    }
  };

  return (
    <footer className="bg-[#002B49] text-white pt-20 pb-10 relative overflow-hidden">
      <div className="absolute top-0 end-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 start-0 w-72 h-72 bg-[#C7613E]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 start-0 end-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div>
              <img
                src="/image/namat_logo.webp"
                alt="NAMAT"
                className="h-16 object-contain brightness-0 invert mb-4"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <p className="text-[#D4AF37] font-bold text-sm tracking-widest">NAMAT</p>
              <p className="text-white/60 text-sm mt-1 italic">{t('footer.brandLine')}</p>
            </div>
            <p className="text-white/60 text-sm leading-relaxed text-start">{t('footer.description')}</p>
            <div className="flex items-center gap-3">
              {SOCIAL.map((s, i) => (
                <motion.a
                  key={i}
                  href={s.href}
                  whileHover={{ y: -3, scale: 1.1 }}
                  aria-label={s.label}
                  className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 transition-all"
                >
                  <s.icon />
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-black text-lg mb-6 text-start">{t('footer.sections')}</h3>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-white/55 hover:text-[#D4AF37] transition-colors text-sm font-medium flex items-center gap-2 group text-start"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-black text-lg mb-6 text-start">{t('footer.info')}</h3>
            <ul className="space-y-3">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-white/55 hover:text-[#D4AF37] transition-colors text-sm font-medium flex items-center gap-2 group text-start"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 space-y-3">
              <a href="tel:+966500000000" className="flex items-center gap-3 text-white/55 hover:text-[#D4AF37] transition-colors text-sm">
                <Phone className="h-4 w-4 text-[#D4AF37] shrink-0" />
                <span dir="ltr">+966 50 000 0000</span>
              </a>
              <a href="mailto:info@namat.sa" className="flex items-center gap-3 text-white/55 hover:text-[#D4AF37] transition-colors text-sm">
                <Mail className="h-4 w-4 text-[#D4AF37] shrink-0" />
                info@namat.sa
              </a>
              <div className="flex items-start gap-3 text-white/55 text-sm">
                <MapPin className="h-4 w-4 text-[#D4AF37] mt-0.5 shrink-0" />
                <span className="text-start">{t('footer.location')}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-black text-lg mb-3 text-start">{t('footer.newsletterTitle')}</h3>
            <p className="text-white/55 text-sm leading-relaxed mb-6 text-start">{t('footer.newsletterHint')}</p>
            {subscribed ? (
              <div className="p-4 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-center">
                <p className="text-[#D4AF37] font-bold text-sm">{t('footer.subscribedThanks')}</p>
                <p className="text-white/50 text-xs mt-1">{t('footer.subscribedHint')}</p>
              </div>
            ) : (
              <form onSubmit={(e) => void handleSubscribe(e)} className="space-y-3">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.emailPlaceholder')}
                  required
                  className="h-12 bg-white/5 border-white/10 text-white rounded-xl placeholder:text-white/30 focus-visible:ring-[#D4AF37] focus-visible:border-[#D4AF37]/50"
                />
                {error && <p className="text-amber-200 text-xs text-start">{t('contact.errorSend')}</p>}
                <button
                  type="submit"
                  className="w-full h-12 rounded-xl font-bold text-[#002B49] transition-all hover:opacity-90 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #f0d060)' }}
                >
                  {t('footer.subscribe')}
                </button>
              </form>
            )}

            <div className="mt-6">
              <p className="text-white/30 text-xs mb-3 text-start">{t('footer.paymentMethods')}</p>
              <div className="flex gap-2 flex-wrap">
                {['Visa', 'Mastercard', 'Mada', 'Tabby', 'Tamara'].map((m) => (
                  <span key={m} className="text-[10px] font-bold px-2 py-1 rounded-lg border border-white/10 text-white/40">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <p className="text-center md:text-start">{t('footer.copyright')}</p>
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <a href="#" className="hover:text-[#D4AF37] transition-colors">
              {t('footer.terms')}
            </a>
            <a href="#" className="hover:text-[#D4AF37] transition-colors">
              {t('footer.privacy')}
            </a>
            <a href="#" className="hover:text-[#D4AF37] transition-colors">
              {t('footer.sitemap')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
