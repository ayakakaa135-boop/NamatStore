import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/** يزامن وسم <html> مع اللغة والاتجاه (RTL/LTR). */
export default function HtmlI18n() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const apply = () => {
      document.documentElement.lang = i18n.language === 'en' ? 'en' : 'ar';
      document.documentElement.dir = i18n.dir();
    };
    apply();
    i18n.on('languageChanged', apply);
    return () => {
      i18n.off('languageChanged', apply);
    };
  }, [i18n]);

  return null;
}
