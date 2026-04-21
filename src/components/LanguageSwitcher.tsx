import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const next = i18n.language === 'en' ? 'ar' : 'en';

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => void i18n.changeLanguage(next)}
      className="rounded-full gap-1.5 text-[#002B49] hover:bg-[#D4AF37]/10 font-bold text-xs px-3 h-9 shrink-0"
      aria-label={t('lang.en')}
    >
      <Languages className="h-4 w-4" />
      <span className="uppercase tracking-wide">{i18n.language === 'en' ? 'AR' : 'EN'}</span>
    </Button>
  );
}
