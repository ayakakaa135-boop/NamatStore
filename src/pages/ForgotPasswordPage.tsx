import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSupabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

type ForgotPasswordPageProps = {
  mode?: 'request' | 'reset';
};

export default function ForgotPasswordPage({ mode = 'request' }: ForgotPasswordPageProps) {
  const { t, i18n } = useTranslation();
  const supabase = getSupabase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRTL = i18n.language === 'ar';
  const isResetMode = mode === 'reset';

  useEffect(() => {
    if (!isResetMode || !supabase) return;

    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const accessToken = hash.get('access_token');
    const refreshToken = hash.get('refresh_token');

    if (!accessToken || !refreshToken) return;

    void supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }, [isResetMode, supabase]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError(t('contact.errorSend'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = isResetMode
        ? await supabase.auth.updateUser({ password })
        : await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });

      if (resetError) throw resetError;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || t('auth.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F4F0] selection:bg-[#002B49] selection:text-white">
      <Header />

      <main className="flex-grow flex items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-[2.5rem] border border-[#F3E3CF] shadow-2xl p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-[#F3E3CF] flex items-center justify-center mx-auto mb-6">
                <Mail className="h-10 w-10 text-[#D4AF37]" />
              </div>
              <h1 className="text-3xl font-black text-[#002B49] mb-3">
                {isResetMode
                  ? isRTL ? 'تعيين كلمة مرور جديدة' : 'Create a new password'
                  : isRTL ? 'استعادة كلمة المرور' : 'Reset your password'}
              </h1>
              <p className="text-[#7a6a56] font-medium">
                {isResetMode
                  ? isRTL
                    ? 'أدخل كلمة مرور جديدة لحسابك ثم احفظ التغيير.'
                    : 'Enter a new password for your account and save the change.'
                  : isRTL
                    ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور.'
                    : 'Enter your email and we will send you a password reset link.'}
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            {success ? (
              <div className="bg-green-50 border border-green-100 text-green-700 p-6 rounded-2xl text-center">
                <CheckCircle2 className="h-10 w-10 mx-auto mb-3" />
                <h2 className="font-black text-lg mb-2">
                  {isRTL ? 'تم إرسال الرابط' : 'Reset link sent'}
                </h2>
                <p className="text-sm">
                  {isRTL
                    ? 'تحقق من بريدك الإلكتروني واتبع التعليمات لإكمال العملية.'
                    : 'Check your inbox and follow the instructions to continue.'}
                </p>
              </div>
            ) : (
              <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#002B49] ms-1">
                    {isResetMode ? t('auth.passLabel') : t('auth.emailLabel')}
                  </label>
                  {isResetMode ? (
                    <Input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('auth.passPlaceHolder')}
                      className="h-14 bg-[#F7F4F0] border-[#e8d9c5] focus:border-[#D4AF37] rounded-2xl"
                    />
                  ) : (
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('auth.emailPlaceHolder')}
                      className="h-14 bg-[#F7F4F0] border-[#e8d9c5] focus:border-[#D4AF37] rounded-2xl"
                    />
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-2xl bg-[#002B49] hover:bg-[#003d6b] text-white font-black text-lg"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : isRTL ? (
                    <>
                      {isResetMode ? 'حفظ كلمة المرور' : 'إرسال الرابط'}
                      <ArrowLeft className="ms-2 h-5 w-5" />
                    </>
                  ) : (
                    <>
                      {isResetMode ? 'Save password' : 'Send reset link'}
                      <ArrowRight className="ms-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-[#F3E3CF] text-center">
              <Link to="/login" className="text-[#D4AF37] font-black hover:underline">
                {isRTL ? 'العودة إلى تسجيل الدخول' : 'Back to sign in'}
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
