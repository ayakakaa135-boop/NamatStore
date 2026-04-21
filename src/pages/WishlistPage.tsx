import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../context/WishlistContext';
import { PRODUCTS } from '../lib/constants';
import { getLocalizedProduct } from '../lib/productLocale';
import ProductCard from '../components/home/ProductCard';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function WishlistPage() {
  const { t, i18n } = useTranslation();
  const { items: wishlistIds, count } = useWishlist();
  const products = PRODUCTS.filter((p) => wishlistIds.includes(p.id)).map((p) => getLocalizedProduct(p, i18n.language));

  return (
    <div className="min-h-screen bg-[#F7F4F0]">
      <Header />

      <div className="bg-[#002B49] py-12 relative overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-20" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl font-black text-white flex items-center justify-center gap-3">
            <Heart className="h-8 w-8 fill-[#C7613E] text-[#C7613E]" />
            {t('wishlist.title')}
          </h1>
          <p className="text-white/50 mt-2">{t('wishlist.count', { count })}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {count === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="w-28 h-28 rounded-full bg-[#F3E3CF] flex items-center justify-center mx-auto mb-6">
              <Heart className="h-14 w-14 text-[#D4AF37]" />
            </div>
            <h2 className="text-2xl font-black text-[#002B49] mb-3">{t('wishlist.empty')}</h2>
            <p className="text-[#7a6a56] mb-8">{t('wishlist.emptyHint')}</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, #002B49, #003d6b)' }}
            >
              <ShoppingBag className="h-5 w-5" />
              {t('wishlist.browse')}
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            <div className="text-center mt-10">
              <Link to="/shop" className="inline-flex gap-2 text-[#002B49] font-bold hover:text-[#D4AF37] transition-colors">
                {t('wishlist.continue')}
              </Link>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
