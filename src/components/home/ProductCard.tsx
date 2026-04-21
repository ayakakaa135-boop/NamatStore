import type { FC, MouseEvent } from 'react';
import { motion } from 'motion/react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { Product } from '../../lib/constants';
import { formatPrice } from '../../lib/formatPrice';

export interface ProductCardProps {
  product: Product;
}

const ProductCard: FC<ProductCardProps> = ({ product }) => {
  const { t, i18n } = useTranslation();
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      size: product.sizes[0],
    });
  };

  const handleWishlist = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative overflow-hidden rounded-[2rem] border border-[#e6dbcf] bg-white transition-all duration-300 hover:-translate-y-1"
      style={{ boxShadow: '0 8px 30px rgba(29,45,60,0.04)' }}
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden aspect-[3/4] bg-[#F3E3CF]">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {product.isNew && (
              <span className="rounded-full bg-[#1d2d3c] px-3 py-1 text-[11px] font-black text-white">{t('card.new')}</span>
            )}
            {product.discount && (
              <span className="rounded-full bg-[#efe2cf] px-3 py-1 text-[11px] font-black text-[#7a5a34]">
                -{product.discount}%
              </span>
            )}
          </div>

          <button
            onClick={handleWishlist}
            className="absolute top-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#1d2d3c] shadow-sm transition-all hover:scale-105"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                wishlisted ? 'fill-[#C7613E] text-[#C7613E]' : 'text-[#002B49]'
              }`}
            />
          </button>
        </div>

        <div className="p-4 text-right">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#9f7a53]">{product.category}</p>
          <h3 className="mb-3 line-clamp-2 text-base font-bold leading-tight text-[#1d2d3c]">
            {product.name}
          </h3>

          <div className="mb-4 flex items-center justify-start gap-1 text-[#7a6a56]">
            <Star className="h-3.5 w-3.5 fill-[#D4AF37] text-[#D4AF37]" />
            <span className="text-xs font-bold text-[#002B49]">{product.rating}</span>
            <span className="text-xs">({product.reviewCount})</span>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 justify-start">
                <span className="text-xl font-black text-[#1d2d3c]">{formatPrice(product.price, i18n.language)}</span>
                {product.originalPrice && (
                  <span className="text-sm text-[#7a6a56] line-through">
                    {formatPrice(product.originalPrice, i18n.language)}
                  </span>
                )}
              </div>
              {product.sizes.length > 0 && (
                <p className="mt-2 text-xs text-[#7a6a56]">
                  {product.sizes.slice(0, 3).join(' · ')}
                  {product.sizes.length > 3 ? ` · ${t('card.moreSizes', { n: product.sizes.length - 3 })}` : ''}
                </p>
              )}
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl border border-[#ddd0c2] bg-[#fcfaf7] px-4 text-sm font-bold text-[#1d2d3c] transition hover:bg-[#f3ece4]"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{t('card.addToCart')}</span>
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
