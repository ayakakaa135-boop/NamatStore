export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  categoryId: string;
  image: string;
  images?: string[];
  description: string;
  rating: number;
  reviewCount: number;
  sizes: string[];
  colors?: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  inStock: boolean;
  discount?: number;
  material?: string;
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  image: string;
  count: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'abaya',
    name: 'عبايات فاخرة',
    nameEn: 'Luxury Abayas',
    image: '/image/abaya-brown-1.jpeg',
    count: 'مجموعة مختارة',
    description: 'عبايات يومية ومناسبات بألوان ترابية راقية وقصات انسيابية',
  },
  {
    id: 'women',
    name: 'قطع مناسبات نسائية',
    nameEn: "Women's Occasion Wear",
    image: '/image/yasu-shots-_y6hMz1pJC0-unsplash.webp',
    count: 'إطلالات مناسبة',
    description: 'قطع ناعمة للمناسبات والإطلالات المسائية المحتشمة',
  },
  {
    id: 'kids',
    name: 'ملابس أطفال',
    nameEn: "Children's Wear",
    image: '/image/kids-thobe-formal.webp',
    count: 'أناقة الصغار',
    description: 'ثياب أطفال رسمية ومريحة للمناسبات والأعياد',
  },
  {
    id: 'accessories',
    name: 'إكسسوارات',
    nameEn: 'Accessories',
    image: '/image/cashmere-hijab.webp',
    count: 'لمسات مكملة',
    description: 'حجابات وشالات وإكسسوارات تكمل الإطلالة بهدوء وأناقة',
  },
];

export const PRODUCTS: Product[] = [
  {
    id: '2',
    name: 'عباية انسيابية بلون القهوة',
    price: 890,
    category: 'عبايات فاخرة',
    categoryId: 'abaya',
    image: '/image/abaya-brown-1.jpeg',
    images: [
      '/image/abaya-brown-1.jpeg',
    ],
    description: 'عباية انسيابية بقصة هادئة ولون قهوة دافئ، مناسبة للإطلالات اليومية الراقية مع أكمام واسعة ولمسة عملية أنيقة.',
    rating: 4.8,
    reviewCount: 94,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['قهوة', 'بني داكن'],
    isNew: true,
    isFeatured: true,
    inStock: true,
    material: 'كريب ناعم',
  },
  {
    id: '3',
    name: 'قفطان سهرة دانتيل فاخر',
    price: 1280,
    originalPrice: 1540,
    category: 'قطع مناسبات نسائية',
    categoryId: 'women',
    image: '/image/yasu-shots-_y6hMz1pJC0-unsplash.webp',
    images: ['/image/yasu-shots-_y6hMz1pJC0-unsplash.webp'],
    description: 'قفطان سهرة فاخر بلمسة دانتيل ناعمة وقصة أنثوية محتشمة، مناسب للمناسبات المسائية والاستقبالات الراقية.',
    rating: 4.7,
    reviewCount: 67,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['أسود', 'بورغندي', 'نيفي'],
    isNew: false,
    isFeatured: true,
    inStock: true,
    discount: 20,
    material: 'دانتيل فرنسي',
  },
  {
    id: '5',
    name: 'ساعة يد كلاسيكية مطلية بالذهب',
    price: 1500,
    originalPrice: 1800,
    category: 'إكسسوارات',
    categoryId: 'accessories',
    image: '/image/watch-gold-1.jpeg',
    images: ['/image/watch-gold-1.jpeg'],
    description: 'ساعة يد فاخرة بتصميم كلاسيكي، مطلية بذهب عيار 18 مع مقاومة ممتازة للماء وآلية سويسرية دقيقة.',
    rating: 4.6,
    reviewCount: 83,
    sizes: ['مقاس موحد'],
    colors: ['ذهبي', 'ذهبي وردي'],
    isNew: true,
    inStock: true,
    discount: 17,
    material: 'ستانلس ستيل مطلي',
  },
  {
    id: '6',
    name: 'ثوب أطفال رسمي للمناسبات',
    price: 280,
    category: 'ملابس أطفال',
    categoryId: 'kids',
    image: '/image/kids-thobe-formal.webp',
    images: ['/image/kids-thobe-formal.webp'],
    description: 'ثوب أطفال رسمي بستايل خليجي أنيق، مناسب للأعياد والزيارات والمناسبات العائلية مع قماش مريح ومظهر مرتب.',
    rating: 4.5,
    reviewCount: 156,
    sizes: ['2-3 سنوات', '4-5 سنوات', '6-7 سنوات', '8-9 سنوات'],
    colors: ['أبيض'],
    isNew: false,
    inStock: true,
    material: 'قطن ناعم',
  },
  {
    id: '7',
    name: 'عباية فاخرة بلون الفحم',
    price: 1080,
    originalPrice: 1320,
    category: 'عبايات فاخرة',
    categoryId: 'abaya',
    image: '/image/abaya-charcoal-4.jpeg',
    images: ['/image/abaya-charcoal-4.jpeg'],
    description: 'عباية فاخرة بلون الفحم الداكن مع حضور أنيق وقصة واسعة ناعمة، مثالية للسهرات والإطلالات المسائية الهادئة.',
    rating: 4.9,
    reviewCount: 71,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['فحمي', 'أسود'],
    isNew: true,
    isFeatured: true,
    inStock: true,
    discount: 21,
    material: 'كريب فاخر',
  },
  {
    id: '8',
    name: 'حجاب كشمير فاخر',
    price: 420,
    category: 'إكسسوارات',
    categoryId: 'accessories',
    image: '/image/cashmere-hijab.webp',
    images: ['/image/cashmere-hijab.webp'],
    description: 'حجاب كشمير ناعم وخفيف بملمس فاخر، ينسدل بأناقة ويمنح الإطلالة لمسة راقية للاستخدام اليومي والمناسبات.',
    rating: 4.7,
    reviewCount: 39,
    sizes: ['مقاس موحد'],
    colors: ['أوف وايت', 'بيج رملي'],
    isNew: false,
    inStock: true,
    material: 'كشمير 100%',
  },
  {
    id: '9',
    name: 'عباية كلاسيكية خضراء داكنة',
    price: 940,
    originalPrice: 1120,
    category: 'عبايات فاخرة',
    categoryId: 'abaya',
    image: '/image/abaya-green-2.jpeg',
    images: ['/image/abaya-green-2.jpeg'],
    description: 'عباية كلاسيكية بلون أخضر داكن أنيق، بقصة مستقيمة وأكمام واسعة، تناسب الإطلالات اليومية الفاخرة والمناسبات الهادئة.',
    rating: 4.8,
    reviewCount: 52,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['أخضر داكن'],
    isNew: true,
    isFeatured: true,
    inStock: true,
    discount: 16,
    material: 'كريب عملي فاخر',
  },
  {
    id: '10',
    name: 'عباية زيتونية بحزام ناعم',
    price: 970,
    originalPrice: 1180,
    category: 'عبايات فاخرة',
    categoryId: 'abaya',
    image: '/image/abaya-olive-3.jpeg',
    images: ['/image/abaya-olive-3.jpeg'],
    description: 'عباية زيتونية أنيقة بحزام خفيف يبرز القصة بشكل ناعم، تصميم مناسب للنهار والمساء مع طابع عصري راقٍ.',
    rating: 4.9,
    reviewCount: 48,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['زيتي', 'أخضر فاتح'],
    isNew: true,
    isFeatured: true,
    inStock: true,
    discount: 18,
    material: 'نسيج كريب انسيابي',
  },
  {
    id: '11',
    name: 'عباية مفتوحة للمناسبات',
    price: 1220,
    originalPrice: 1460,
    category: 'عبايات فاخرة',
    categoryId: 'abaya',
    image: '/image/milada-vigerova-p8Drpg_duLw-unsplash.webp',
    images: ['/image/milada-vigerova-p8Drpg_duLw-unsplash.webp'],
    description: 'عباية مفتوحة للمناسبات بتفاصيل راقية وانسياب ناعم، تلائم فساتين السهرة والإطلالات الرسمية المحتشمة.',
    rating: 4.8,
    reviewCount: 44,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['أسود', 'كحلي'],
    isNew: true,
    isFeatured: true,
    inStock: true,
    discount: 16,
    material: 'ساتان مطفي فاخر',
  },
  {
    id: '12',
    name: 'شال كشمير دافئ',
    price: 360,
    originalPrice: 440,
    category: 'إكسسوارات',
    categoryId: 'accessories',
    image: '/image/tobias-tullius-Fg15LdqpWrs-unsplash.webp',
    images: ['/image/tobias-tullius-Fg15LdqpWrs-unsplash.webp'],
    description: 'شال كشمير دافئ بملمس فاخر يضيف طبقة أنيقة ومريحة فوق العبايات والإطلالات الشتوية الخفيفة.',
    rating: 4.7,
    reviewCount: 58,
    sizes: ['مقاس موحد'],
    colors: ['بيج', 'رمادي', 'موكا'],
    isNew: false,
    inStock: true,
    discount: 18,
    material: 'خليط كشمير ناعم',
  },
];

export type SiteFeatureId = 'delivery' | 'quality' | 'tailoring' | 'payment';

export interface SiteFeature {
  id: SiteFeatureId;
  title: string;
  description: string;
}

/** نفس المحتوى لجميع الصفحات؛ الأيقونات تُعرَض في الواجهة (إيموجي أو Lucide). */
export const FEATURES: SiteFeature[] = [
  {
    id: 'delivery',
    title: 'توصيل سريع ومجاني',
    description: 'نقدم خدمة التوصيل السريع لجميع دول الخليج، مجاناً للطلبات فوق 500 ريال.',
  },
  {
    id: 'quality',
    title: 'جودة استثنائية',
    description: 'نستخدم أجود أنواع الأقمشة العالمية لضمان راحة وفخامة تدوم طويلاً.',
  },
  {
    id: 'tailoring',
    title: 'خياطة حسب الطلب',
    description: 'فريق من أمهر الخياطين لتعديل ملابسك وضمان المقاس المثالي لك.',
  },
  {
    id: 'payment',
    title: 'دفع آمن وسهل',
    description: 'خيارات دفع متعددة تشمل الدفع عند الاستلام، تابي، وتمارا.',
  },
];

export const FEATURE_ICONS_EMOJI: Record<SiteFeatureId, string> = {
  delivery: '🚚',
  quality: '✨',
  tailoring: '✂️',
  payment: '💳',
};

export const TESTIMONIALS = [
  {
    tid: 'abdullah' as const,
    name: 'دانا العتيبي',
    role: 'عميلة دائمة',
    content: 'القصات هادئة والخامات راقية، وكل قطعة وصلتني كانت أجمل من الصور.',
    rating: 5,
    avatar: '/image/about-editorial-1.webp',
  },
  {
    tid: 'noura' as const,
    name: 'نورة المنصور',
    role: 'مصممة أزياء',
    content: 'أبهرتني دقة التفاصيل في العبايات، التصاميم عصرية وتناسب الذوق الخليجي الرفيع. خدمة العملاء ممتازة.',
    rating: 5,
    avatar: '/image/junko-nakase-Q-72wa9-7Dg-unsplash.webp',
  },
  {
    tid: 'fahad' as const,
    name: 'مي العبدالله',
    role: 'صانعة محتوى',
    content: 'أحببت بساطة المتجر واختيار القطع. واضح أن كل منتج مختار بعناية وليس مجرد عرض عشوائي.',
    rating: 5,
    avatar: '/image/alyssa-strohmann-TS--uNw-JqE-unsplash.webp',
  },
];
