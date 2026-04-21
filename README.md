# نمط (NAMAT)

واجهة متجر إلكتروني للأزياء والعبايات والأثواب — React 19، Vite، Tailwind CSS، **عربي/إنجليزي** مع تبديل الاتجاه (RTL/LTR).

## التشغيل محلياً

**المتطلبات:** Node.js 18+

```bash
npm install
npm run dev
```

يفتح الخادم عادة على المنفذ 3000. زر **EN / AR** في الشريط العلوي يغيّر اللغة ويُخزَّن الاختيار في `localStorage` (`namat_lang`).

## الأوامر

| الأمر | الوظيفة |
|--------|---------|
| `npm run dev` | خادم تطوير |
| `npm run build` | بناء للإنتاج (`dist/`) |
| `npm run preview` | معاينة البناء |
| `npm run lint` | فحص TypeScript |

## الباك إند (Supabase) — اختياري

لحفظ **رسائل صفحة التواصل** و**النشرة البريدية** في قاعدة بيانات حقيقية:

1. أنشئ مشروعاً مجانياً على [supabase.com](https://supabase.com).
2. من **SQL Editor** نفّذ محتوى الملف `supabase/migrations/001_init.sql`.
3. نفّذ أيضاً `supabase/migrations/002_profiles.sql`.
4. ثم نفّذ `supabase/migrations/003_orders.sql` لتفعيل نظام الطلبات.
5. ثم نفّذ `supabase/migrations/004_admin_order_roles.sql` لتفعيل صلاحيات الأدمن وحالات الطلب الموسعة.
6. من **Project Settings → API** انسخ **Project URL** و**anon public key**.
7. أنشئ ملف `.env` في جذر المشروع:

   ```env
   VITE_SUPABASE_URL=""
   VITE_SUPABASE_ANON_KEY=""
   APP_URL=""
   STRIPE_SECRET_KEY=""
   ```

8. أعد تشغيل `npm run dev`.

بدون هذه المتغيرات ستعمل الواجهة، لكن:
- تسجيل الدخول وإنشاء الحساب واستعادة كلمة المرور لن تعمل فعلياً.
- نماذج التواصل والنشرة ستُظهر خطأ إرسال بدلاً من نجاح وهمي.

## المصادقة (تسجيل الدخول / إنشاء حساب / إعادة تعيين)

- التسجيل وتسجيل الدخول يعتمدان على **Supabase Auth**.
- بعد تشغيل `supabase/migrations/002_profiles.sql` سيتم إنشاء سجل `profile` تلقائياً لكل مستخدم جديد.
- لتفعيل **لوحة الأدمن**: غيّر قيمة `role` في جدول `profiles` للحساب المطلوب إلى `admin`.
- مثال SQL:

  ```sql
  update public.profiles
  set role = 'admin'
  where id = 'USER_UUID_HERE';
  ```

- بعد ذلك ستظهر صفحة **إدارة الطلبات** عبر الرابط `/admin/orders` ومن قائمة المستخدم.
- صفحة **نسيت كلمة المرور** ترسل رابطاً إلى المسار `/reset-password` داخل الموقع لإكمال تعيين كلمة مرور جديدة.
- صفحة **الحساب الشخصي** متاحة على `/profile`.
- إذا ظهر الخطأ `Orders database is not ready yet` أو `Could not find the table 'public.orders'` فهذا يعني أن migration الطلبات لم تُطبّق بعد.

## الدفع عبر Stripe

- تم تجهيز API route باسم `/api/create-checkout-session` لاستخدام **Stripe Checkout Sessions**.
- الدفع بالبطاقة من صفحة الدفع يعتمد على وجود `STRIPE_SECRET_KEY`.
- في بيئة النشر على Vercel سيعمل المسار مباشرة، أما محلياً فالأفضل تشغيل المشروع عبر `vercel dev` إذا أردت اختبار الـ API route مع الواجهة.
- الربط الحالي عملي لبدء الدفع، ومع الإنتاج يُنصح بإضافة **Webhook** من Stripe لمزامنة حالة الدفع تلقائياً داخل قاعدة البيانات.

## النشر على الإنترنت (مثال: Vercel)

1. اربط المستودع مع [Vercel](https://vercel.com) أو ارفع مجلد المشروع.
2. **Build command:** `npm run build`  
   **Output directory:** `dist`
3. أضف متغيرات البيئة نفسها (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) في إعدادات المشروع على Vercel.
4. يتضمن المشروع `vercel.json` لإعادة توجيه مسارات SPA إلى `index.html`.

## ملاحظات

- السلة والمفضلة في `localStorage`: `namat_cart`، `namat_wishlist`.
- ترجمات الواجهة في `src/locales/ar.json` و `src/locales/en.json`؛ أسماء ووصف المنتجات بالإنجليزية في `src/lib/productLocale.ts`.
