# دليل إصلاح وتحسين نظام الدفع - متجر نمط (NAMAT)

## 📋 ملخص التحسينات

تم إجراء تحسينات شاملة على نظام الدفع والطلبات في متجر نمط، شملت:

### ✅ التحسينات الرئيسية

1. **إعادة بناء صفحة Checkout بالكامل**
   - ✅ معالجة أخطاء منطقية وتقنية
   - ✅ إضافة validation متقدم للنماذج
   - ✅ معالجة شاملة للأخطاء
   - ✅ إضافة Toast notifications
   - ✅ Loading states واضحة
   - ✅ منع الضغط المتعدد على الزر

2. **تكامل Stripe كامل**
   - ✅ Netlify Function محسّنة (`create-checkout.ts`)
   - ✅ Stripe Webhook للتحديثات التلقائية (`stripe-webhook.ts`)
   - ✅ معالجة جميع حالات الدفع (نجاح/فشل/معلق)
   - ✅ دعم الدفع الآجل (async payments)

3. **ربط مع Supabase**
   - ✅ حفظ الطلبات تلقائياً قبل التوجه للدفع
   - ✅ تحديث حالة الطلب بعد نجاح الدفع
   - ✅ ربط الطلبات بالمستخدمين المسجلين
   - ✅ تتبع Stripe Session IDs

4. **صفحة نجاح الطلب**
   - ✅ عرض تفاصيل الطلب كاملة
   - ✅ رقم الطلب وحالته
   - ✅ معلومات التوصيل
   - ✅ إرشادات الخطوات التالية

---

## 🚀 خطوات التثبيت

### 1. تثبيت المكتبات المطلوبة

```bash
npm install stripe@^17.5.0 @netlify/functions@^2.8.2
```

### 2. تحديث ملفات البيئة

أضف المتغيرات التالية في ملف `.env`:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx  # مطلوب للـ Webhook

# App URL
APP_URL=https://namat-store.netlify.app
```

### 3. رفع الملفات

قم برفع الملفات التالية إلى مشروعك:

```
src/pages/
├── CheckoutPage.tsx         # صفحة الدفع المحسّنة
└── OrderSuccessPage.tsx     # صفحة نجاح الطلب

netlify/functions/
├── create-checkout.ts       # معالج Stripe Checkout
└── stripe-webhook.ts        # معالج Webhook
```

### 4. تحديث Routes

أضف المسار الجديد في `App.tsx` أو ملف الـ routing:

```typescript
import OrderSuccessPage from '@/pages/OrderSuccessPage';

// داخل الـ Routes
<Route path="/order-success" element={<OrderSuccessPage />} />
```

---

## 🔧 إعداد Stripe Dashboard

### 1. الحصول على API Keys

من [Stripe Dashboard](https://dashboard.stripe.com/):

1. اذهب إلى **Developers** → **API keys**
2. انسخ **Secret key** (يبدأ بـ `sk_test_` للتجربة)
3. ضعه في `.env` كـ `STRIPE_SECRET_KEY`

### 2. إعداد Webhook

1. من **Developers** → **Webhooks** → **Add endpoint**
2. URL: `https://your-site.netlify.app/.netlify/functions/stripe-webhook`
3. اختر الأحداث التالية:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. احفظ واحصل على **Signing secret** (يبدأ بـ `whsec_`)
5. ضعه في `.env` كـ `STRIPE_WEBHOOK_SECRET`

### 3. إعداد Netlify Environment Variables

1. اذهب إلى **Site settings** → **Environment variables**
2. أضف جميع المتغيرات من `.env`
3. احفظ وأعد deploy الموقع

---

## 📊 بنية قاعدة البيانات

تأكد من وجود الجداول التالية في Supabase:

### جدول `orders`

```sql
create table orders (
  id uuid default gen_random_uuid() primary key,
  order_number text unique default ('ORD-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  user_id uuid references auth.users(id),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address jsonb not null,
  notes text,
  items jsonb not null,
  total_amount decimal(10,2) not null,
  status text default 'pending',
  payment_status text default 'pending',
  stripe_session_id text,
  stripe_payment_intent text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Index للبحث السريع
create index orders_user_id_idx on orders(user_id);
create index orders_status_idx on orders(status);
create index orders_created_at_idx on orders(created_at desc);
```

### حالات الطلب المدعومة

- **status**: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`
- **payment_status**: `pending`, `paid`, `failed`, `refunded`

---

## 🔍 آلية العمل

### 1. المستخدم يملأ نموذج Checkout

```
CheckoutPage.tsx
↓
Validation
↓
إنشاء سجل في جدول orders (status: pending)
```

### 2. إنشاء Stripe Session

```
POST /.netlify/functions/create-checkout
↓
Stripe API: Create Checkout Session
↓
إعادة توجيه المستخدم لصفحة Stripe
```

### 3. المستخدم يدفع في Stripe

```
Stripe Payment Form
↓
نجاح/فشل الدفع
↓
Stripe يرسل Webhook
```

### 4. تحديث حالة الطلب

```
POST /.netlify/functions/stripe-webhook
↓
التحقق من Webhook Signature
↓
تحديث orders (status: confirmed, payment_status: paid)
↓
إعادة توجيه المستخدم لـ /order-success
```

---

## 🧪 الاختبار

### 1. اختبار Checkout محلياً

```bash
npm run dev
```

- اذهب إلى `/checkout`
- املأ النموذج (استخدم بيانات وهمية)
- تحقق من validation
- تأكد من ظهور loading state

### 2. اختبار Stripe (Test Mode)

استخدم بطاقات الاختبار:

| البطاقة | الرقم | النتيجة |
|---------|-------|---------|
| نجاح | 4242 4242 4242 4242 | دفع ناجح |
| فشل | 4000 0000 0000 0002 | رفض البطاقة |
| 3D Secure | 4000 0027 6000 3184 | يتطلب تأكيد |

- CVC: أي 3 أرقام
- تاريخ الانتهاء: أي تاريخ مستقبلي
- ZIP: أي 5 أرقام

### 3. اختبار Webhook

استخدم [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:8888/.netlify/functions/stripe-webhook
```

---

## 🐛 حل المشاكل الشائعة

### المشكلة: زر "إكمال الطلب" لا يعمل

**الحلول:**

1. **تحقق من Console في المتصفح**
   ```javascript
   // افتح Developer Tools → Console
   // ابحث عن أخطاء JavaScript
   ```

2. **تحقق من Network tab**
   - هل يتم إرسال الطلب للـ function؟
   - ما هي رسالة الخطأ؟

3. **تحقق من Environment Variables**
   ```bash
   # في Netlify Dashboard
   STRIPE_SECRET_KEY=sk_test_xxx  # ✓
   VITE_SUPABASE_URL=https://xxx  # ✓
   ```

### المشكلة: Webhook لا يعمل

**الحلول:**

1. **تحقق من Webhook Secret**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

2. **تحقق من Logs في Netlify**
   ```
   Functions → stripe-webhook → View logs
   ```

3. **تحقق من Stripe Dashboard**
   ```
   Developers → Webhooks → View events
   ```

### المشكلة: الطلب لا يُحدّث في Supabase

**الحلول:**

1. **تحقق من Service Role Key**
   ```env
   SUPABASE_SERVICE_ROLE_KEY=xxxxx
   ```

2. **تحقق من Row Level Security (RLS)**
   ```sql
   -- تعطيل RLS مؤقتاً للاختبار
   alter table orders disable row level security;
   ```

3. **تحقق من Logs**
   ```javascript
   // في stripe-webhook.ts
   console.log('Order updated:', data);
   ```

---

## 📱 معالجة الأخطاء

### أخطاء Validation

```typescript
// في CheckoutPage.tsx
if (!formData.fullName.trim()) {
  errors.fullName = 'الاسم الكامل مطلوب';
}
```

### أخطاء Network

```typescript
try {
  const response = await fetch('...');
  if (!response.ok) throw new Error('Network error');
} catch (error) {
  showToast('خطأ في الاتصال بالشبكة', 'error');
}
```

### أخطاء Stripe

```typescript
catch (error: any) {
  if (error.type === 'StripeCardError') {
    showToast('تم رفض البطاقة', 'error');
  }
}
```

---

## 🎨 التخصيص

### تغيير العملة

```typescript
// في create-checkout.ts
currency: 'sar', // SAR = ريال سعودي
// أو: 'usd', 'aed', 'kwd'
```

### تخصيص رسائل Toast

```typescript
// في CheckoutPage.tsx
showToast('رسالة مخصصة', 'success');
```

### إضافة حقول للنموذج

```typescript
// في CheckoutPage.tsx
interface CheckoutFormData {
  // ... الحقول الموجودة
  companyName?: string; // حقل جديد
}
```

---

## 📧 إرسال إشعارات البريد الإلكتروني (اختياري)

يمكنك إضافة إرسال بريد تأكيد باستخدام خدمة مثل SendGrid:

```typescript
// في stripe-webhook.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: session.customer_email,
  from: 'orders@namat.com',
  subject: 'تأكيد طلبك',
  html: `طلبك رقم #${orderId} تم تأكيده بنجاح`,
});
```

---

## 🔐 الأمان

### التوصيات

1. **استخدم HTTPS دائماً** في الإنتاج
2. **لا تشارك Secret Keys** في الكود
3. **تحقق من Webhook Signature** (مطبق بالفعل)
4. **فعّل Rate Limiting** في Netlify
5. **استخدم Environment Variables** للبيانات الحساسة

### Row Level Security في Supabase

```sql
-- السماح للمستخدمين برؤية طلباتهم فقط
create policy "Users can view own orders"
on orders for select
using (auth.uid() = user_id);

-- السماح بالإدراج للجميع (ضيوف)
create policy "Anyone can create orders"
on orders for insert
with check (true);
```

---

## 📈 التحسينات المستقبلية

### أفكار للتطوير

1. **نظام تتبع الشحن**
   - إضافة tracking_number في جدول orders
   - عرض خريطة التتبع

2. **إشعارات Push**
   - تنبيهات عند تحديث حالة الطلب

3. **نظام المراجعات**
   - السماح بتقييم المنتجات بعد الاستلام

4. **خصومات وكوبونات**
   - نظام Promo codes
   - خصم تلقائي للطلبات الكبيرة

5. **لوحة تحكم الأدمن**
   - إدارة الطلبات
   - تحديث الحالات
   - طباعة فواتير

---

## 📞 الدعم

إذا واجهت مشاكل:

1. **راجع Console logs** في المتصفح
2. **راجع Netlify Function logs**
3. **راجع Stripe Dashboard logs**
4. **راجع Supabase logs**

---

## ✅ Checklist التحقق النهائي

قبل النشر إلى Production:

- [ ] جميع Environment Variables مضبوطة
- [ ] Stripe في Live Mode (وليس Test)
- [ ] Webhook مُعد بشكل صحيح
- [ ] تم اختبار عملية الدفع كاملة
- [ ] تم اختبار حالات الخطأ
- [ ] HTTPS مفعّل
- [ ] تم مراجعة RLS في Supabase
- [ ] تم اختبار على أجهزة مختلفة
- [ ] تم مراجعة UX للنماذج
- [ ] تم إضافة Google Analytics (اختياري)

---

**نجاح التكامل! 🎉**

الآن نظام الدفع جاهز بالكامل مع جميع التحسينات المطلوبة.
