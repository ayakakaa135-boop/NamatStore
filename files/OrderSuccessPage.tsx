import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { CheckCircle, Package, Truck, Mail, ArrowRight, Loader2 } from 'lucide-react';

interface OrderDetails {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  items: any[];
}

export default function OrderSuccessPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError('Order ID not found');
        setIsLoading(false);
        return;
      }

      try {
        // جلب تفاصيل الطلب من Supabase
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (fetchError) {
          console.error('Error fetching order:', fetchError);
          setError('Failed to fetch order details');
          return;
        }

        setOrder(data);

        // مسح السلة بعد نجاح الطلب
        clearCart();

      } catch (err: any) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, clearCart]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">{t('orderSuccess.loading') || 'جاري تحميل تفاصيل الطلب...'}</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('orderSuccess.error') || 'حدث خطأ'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || t('orderSuccess.errorMessage') || 'لم نتمكن من العثور على الطلب'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            {t('orderSuccess.backToHome') || 'العودة للرئيسية'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* رسالة النجاح */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('orderSuccess.title') || 'تم تأكيد طلبك بنجاح!'}
            </h1>
            <p className="text-gray-600 mb-6">
              {t('orderSuccess.subtitle') || 'شكراً لك على الشراء. تم استلام طلبك وجاري تجهيزه.'}
            </p>
            
            {/* رقم الطلب */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">
                {t('orderSuccess.orderNumber') || 'رقم الطلب'}
              </p>
              <p className="text-2xl font-bold text-primary" dir="ltr">
                #{order.order_number || order.id.slice(0, 8).toUpperCase()}
              </p>
            </div>

            {/* معلومات الطلب */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <Mail className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  {t('orderSuccess.confirmationEmail') || 'رسالة التأكيد'}
                </p>
                <p className="text-xs font-medium text-gray-900">
                  {t('orderSuccess.sentTo') || 'تم الإرسال إلى'}
                </p>
                <p className="text-xs text-gray-600 break-all">
                  {order.customer_email}
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <Package className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  {t('orderSuccess.status') || 'حالة الطلب'}
                </p>
                <p className="text-xs font-medium text-gray-900">
                  {order.status === 'confirmed' 
                    ? t('orderSuccess.confirmed') || 'مؤكد' 
                    : order.status === 'pending' 
                    ? t('orderSuccess.pending') || 'قيد المعالجة'
                    : order.status}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <Truck className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  {t('orderSuccess.delivery') || 'التوصيل'}
                </p>
                <p className="text-xs font-medium text-gray-900">
                  {t('orderSuccess.deliveryTime') || '3-7 أيام عمل'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* تفاصيل المنتجات */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('orderSuccess.items') || 'المنتجات المطلوبة'}
          </h2>
          <div className="space-y-4">
            {order.items.map((item: any, index: number) => (
              <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  {item.size && (
                    <p className="text-sm text-gray-600">
                      {t('size')}: {item.size}
                    </p>
                  )}
                  {item.color && (
                    <p className="text-sm text-gray-600">
                      {t('color')}: {item.color}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    {t('quantity')}: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {item.price * item.quantity} {t('currency')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* الإجمالي */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between text-lg font-bold">
              <span>{t('orderSuccess.total') || 'الإجمالي'}</span>
              <span className="text-primary">
                {order.total_amount} {t('currency')}
              </span>
            </div>
          </div>
        </div>

        {/* الخطوات التالية */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('orderSuccess.nextSteps') || 'ما التالي؟'}
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">
                  {t('orderSuccess.step1Title') || 'تأكيد الطلب'}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('orderSuccess.step1Description') || 'سنرسل لك رسالة تأكيد عبر البريد الإلكتروني خلال دقائق'}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">
                  {t('orderSuccess.step2Title') || 'تجهيز الطلب'}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('orderSuccess.step2Description') || 'سيتم تجهيز طلبك وتعبئته بعناية خلال 1-2 يوم عمل'}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">
                  {t('orderSuccess.step3Title') || 'الشحن'}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('orderSuccess.step3Description') || 'سيتم شحن طلبك وستصلك رسالة برقم التتبع'}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">
                  {t('orderSuccess.step4Title') || 'الاستلام'}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('orderSuccess.step4Description') || 'استلم طلبك خلال 3-7 أيام عمل'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* أزرار العمل */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/profile')}
            className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
          >
            {t('orderSuccess.viewOrders') || 'عرض طلباتي'}
            <ArrowRight className="w-5 h-5 mr-2" />
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-white text-primary border-2 border-primary px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('orderSuccess.continueShopping') || 'متابعة التسوق'}
          </button>
        </div>

        {/* معلومات إضافية */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-700">
            {t('orderSuccess.helpText') || 'هل تحتاج مساعدة؟ تواصل معنا عبر'}
            {' '}
            <a href="/contact" className="text-primary font-medium hover:underline">
              {t('orderSuccess.contactUs') || 'صفحة التواصل'}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
