import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock3, PackageCheck, RefreshCcw, Truck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { formatPrice } from '@/lib/formatPrice';
import { getAllOrders, updateOrderStatus, type OrderRecord, type OrderStatus } from '@/lib/orders';
import { getOrderStatusMeta } from '@/lib/orderStatus';

const STATUS_ICONS = {
  pending: Clock3,
  confirmed: CheckCircle2,
  processing: RefreshCcw,
  shipped: Truck,
  delivered: PackageCheck,
  cancelled: Clock3,
  refunded: RefreshCcw,
} satisfies Record<OrderStatus, typeof Clock3>;

export default function AdminOrdersPage() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isAdmin) {
      setLoading(false);
      return;
    }

    void (async () => {
      const res = await getAllOrders();
      setLoading(false);
      if (!res.ok) {
        setError(res.error || t('orders.loadError'));
        return;
      }
      setOrders(res.orders || []);
    })();
  }, [isAdmin, t, user]);

  const summary = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((order) => order.status === 'pending').length,
    inProgress: orders.filter((order) => ['confirmed', 'processing', 'shipped'].includes(order.status)).length,
    delivered: orders.filter((order) => order.status === 'delivered').length,
  }), [orders]);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setSavingId(orderId);
    setNotice(null);
    const res = await updateOrderStatus(orderId, status);
    setSavingId(null);

    if (!res.ok) {
      setNotice(res.error || t('orders.updateError'));
      return;
    }

    setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status } : order)));
    setNotice(t('orders.updateSuccess'));
  };

  if (!authLoading && !user) {
    return <Navigate to="/login" replace state={{ from: { pathname: '/admin/orders' } }} />;
  }

  if (!authLoading && user && !isAdmin) {
    return <Navigate to="/orders" replace />;
  }

  return (
    <div className="min-h-screen bg-[#f5f1eb] flex flex-col">
      <Header />

      <main className="flex-1 px-4 py-10 md:py-14">
        <div className="mx-auto max-w-6xl space-y-8">
          <section className="rounded-[2rem] border border-[#e7ddd0] bg-white px-6 py-8 md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="text-start">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#9f7a53]">{t('orders.adminEyebrow')}</p>
                <h1 className="mt-3 text-3xl font-black text-[#1d2d3c] md:text-4xl">{t('orders.adminTitle')}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[#766a5d]">{t('orders.adminSubtitle')}</p>
              </div>
              {notice && (
                <div className="rounded-2xl border border-[#ddd0c2] bg-[#fbf8f4] px-4 py-3 text-sm font-medium text-[#33485c]">
                  {notice}
                </div>
              )}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-4">
            {[
              { label: t('orders.summary.total'), value: summary.total },
              { label: t('orders.summary.pending'), value: summary.pending },
              { label: t('orders.summary.inProgress'), value: summary.inProgress },
              { label: t('orders.summary.delivered'), value: summary.delivered },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.75rem] border border-[#e7ddd0] bg-white px-5 py-5">
                <p className="text-sm text-[#7d7063]">{item.label}</p>
                <p className="mt-2 text-3xl font-black text-[#1d2d3c]">{item.value}</p>
              </div>
            ))}
          </section>

          {loading ? (
            <div className="rounded-[2rem] border border-[#e7ddd0] bg-white px-6 py-12 text-center font-bold text-[#1d2d3c]">
              {t('orders.loading')}
            </div>
          ) : error ? (
            <div className="rounded-[2rem] border border-[#f0d1d1] bg-white px-6 py-12 text-center font-bold text-red-600">
              {error}
            </div>
          ) : (
            <section className="space-y-4">
              {orders.map((order) => {
                const meta = getOrderStatusMeta(order.status, t);
                const StatusIcon = STATUS_ICONS[order.status];

                return (
                  <article key={order.id} className="rounded-[2rem] border border-[#e7ddd0] bg-white p-6 md:p-8">
                    <div className="flex flex-col gap-5 border-b border-[#efe5d8] pb-6 md:flex-row md:items-start md:justify-between">
                      <div className="text-start">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9f7a53]">{order.order_number}</p>
                        <h2 className="mt-2 text-2xl font-black text-[#1d2d3c]">{order.customer_name}</h2>
                        <p className="mt-2 text-sm text-[#766a5d]">
                          {order.customer_email} · {order.customer_phone}
                        </p>
                        <p className="mt-1 text-sm text-[#766a5d]">
                          {new Date(order.created_at).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 md:items-end">
                        <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${meta.chipClass}`}>
                          <StatusIcon className="h-4 w-4" />
                          {meta.label}
                        </div>
                        <div className="text-lg font-black text-[#1d2d3c]">{formatPrice(Number(order.total_amount), i18n.language)}</div>
                      </div>
                    </div>

                    <div className="grid gap-6 pt-6 lg:grid-cols-[1.15fr_0.85fr]">
                      <div className="space-y-3">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-[#efe5d8] bg-[#fcfaf7] p-3">
                            <div className="h-14 w-14 overflow-hidden rounded-xl bg-[#f1e6d7]">
                              <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1 text-start">
                              <p className="truncate text-sm font-bold text-[#1d2d3c]">{item.product_name}</p>
                              <p className="mt-1 text-xs text-[#766a5d]">
                                {t('orders.qtyLabel')}: {item.quantity}
                                {item.selected_size ? ` · ${t('orders.sizeLabel')}: ${item.selected_size}` : ''}
                              </p>
                            </div>
                            <div className="text-sm font-bold text-[#1d2d3c]">
                              {formatPrice(Number(item.unit_price) * item.quantity, i18n.language)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-[1.75rem] border border-[#efe5d8] bg-[#fcfaf7] p-5 text-start">
                        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#9f7a53]">{t('orders.adminCardTitle')}</p>
                        <p className="mt-3 text-sm leading-7 text-[#766a5d]">{meta.description}</p>

                        <label className="mt-6 block text-sm font-bold text-[#1d2d3c]">{t('orders.changeStatus')}</label>
                        <select
                          value={order.status}
                          onChange={(event) => void handleStatusChange(order.id, event.target.value as OrderStatus)}
                          disabled={savingId === order.id}
                          className="mt-2 h-12 w-full rounded-2xl border border-[#ddd0c2] bg-white px-4 text-sm font-semibold text-[#1d2d3c] outline-none transition focus:border-[#b99a72] disabled:opacity-70"
                        >
                          {(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((status) => (
                            <option key={status} value={status}>
                              {getOrderStatusMeta(status, t).label}
                            </option>
                          ))}
                        </select>

                        <div className="mt-6 space-y-2 text-sm text-[#766a5d]">
                          <p><span className="font-bold text-[#1d2d3c]">{t('orders.cityLabel')}:</span> {order.city}</p>
                          <p><span className="font-bold text-[#1d2d3c]">{t('orders.addressLabel')}:</span> {order.address}</p>
                          <p><span className="font-bold text-[#1d2d3c]">{t('orders.paymentLabel')}:</span> {order.payment_method}</p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
