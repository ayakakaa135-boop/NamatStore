import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Hero from '../components/home/Hero';
import BentoCategories from '../components/home/BentoCategories';
import FeaturedCollections from '../components/home/FeaturedCollections';
import ProductGrid from '../components/home/ProductGrid';
import { FEATURES, TESTIMONIALS, type SiteFeatureId } from '../lib/constants';
import { submitNewsletterEmail } from '../lib/submissions';
import {
  Truck,
  ShieldCheck,
  Headphones,
  CreditCard,
  Star,
  Quote,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'motion/react';

const HOME_FEATURE_ICONS: Record<SiteFeatureId, LucideIcon> = {
  delivery: Truck,
  quality: ShieldCheck,
  tailoring: Headphones,
  payment: CreditCard,
};

function Features() {
  const { t } = useTranslation();
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {FEATURES.map((feature, index) => {
            const Icon = HOME_FEATURE_ICONS[feature.id];
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center space-y-6 group p-8 rounded-[2rem] hover:bg-slate-50 transition-colors border border-transparent hover:border-[#F3E3CF]"
              >
                <div className="p-6 rounded-3xl bg-[#F3E3CF]/50 text-[#002B49] border border-[#D4AF37]/20 group-hover:scale-110 transition-transform duration-500">
                  <Icon className="h-10 w-10 text-[#D4AF37]" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-black text-xl tracking-tight text-[#002B49]">
                    {t(`features.${feature.id}.title`, { defaultValue: feature.title })}
                  </h3>
                  <p className="text-[#b5a090] leading-relaxed font-medium">
                    {t(`features.${feature.id}.description`, { defaultValue: feature.description })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const { t } = useTranslation();
  return (
    <section className="py-32 bg-[#002B49] text-white overflow-hidden relative">
      <div className="absolute top-0 start-0 w-full h-full pointer-events-none opacity-20 pattern-bg" />
      <div className="absolute top-1/4 start-1/4 w-96 h-96 bg-[#D4AF37] rounded-full blur-[150px] opacity-10" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter">
            {t('home.clientsTitle')}{' '}
            <span className="text-[#D4AF37]">{t('home.clientsHighlight')}</span>
            {t('home.clientsTitleEnd')}
          </h2>
          <p className="text-xl text-white/60 font-medium">{t('home.clientsSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((review, index) => (
            <motion.div
              key={review.tid}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 relative group hover:border-[#D4AF37]/30 transition-colors backdrop-blur-md"
            >
              <Quote className="absolute top-8 start-8 h-12 w-12 text-white/5 group-hover:text-[#D4AF37]/20 transition-colors" />
              <div className="flex items-center gap-1 mb-6">
                {Array.from({ length: review.rating }).map((_, s) => (
                  <Star key={s} className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" />
                ))}
              </div>
              <p className="text-lg leading-relaxed mb-8 font-medium text-white/80">
                &ldquo;
                {t(`testimonials.${review.tid}.content`, { defaultValue: review.content })}
                &rdquo;
              </p>
              <div className="flex items-center gap-4">
                <img
                  src={review.avatar}
                  alt=""
                  className="w-16 h-16 rounded-full object-cover object-center border-2 border-[#D4AF37]/50 bg-white/10 p-0.5"
                />
                <div className="text-start">
                  <h4 className="font-black text-lg">
                    {t(`testimonials.${review.tid}.name`, { defaultValue: review.name })}
                  </h4>
                  <p className="text-sm text-[#D4AF37] font-bold">
                    {t(`testimonials.${review.tid}.role`, { defaultValue: review.role })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const [newsletterError, setNewsletterError] = useState(false);

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    setNewsletterError(false);
    const res = await submitNewsletterEmail(email, 'home', i18n.language);
    if (res.ok) setSubscribed(true);
    else setNewsletterError(true);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-[#002B49] selection:text-white">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Features />
        <BentoCategories />
        <FeaturedCollections />
        <ProductGrid />
        <Testimonials />

        <section className="py-32 bg-[#002B49] text-white relative overflow-hidden border-t border-white/5">
          <div className="absolute bottom-0 end-0 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full translate-x-1/3 translate-y-1/3 blur-[120px]" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-tight mb-8 text-white">
                  {t('home.newsletterTitle')} <br />{' '}
                  <span className="text-[#D4AF37] relative inline-block">
                    {t('home.newsletterHighlight')}
                    <span className="absolute -bottom-2 start-0 end-0 h-1 bg-[#D4AF37] rounded-full opacity-30" />
                  </span>{' '}
                  {t('home.newsletterTitleEnd')}
                </h2>
                <p className="text-xl md:text-2xl opacity-90 leading-relaxed font-medium max-w-2xl mx-auto text-white/80">
                  {t('home.newsletterSubtitle')}
                </p>
              </motion.div>

              {!subscribed ? (
                <motion.form
                  onSubmit={(e) => void handleSubscribe(e)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                  className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('home.newsletterPh')}
                    className="flex-grow h-16 px-8 rounded-2xl bg-white text-[#002B49] focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/20 text-lg font-bold shadow-2xl placeholder:text-[#b5a090]"
                  />
                  <button
                    type="submit"
                    className="h-16 px-12 bg-[#D4AF37] text-[#002B49] font-black rounded-2xl hover:brightness-105 transition-all hover:scale-105 active:scale-95 shadow-2xl text-lg"
                  >
                    {t('home.newsletterBtn')}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/10 p-8 rounded-3xl border border-[#D4AF37]/30 backdrop-blur-md max-w-xl mx-auto"
                >
                  <h3 className="text-2xl font-bold text-[#D4AF37] mb-2">{t('home.newsletterThanks')}</h3>
                  <p className="text-lg">{t('home.newsletterThanksBody')}</p>
                </motion.div>
              )}

              {newsletterError && (
                <p className="text-amber-200 text-sm font-medium">{t('contact.errorSend')}</p>
              )}
              <p className="text-sm font-bold text-white/40">{t('home.privacyNote')}</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
