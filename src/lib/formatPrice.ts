export function formatPrice(amount: number, lang: string): string {
  const loc = lang === 'en' ? 'en-US' : 'ar-SA';
  const n = amount.toLocaleString(loc);
  return lang === 'en' ? `${n} SAR` : `${n} ر.س`;
}
