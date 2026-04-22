# 💠 نمط | NAMAT Store
### متجر إلكتروني فاخر للأزياء العربية والمعاصرة
**[معاينة حية للمشروع](https://namat-store.vercel.app/)**

![Banner](https://namat-store.vercel.app/image/about-editorial-1.webp)

---

## 🌟 نظرة عامة
**نمط (NAMAT)** هو منصة تسوق إلكترونية متطورة متخصصة في الأزياء الراقية (عبايات، قفاطين، ملابس أطفال). يجمع المشروع بين أصالة التراث الخليجي وحداثة التصميم العالمي، مع تجربة مستخدم سلسة تدعم اللغتين العربية والإنجليزية بشكل كامل.

## 🚀 الروابط السريعة
- **رابط النشر (Vercel):** [https://namat-store.vercel.app/](https://namat-store.vercel.app/)
- **رابط النشر (Netlify):** [https://namat-store.netlify.app/](https://namat-store.netlify.app/)

## ✨ المميزات الرئيسية
- **🌍 ثنائي اللغة (i18n):** دعم كامل للغتين العربية والإنجليزية مع تبديل تلقائي للاتجاهات (RTL/LTR).
- **💳 دفع آمن:** تكامل متقدم مع **Stripe** لدفع البطاقات الائتمانية.
- **🔐 نظام مصادقة:** إدارة حسابات المستخدمين عبر **Supabase Auth**.
- **📦 إدارة الطلبات:** لوحة تحكم إدارية لمتابعة الطلبات وتحديث حالاتها.
- **🛒 تجربة تسوق ذكية:** سلة مشتريات ديناميكية، قائمة أمنيات، وفلاتر بحث متقدمة.
- **📱 متجاوب بالكامل:** تصميم عصري يعمل بكفاءة على كافة أحجام الشاشات.

## 🛠️ التقنيات المستخدمة
- **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend/Database:** Supabase (PostgreSQL, Auth, Storage).
- **Payments:** Stripe API & Webhooks.
- **Deployment:** Vercel & Netlify Functions.

---

## 📸 لقطات من المشروع
| الصفحة الرئيسية | سلة المشتريات | صفحة إتمام الطلب |
|:---:|:---:|:---:|
| ![Main Shop](./public/screenshots/shop-main.png) | ![Cart](./public/screenshots/cart.png) | ![Checkout](./public/screenshots/checkout.png) |

| الأقسام والفلاتر | عرض المنتجات |
|:---:|:---:|
| ![Categories](./public/screenshots/categories.png) | ![Products](./public/screenshots/products-list.png) |

---

## ⚙️ التشغيل المحلي
1. **تحميل المشروع:**
   ```bash
   git clone https://github.com/ayakakaa135-boop/NamatStore.git
   cd NamatStore
   ```
2. **تثبيت المكتبات:**
   ```bash
   npm install
   ```
3. **إعداد البيئة:**
   أنشئ ملف `.env` وأضف مفاتيح Supabase و Stripe الخاصة بك.
4. **التشغيل:**
   ```bash
   npm run dev
   ```

## 📝 ملاحظات للمطورين
- يتم تخزين السلة والمفضلة محلياً في المتصفح لضمان سرعة الوصول.
- تعتمد حالات الطلب على تدفق منطقي يبدأ من `Pending` وصولاً إلى `Delivered`.
- جميع الصور تم تحسينها بصيغة `WebP` لضمان أداء عالٍ.

---
تم التطوير بكل ❤️ بواسطة فريق **Antigravity**.

