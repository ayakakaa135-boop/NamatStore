import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Hero() {
  const { t } = useTranslation();

  const stats = [
    { value: t('hero.stat1v'), label: t('hero.stat1l') },
    { value: t('hero.stat2v'), label: t('hero.stat2l') },
    { value: t('hero.stat3v'), label: t('hero.stat3l') },
  ];

  return (
    <section className="relative w-full min-h-screen flex items-center overflow-hidden bg-[#002B49]">
      <div className="absolute inset-0 z-0">
        <motion.img
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          src="/image/photo_2026-04-09_10-23-30.jpg"
          alt="NAMAT"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#002B49]/95 via-[#002B49]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#002B49]/80 via-transparent to-[#002B49]/20" />
      </div>

      <div className="absolute top-0 start-0 end-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-60" />

      <div className="absolute top-1/4 end-1/3 w-72 h-72 bg-[#D4AF37]/10 rounded-full blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 end-1/4 w-48 h-48 bg-[#C7613E]/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 py-32">
        <div className="max-w-2xl ms-auto me-0 text-start">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border border-[#D4AF37]/40 bg-[#D4AF37]/10 backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4 text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-sm font-bold">{t('hero.badge')}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] tracking-tight mb-6">
              {t('hero.h1a')}{' '}
              <span
                className="block"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37, #f0d060, #b8952a)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {t('hero.h1b')}
              </span>
              <span className="text-white">{t('hero.h1c')}</span>
            </h1>

            <p className="text-lg md:text-xl text-white/75 max-w-lg leading-relaxed font-medium mb-2">{t('hero.tagline')}</p>
            <p className="text-base text-white/55 max-w-lg leading-relaxed mb-10">{t('hero.subtitle')}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="flex flex-wrap gap-4 justify-start"
          >
            <Link to="/shop">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 h-14 px-8 rounded-2xl font-black text-lg text-[#002B49] shadow-2xl transition-all"
                style={{ background: 'linear-gradient(135deg, #D4AF37, #f0d060, #b8952a)' }}
              >
                {t('hero.ctaShop')}
                <ArrowLeft className="h-5 w-5 rtl:rotate-0 ltr:rotate-180" />
              </motion.button>
            </Link>

            <Link to="/about">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="h-14 px-8 rounded-2xl font-bold text-lg text-white border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
              >
                {t('hero.ctaAbout')}
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="grid grid-cols-3 gap-8 mt-14 pt-8 border-t border-white/10"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-start">
                <p className="text-3xl font-black text-[#D4AF37]">{stat.value}</p>
                <p className="text-sm text-white/60 font-medium mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute start-6 bottom-12 hidden lg:block"
      >
        <div
          className="p-4 rounded-2xl border border-[#D4AF37]/30 backdrop-blur-md"
          style={{ background: 'rgba(0,43,73,0.7)' }}
        >
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="h-3 w-3 fill-[#D4AF37] text-[#D4AF37]" />
            ))}
          </div>
          <p className="text-white font-bold text-sm">{t('hero.cardQuote')}</p>
          <p className="text-white/50 text-xs mt-1">{t('hero.cardBy')}</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40" />
            <span className="text-[#D4AF37] text-xs font-bold">{t('hero.cardTrusted')}</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 start-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1"
        >
          <div className="w-1 h-2 bg-[#D4AF37] rounded-full" />
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 start-0 end-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
    </section>
  );
}
