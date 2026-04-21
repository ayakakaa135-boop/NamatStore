import { ShoppingCart, Search, Menu, User, Heart, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/formatPrice';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Header() {
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { count, items, total, removeItem } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    navigate('/');
  };

  const navLinks = useMemo(
    () => [
      { label: t('nav.home'), to: '/' },
      { label: t('nav.shop'), to: '/shop' },
      { label: t('nav.abaya'), to: '/shop?category=abaya' },
      { label: t('nav.deals'), to: '/shop?discount=true' },
      { label: t('nav.about'), to: '/about' },
    ],
    [t, i18n.language]
  );

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-500 ${
          isScrolled
            ? 'glass shadow-lg border-b border-gold/10 h-16'
            : 'bg-transparent h-20'
        }`}
      >
        <div className="container mx-auto px-4 h-full flex items-center justify-between gap-4">
          <div className="flex items-center md:hidden">
            <Sheet>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="rounded-full text-navy hover:bg-gold/10" />}>
                <Menu className="h-6 w-6" />
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-white border-s border-gold/20">
                <SheetHeader className="text-start mb-8 border-b border-gold/20 pb-6">
                  <SheetTitle>
                    <img
                      src="/image/namat_logo.webp"
                      alt="NAMAT"
                      className="h-14 object-contain mx-auto"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <p className="text-xs text-center text-[#C7613E] font-medium mt-2">{t('header.tagline')}</p>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2">
                  {navLinks.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="text-lg font-medium py-3 px-4 rounded-xl hover:bg-[#F3E3CF] hover:text-[#002B49] transition-all text-[#002B49]"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="mt-4 pt-4 border-t border-gold/20">
                    {user ? (
                      <div className="space-y-2">
                        <div className="px-4 py-2">
                          <p className="text-xs font-bold text-[#7a6a56] mb-1">{t('auth.fullNameLabel')}</p>
                          <p className="text-sm font-black text-[#002B49] truncate">{user.user_metadata?.full_name || user.email}</p>
                        </div>
                        {isAdmin && (
                          <Link
                            to="/admin/orders"
                            className="flex items-center gap-3 w-full px-4 py-3 text-lg font-medium text-[#002B49] hover:bg-[#F3E3CF] rounded-xl transition-all"
                          >
                            <ShoppingCart className="h-5 w-5" />
                            {t('orders.adminTitle')}
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 w-full px-4 py-3 text-lg font-medium text-[#002B49] hover:bg-[#F3E3CF] rounded-xl transition-all"
                        >
                          <User className="h-5 w-5" />
                          {t('profile.title')}
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 w-full px-4 py-3 text-lg font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <LogOut className="h-5 w-5" />
                          {t('auth.logoutBtn')}
                        </button>
                      </div>
                    ) : (
                      <Link
                        to="/login"
                        className="flex items-center gap-3 w-full px-4 py-3 text-lg font-medium text-[#002B49] hover:bg-[#F3E3CF] rounded-xl transition-all"
                      >
                        <User className="h-5 w-5" />
                        {t('auth.signInBtn')}
                      </Link>
                    )}
                  </div>
                </nav>
                <div className="mt-8 pt-6 border-t border-gold/20">
                  <Link to="/contact" className="text-sm text-[#7a6a56] hover:text-[#D4AF37] transition-colors">
                    {t('header.contact')}
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <img
              src="/image/namat_logo.webp"
              alt="NAMAT"
              className="h-12 object-contain transition-transform group-hover:scale-105"
              style={{ filter: isScrolled ? 'none' : 'brightness(1)' }}
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'text-2xl font-black text-[#002B49]';
                fallback.textContent = 'نمط';
                el.parentNode?.appendChild(fallback);
              }}
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm font-semibold text-[#002B49] hover:text-[#D4AF37] transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 start-0 w-0 h-0.5 bg-[#D4AF37] transition-all group-hover:w-full rounded-full" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-[#D4AF37]/10 text-[#002B49]"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-[#D4AF37]/10 text-[#002B49] hidden sm:flex">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -end-1 bg-[#C7613E] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>

            <div className="relative">
              {user ? (
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`rounded-full hover:bg-[#D4AF37]/10 text-[#002B49] hidden sm:flex ${userMenuOpen ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : ''}`}
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <User className="h-5 w-5" />
                  </Button>
                  
                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className={`absolute ${i18n.language === 'ar' ? 'left-0' : 'right-0'} mt-1 top-full z-50 w-56 glass border border-[#F3E3CF] rounded-2xl shadow-xl overflow-hidden`}
                        >
                          <div className="p-4 border-b border-[#F3E3CF] bg-[#F7F4F0]/50 text-start">
                            <p className="text-xs font-bold text-[#7a6a56] mb-1">{t('auth.fullNameLabel')}</p>
                            <p className="text-sm font-black text-[#002B49] truncate">{user.user_metadata?.full_name || user.email}</p>
                          </div>
                          <div className="p-2 space-y-1">
                            <Link 
                              to="/orders" 
                              className="flex items-center gap-3 w-full px-3 py-2 text-sm font-bold text-[#002B49] hover:bg-[#D4AF37]/10 rounded-xl transition-colors text-start"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <div className="w-8 h-8 rounded-lg bg-[#F3E3CF] flex items-center justify-center">
                                <ShoppingCart className="h-4 w-4 text-[#D4AF37]" />
                              </div>
                              {i18n.language === 'ar' ? 'طلباتي' : 'My orders'}
                            </Link>
                            <Link
                              to="/profile"
                              className="flex items-center gap-3 w-full px-3 py-2 text-sm font-bold text-[#002B49] hover:bg-[#D4AF37]/10 rounded-xl transition-colors text-start"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <div className="w-8 h-8 rounded-lg bg-[#F3E3CF] flex items-center justify-center">
                                <User className="h-4 w-4 text-[#D4AF37]" />
                              </div>
                              {t('profile.title')}
                            </Link>
                            {isAdmin && (
                              <Link
                                to="/admin/orders"
                                className="flex items-center gap-3 w-full px-3 py-2 text-sm font-bold text-[#002B49] hover:bg-[#D4AF37]/10 rounded-xl transition-colors text-start"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <div className="w-8 h-8 rounded-lg bg-[#F3E3CF] flex items-center justify-center">
                                  <ShoppingCart className="h-4 w-4 text-[#D4AF37]" />
                                </div>
                                {t('orders.adminTitle')}
                              </Link>
                            )}
                            <button
                              onClick={handleSignOut}
                              className="flex items-center gap-3 w-full px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-start"
                            >
                              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                                <LogOut className="h-4 w-4 text-red-600" />
                              </div>
                              {t('auth.logoutBtn')}
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="hidden sm:block">
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-[#D4AF37]/10 text-[#002B49]">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>

            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    className="relative rounded-2xl bg-[#002B49] hover:bg-[#003d6b] text-white h-10 w-10 shadow-lg ms-1"
                    size="icon"
                  />
                }
              >
                <ShoppingCart className="h-5 w-5" />
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -end-1 bg-[#D4AF37] text-[#002B49] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white"
                  >
                    {count}
                  </motion.span>
                )}
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:max-w-md bg-white border-e border-gold/20 flex flex-col">
                <SheetHeader className="text-start mb-6 border-b border-[#F3E3CF] pb-4">
                  <SheetTitle className="text-xl font-bold text-[#002B49] flex flex-wrap items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-[#D4AF37]" />
                    {t('header.cartTitle')}
                    {count > 0 && (
                      <span className="text-sm font-normal text-[#7a6a56]">
                        ({t('header.cartCount', { count })})
                      </span>
                    )}
                  </SheetTitle>
                </SheetHeader>

                {items.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
                    <div className="w-20 h-20 rounded-full bg-[#F3E3CF] flex items-center justify-center">
                      <ShoppingCart className="h-10 w-10 text-[#D4AF37]" />
                    </div>
                    <p className="text-[#002B49] font-semibold text-lg">{t('header.cartEmpty')}</p>
                    <p className="text-[#7a6a56] text-sm">{t('header.cartEmptyHint')}</p>
                    <Link to="/shop">
                      <Button className="bg-[#002B49] hover:bg-[#003d6b] text-white rounded-2xl px-8">{t('header.shopNow')}</Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3 pb-4">
                      {items.map((item) => (
                        <div key={`${item.id}-${item.size ?? ''}`} className="flex gap-3 p-3 rounded-2xl bg-[#F7F4F0] border border-[#F3E3CF]">
                          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#F3E3CF]">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0 text-start">
                            <h4 className="font-bold text-sm text-[#002B49] truncate">{item.name}</h4>
                            {item.size && (
                              <p className="text-xs text-[#7a6a56] mt-0.5">
                                {t('header.sizeLabel')} {item.size}
                              </p>
                            )}
                            <p className="text-[#D4AF37] font-black mt-1 text-sm">
                              {formatPrice(item.price * item.quantity, i18n.language)}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                type="button"
                                onClick={() => removeItem({ id: item.id, size: item.size })}
                                className="p-1 rounded-lg border border-[#e8d9c5] hover:border-red-300 hover:text-red-500 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                              <span className="text-xs font-bold text-[#002B49] bg-white px-3 py-1 rounded-lg border border-[#e8d9c5]">
                                {item.quantity}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-[#F3E3CF] pt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[#7a6a56] font-medium">{t('header.subtotal')}</span>
                        <span className="text-2xl font-black text-[#002B49]">{formatPrice(total, i18n.language)}</span>
                      </div>
                      <Link to="/cart" className="block">
                        <Button className="w-full h-12 text-base font-bold rounded-2xl bg-[#D4AF37] hover:bg-[#b8952a] text-[#002B49] shadow-lg">
                          {t('header.viewCart')}
                        </Button>
                      </Link>
                      <Link to="/shop" className="block">
                        <Button variant="ghost" className="w-full h-10 text-sm text-[#7a6a56] hover:text-[#002B49]">
                          {t('header.continueShopping')}
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#002B49]/80 backdrop-blur-sm flex items-start justify-center pt-24"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="w-full max-w-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSearch} className="relative">
                <Input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('header.searchPlaceholder')}
                  className="h-16 text-lg ps-14 pe-14 rounded-2xl bg-white border-2 border-[#D4AF37] text-[#002B49] placeholder:text-[#7a6a56] shadow-2xl"
                />
                <Search className="absolute top-5 h-6 w-6 text-[#D4AF37] start-5" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute end-4 top-4 rounded-full text-[#7a6a56] hover:text-[#002B49]"
                  onClick={() => setSearchOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </form>
              <p className="text-center text-white/60 text-sm mt-4">{t('header.searchHint')}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
