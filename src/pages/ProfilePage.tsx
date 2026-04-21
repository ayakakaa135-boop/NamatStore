import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Globe, Mail, Save, Shield, User2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { getMyProfile, upsertMyProfile } from '@/lib/profile';

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    website: '',
    avatarUrl: '',
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    void (async () => {
      const res = await getMyProfile(user.id);
      setLoading(false);
      if (!res.ok) {
        setNotice(res.error || t('profile.loadError'));
        return;
      }

      setForm({
        fullName: res.profile?.full_name || user.user_metadata?.full_name || '',
        website: res.profile?.website || '',
        avatarUrl: res.profile?.avatar_url || '',
      });
    })();
  }, [t, user]);

  if (!authLoading && !user) {
    return <Navigate to="/login" replace state={{ from: { pathname: '/profile' } }} />;
  }

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setNotice(null);

    const res = await upsertMyProfile({
      id: user.id,
      full_name: form.fullName || null,
      website: form.website || null,
      avatar_url: form.avatarUrl || null,
      role,
    });

    setSaving(false);
    setNotice(res.ok ? t('profile.saved') : res.error || t('profile.saveError'));
  };

  return (
    <div className="min-h-screen bg-[#f5f1eb] flex flex-col">
      <Header />

      <main className="flex-1 px-4 py-10 md:py-14">
        <div className="mx-auto max-w-5xl space-y-8">
          <section className="rounded-[2rem] border border-[#e7ddd0] bg-white px-6 py-8 md:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#9f7a53]">{t('profile.eyebrow')}</p>
            <h1 className="mt-3 text-3xl font-black text-[#1d2d3c] md:text-4xl">{t('profile.title')}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#766a5d]">{t('profile.subtitle')}</p>
          </section>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <aside className="rounded-[2rem] border border-[#e7ddd0] bg-white p-6 text-start">
              <div className="flex items-center gap-4">
                {form.avatarUrl ? (
                  <img src={form.avatarUrl} alt="" className="h-20 w-20 rounded-[1.5rem] object-cover border border-[#e7ddd0]" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-[#f3ece4] text-[#1d2d3c]">
                    <User2 className="h-8 w-8" />
                  </div>
                )}
                <div>
                  <p className="text-2xl font-black text-[#1d2d3c]">{form.fullName || user?.email?.split('@')[0]}</p>
                  <p className="mt-1 text-sm text-[#766a5d]">{user?.email}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-[#efe5d8] bg-[#fcfaf7] p-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-[#9f7a53]" />
                    <span className="text-sm text-[#766a5d]">{user?.email}</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-[#efe5d8] bg-[#fcfaf7] p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-[#9f7a53]" />
                    <span className="text-sm text-[#766a5d]">{t(`profile.role.${role}`)}</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-[#efe5d8] bg-[#fcfaf7] p-4">
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-[#9f7a53]" />
                    <span className="text-sm text-[#766a5d]">{t('profile.langValue', { lang: i18n.language === 'ar' ? 'العربية' : 'English' })}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/orders" className="rounded-2xl border border-[#ddd0c2] px-4 py-3 text-sm font-bold text-[#1d2d3c] hover:bg-[#f5efe7]">
                  {t('profile.myOrders')}
                </Link>
                <Link to="/wishlist" className="rounded-2xl border border-[#ddd0c2] px-4 py-3 text-sm font-bold text-[#1d2d3c] hover:bg-[#f5efe7]">
                  {t('profile.savedItems')}
                </Link>
              </div>
            </aside>

            <section className="rounded-[2rem] border border-[#e7ddd0] bg-white p-6 md:p-8 text-start">
              {loading ? (
                <p className="font-bold text-[#1d2d3c]">{t('profile.loading')}</p>
              ) : (
                <>
                  <div className="grid gap-5">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-[#1d2d3c]">{t('profile.fullName')}</label>
                      <input
                        value={form.fullName}
                        onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                        className="h-12 w-full rounded-2xl border border-[#ddd0c2] bg-[#fcfaf7] px-4 text-sm text-[#1d2d3c] outline-none focus:border-[#b99a72]"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-[#1d2d3c]">{t('profile.website')}</label>
                      <input
                        value={form.website}
                        onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
                        placeholder="https://"
                        className="h-12 w-full rounded-2xl border border-[#ddd0c2] bg-[#fcfaf7] px-4 text-sm text-[#1d2d3c] outline-none focus:border-[#b99a72]"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-[#1d2d3c]">{t('profile.avatar')}</label>
                      <input
                        value={form.avatarUrl}
                        onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))}
                        placeholder="https://example.com/avatar.jpg"
                        className="h-12 w-full rounded-2xl border border-[#ddd0c2] bg-[#fcfaf7] px-4 text-sm text-[#1d2d3c] outline-none focus:border-[#b99a72]"
                      />
                    </div>
                  </div>

                  {notice && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-2xl border border-[#e7ddd0] bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-[#33485c]">
                      {notice}
                    </motion.div>
                  )}

                  <button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={saving}
                    className="mt-6 inline-flex h-12 items-center gap-2 rounded-2xl bg-[#1d2d3c] px-5 text-sm font-bold text-white transition hover:bg-[#2a3f52] disabled:opacity-70"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? t('profile.saving') : t('profile.save')}
                  </button>
                </>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
