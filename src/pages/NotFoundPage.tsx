import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, ShoppingBag, Search, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F4F0]">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-24 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-1/4 end-1/4 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 start-1/3 w-64 h-64 bg-[#002B49]/5 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-lg relative z-10"
        >
          {/* Large 404 number */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <h1
              className="text-[10rem] md:text-[14rem] font-black leading-none select-none"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #f0d060 40%, #b8952a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                opacity: 0.25,
              }}
            >
              404
            </h1>
          </motion.div>

          <div className="-mt-16 relative z-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 border border-[#D4AF37]/30 bg-[#D4AF37]/10"
            >
              <Search className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-xs font-bold tracking-wider">
                {t('notFound.code')}
              </span>
            </motion.div>

            <h2 className="text-2xl md:text-3xl font-black text-[#002B49] mb-4">
              {t('notFound.title')}
            </h2>
            <p className="text-[#7a6a56] leading-relaxed mb-10 max-w-sm mx-auto">
              {t('notFound.body')}
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-black text-white shadow-xl transition-all"
                  style={{ background: 'linear-gradient(135deg, #002B49, #003d6b)' }}
                >
                  <Home className="h-5 w-5" />
                  {t('notFound.home')}
                </motion.button>
              </Link>
              <Link to="/shop">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold border-2 border-[#D4AF37] text-[#002B49] hover:bg-[#D4AF37] hover:text-[#002B49] transition-all shadow-lg"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {t('notFound.shop')}
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
