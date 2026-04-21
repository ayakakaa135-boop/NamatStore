import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { ShoppingBag, CreditCard, Package, MapPin, User, Mail, Phone, Loader2, AlertCircle } from 'lucide-react';

interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  postalCode: string;
  notes: string;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    email: '',
    phone: '',
    country: 'Saudi Arabia',
    city: '',
    address: '',
    postalCode: '',
    notes: '',
  });

  // جلب بيانات المستخدم المسجل
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        // جلب بيانات الملف الشخصي إن وجدت
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setFormData(prev => ({
            ...prev,
            fullName: profile.full_name || user.user_metadata?.full_name || '',
            email: user.email || '',
            phone: profile.phone || '',
            address: profile.address || '',
            city: profile.city || '',
            country: profile.country || 'Saudi Arabia',
            postalCode: profile.postal_code || '',
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            fullName: user.user_metadata?.full_name || '',
            email: user.email || '',
          }));
        }
      }
    };

    fetchUser();
  }, []);

  // إعادة التوجيه إذا كانت السلة فارغة
  useEffect(() => {
    if (cart.length === 0) {
      showToast(t('checkout.emptyCart') || 'السلة فارغة', 'error');
      setTimeout(() => navigate('/'), 2000);
    }
  }, [cart, navigate, t]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // التحقق من الاسم الكامل
    if (!formData.fullName.trim()) {
      newErrors.fullName = t('checkout.errors.fullNameRequired') || 'الاسم الكامل مطلوب';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = t('checkout.errors.fullNameMin') || 'الاسم يجب أن يكون 3 أحرف على الأقل';
    }

    // التحقق من البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = t('checkout.errors.emailRequired') || 'البريد الإلكتروني مطلوب';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = t('checkout.errors.emailInvalid') || 'البريد الإلكتروني غير صحيح';
    }

    // التحقق من رقم الهاتف
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = t('checkout.errors.phoneRequired') || 'رقم الهاتف مطلوب';
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = t('checkout.errors.phoneInvalid') || 'رقم الهاتف غير صحيح';
    }

    // التحقق من المدينة
    if (!formData.city.trim()) {
      newErrors.city = t('checkout.errors.cityRequired') || 'المدينة مطلوبة';
    }

    // التحقق من العنوان
    if (!formData.address.trim()) {
      newErrors.address = t('checkout.errors.addressRequired') || 'العنوان مطلوب';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = t('checkout.errors.addressMin') || 'العنوان يجب أن يكون 10 أحرف على الأقل';
    }

    // التحقق من الرمز البريدي
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = t('checkout.errors.postalCodeRequired') || 'الرمز البريدي مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // إزالة الخطأ عند بدء الكتابة
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من صحة البيانات
    if (!validateForm()) {
      showToast(t('checkout.errors.validationFailed') || 'يرجى تصحيح الأخطاء في النموذج', 'error');
      
      // التمرير إلى أول خطأ
      const firstErrorField = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      return;
    }

    // التحقق من وجود منتجات في السلة
    if (cart.length === 0) {
      showToast(t('checkout.emptyCart') || 'السلة فارغة', 'error');
      return;
    }

    setIsLoading(true);

    try {
      // إعداد بيانات الطلب
      const orderData = {
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: {
          country: formData.country,
          city: formData.city,
          address: formData.address,
          postalCode: formData.postalCode,
        },
        notes: formData.notes,
        items: cart.map(item => ({
          product_id: item.id,
          name: item.name,
          name_en: item.name_en,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          image: item.image,
        })),
        total_amount: getCartTotal(),
        user_id: user?.id || null,
      };

      // حفظ الطلب مبدئياً في Supabase بحالة "pending"
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: orderData.user_id,
          customer_name: orderData.customer_name,
          customer_email: orderData.customer_email,
          customer_phone: orderData.customer_phone,
          shipping_address: orderData.shipping_address,
          notes: orderData.notes,
          items: orderData.items,
          total_amount: orderData.total_amount,
          status: 'pending',
          payment_status: 'pending',
        }])
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(orderError.message);
      }

      console.log('Order created successfully:', order);

      // إنشاء جلسة Stripe Checkout
      const response = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          items: orderData.items,
          customerEmail: orderData.customer_email,
          shippingAddress: orderData.shipping_address,
          successUrl: `${window.location.origin}/order-success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
          cancelUrl: `${window.location.origin}/checkout?canceled=true`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const { sessionId, url } = await response.json();

      if (!sessionId && !url) {
        throw new Error('No session ID or URL returned from server');
      }

      // إعادة التوجيه إلى صفحة الدفع في Stripe
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL provided');
      }

    } catch (error: any) {
      console.error('Checkout error:', error);
      
      let errorMessage = t('checkout.errors.processingFailed') || 'فشل في معالجة الطلب';
      
      if (error.message.includes('Failed to fetch')) {
        errorMessage = t('checkout.errors.networkError') || 'خطأ في الاتصال بالشبكة';
      } else if (error.message.includes('Stripe')) {
        errorMessage = t('checkout.errors.stripeError') || 'خطأ في نظام الدفع';
      } else if (error.message) {
        errorMessage = error.message;
      }

      showToast(errorMessage, 'error');
      setIsLoading(false);
    }
  };

  const countries = [
    'Saudi Arabia',
    'United Arab Emirates',
    'Kuwait',
    'Qatar',
    'Bahrain',
    'Oman',
    'Jordan',
    'Egypt',
  ];

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">{t('checkout.emptyCart')}</h2>
          <p className="text-gray-600 mb-4">{t('checkout.emptyCartMessage')}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            {t('checkout.continueShopping')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('checkout.title') || 'إتمام الطلب'}
          </h1>
          <p className="text-gray-600">
            {t('checkout.subtitle') || 'أكمل بياناتك لإتمام عملية الشراء'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* نموذج البيانات */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* معلومات الاتصال */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <User className="w-5 h-5 text-primary mr-2" />
                  <h2 className="text-xl font-semibold">
                    {t('checkout.contactInfo') || 'معلومات الاتصال'}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('checkout.fullName') || 'الاسم الكامل'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={t('checkout.fullNamePlaceholder') || 'أدخل الاسم الكامل'}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="w-4 h-4 inline mr-1" />
                      {t('checkout.email') || 'البريد الإلكتروني'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={t('checkout.emailPlaceholder') || 'example@email.com'}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="w-4 h-4 inline mr-1" />
                      {t('checkout.phone') || 'رقم الهاتف'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={t('checkout.phonePlaceholder') || '+966 5X XXX XXXX'}
                      dir="ltr"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* معلومات الشحن */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <MapPin className="w-5 h-5 text-primary mr-2" />
                  <h2 className="text-xl font-semibold">
                    {t('checkout.shippingInfo') || 'معلومات الشحن'}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('checkout.country') || 'الدولة'} <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {countries.map(country => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('checkout.city') || 'المدينة'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={t('checkout.cityPlaceholder') || 'الرياض، جدة، دبي...'}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('checkout.address') || 'العنوان الكامل'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={t('checkout.addressPlaceholder') || 'الشارع، الحي، رقم المبنى...'}
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('checkout.postalCode') || 'الرمز البريدي'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.postalCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="12345"
                      dir="ltr"
                    />
                    {errors.postalCode && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.postalCode}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ملاحظات إضافية */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  <Package className="w-4 h-4 inline mr-1" />
                  {t('checkout.notes') || 'ملاحظات إضافية (اختياري)'}
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder={t('checkout.notesPlaceholder') || 'أي ملاحظات خاصة بالطلب...'}
                />
              </div>

              {/* زر الإرسال */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t('checkout.processing') || 'جاري المعالجة...'}
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    {t('checkout.proceedToPayment') || 'المتابعة للدفع'}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ملخص الطلب */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">
                {t('checkout.orderSummary') || 'ملخص الطلب'}
              </h2>

              <div className="space-y-4 mb-4">
                {cart.map(item => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{item.name}</h3>
                      <p className="text-xs text-gray-600">
                        {item.size && `${t('size')}: ${item.size}`}
                        {item.size && item.color && ' | '}
                        {item.color && `${t('color')}: ${item.color}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × {item.price} {t('currency')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('checkout.subtotal')}</span>
                  <span className="font-medium">{getCartTotal()} {t('currency')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('checkout.shipping')}</span>
                  <span className="font-medium text-green-600">{t('checkout.freeShipping')}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>{t('checkout.total')}</span>
                  <span className="text-primary">{getCartTotal()} {t('currency')}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <CreditCard className="w-4 h-4 inline mr-1" />
                  {t('checkout.securePayment') || 'الدفع آمن ومشفر عبر Stripe'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 left-4 md:left-auto md:w-96 p-4 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-500' :
          toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } text-white`}>
          <div className="flex items-center">
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 mr-2" />}
            <p>{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
