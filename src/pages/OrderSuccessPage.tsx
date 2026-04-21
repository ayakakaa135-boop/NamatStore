import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, Mail, Package, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { getOrderById, type OrderRecord } from '@/lib/orders';
import { formatPrice } from '@/lib/formatPrice';
import { getOrderStatusMeta } from '@/lib/orderStatus';

export default function OrderSuccessPage() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get('order_id');
  const hasStripeSession = Boolean(searchParams.get('session_id'));

  useEffect(() => {
    if (!orderId) {
      setError(i18n.language === 'ar' ? 'لم يتم العثور على الطلب.' : 'Order ID was not found.');
      setLoading(false);
      return;
    }

    void (async () => {
      const result = await getOrderById(orderId);
      setLoading(false);

      if (!result.ok || !result.order) {
        setError(result.error || (i18n.language === 'ar' ? 'تعذر تحميل تفاصيل الطلب.' : 'Could not load order details.'));
        return;
      }

      clearCart();
      setOrder(result.order);
    })();
  }, [clearCart, i18n.language, orderId]);

  return (
    <div className="min-h-screen bg-[#F7F4F0] flex flex-col">
      <Header />

      <main className="flex-1 px-4 py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          {loading ? (
            <div className="rounded-[2rem] border border-[#F3E3CF] bg-white px-6 py-16 text-center">
              <p className="font-bold text-[#002B49]">
                {i18n.language === 'ar' ? 'جاري تحميل تفاصيل الطلب...' : 'Loading your order details...'}
              </p>
            </div>
          ) : error || !order ? (
            <div className="rounded-[2rem] border border-[#f0d1d1] bg-white px-6 py-16 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <Package className="h-8 w-8 text-red-500" />
              </div>
              <h1 className="text-2xl font-black text-[#002B49]">
                {i18n.language === 'ar' ? 'حدث خطأ' : 'Something went wrong'}
              </h1>
              <p className="mt-3 text-[#7a6a56]">{error}</p>
              <Link
                to="/"
                className="mt-8 inline-flex rounded-2xl px-6 py-3 font-bold text-[#002B49] shadow-lg"
                style={{ background: 'linear-gradient(135deg, #D4AF37, #f0d060)' }}
              >
                {i18n.language === 'ar' ? 'العودة للرئيسية' : 'Back home'}
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[2rem] border border-[#F3E3CF] bg-white px-6 py-10 text-center shadow-sm md:px-10"
              >
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#edf7ef]">
                  <CheckCircle2 className="h-11 w-11 text-[#2f7a47]" />
                </div>
                <h1 className="text-3xl font-black text-[#002B49]">
                  {i18n.language === 'ar' ? 'تم استلام طلبك بنجاح' : 'Your order has been received'}
                </h1>
                <p className="mx-auto mt-3 max-w-2xl text-[#7a6a56]">
                  {hasStripeSession
                    ? i18n.language === 'ar'
                      ? 'تم تأكيد الدفع عبر Stripe، وسنبدأ تجهيز الطلب مباشرة.'
                      : 'Your payment was confirmed through Stripe and we will start preparing your order right away.'
                    : i18n.language === 'ar'
                      ? 'تم إنشاء الطلب بنجاح وسيتم التواصل معك لتأكيده.'
                      : 'Your order was created successfully and our team will contact you to confirm it.'}
                </p>

                <div className="mx-auto mt-8 grid max-w-3xl gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-[#F7F4F0] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#9f7a53]">
                      {i18n.language === 'ar' ? 'رقم الطلب' : 'Order number'}
                    </p>
                    <p className="mt-2 text-lg font-black text-[#002B49]">{order.order_number}</p>
                  </div>
                  <div className="rounded-2xl bg-[#F7F4F0] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#9f7a53]">
                      {i18n.language === 'ar' ? 'الحالة' : 'Status'}
                    </p>
                    <p className="mt-2 text-sm font-bold text-[#002B49]">{getOrderStatusMeta(order.status, t).label}</p>
                  </div>
                  <div className="rounded-2xl bg-[#F7F4F0] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#9f7a53]">
                      {i18n.language === 'ar' ? 'الإجمالي' : 'Total'}
                    </p>
                    <p className="mt-2 text-lg font-black text-[#002B49]">
                      {formatPrice(Number(order.total_amount), i18n.language)}
                    </p>
                  </div>
                </div>
              </motion.section>

              <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[2rem] border border-[#F3E3CF] bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-black text-[#002B49]">
                    {i18n.language === 'ar' ? 'المنتجات المطلوبة' : 'Ordered items'}
                  </h2>
                  <div className="mt-5 space-y-4">
                    {order.items.map((item, index) => (
                      <div key={`${item.product_id}-${index}`} className="flex items-center gap-3 rounded-2xl bg-[#F7F4F0] p-3">
                        <div className="h-16 w-16 overflow-hidden rounded-xl bg-[#F3E3CF]">
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1 text-start">
                          <p className="truncate font-bold text-[#002B49]">{item.name}</p>
                          <p className="mt-1 text-xs text-[#7a6a56]">
                            {i18n.language === 'ar' ? 'الكمية' : 'Qty'}: {item.quantity}
                            {item.size ? ` · ${i18n.language === 'ar' ? 'المقاس' : 'Size'}: ${item.size}` : ''}
                            {item.color ? ` · ${i18n.language === 'ar' ? 'اللون' : 'Color'}: ${item.color}` : ''}
                          </p>
                        </div>
                        <div className="text-sm font-black text-[#002B49]">
                          {formatPrice(item.price * item.quantity, i18n.language)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-[2rem] border border-[#F3E3CF] bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-black text-[#002B49]">
                      {i18n.language === 'ar' ? 'الخطوات التالية' : 'What happens next'}
                    </h2>
                    <div className="mt-5 space-y-4">
                      {[
                        {
                          icon: Mail,
                          title: i18n.language === 'ar' ? 'تأكيد عبر البريد' : 'Email confirmation',
                          body: i18n.language === 'ar'
                            ? `سنرسل إشعارًا إلى ${order.customer_email}`
                            : `We will send an update to ${order.customer_email}`,
                        },
                        {
                          icon: Package,
                          title: i18n.language === 'ar' ? 'تجهيز الطلب' : 'Order preparation',
                          body: i18n.language === 'ar'
                            ? 'يتم الآن مراجعة الطلب وتجهيزه للشحن.'
                            : 'Your order is now being reviewed and prepared.',
                        },
                        {
                          icon: Truck,
                          title: i18n.language === 'ar' ? 'الشحن والتسليم' : 'Shipping and delivery',
                          body: i18n.language === 'ar'
                            ? 'عادةً ما يصل الطلب خلال 3 إلى 7 أيام عمل.'
                            : 'Delivery usually takes 3 to 7 business days.',
                        },
                      ].map(({ icon: Icon, title, body }) => (
                        <div key={title} className="flex gap-3 rounded-2xl bg-[#F7F4F0] p-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                            <Icon className="h-5 w-5 text-[#D4AF37]" />
                          </div>
                          <div className="text-start">
                            <p className="font-bold text-[#002B49]">{title}</p>
                            <p className="mt-1 text-sm text-[#7a6a56]">{body}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-[#F3E3CF] bg-white p-6 shadow-sm">
                    <div className="space-y-2 text-start text-sm text-[#7a6a56]">
                      <p><span className="font-bold text-[#002B49]">{i18n.language === 'ar' ? 'الاسم:' : 'Name:'}</span> {order.customer_name}</p>
                      <p><span className="font-bold text-[#002B49]">{i18n.language === 'ar' ? 'الهاتف:' : 'Phone:'}</span> {order.customer_phone}</p>
                      <p><span className="font-bold text-[#002B49]">{i18n.language === 'ar' ? 'العنوان:' : 'Address:'}</span> {order.shipping_address?.address || order.address}</p>
                      <p><span className="font-bold text-[#002B49]">{i18n.language === 'ar' ? 'المدينة:' : 'City:'}</span> {order.shipping_address?.city || order.city}</p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/shop"
                  className="rounded-2xl px-6 py-3 font-bold text-[#002B49] shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #f0d060)' }}
                >
                  {i18n.language === 'ar' ? 'متابعة التسوق' : 'Continue shopping'}
                </Link>
                <Link
                  to="/"
                  className="rounded-2xl border-2 border-[#002B49] px-6 py-3 font-bold text-[#002B49] transition hover:bg-[#002B49] hover:text-white"
                >
                  {i18n.language === 'ar' ? 'العودة للرئيسية' : 'Back home'}
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
