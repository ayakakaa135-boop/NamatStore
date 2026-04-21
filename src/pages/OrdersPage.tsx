import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, PackageSearch } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { getMyOrders, type OrderRecord } from '@/lib/orders';
import { formatPrice } from '@/lib/formatPrice';
import { ORDER_STATUS_FLOW, getOrderStatusMeta } from '@/lib/orderStatus';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function OrdersPage() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isRTL = i18n.language === 'ar';
  const orderNotice = location.state as { orderPlaced?: boolean; orderNumber?: string } | null;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    void (async () => {
      const res = await getMyOrders();
      setLoading(false);
      if (!res.ok) {
        setError(res.error || 'Could not load orders');
        return;
      }
      setOrders(res.orders || []);
    })();
  }, [user]);

  if (!authLoading && !user) {
    return <Navigate to="/login" replace state={{ from: { pathname: '/orders' } }} />;
  }

  return (
    <div className="min-h-screen bg-[#F7F4F0] flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-5xl w-full">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-black text-[#002B49] mb-2">{isRTL ? 'طلباتي' : 'My orders'}</h1>
            <p className="text-[#7a6a56]">{isRTL ? 'تابعي حالة طلباتك الأخيرة من حسابك.' : 'Track and review your recent orders from your account.'}</p>
          </div>

          {orderNotice?.orderPlaced && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-[2rem] border border-[#dce9de] bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3 text-start">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf7ef]">
                    <CheckCircle2 className="h-6 w-6 text-[#2f7a47]" />
                  </div>
                  <div>
                    <p className="font-black text-[#002B49]">{t('orders.successTitle')}</p>
                    <p className="mt-1 text-sm text-[#7a6a56]">
                      {orderNotice.orderNumber
                        ? t('orders.successBodyNumber', { orderNumber: orderNotice.orderNumber })
                        : t('orders.successBody')}
                    </p>
                  </div>
                </div>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-2xl border border-[#d9c9b5] px-5 py-3 text-sm font-bold text-[#002B49] transition hover:bg-[#F7F4F0]"
                >
                  {t('orders.followupCta')}
                </Link>
              </div>
            </motion.div>
          )}

          {loading ? (
            <div className="bg-white rounded-[2rem] border border-[#F3E3CF] shadow-xl p-10 text-center">
              <p className="text-[#002B49] font-bold">{t('orders.loading')}</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-[2rem] border border-[#F3E3CF] shadow-xl p-10 text-center">
              <p className="text-red-600 font-bold mb-6">{error}</p>
              <Link to="/shop" className="px-6 py-3 rounded-2xl font-black text-[#002B49] shadow-lg" style={{ background: 'linear-gradient(135deg, #D4AF37, #f0d060)' }}>
                {isRTL ? 'العودة للمتجر' : 'Back to shop'}
              </Link>
            </div>
          ) : orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl mx-auto bg-white rounded-[2.5rem] border border-[#F3E3CF] shadow-xl p-10 text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-[#F3E3CF] flex items-center justify-center mx-auto mb-6">
                <PackageSearch className="h-10 w-10 text-[#D4AF37]" />
              </div>
              <p className="text-[#7a6a56] leading-relaxed mb-8">
                {isRTL
                  ? 'لا توجد طلبات بعد. بعد إتمام أول طلب سيظهر هنا مع حالته وتفاصيله.'
                  : 'No orders yet. Once you place your first order, it will appear here with status and details.'}
              </p>
              <Link
                to="/shop"
                className="px-6 py-3 rounded-2xl font-black text-[#002B49] shadow-lg hover:opacity-90 transition-all"
                style={{ background: 'linear-gradient(135deg, #D4AF37, #f0d060)' }}
              >
                {isRTL ? 'ابدئي التسوق' : 'Start shopping'}
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-[2rem] border border-[#F3E3CF] shadow-sm p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                    <div className="text-start">
                      <p className="text-[#C7613E] text-xs tracking-[0.25em] uppercase font-bold mb-2">{order.order_number}</p>
                      <h2 className="text-2xl font-black text-[#002B49]">{t('orders.savedOrder')}</h2>
                      <p className="text-[#7a6a56] text-sm mt-1">{new Date(order.created_at).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-4 py-2 rounded-full border text-sm font-bold ${getOrderStatusMeta(order.status, t).chipClass}`}>
                        {getOrderStatusMeta(order.status, t).label}
                      </span>
                      <span className="px-4 py-2 rounded-full border border-[#e8d9c5] text-[#7a6a56] text-sm font-semibold">
                        {formatPrice(Number(order.total_amount), i18n.language)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
                    <div className="space-y-3">
                      <div className="rounded-2xl border border-[#F3E3CF] bg-[#FCFBF8] p-4">
                        <div className="flex flex-wrap gap-2">
                          {ORDER_STATUS_FLOW.map((status, index) => {
                            const activeIndex = ORDER_STATUS_FLOW.indexOf(order.status);
                            const isComplete = order.status === 'cancelled' ? false : index <= activeIndex;
                            return (
                              <div
                                key={status}
                                className={`rounded-full px-3 py-2 text-xs font-bold ${
                                  isComplete ? 'bg-[#002B49] text-white' : 'bg-white text-[#8a7b68] border border-[#eadfce]'
                                }`}
                              >
                                {getOrderStatusMeta(status, t).label}
                              </div>
                            );
                          })}
                        </div>
                        <p className="mt-3 text-sm text-[#7a6a56]">{getOrderStatusMeta(order.status, t).description}</p>
                      </div>

                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-[#F7F4F0] border border-[#F3E3CF] p-3">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#F3E3CF] shrink-0">
                            <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 text-start min-w-0">
                            <p className="text-[#002B49] font-bold text-sm line-clamp-1">{item.product_name}</p>
                            <p className="text-[#7a6a56] text-xs mt-1">
                              {item.selected_size ? `${isRTL ? 'المقاس' : 'Size'}: ${item.selected_size} · ` : ''}
                              {isRTL ? 'الكمية' : 'Qty'}: {item.quantity}
                            </p>
                          </div>
                          <div className="text-[#002B49] font-black text-sm">{formatPrice(Number(item.unit_price) * item.quantity, i18n.language)}</div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-[#F3E3CF] p-5 bg-[#FCFBF8] text-start">
                      <p className="text-[#002B49] font-black mb-4">{t('orders.shippingTitle')}</p>
                      <div className="space-y-2 text-sm text-[#7a6a56]">
                        <p><span className="text-[#002B49] font-bold">{t('orders.nameLabel')}</span> {order.customer_name}</p>
                        <p><span className="text-[#002B49] font-bold">{t('orders.phoneLabel')}</span> {order.customer_phone}</p>
                        <p><span className="text-[#002B49] font-bold">{t('orders.cityLabel')}</span> {order.city}</p>
                        <p><span className="text-[#002B49] font-bold">{t('orders.addressLabel')}</span> {order.address}</p>
                      </div>
                      <div className="border-t border-[#F3E3CF] mt-4 pt-4 space-y-2 text-sm">
                        <div className="flex justify-between"><span>{t('orders.subtotalLabel')}</span><span className="font-bold text-[#002B49]">{formatPrice(Number(order.subtotal), i18n.language)}</span></div>
                        <div className="flex justify-between"><span>{t('orders.shippingLabel')}</span><span className="font-bold text-[#002B49]">{formatPrice(Number(order.shipping_amount), i18n.language)}</span></div>
                        <div className="flex justify-between text-base border-t border-[#F3E3CF] pt-3"><span className="font-bold text-[#002B49]">{t('orders.totalLabel')}</span><span className="font-black text-[#002B49]">{formatPrice(Number(order.total_amount), i18n.language)}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
