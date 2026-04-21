import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CATEGORIES } from '../../lib/constants';

export default function BentoCategories() {
  const { i18n, t } = useTranslation();

  return (
    <section className="py-24 bg-[#F7F4F0] pattern-bg">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-[#D4AF37] font-bold text-sm tracking-widest uppercase mb-3">{t('bento.label')}</p>
          <h2 className="text-4xl md:text-5xl font-black text-[#002B49] leading-tight">
            {t('bento.titleA')}{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #D4AF37, #b8952a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t('bento.titleB')}
            </span>
          </h2>
          <p className="text-[#7a6a56] mt-4 max-w-xl mx-auto">{t('bento.subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, i) => {
            const title = i18n.language === 'en' ? cat.nameEn : cat.name;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`relative overflow-hidden rounded-3xl cursor-pointer group ${
                  i === 0 ? 'col-span-2 row-span-2 md:col-span-2' : ''
                }`}
              >
                <Link to={`/shop?category=${cat.id}`} className="block h-full">
                  <div className={`relative ${i === 0 ? 'h-80 md:h-full min-h-[320px]' : 'h-52'} overflow-hidden`}>
                    <img
                      src={cat.image}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#002B49]/90 via-[#002B49]/30 to-transparent" />
                    <div className="absolute inset-0 bg-[#002B49]/0 group-hover:bg-[#002B49]/20 transition-colors duration-500" />
                    <div className="absolute bottom-0 end-0 p-5 text-start">
                      <span className="text-[#D4AF37] text-xs font-bold tracking-wider uppercase block mb-1">{cat.count}</span>
                      <h3 className="text-white font-black text-xl leading-tight">{title}</h3>
                      <motion.div
                        className="flex items-center gap-1 justify-start mt-2 text-white/70 text-sm"
                        initial={{ opacity: 0, x: 10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                      >
                        <span className="group-hover:text-[#D4AF37] transition-colors">{t('bento.shopNow')}</span>
                        <ArrowLeft className="h-4 w-4 group-hover:text-[#D4AF37] rtl:group-hover:-translate-x-1 ltr:rotate-180 ltr:group-hover:translate-x-1 transition-all" />
                      </motion.div>
                    </div>
                    <div className="absolute top-4 end-4 w-8 h-8 border-t-2 border-e-2 border-[#D4AF37]/50 rounded-te-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-4 start-4 w-8 h-8 border-b-2 border-s-2 border-[#D4AF37]/50 rounded-bs-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
