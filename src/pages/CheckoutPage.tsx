import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, CreditCard, Loader2, MapPin, Phone, ShoppingBag, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../lib/formatPrice';
import { createOrder } from '../lib/orders';
import { createStripeCheckoutSession } from '../lib/stripe';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import PhoneInput from '../components/PhoneInput';

interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  postalCode: string;
  notes: string;
  paymentMethod: 'card' | 'cod';
}

type ValidationErrors = Partial<Record<keyof CheckoutFormData, string>>;

export default function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    email: '',
    phone: '',
    country: 'Saudi Arabia',
    city: '',
    address: '',
    postalCode: '',
    notes: '',
    paymentMethod: 'card',
  });

  const shipping = total >= 500 ? 0 : 30;
  const grandTotal = total + shipping;
  const countries = useMemo(
    () => ['Saudi Arabia', 'United Arab Emirates', 'Kuwait', 'Qatar', 'Bahrain', 'Oman', 'Jordan', 'Egypt'],
    []
  );

  useEffect(() => {
    if (!user) return;
    setFormData((current) => ({
      ...current,
      fullName: current.fullName || user.user_metadata?.full_name || '',
      email: current.email || user.email || '',
    }));
  }, [user]);

  useEffect(() => {
    if (searchParams.get('canceled') === 'true') {
      showToast(
        i18n.language === 'ar'
          ? 'تم إلغاء عملية الدفع. ما زال طلبك محفوظًا ويمكنك المحاولة مرة أخرى.'
          : 'Payment was canceled. Your order is still saved and you can try again.',
        'info'
      );
    }
  }, [i18n.language, searchParams, showToast]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (errors[name as keyof CheckoutFormData]) {
      setErrors((current) => ({ ...current, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const nextErrors: ValidationErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+]?[\d\s\-()]{8,20}$/;

    if (!formData.fullName.trim()) {
      nextErrors.fullName = i18n.language === 'ar' ? 'الاسم الكامل مطلوب.' : 'Full name is required.';
    } else if (formData.fullName.trim().length < 3) {
      nextErrors.fullName = i18n.language === 'ar' ? 'الاسم يجب أن يكون 3 أحرف على الأقل.' : 'Full name must be at least 3 characters.';
    }

    if (!formData.email.trim()) {
      nextErrors.email = i18n.language === 'ar' ? 'البريد الإلكتروني مطلوب.' : 'Email is required.';
    } else if (!emailRegex.test(formData.email)) {
      nextErrors.email = i18n.language === 'ar' ? 'البريد الإلكتروني غير صحيح.' : 'Email format is invalid.';
    }

    if (!formData.phone.trim()) {
      nextErrors.phone = i18n.language === 'ar' ? 'رقم الهاتف مطلوب.' : 'Phone number is required.';
    } else if (!phoneRegex.test(formData.phone.trim())) {
      nextErrors.phone = i18n.language === 'ar' ? 'رقم الهاتف غير صحيح.' : 'Phone number format is invalid.';
    }

    if (!formData.city.trim()) {
      nextErrors.city = i18n.language === 'ar' ? 'المدينة مطلوبة.' : 'City is required.';
    }

    if (!formData.address.trim()) {
      nextErrors.address = i18n.language === 'ar' ? 'العنوان مطلوب.' : 'Address is required.';
    } else if (formData.address.trim().length < 10) {
      nextErrors.address = i18n.language === 'ar' ? 'العنوان يجب أن يكون 10 أحرف على الأقل.' : 'Address must be at least 10 characters.';
    }

    if (!formData.postalCode.trim()) {
      nextErrors.postalCode = i18n.language === 'ar' ? 'الرمز البريدي مطلوب.' : 'Postal code is required.';
    }

    setErrors(nextErrors);

    const firstField = Object.keys(nextErrors)[0];
    if (firstField) {
      document.querySelector(`[name="${firstField}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (items.length === 0) {
      showToast(i18n.language === 'ar' ? 'السلة فارغة.' : 'Your cart is empty.', 'error');
      return;
    }

    if (!validateForm()) {
      showToast(
        i18n.language === 'ar' ? 'يرجى تصحيح الحقول المظللة قبل المتابعة.' : 'Please fix the highlighted fields before continuing.',
        'error'
      );
      return;
    }

    setSubmitting(true);

    try {
      const result = await createOrder({
        userId: user?.id ?? null,
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        country: formData.country,
        city: formData.city,
        address: formData.address,
        postalCode: formData.postalCode,
        notes: formData.notes,
        paymentMethod: formData.paymentMethod,
        subtotal: total,
        shippingAmount: shipping,
        totalAmount: grandTotal,
        items,
      });

      if (!result.ok || !result.orderId) {
        throw new Error(result.error || (i18n.language === 'ar' ? 'تعذر إنشاء الطلب.' : 'Could not create order.'));
      }

      if (formData.paymentMethod === 'card') {
        const checkout = await createStripeCheckoutSession({
          orderId: result.orderId,
          items: items.map((item) => ({
            product_id: item.id,
            name: item.name,
            name_en: item.name_en,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            image: item.image,
          })),
          customerEmail: formData.email,
          shippingAddress: {
            country: formData.country,
            city: formData.city,
            address: formData.address,
            postalCode: formData.postalCode,
          },
          shippingAmount: shipping,
          successUrl: `${window.location.origin}/order-success?session_id={CHECKOUT_SESSION_ID}&order_id=${result.orderId}`,
          cancelUrl: `${window.location.origin}/checkout?canceled=true&order_id=${result.orderId}`,
        });

        window.location.href = checkout.url;
        return;
      }

      clearCart();
      navigate(`/order-success?order_id=${result.orderId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : i18n.language === 'ar' ? 'حدث خطأ غير متوقع.' : 'An unexpected error occurred.';
      showToast(message, 'error');
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F4F0] flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-xl rounded-[2rem] border border-[#F3E3CF] bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#F3E3CF]">
              <ShoppingBag className="h-10 w-10 text-[#D4AF37]" />
            </div>
            <h1 className="text-3xl font-black text-[#002B49]">
              {i18n.language === 'ar' ? 'السلة فارغة' : 'Your cart is empty'}
            </h1>
            <p className="mt-3 text-[#7a6a56]">
              {i18n.language === 'ar'
                ? 'أضيفي منتجات إلى السلة أولًا ثم عودي لإتمام الطلب.'
                : 'Add products to your cart first, then come back to complete checkout.'}
            </p>
            <Link
              to="/shop"
              className="mt-8 inline-flex rounded-2xl px-6 py-3 font-bold text-[#002B49] shadow-lg"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #f0d060)' }}
            >
              {i18n.language === 'ar' ? 'الذهاب للمتجر' : 'Go to shop'}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4F0]">
      <Header />

      <div className="bg-[#002B49] py-10 relative overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-3xl font-black text-white text-center mb-1">
            {i18n.language === 'ar' ? 'إتمام الطلب' : 'Checkout'}
          </h1>
          <p className="text-center text-white/65">
            {i18n.language === 'ar'
              ? 'أكملي بياناتك ثم انتقلي مباشرة إلى الدفع الآمن عبر Stripe.'
              : 'Complete your details and continue to secure payment with Stripe.'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-[#F3E3CF] bg-white p-8"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3E3CF]">
                  <User className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <div className="text-start">
                  <h2 className="text-xl font-black text-[#002B49]">
                    {i18n.language === 'ar' ? 'بيانات العميل' : 'Customer details'}
                  </h2>
                  <p className="text-sm text-[#7a6a56]">
                    {i18n.language === 'ar'
                      ? 'أدخلي بيانات التواصل كما تريدين أن تظهر في الطلب.'
                      : 'Enter the contact details exactly as they should appear on the order.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {[
                  { name: 'fullName', label: i18n.language === 'ar' ? 'الاسم الكامل' : 'Full name', type: 'text' },
                  { name: 'email', label: i18n.language === 'ar' ? 'البريد الإلكتروني' : 'Email', type: 'email' },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="mb-2 block text-sm font-bold text-[#002B49]">{field.label}</label>
                    <input
                      name={field.name}
                      type={field.type}
                      value={formData[field.name as keyof CheckoutFormData] as string}
                      onChange={handleChange}
                      className={`h-12 w-full rounded-xl border-2 bg-[#F7F4F0] px-4 font-medium text-[#002B49] outline-none transition ${
                        errors[field.name as keyof CheckoutFormData] ? 'border-red-400' : 'border-[#e8d9c5] focus:border-[#D4AF37]'
                      }`}
                    />
                    {errors[field.name as keyof CheckoutFormData] && (
                      <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        {errors[field.name as keyof CheckoutFormData]}
                      </p>
                    )}
                  </div>
                ))}

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-[#002B49]">
                    {i18n.language === 'ar' ? 'رقم الهاتف' : 'Phone'}
                  </label>
                  <PhoneInput
                    name="phone"
                    value={formData.phone}
                    onChange={(next) => {
                      setFormData((current) => ({ ...current, phone: next }));
                      if (errors.phone) setErrors((current) => ({ ...current, phone: undefined }));
                    }}
                    placeholder={i18n.language === 'ar' ? '5xxxxxxxx' : '5xxxxxxxx'}
                    hasError={Boolean(errors.phone)}
                  />
                  {errors.phone && (
                    <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-3xl border border-[#F3E3CF] bg-white p-8"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3E3CF]">
                  <MapPin className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <div className="text-start">
                  <h2 className="text-xl font-black text-[#002B49]">
                    {i18n.language === 'ar' ? 'عنوان الشحن' : 'Shipping address'}
                  </h2>
                  <p className="text-sm text-[#7a6a56]">
                    {i18n.language === 'ar'
                      ? 'سيتم استخدام هذا العنوان في الطلب وداخل Stripe Checkout.'
                      : 'This address will be saved with the order and passed to Stripe Checkout.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#002B49]">
                    {i18n.language === 'ar' ? 'الدولة' : 'Country'}
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border-2 border-[#e8d9c5] bg-[#F7F4F0] px-4 font-medium text-[#002B49] outline-none transition focus:border-[#D4AF37]"
                  >
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#002B49]">
                    {i18n.language === 'ar' ? 'المدينة' : 'City'}
                  </label>
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`h-12 w-full rounded-xl border-2 bg-[#F7F4F0] px-4 font-medium text-[#002B49] outline-none transition ${
                      errors.city ? 'border-red-400' : 'border-[#e8d9c5] focus:border-[#D4AF37]'
                    }`}
                  />
                  {errors.city && (
                    <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.city}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-[#002B49]">
                    {i18n.language === 'ar' ? 'العنوان الكامل' : 'Full address'}
                  </label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`h-12 w-full rounded-xl border-2 bg-[#F7F4F0] px-4 font-medium text-[#002B49] outline-none transition ${
                      errors.address ? 'border-red-400' : 'border-[#e8d9c5] focus:border-[#D4AF37]'
                    }`}
                  />
                  {errors.address && (
                    <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.address}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#002B49]">
                    {i18n.language === 'ar' ? 'الرمز البريدي' : 'Postal code'}
                  </label>
                  <input
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className={`h-12 w-full rounded-xl border-2 bg-[#F7F4F0] px-4 font-medium text-[#002B49] outline-none transition ${
                      errors.postalCode ? 'border-red-400' : 'border-[#e8d9c5] focus:border-[#D4AF37]'
                    }`}
                  />
                  {errors.postalCode && (
                    <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.postalCode}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-[#002B49]">
                    {i18n.language === 'ar' ? 'ملاحظات إضافية' : 'Order notes'}
                  </label>
                  <textarea
                    name="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-[#e8d9c5] bg-[#F7F4F0] px-4 py-3 font-medium text-[#002B49] outline-none transition focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-[#F3E3CF] bg-white p-8"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3E3CF]">
                  <CreditCard className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <div className="text-start">
                  <h2 className="text-xl font-black text-[#002B49]">
                    {i18n.language === 'ar' ? 'طريقة الدفع' : 'Payment method'}
                  </h2>
                  <p className="text-sm text-[#7a6a56]">
                    {i18n.language === 'ar'
                      ? 'يمكنك الدفع الآن عبر Stripe أو إنشاء طلب الدفع عند الاستلام.'
                      : 'Pay now with Stripe or create a cash-on-delivery order.'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    value: 'card',
                    title: i18n.language === 'ar' ? 'بطاقة بنكية عبر Stripe' : 'Card payment via Stripe',
                    description: i18n.language === 'ar' ? 'تحويل فوري إلى صفحة دفع آمنة.' : 'Immediate redirect to a secure Stripe checkout page.',
                  },
                  {
                    value: 'cod',
                    title: i18n.language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on delivery',
                    description: i18n.language === 'ar' ? 'سيتم إنشاء الطلب مباشرة بدون دفع إلكتروني.' : 'Create the order now without online payment.',
                  },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer gap-4 rounded-2xl border-2 p-4 transition ${
                      formData.paymentMethod === option.value ? 'border-[#D4AF37] bg-[#F3E3CF]/35' : 'border-[#e8d9c5]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={option.value}
                      checked={formData.paymentMethod === option.value}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 accent-[#D4AF37]"
                    />
                    <div className="text-start">
                      <p className="font-bold text-[#002B49]">{option.title}</p>
                      <p className="mt-1 text-sm text-[#7a6a56]">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#F3E3CF] bg-[#FCFBF8] p-4 text-sm text-[#7a6a56]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2f7a47]" />
                <p>
                  {i18n.language === 'ar'
                    ? 'يتم حفظ الطلب أولًا في Supabase ثم تحديث حالته تلقائيًا بعد نجاح Stripe webhook.'
                    : 'The order is saved in Supabase first, then updated automatically when the Stripe webhook confirms payment.'}
                </p>
              </div>
            </motion.section>
          </div>

          <aside>
            <div className="sticky top-24 rounded-3xl border border-[#F3E3CF] bg-white p-6">
              <h3 className="text-lg font-black text-[#002B49]">
                {i18n.language === 'ar' ? 'ملخص الطلب' : 'Order summary'}
              </h3>
              <div className="mt-5 space-y-3">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size || ''}`} className="flex items-center gap-3">
                    <div className="h-14 w-14 overflow-hidden rounded-xl bg-[#F3E3CF]">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1 text-start">
                      <p className="truncate text-sm font-bold text-[#002B49]">{item.name}</p>
                      <p className="mt-1 text-xs text-[#7a6a56]">
                        {i18n.language === 'ar' ? 'الكمية' : 'Qty'}: {item.quantity}
                        {item.size ? ` · ${i18n.language === 'ar' ? 'المقاس' : 'Size'}: ${item.size}` : ''}
                      </p>
                    </div>
                    <div className="text-sm font-black text-[#002B49]">{formatPrice(item.price * item.quantity, i18n.language)}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3 border-t border-[#F3E3CF] pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#7a6a56]">{i18n.language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span className="font-bold text-[#002B49]">{formatPrice(total, i18n.language)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7a6a56]">{i18n.language === 'ar' ? 'الشحن' : 'Shipping'}</span>
                  <span className={`font-bold ${shipping === 0 ? 'text-green-600' : 'text-[#002B49]'}`}>
                    {shipping === 0
                      ? i18n.language === 'ar'
                        ? 'مجاني'
                        : 'Free'
                      : formatPrice(shipping, i18n.language)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#F3E3CF] pt-3">
                  <span className="font-bold text-[#002B49]">{i18n.language === 'ar' ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-lg font-black text-[#002B49]">{formatPrice(grandTotal, i18n.language)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl font-black text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-70"
                style={{ background: 'linear-gradient(135deg, #002B49, #003d6b)' }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {i18n.language === 'ar' ? 'جاري معالجة الطلب...' : 'Processing order...'}
                  </>
                ) : formData.paymentMethod === 'card' ? (
                  <>
                    <CreditCard className="h-5 w-5" />
                    {i18n.language === 'ar' ? 'المتابعة إلى Stripe' : 'Continue to Stripe'}
                  </>
                ) : (
                  <>
                    <Phone className="h-5 w-5" />
                    {i18n.language === 'ar' ? 'إنشاء طلب الدفع عند الاستلام' : 'Create COD order'}
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-xs text-[#7a6a56]">
                {i18n.language === 'ar'
                  ? 'الدفع الإلكتروني يتم عبر Stripe، وبيانات الطلب تُحفظ في Supabase.'
                  : 'Online payments are handled by Stripe and order data is stored in Supabase.'}
              </p>
            </div>
          </aside>
        </form>
      </div>

      <Footer />
    </div>
  );
}
