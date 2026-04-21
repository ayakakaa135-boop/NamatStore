import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { getSupabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const supabase = getSupabase();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  if (user && !authLoading) {
    const from = (location.state as any)?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError(t('auth.errorGeneric'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
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
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37] rounded-full blur-[150px] opacity-10 animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#002B49] rounded-full blur-[150px] opacity-5 animate-pulse" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md z-10"
        >
          <div className="glass p-8 md:p-10 rounded-[2.5rem] border border-white/20 shadow-2xl backdrop-blur-xl bg-white/40">
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-[#002B49] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl rotate-3"
              >
                <Lock className="text-[#D4AF37] h-10 w-10" />
              </motion.div>
              <h1 className="text-3xl font-black text-[#002B49] mb-3 tracking-tighter">
                {t('auth.signInTitle')}
              </h1>
              <p className="text-[#7a6a56] font-medium px-4">
                {t('auth.signInSubtitle')}
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
            </AnimatePresence>

            <form onSubmit={handleLogin} className="space-y-6">
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

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-bold text-[#002B49]">
                    {t('auth.passLabel')}
                  </label>
                  <Link to="/forgot-password" title={t('auth.forgotPass')} className="text-xs font-bold text-[#D4AF37] hover:underline">
                    {t('auth.forgotPass')}
                  </Link>
                </div>
                <div className="relative group">
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.passPlaceHolder')}
                    className="h-14 bg-white/50 border-white/50 focus:border-[#D4AF37] focus:ring-[#D4AF37]/10 rounded-2xl ps-12 transition-all"
                  />
                  <Lock className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} h-6 w-6 text-[#7a6a56] group-focus-within:text-[#D4AF37] transition-colors`} />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-[#002B49] hover:bg-[#003d6b] text-white font-black text-lg transition-all shadow-xl group"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {t('auth.signInBtn')}
                    {isRTL ? (
                      <ArrowLeft className="ms-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    ) : (
                      <ArrowRight className="ms-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    )}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-10 pt-8 border-t border-[#F3E3CF] text-center">
              <p className="text-[#7a6a56] font-medium">
                {t('auth.notRegistered')}{' '}
                <Link to="/register" className="text-[#D4AF37] font-black hover:underline px-1">
                  {t('auth.signUpBtn')}
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
