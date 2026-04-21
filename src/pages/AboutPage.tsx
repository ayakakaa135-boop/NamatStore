import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Star, Award, Users, Sparkles, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { FEATURES, FEATURE_ICONS_EMOJI, TESTIMONIALS } from '../lib/constants';

const STATS = [
  { value: '+2000', valueAr: '+٢٠٠٠', labelKey: 'about.stats.clients', icon: Users },
  { value: '+150', valueAr: '+١٥٠', labelKey: 'about.stats.designs', icon: Sparkles },
  { value: '4.9', valueAr: '٤.٩', labelKey: 'about.stats.rating', icon: Star },
  { value: '5+', valueAr: '٥+', labelKey: 'about.stats.years', icon: Award },
];

export default function AboutPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className="min-h-screen bg-[#F7F4F0]">
      <Header />

      {/* Hero Banner */}
      <section className="relative bg-[#002B49] py-32 overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#D4AF37] font-bold text-sm tracking-widest uppercase mb-4"
          >
            {t('about.storyEyebrow')}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white mb-6"
          >
            {t('about.heroTitle')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-xl max-w-xl mx-auto leading-relaxed"
          >
            {t('about.heroSubtitle')}
          </motion.p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-right"
            >
              <p className="text-[#D4AF37] font-bold text-sm tracking-widest uppercase mb-4">{t('about.storyTag')}</p>
              <h2 className="text-4xl font-black text-[#002B49] leading-tight mb-6">
                {t('about.storyTitleA')}
                <br />
                <span style={{
                  background: 'linear-gradient(135deg, #D4AF37, #b8952a)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {t('about.storyTitleB')}
                </span>
              </h2>
              <div className="space-y-4 text-[#7a6a56] leading-loose">
                <p>{t('about.storyBody1')}</p>
                <p>{t('about.storyBody2')}</p>
                <p>{t('about.storyBody3')}</p>
              </div>
              <div className="mt-8">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-white shadow-lg hover:opacity-90 transition-all"
                  style={{ background: 'linear-gradient(135deg, #002B49, #003d6b)' }}
                >
                  {t('about.storyCta')}
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden aspect-square">
                <img
                  src="/image/photo_2026-04-09_10-23-30.jpg"
                  alt={t('about.storyImageAlt')}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#002B49]/40 to-transparent" />
              </div>
              {/* Gold accent */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-2xl border-4 border-[#D4AF37]/30 bg-[#F3E3CF]" />
              <div className="absolute -top-4 -left-4 w-20 h-20 rounded-2xl border-4 border-[#D4AF37]/20" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-[#002B49]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, valueAr, labelKey, icon: Icon }, i) => (
              <motion.div
                key={labelKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-7 w-7 text-[#D4AF37]" />
                </div>
                <p className="text-4xl font-black text-white mb-1">{isRTL ? valueAr : value}</p>
                <p className="text-white/50 font-medium">{t(labelKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features / Values */}
      <section className="py-24 bg-[#F7F4F0]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-[#D4AF37] font-bold text-sm tracking-widest uppercase mb-3">{t('about.featuresTitle')}</p>
            <h2 className="text-4xl font-black text-[#002B49]">{t('about.featuresSubtitle')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl p-7 text-right border border-[#F3E3CF] group hover:border-[#D4AF37]/30 transition-all hover:-translate-y-1"
                style={{ boxShadow: '0 2px 16px rgba(0,43,73,0.05)' }}
              >
                <div className="text-4xl mb-5 group-hover:scale-110 transition-transform inline-block">{FEATURE_ICONS_EMOJI[f.id]}</div>
                <h3 className="text-[#002B49] font-black text-xl mb-3">
                  {t(`features.${f.id}.title`, { defaultValue: f.title })}
                </h3>
                <p className="text-[#7a6a56] text-sm leading-relaxed">
                  {t(`features.${f.id}.description`, { defaultValue: f.description })}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-[#D4AF37] font-bold text-sm tracking-widest uppercase mb-3">{t('about.teamTitle')}</p>
            <h2 className="text-4xl font-black text-[#002B49]">{t('about.teamSubtitle')}</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-[2rem] bg-[#002B49] p-8 md:p-10 text-white flex flex-col justify-between overflow-hidden relative"
            >
              <div className="absolute inset-0 pattern-bg opacity-20" />
              <div className="absolute top-0 end-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-[70px]" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/20 flex items-center justify-center mb-6">
                  <Sparkles className="h-6 w-6 text-[#D4AF37]" />
                </div>
                <p className="text-[#D4AF37] text-xs tracking-[0.35em] uppercase font-bold mb-4">NAMAT DNA</p>
                <h3 className="text-3xl font-black leading-tight mb-5">
                  {t('about.dnaTitleA')}
                  <br />
                  {t('about.dnaTitleB')}
                </h3>
                <p className="text-white/75 leading-loose mb-6">
                  {t('about.dnaBody')}
                </p>
              </div>
              <div className="relative z-10 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/8 border border-white/10 p-4">
                  <p className="text-2xl font-black text-[#D4AF37] mb-1">{isRTL ? '٢٤/٧' : '24/7'}</p>
                  <p className="text-white/60 text-sm">{t('about.dnaPoint1')}</p>
                </div>
                <div className="rounded-2xl bg-white/8 border border-white/10 p-4">
                  <p className="text-2xl font-black text-[#D4AF37] mb-1">{t('about.dnaPoint2Title')}</p>
                  <p className="text-white/60 text-sm">{t('about.dnaPoint2')}</p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  image: '/image/about-editorial-1.webp',
                  title: t('about.card1Title'),
                  body: t('about.card1Body'),
                },
                {
                  image: '/image/about-editorial-2.webp',
                  title: t('about.card2Title'),
                  body: t('about.card2Body'),
                },
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group rounded-[2rem] overflow-hidden border border-[#F3E3CF] bg-[#F7F4F0]"
                  style={{ boxShadow: '0 12px 40px rgba(0,43,73,0.08)' }}
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#002B49]/70 via-transparent to-transparent" />
                  </div>
                  <div className="p-6 text-start">
                    <h3 className="text-[#002B49] font-black text-2xl mb-2">{card.title}</h3>
                    <p className="text-[#7a6a56] leading-relaxed text-sm">{card.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[#002B49]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-[#D4AF37] font-bold text-sm tracking-widest uppercase mb-3">{t('about.testimonialsLabel')}</p>
            <h2 className="text-4xl font-black text-white">{t('about.testimonialsTitle')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, i) => (
              <motion.div
                key={testimonial.tid}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 border border-white/10 rounded-3xl p-7 text-start hover:border-[#D4AF37]/30 transition-all"
              >
                <div className="flex gap-1 justify-start mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" />
                  ))}
                </div>
                <p className="text-white/80 leading-relaxed mb-6 text-sm">
                  &ldquo;
                  {t(`testimonials.${testimonial.tid}.content`, { defaultValue: testimonial.content })}
                  &rdquo;
                </p>
                <div className="flex items-center gap-3 justify-start">
                  <img
                    src={testimonial.avatar}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover object-center border-2 border-[#D4AF37]/30 bg-white/10 p-0.5"
                  />
                  <div>
                    <p className="text-white font-bold text-sm">
                      {t(`testimonials.${testimonial.tid}.name`, { defaultValue: testimonial.name })}
                    </p>
                    <p className="text-white/40 text-xs">
                      {t(`testimonials.${testimonial.tid}.role`, { defaultValue: testimonial.role })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
