import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trash2, ShoppingBag, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/formatPrice';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function CartPage() {
  const { t, i18n } = useTranslation();
  const { items, removeItem, updateQuantity, total, count } = useCart();
  const shipping = total >= 500 ? 0 : 30;
  const grand = total + shipping;

  return (
    <div className="min-h-screen bg-[#F7F4F0]">
      <Header />

      <div className="bg-[#002B49] py-12 relative overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-20" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl font-black text-white">{t('cart.title')}</h1>
          <p className="text-white/50 mt-2">{t('cart.countInCart', { count })}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="w-28 h-28 rounded-full bg-[#F3E3CF] flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-14 w-14 text-[#D4AF37]" />
            </div>
            <h2 className="text-2xl font-black text-[#002B49] mb-3">{t('cart.empty')}</h2>
            <p className="text-[#7a6a56] mb-8">{t('cart.emptyHint')}</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, #002B49, #003d6b)' }}
            >
              <ShoppingBag className="h-5 w-5" />
              {t('cart.shopNow')}
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, i) => (
                <motion.div
                  key={`${item.id}-${item.size ?? ''}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-3xl p-5 border border-[#F3E3CF] flex gap-5"
                >
                  <Link to={`/product/${item.id}`} className="block w-28 h-32 rounded-2xl overflow-hidden bg-[#F3E3CF] shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </Link>
                  <div className="flex-1 min-w-0 text-start">
                    <div className="flex justify-between gap-2">
                      <Link
                        to={`/product/${item.id}`}
                        className="text-[#002B49] font-black text-lg hover:text-[#D4AF37] transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem({ id: item.id, size: item.size })}
                        className="text-[#7a6a56] hover:text-red-500 transition-colors p-1 shrink-0"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    {item.size && (
                      <p className="text-[#7a6a56] text-sm mt-1">
                        {t('cart.size')} <span className="font-bold text-[#002B49]">{item.size}</span>
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
                      <p className="text-xl font-black text-[#002B49]">{formatPrice(item.price * item.quantity, i18n.language)}</p>
                      <div className="flex items-center gap-2 border border-[#e8d9c5] rounded-xl px-3 py-1.5 bg-[#F7F4F0]">
                        <button
                          type="button"
                          onClick={() => updateQuantity({ id: item.id, size: item.size }, Math.max(1, item.quantity - 1))}
                          className="text-[#002B49] font-black text-lg w-5 text-center hover:text-[#D4AF37] transition-colors"
                        >
                          −
                        </button>
                        <span className="text-[#002B49] font-bold w-6 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity({ id: item.id, size: item.size }, item.quantity + 1)}
                          className="text-[#002B49] font-black text-lg w-5 text-center hover:text-[#D4AF37] transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              <div className="pt-2">
                <Link
                  to="/shop"
                  className="flex items-center gap-2 text-[#002B49] font-bold text-sm hover:text-[#D4AF37] transition-colors"
                >
                  <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                  {t('cart.continue')}
                </Link>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-3xl p-6 border border-[#F3E3CF] sticky top-24">
                <h2 className="text-xl font-black text-[#002B49] mb-6 text-start">{t('cart.summary')}</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#7a6a56]">{t('cart.subtotal')}</span>
                    <span className="font-bold text-[#002B49]">{formatPrice(total, i18n.language)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7a6a56]">{t('cart.shipping')}</span>
                    <span className="text-green-600 font-bold">
                      {total >= 500 ? t('cart.shippingFree') : formatPrice(30, i18n.language)}
                    </span>
                  </div>
                  {total < 500 && (
                    <div className="p-3 rounded-xl bg-[#F3E3CF] text-xs text-[#002B49] text-start">
                      {t('cart.addForFreeShip', { amount: formatPrice(500 - total, i18n.language) })}
                    </div>
                  )}
                  <div className="border-t border-[#F3E3CF] pt-4 flex justify-between items-baseline">
                    <span className="text-[#002B49] font-bold text-base">{t('cart.total')}</span>
                    <span className="text-2xl font-black text-[#002B49]">{formatPrice(grand, i18n.language)}</span>
                  </div>
                </div>

                <Link to="/checkout">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-14 rounded-2xl font-black text-lg text-[#002B49] shadow-xl mt-6 hover:opacity-90 transition-all"
                    style={{ background: 'linear-gradient(135deg, #D4AF37, #f0d060)' }}
                  >
                    {t('cart.checkout')}
                  </motion.button>
                </Link>

                <div className="mt-6 text-center">
                  <p className="text-[#7a6a56] text-xs mb-3">{t('cart.securePay')}</p>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {['Visa', 'Mastercard', 'Mada', 'Tabby', 'Tamara'].map((m) => (
                      <span key={m} className="text-[10px] font-bold px-2 py-1 rounded-lg border border-[#e8d9c5] text-[#7a6a56]">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
