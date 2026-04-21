import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, ShoppingCart, Heart, ChevronRight, Check, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PRODUCTS } from '../lib/constants';
import { getLocalizedProduct } from '../lib/productLocale';
import { formatPrice } from '../lib/formatPrice';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ProductCard from '../components/home/ProductCard';

export default function ProductPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const raw = PRODUCTS.find((p) => p.id === id);
  const product = useMemo(() => (raw ? getLocalizedProduct(raw, i18n.language) : undefined), [raw, i18n.language]);
  const relatedRaw = PRODUCTS.filter((p) => p.categoryId === product?.categoryId && p.id !== id).slice(0, 4);
  const related = useMemo(
    () => relatedRaw.map((p) => getLocalizedProduct(p, i18n.language)),
    [relatedRaw, i18n.language]
  );

  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);

  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = product ? isWishlisted(product.id) : false;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (product?.sizes?.[0]) setSelectedSize(product.sizes[0]);
  }, [id, product?.sizes]);

  if (!product || !raw) {
    return (
      <div className="min-h-screen bg-[#F7F4F0] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-2xl font-black text-[#002B49] mb-4">{t('product.notFound')}</p>
            <Link to="/shop" className="text-[#D4AF37] font-bold hover:underline">
              {t('product.backShop')}
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.image];

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: qty,
      size: selectedSize,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const trust = [
    { icon: Truck, label: t('product.trustShip'), sub: t('product.trustShipSub') },
    { icon: ShieldCheck, label: t('product.trustQuality'), sub: t('product.trustQualitySub') },
    { icon: RefreshCw, label: t('product.trustReturn'), sub: t('product.trustReturnSub') },
  ];

  return (
    <div className="min-h-screen bg-[#F7F4F0]">
      <Header />

      <div className="bg-white border-b border-[#F3E3CF]">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-[#7a6a56]">
            <Link to="/" className="hover:text-[#002B49] transition-colors">
              {t('product.breadcrumbHome')}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50 rtl:rotate-180" />
            <Link to="/shop" className="hover:text-[#002B49] transition-colors">
              {t('product.breadcrumbShop')}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50 rtl:rotate-180" />
            <span className="text-[#002B49] font-semibold line-clamp-1">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div className="space-y-4">
            <motion.div
              key={activeImg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square bg-[#F3E3CF] rounded-3xl overflow-hidden"
            >
              <img src={images[activeImg]} alt={product.name} className="w-full h-full object-cover" />
              {product.isNew && (
                <span className="absolute top-4 end-4 bg-[#002B49] text-white text-xs font-black px-3 py-1.5 rounded-full">
                  {t('product.new')}
                </span>
              )}
              {product.discount && (
                <span className="absolute top-4 start-4 bg-[#C7613E] text-white text-xs font-black px-3 py-1.5 rounded-full">
                  -{product.discount}%
                </span>
              )}
            </motion.div>
            {images.length > 1 && (
              <div className="flex gap-3 flex-wrap">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                      activeImg === i ? 'border-[#D4AF37]' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6 lg:py-4 text-start">
            <div>
              <Link to={`/shop?category=${product.categoryId}`} className="text-[#D4AF37] font-bold text-sm hover:underline">
                {product.category}
              </Link>
              <h1 className="text-3xl md:text-4xl font-black text-[#002B49] mt-2 leading-tight">{product.name}</h1>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-[#e8d9c5]'}`}
                  />
                ))}
              </div>
              <span className="font-bold text-[#002B49]">{product.rating}</span>
              <span className="text-[#7a6a56] text-sm">({t('product.reviews', { count: product.reviewCount })})</span>
            </div>

            <div className="flex items-baseline gap-4 flex-wrap">
              <span className="text-4xl font-black text-[#002B49]">{formatPrice(product.price, i18n.language)}</span>
              {product.originalPrice && (
                <span className="text-lg text-[#7a6a56] line-through">{formatPrice(product.originalPrice, i18n.language)}</span>
              )}
              {product.discount && (
                <span className="bg-[#C7613E]/10 text-[#C7613E] text-sm font-black px-3 py-1 rounded-xl">
                  {t('product.save', { n: product.discount })}
                </span>
              )}
            </div>

            <p className="text-[#7a6a56] leading-loose text-base">{product.description}</p>

            {product.material && (
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <span className="text-[#002B49] font-bold">{t('product.material')}</span>
                <span className="text-[#7a6a56]">{product.material}</span>
              </div>
            )}

            {product.colors && (
              <div>
                <p className="text-[#002B49] font-bold text-sm mb-3">{t('product.colors')}</p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((color) => (
                    <span
                      key={color}
                      className="px-4 py-2 rounded-xl border border-[#e8d9c5] bg-white text-sm font-semibold text-[#002B49]"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                <p className="text-[#002B49] font-bold text-sm">{t('product.chooseSize')}</p>
                <button type="button" className="text-[#D4AF37] text-xs font-bold hover:underline">
                  {t('product.sizeGuide')}
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[48px] h-10 px-3 rounded-xl border-2 text-sm font-bold transition-all ${
                      selectedSize === size
                        ? 'border-[#002B49] bg-[#002B49] text-white'
                        : 'border-[#e8d9c5] text-[#002B49] hover:border-[#D4AF37]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <p className="text-[#002B49] font-bold text-sm">{t('product.quantity')}</p>
              <div className="flex items-center gap-3 bg-white border border-[#e8d9c5] rounded-xl px-4 py-2">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="text-[#002B49] font-black text-xl hover:text-[#D4AF37] transition-colors w-6 text-center"
                >
                  −
                </button>
                <span className="text-[#002B49] font-black text-lg w-8 text-center">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                  className="text-[#002B49] font-black text-xl hover:text-[#D4AF37] transition-colors w-6 text-center"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                className={`flex-1 h-14 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-lg transition-all ${
                  added ? 'bg-green-500 text-white' : 'text-[#002B49] hover:opacity-90'
                }`}
                style={!added ? { background: 'linear-gradient(135deg, #D4AF37, #f0d060)' } : {}}
              >
                {added ? (
                  <>
                    <Check className="h-5 w-5" /> {t('product.added')}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" /> {t('product.addToCart')}
                  </>
                )}
              </motion.button>

              <button
                type="button"
                onClick={() => toggle(product.id)}
                className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${
                  wishlisted
                    ? 'border-[#C7613E] bg-[#C7613E]/10 text-[#C7613E]'
                    : 'border-[#e8d9c5] bg-white text-[#002B49] hover:border-[#C7613E] hover:text-[#C7613E]'
                }`}
              >
                <Heart className={`h-5 w-5 ${wishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#F3E3CF]">
              {trust.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="text-center p-3 rounded-2xl bg-[#F3E3CF]/50">
                  <Icon className="h-5 w-5 text-[#D4AF37] mx-auto mb-1" />
                  <p className="text-[#002B49] font-bold text-xs">{label}</p>
                  <p className="text-[#7a6a56] text-[10px]">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div>
            <h2 className="text-2xl font-black text-[#002B49] mb-8 text-start">{t('product.related')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
