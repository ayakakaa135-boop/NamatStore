import type { Product } from './constants';

/** ترجمة حقول العرض للمنتجات (المصدر العربي في constants). */
const EN: Record<
  string,
  Pick<Product, 'name' | 'category' | 'description'> & {
    colors?: string[];
    sizes?: string[];
    material?: string;
  }
> = {
  '2': {
    name: 'Coffee-toned flowing abaya',
    category: 'Luxury abayas',
    description:
      'A flowing abaya in a warm coffee shade with soft wide sleeves, made for elegant everyday wear and refined styling.',
    colors: ['Coffee', 'Dark brown'],
    material: 'Soft crepe',
  },
  '3': {
    name: 'Luxury lace evening kaftan',
    category: "Women's occasion wear",
    description:
      'A refined evening kaftan with soft lace detailing and a modest feminine silhouette for receptions and formal occasions.',
    colors: ['Black', 'Burgundy', 'Navy'],
    material: 'French lace',
  },
  '5': {
    name: 'Classic gold-plated watch',
    category: 'Accessories',
    description:
      'A luxury watch with a classic design, 18k gold plating, water resistance, and a precise Swiss movement.',
    colors: ['Gold', 'Rose gold'],
    material: 'Gold-plated stainless steel',
  },
  '6': {
    name: 'Formal kids thobe',
    category: "Children's wear",
    description:
      'A formal Gulf-style thobe for kids, ideal for Eid, visits, and family occasions with a neat comfortable fit.',
    colors: ['White'],
    sizes: ['2–3 yrs', '4–5 yrs', '6–7 yrs', '8–9 yrs'],
    material: 'Soft cotton',
  },
  '7': {
    name: 'Charcoal luxury abaya',
    category: 'Luxury abayas',
    description:
      'A dark charcoal abaya with a graceful wide silhouette, designed for elegant evening wear and refined minimal looks.',
    colors: ['Charcoal', 'Black'],
    material: 'Premium crepe',
  },
  '8': {
    name: 'Luxury cashmere hijab',
    category: 'Accessories',
    description:
      'A soft lightweight cashmere hijab with an elegant drape that adds a refined finish to daily and occasion looks.',
    colors: ['Off-white', 'Sand beige'],
    material: '100% cashmere',
  },
  '9': {
    name: 'Dark green classic abaya',
    category: 'Luxury abayas',
    description:
      'A classic abaya in deep green with wide sleeves and a clean silhouette, ideal for polished everyday looks and quiet occasions.',
    colors: ['Dark green'],
    material: 'Premium practical crepe',
  },
  '10': {
    name: 'Olive abaya with soft belt',
    category: 'Luxury abayas',
    description:
      'An olive-toned abaya with a soft waist tie and fluid movement, balancing modern elegance with versatile wearability.',
    colors: ['Olive', 'Light green'],
    material: 'Fluid crepe fabric',
  },
  '11': {
    name: 'Open abaya for occasions',
    category: 'Luxury abayas',
    description:
      'An open abaya for special occasions with elegant fluid movement, designed to layer beautifully over evening looks.',
    colors: ['Black', 'Navy'],
    material: 'Premium matte satin',
  },
  '12': {
    name: 'Warm cashmere shawl',
    category: 'Accessories',
    description:
      'A warm cashmere-blend shawl with a luxurious hand feel, ideal for layering over abayas and modest winter looks.',
    colors: ['Beige', 'Grey', 'Mocha'],
    material: 'Soft cashmere blend',
  },
};

export function getLocalizedProduct(product: Product, lang: string): Product {
  if (lang !== 'en') return product;
  const en = EN[product.id];
  if (!en) return product;
  return {
    ...product,
    name: en.name,
    category: en.category,
    description: en.description,
    material: en.material ?? product.material,
    colors: en.colors ?? product.colors,
    sizes: en.sizes ?? product.sizes,
  };
}

export function productSearchBlob(p: Product, lang: string): string {
  const loc = getLocalizedProduct(p, lang);
  return `${loc.name} ${loc.description} ${loc.category}`.toLowerCase();
}
