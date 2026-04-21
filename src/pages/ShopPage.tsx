import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PRODUCTS, CATEGORIES, Product } from '../lib/constants';
import { productSearchBlob, getLocalizedProduct } from '../lib/productLocale';
import ProductCard from '../components/home/ProductCard';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

function sortList(list: Product[], sortVal: string): Product[] {
  const sorted = [...list];
  switch (sortVal) {
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      break;
    default:
      break;
  }
  return sorted;
}

export default function ShopPage() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sort, setSort] = useState('default');
  const [priceMax, setPriceMax] = useState(3000);

  const sortOptions = useMemo(
    () => [
      { value: 'default', label: t('shop.sortDefault') },
      { value: 'price-asc', label: t('shop.sortPriceAsc') },
      { value: 'price-desc', label: t('shop.sortPriceDesc') },
      { value: 'rating', label: t('shop.sortRating') },
      { value: 'newest', label: t('shop.sortNewest') },
    ],
    [t, i18n.language]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    const c = searchParams.get('category');
    if (c) setActiveCategory(c);
    else if (!searchParams.get('search') && searchParams.get('discount') !== 'true') {
      setActiveCategory('all');
    }
  }, [searchParams]);

  useEffect(() => {
    let filtered = [...PRODUCTS];
    if (activeCategory !== 'all') {
      filtered = filtered.filter((p) => p.categoryId === activeCategory);
    }
    const search = searchParams.get('search');
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((p) => productSearchBlob(p, i18n.language).includes(q));
    }
    if (searchParams.get('discount') === 'true') {
      filtered = filtered.filter((p) => p.discount);
    }
    filtered = filtered.filter((p) => p.price <= priceMax);
    setProducts(sortList(filtered, sort));
  }, [activeCategory, searchParams, priceMax, sort, i18n.language]);

  const handleCategory = (catId: string) => {
    setActiveCategory(catId);
  };

  const handleSort = (val: string) => {
    setSort(val);
  };

  const displayProducts = useMemo(
    () => products.map((p) => getLocalizedProduct(p, i18n.language)),
    [products, i18n.language]
  );

  const categoryLabel = (cat: (typeof CATEGORIES)[0]) => (i18n.language === 'en' ? cat.nameEn : cat.name);
  const currentCategory = CATEGORIES.find((cat) => cat.id === activeCategory);
  const shopIntro = currentCategory?.description || t('shop.defaultIntro');

  return (
    <div className="min-h-screen bg-[#f5f1eb]">
      <Header />

      <section className="px-4 pt-8 md:pt-10">
        <div className="container mx-auto rounded-[2.25rem] border border-[#e6dbcf] bg-[#fbf8f4] px-6 py-10 md:px-10 md:py-14">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#8e6e49] font-semibold text-xs tracking-[0.4em] uppercase mb-4 text-start"
          >
            {t('shop.storeLabel')}
          </motion.p>
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
            <div className="text-start">
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-black text-[#1d2d3c]"
              >
                {currentCategory ? categoryLabel(currentCategory) : t('shop.title')}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-4 max-w-2xl text-sm leading-8 text-[#766a5d]"
              >
                {shopIntro}
              </motion.p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:max-w-sm md:ms-auto">
              <div className="rounded-[1.75rem] border border-[#e6dbcf] bg-white px-5 py-5 text-start">
                <p className="text-xs uppercase tracking-[0.25em] text-[#9f7a53]">{t('shop.countCard')}</p>
                <p className="mt-3 text-3xl font-black text-[#1d2d3c]">{products.length}</p>
              </div>
              <div className="rounded-[1.75rem] border border-[#e6dbcf] bg-white px-5 py-5 text-start">
                <p className="text-xs uppercase tracking-[0.25em] text-[#9f7a53]">{t('shop.rangeCard')}</p>
                <p className="mt-3 text-lg font-black text-[#1d2d3c]">
                  {priceMax} {i18n.language === 'en' ? 'SAR' : 'ر.س'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <div className="flex gap-8 items-start">
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-[2rem] p-6 border border-[#e6dbcf]">
                <h3 className="text-[#1d2d3c] font-black text-lg mb-4 text-start">{t('shop.categories')}</h3>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleCategory('all')}
                    className={`w-full text-start px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      activeCategory === 'all'
                        ? 'bg-[#1d2d3c] text-white'
                        : 'text-[#6e6358] bg-[#fcfaf7] hover:bg-[#f3ece4] hover:text-[#1d2d3c]'
                    }`}
                  >
                    {t('shop.allCats')}
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategory(cat.id)}
                      className={`w-full text-start px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                        activeCategory === cat.id
                          ? 'bg-[#1d2d3c] text-white'
                          : 'text-[#6e6358] bg-[#fcfaf7] hover:bg-[#f3ece4] hover:text-[#1d2d3c]'
                      }`}
                    >
                      {categoryLabel(cat)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-6 border border-[#e6dbcf]">
                <h3 className="text-[#1d2d3c] font-black text-lg mb-4 text-start">{t('shop.priceRange')}</h3>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="3000"
                    step="50"
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="w-full accent-[#b99a72]"
                  />
                  <div className="flex justify-between text-sm text-[#1d2d3c] font-bold">
                    <span>0 {i18n.language === 'en' ? 'SAR' : 'ر.س'}</span>
                    <span>
                      {priceMax} {i18n.language === 'en' ? 'SAR' : 'ر.س'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="mb-6 rounded-[2rem] border border-[#e6dbcf] bg-white p-4 md:p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-hide pb-1">
                  <button
                    type="button"
                    onClick={() => handleCategory('all')}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all ${
                      activeCategory === 'all' ? 'bg-[#1d2d3c] text-white' : 'bg-[#f7f1ea] text-[#6e6358]'
                    }`}
                  >
                    {t('shop.all')}
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategory(cat.id)}
                      className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all ${
                        activeCategory === cat.id ? 'bg-[#1d2d3c] text-white' : 'bg-[#f7f1ea] text-[#6e6358]'
                      }`}
                    >
                      {categoryLabel(cat)}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[#7a6a56] text-sm">{t('header.productCount', { count: products.length })}</span>
                  <div className="relative">
                    <select
                      value={sort}
                      onChange={(e) => handleSort(e.target.value)}
                      className="appearance-none h-11 ps-8 pe-10 rounded-2xl border border-[#ddd0c2] bg-[#fcfaf7] text-[#1d2d3c] font-semibold text-sm cursor-pointer focus:outline-none focus:border-[#b99a72]"
                    >
                      {sortOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute end-3 top-3.5 h-4 w-4 text-[#7a6a56] pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4 rounded-[1.5rem] bg-[#fbf8f4] px-4 py-3">
                <p className="text-sm text-[#766a5d]">{t('shop.minimalNote')}</p>
                <div className="relative">
                  <span className="text-sm font-bold text-[#1d2d3c]">
                    {t('shop.upToPrice', { price: priceMax })}
                  </span>
                </div>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-20 h-20 rounded-full bg-[#f1e6d7] flex items-center justify-center mx-auto mb-4">
                  <X className="h-10 w-10 text-[#8e6e49]" />
                </div>
                <p className="text-[#1d2d3c] font-bold text-xl">{t('shop.noProducts')}</p>
                <p className="text-[#7a6a56] mt-2">{t('shop.tryFilters')}</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {displayProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
