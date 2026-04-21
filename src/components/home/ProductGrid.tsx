import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PRODUCTS } from '../../lib/constants';
import { getLocalizedProduct } from '../../lib/productLocale';
import ProductCard from './ProductCard';

export default function ProductGrid() {
  const { t, i18n } = useTranslation();
  const featured = [...PRODUCTS]
    .filter((p) => p.isFeatured)
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 4);
  const localized = featured.map((p) => getLocalizedProduct(p, i18n.language));

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-14 flex-row-reverse flex-wrap gap-4"
        >
          <Link
            to="/shop"
            className="flex items-center gap-2 text-[#002B49] font-bold hover:text-[#D4AF37] transition-colors group text-sm order-2 sm:order-none"
          >
            {t('productGrid.viewAll')}
            <ArrowLeft className="h-4 w-4 rtl:group-hover:-translate-x-1 ltr:rotate-180 ltr:group-hover:translate-x-1 transition-transform" />
          </Link>
          <div className="text-start order-1 sm:order-none">
            <p className="text-[#D4AF37] font-bold text-sm tracking-widest uppercase mb-2">{t('productGrid.label')}</p>
            <h2 className="text-4xl md:text-5xl font-black text-[#002B49]">
              {t('productGrid.title')}{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #D4AF37, #b8952a)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {t('productGrid.titleSpan')}
              </span>
            </h2>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {localized.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-lg text-white shadow-xl transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #002B49, #003d6b)' }}
          >
            {t('productGrid.browseAll')}
            <ArrowLeft className="h-5 w-5 rtl:rotate-0 ltr:rotate-180" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
