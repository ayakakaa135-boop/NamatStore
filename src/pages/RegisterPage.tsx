import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { getSupabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const supabase = getSupabase();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Redirect if already logged in
  if (user && !authLoading) {
    return <Navigate to="/" replace />;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError(t('auth.errorGeneric'));
      return;
    }

    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError(t('auth.errorPassMatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.errorPass'));
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      // If everything is fine
      clearCart();
      setSuccess(true);
      // Optional: Auto-login or redirect after a few seconds
      setTimeout(() => {
        if (data.session) navigate('/');
        else navigate('/login');
      }, 3000);

    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || t('auth.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  const isRTL = i18n.language === 'ar';

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F4F0] selection:bg-[#002B49] selection:text-white">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-20 px-4 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#D4AF37] rounded-full blur-[150px] opacity-10 animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#002B49] rounded-full blur-[150px] opacity-5 animate-pulse" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md z-10"
        >
          <div className="glass p-8 md:p-10 rounded-[2.5rem] border border-white/20 shadow-2xl backdrop-blur-xl bg-white/40">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-[#D4AF37] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl -rotate-3"
              >
                <UserIcon className="text-[#002B49] h-10 w-10" />
              </motion.div>
              <h1 className="text-3xl font-black text-[#002B49] mb-3 tracking-tighter">
                {t('auth.signUpTitle')}
              </h1>
              <p className="text-[#7a6a56] font-medium px-4">
                {t('auth.signUpSubtitle')}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-start gap-3"
                >
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-bold">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 bg-green-50 border border-green-100 text-green-600 p-6 rounded-2xl text-center"
                >
                  <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-green-500" />
                  <h3 className="font-black text-lg mb-1">{t('auth.successMessage')}</h3>
                  <p className="text-sm opacity-80">{t('auth.loading')}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {!success && (
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#002B49] ms-1">
                    {t('auth.fullNameLabel')}
                  </label>
                  <div className="relative group">
                    <Input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t('auth.fullNamePlaceHolder')}
                      className="h-14 bg-white/50 border-white/50 focus:border-[#D4AF37] focus:ring-[#D4AF37]/10 rounded-2xl ps-12 transition-all"
                    />
                    <UserIcon className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} h-6 w-6 text-[#7a6a56] group-focus-within:text-[#D4AF37] transition-colors`} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#002B49] ms-1">
                    {t('auth.emailLabel')}
                  </label>
                  <div className="relative group">
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('auth.emailPlaceHolder')}
                      className="h-14 bg-white/50 border-white/50 focus:border-[#D4AF37] focus:ring-[#D4AF37]/10 rounded-2xl ps-12 transition-all"
                    />
                    <Mail className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} h-6 w-6 text-[#7a6a56] group-focus-within:text-[#D4AF37] transition-colors`} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#002B49] ms-1">
                      {t('auth.passLabel')}
                    </label>
                    <div className="relative group">
                      <Input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('auth.passPlaceHolder')}
                        className="h-14 bg-white/50 border-white/50 focus:border-[#D4AF37] focus:ring-[#D4AF37]/10 rounded-2xl ps-12 transition-all text-sm"
                      />
                      <Lock className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} h-5 w-5 text-[#7a6a56] group-focus-within:text-[#D4AF37] transition-colors`} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#002B49] ms-1">
                      {t('auth.confirmPassLabel')}
                    </label>
                    <div className="relative group">
                      <Input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t('auth.passPlaceHolder')}
                        className="h-14 bg-white/50 border-white/50 focus:border-[#D4AF37] focus:ring-[#D4AF37]/10 rounded-2xl ps-12 transition-all text-sm"
                      />
                      <Lock className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} h-5 w-5 text-[#7a6a56] group-focus-within:text-[#D4AF37] transition-colors`} />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-2xl bg-[#002B49] hover:bg-[#003d6b] text-white font-black text-lg transition-all shadow-xl group mt-4"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      {t('auth.signUpBtn')}
                      {isRTL ? (
                        <ArrowLeft className="ms-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                      ) : (
                        <ArrowRight className="ms-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      )}
                    </>
                  )}
                </Button>
              </form>
            )}

            {!success && (
              <div className="mt-8 pt-6 border-t border-[#F3E3CF] text-center">
                <p className="text-[#7a6a56] font-medium">
                  {t('auth.alreadyRegistered')}{' '}
                  <Link to="/login" className="text-[#D4AF37] font-black hover:underline px-1">
                    {t('auth.signInBtn')}
                  </Link>
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
