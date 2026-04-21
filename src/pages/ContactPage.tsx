import { useState, useMemo, type ChangeEvent, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, MessageCircle, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import PhoneInput from '../components/PhoneInput';
import { submitContactMessage } from '../lib/submissions';

export default function ContactPage() {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendError, setSendError] = useState(false);

  const subjectOptions = useMemo(
    () => (t('contact.subjectOptions', { returnObjects: true }) as string[]) ?? [],
    [t, i18n.language]
  );

  const contactCards = useMemo(
    () => [
      {
        icon: Phone,
        label: t('contact.call'),
        value: '+966 50 000 0000',
        sub: t('contact.callSub'),
        href: 'tel:+966500000000',
        key: 'call',
      },
      {
        icon: Mail,
        label: t('contact.emailUs'),
        value: 'info@namat.sa',
        sub: t('contact.emailSub'),
        href: 'mailto:info@namat.sa',
        key: 'mail',
      },
      {
        icon: MessageCircle,
        label: t('contact.whatsapp'),
        value: '+966 50 000 0000',
        sub: t('contact.whatsappSub'),
        href: 'https://wa.me/966500000000',
        key: 'wa',
      },
      {
        icon: MapPin,
        label: t('contact.location'),
        value: t('contact.locationSub'),
        sub: t('contact.locationCountry'),
        href: '#',
        key: 'loc',
      },
    ],
    [t, i18n.language]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSendError(false);
    const res = await submitContactMessage({
      name: form.name,
      email: form.email,
      phone: form.phone,
      subject: form.subject,
      message: form.message,
      locale: i18n.language,
    });
    setLoading(false);
    if (res.ok) {
      setSent(true);
    } else {
      setSendError(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4F0]">
      <Header />

      <section className="relative bg-[#002B49] py-24 overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-20" />
        <div className="absolute top-0 end-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 start-0 end-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#D4AF37] font-bold text-sm tracking-widest uppercase mb-4"
          >
            {t('contact.bannerSmall')}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-black text-white"
          >
            {t('contact.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/55 mt-3 max-w-lg mx-auto"
          >
            {t('contact.subtitle')}
          </motion.p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="space-y-4">
              {contactCards.map(({ icon: Icon, label, value, sub, href, key }, i) => (
                <motion.a
                  key={key}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-5 p-5 bg-white rounded-2xl border border-[#F3E3CF] hover:border-[#D4AF37]/40 hover:-translate-y-0.5 transition-all group block"
                  style={{ boxShadow: '0 2px 12px rgba(0,43,73,0.05)' }}
                >
                  <div className="w-12 h-12 rounded-xl bg-[#F3E3CF] flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-colors shrink-0">
                    <Icon className="h-5 w-5 text-[#D4AF37]" />
                  </div>
                  <div className="text-start min-w-0">
                    <p className="text-[#7a6a56] text-xs font-semibold">{label}</p>
                    <p className="text-[#002B49] font-bold mt-0.5 break-words">{value}</p>
                    <p className="text-[#b5a090] text-xs mt-0.5">{sub}</p>
                  </div>
                </motion.a>
              ))}

              <div className="p-5 bg-[#002B49] rounded-2xl text-start">
                <p className="text-white font-black mb-3">{t('contact.followTitle')}</p>
                <p className="text-white/50 text-sm mb-4">{t('contact.followHint')}</p>
                <div className="flex gap-3 flex-wrap">
                  {['Instagram', 'X', 'Snapchat', 'TikTok'].map((s) => (
                    <a
                      key={s}
                      href="#"
                      className="flex-1 min-w-[4rem] py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs font-bold text-center hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all"
                    >
                      {s}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div
                className="bg-white rounded-3xl p-8 border border-[#F3E3CF]"
                style={{ boxShadow: '0 4px 24px rgba(0,43,73,0.06)' }}
              >
                {sent ? (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-16">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                      <Check className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-black text-[#002B49] mb-3">{t('contact.sentTitle')}</h3>
                    <p className="text-[#7a6a56]">{t('contact.sentHint')}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSent(false);
                        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
                      }}
                      className="mt-8 px-6 py-3 rounded-2xl border-2 border-[#002B49] text-[#002B49] font-bold hover:bg-[#002B49] hover:text-white transition-all"
                    >
                      {t('contact.sendAnother')}
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <h2 className="text-2xl font-black text-[#002B49] mb-8 text-start">{t('contact.formTitle')}</h2>
                    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
                      {sendError && (
                        <p className="text-red-600 text-sm font-medium text-start">{t('contact.errorSend')}</p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-bold text-[#002B49] mb-2 text-start">{t('contact.name')}</label>
                          <input
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={handleChange}
                            placeholder={t('contact.namePh')}
                            required
                            className="w-full h-12 px-4 rounded-xl border-2 border-[#e8d9c5] bg-[#F7F4F0] text-[#002B49] font-medium text-start focus:outline-none focus:border-[#D4AF37] placeholder:text-[#b5a090] transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-[#002B49] mb-2 text-start">{t('contact.phone')}</label>
                          <PhoneInput
                            name="phone"
                            value={form.phone}
                            onChange={(next) => setForm((prev) => ({ ...prev, phone: next }))}
                            placeholder={t('contact.phonePh')}
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-[#002B49] mb-2 text-start">{t('contact.email')}</label>
                          <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="example@mail.com"
                            required
                            className="w-full h-12 px-4 rounded-xl border-2 border-[#e8d9c5] bg-[#F7F4F0] text-[#002B49] font-medium text-start focus:outline-none focus:border-[#D4AF37] placeholder:text-[#b5a090] transition-colors"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-[#002B49] mb-2 text-start">{t('contact.subject')}</label>
                          <select
                            name="subject"
                            value={form.subject}
                            onChange={handleChange}
                            required
                            className="w-full h-12 px-4 rounded-xl border-2 border-[#e8d9c5] bg-[#F7F4F0] text-[#002B49] font-medium text-start focus:outline-none focus:border-[#D4AF37] transition-colors"
                          >
                            <option value="">{t('contact.subjectPlaceholder')}</option>
                            {subjectOptions.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-[#002B49] mb-2 text-start">{t('contact.message')}</label>
                          <textarea
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            required
                            rows={5}
                            placeholder={t('contact.messagePh')}
                            className="w-full px-4 py-3 rounded-xl border-2 border-[#e8d9c5] bg-[#F7F4F0] text-[#002B49] font-medium text-start focus:outline-none focus:border-[#D4AF37] placeholder:text-[#b5a090] transition-colors resize-none"
                          />
                        </div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 rounded-2xl font-black text-lg text-[#002B49] shadow-lg hover:opacity-90 transition-all disabled:opacity-70 flex items-center justify-center gap-3"
                        style={{ background: 'linear-gradient(135deg, #D4AF37, #f0d060)' }}
                      >
                        {loading ? (
                          <>
                            <span className="w-5 h-5 border-2 border-[#002B49]/30 border-t-[#002B49] rounded-full animate-spin" />
                            {t('contact.sending')}
                          </>
                        ) : (
                          t('contact.submit')
                        )}
                      </motion.button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
