import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface Country {
  code: string;
  dial: string;
  flag: string;
  nameAr: string;
  nameEn: string;
}

export const PHONE_COUNTRIES: Country[] = [
  { code: 'SA', dial: '+966', flag: '🇸🇦', nameAr: 'السعودية', nameEn: 'Saudi Arabia' },
  { code: 'AE', dial: '+971', flag: '🇦🇪', nameAr: 'الإمارات', nameEn: 'United Arab Emirates' },
  { code: 'KW', dial: '+965', flag: '🇰🇼', nameAr: 'الكويت', nameEn: 'Kuwait' },
  { code: 'QA', dial: '+974', flag: '🇶🇦', nameAr: 'قطر', nameEn: 'Qatar' },
  { code: 'BH', dial: '+973', flag: '🇧🇭', nameAr: 'البحرين', nameEn: 'Bahrain' },
  { code: 'OM', dial: '+968', flag: '🇴🇲', nameAr: 'عمان', nameEn: 'Oman' },
  { code: 'YE', dial: '+967', flag: '🇾🇪', nameAr: 'اليمن', nameEn: 'Yemen' },
  { code: 'JO', dial: '+962', flag: '🇯🇴', nameAr: 'الأردن', nameEn: 'Jordan' },
  { code: 'EG', dial: '+20', flag: '🇪🇬', nameAr: 'مصر', nameEn: 'Egypt' },
  { code: 'IQ', dial: '+964', flag: '🇮🇶', nameAr: 'العراق', nameEn: 'Iraq' },
  { code: 'LB', dial: '+961', flag: '🇱🇧', nameAr: 'لبنان', nameEn: 'Lebanon' },
  { code: 'PS', dial: '+970', flag: '🇵🇸', nameAr: 'فلسطين', nameEn: 'Palestine' },
  { code: 'SY', dial: '+963', flag: '🇸🇾', nameAr: 'سوريا', nameEn: 'Syria' },
  { code: 'MA', dial: '+212', flag: '🇲🇦', nameAr: 'المغرب', nameEn: 'Morocco' },
  { code: 'DZ', dial: '+213', flag: '🇩🇿', nameAr: 'الجزائر', nameEn: 'Algeria' },
  { code: 'TN', dial: '+216', flag: '🇹🇳', nameAr: 'تونس', nameEn: 'Tunisia' },
  { code: 'LY', dial: '+218', flag: '🇱🇾', nameAr: 'ليبيا', nameEn: 'Libya' },
  { code: 'SD', dial: '+249', flag: '🇸🇩', nameAr: 'السودان', nameEn: 'Sudan' },
  { code: 'TR', dial: '+90', flag: '🇹🇷', nameAr: 'تركيا', nameEn: 'Turkey' },
  { code: 'GB', dial: '+44', flag: '🇬🇧', nameAr: 'المملكة المتحدة', nameEn: 'United Kingdom' },
  { code: 'US', dial: '+1', flag: '🇺🇸', nameAr: 'الولايات المتحدة', nameEn: 'United States' },
];

const DEFAULT_COUNTRY = PHONE_COUNTRIES[0];

function detectCountry(value: string): Country | null {
  const trimmed = value.trim().replace(/\s+/g, '');
  if (!trimmed.startsWith('+')) return null;
  const sorted = [...PHONE_COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  return sorted.find((c) => trimmed.startsWith(c.dial)) ?? null;
}

function stripDial(value: string, dial: string): string {
  const trimmed = value.trim().replace(/\s+/g, '');
  return trimmed.startsWith(dial) ? trimmed.slice(dial.length) : trimmed.replace(/^\+/, '');
}

interface PhoneInputProps {
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  hasError?: boolean;
  className?: string;
  id?: string;
}

export default function PhoneInput({
  name = 'phone',
  value,
  onChange,
  placeholder,
  required,
  hasError,
  className = '',
  id,
}: PhoneInputProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [country, setCountry] = useState<Country>(() => detectCountry(value) ?? DEFAULT_COUNTRY);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const detected = detectCountry(value);
    if (detected && detected.code !== country.code) {
      setCountry(detected);
    }
  }, [value, country.code]);

  useEffect(() => {
    if (!open) return;
    const handleDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleDocClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleDocClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  const localNumber = useMemo(() => stripDial(value, country.dial), [value, country.dial]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PHONE_COUNTRIES;
    return PHONE_COUNTRIES.filter((c) => {
      const name = isAr ? c.nameAr : c.nameEn;
      return (
        name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.code.toLowerCase().includes(q)
      );
    });
  }, [query, isAr]);

  const pickCountry = (c: Country) => {
    setCountry(c);
    setOpen(false);
    setQuery('');
    onChange(`${c.dial}${localNumber}`);
  };

  const handleNumberChange = (raw: string) => {
    const digits = raw.replace(/[^\d]/g, '');
    onChange(digits ? `${country.dial}${digits}` : '');
  };

  const baseBorder = hasError ? 'border-red-400' : 'border-[#e8d9c5] focus-within:border-[#D4AF37]';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className={`flex h-12 w-full items-stretch overflow-hidden rounded-xl border-2 bg-[#F7F4F0] transition ${baseBorder}`}
      >
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={isAr ? 'اختر الدولة' : 'Select country'}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex shrink-0 items-center gap-2 px-3 font-bold text-[#002B49] hover:bg-[#F3E3CF]/60 transition-colors"
        >
          <span className="text-xl leading-none" aria-hidden="true">
            {country.flag}
          </span>
          <span className="text-sm" dir="ltr">
            {country.dial}
          </span>
          <ChevronDown className="h-4 w-4 text-[#7a6a56]" />
        </button>
        <div className="h-full w-px bg-[#e8d9c5]" />
        <input
          id={id}
          name={name}
          type="tel"
          inputMode="tel"
          dir="ltr"
          autoComplete="tel-national"
          value={localNumber}
          placeholder={placeholder}
          required={required}
          onChange={(e) => handleNumberChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent px-4 font-medium text-[#002B49] outline-none placeholder:text-[#b5a090]"
        />
      </div>

      {open && (
        <div
          role="listbox"
          className="absolute z-30 mt-2 w-full max-w-sm overflow-hidden rounded-2xl border border-[#F3E3CF] bg-white shadow-xl"
        >
          <div className="flex items-center gap-2 border-b border-[#F3E3CF] px-3 py-2">
            <Search className="h-4 w-4 text-[#7a6a56]" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isAr ? 'ابحث عن دولة...' : 'Search country...'}
              className="w-full bg-transparent text-sm text-[#002B49] outline-none placeholder:text-[#b5a090]"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-sm text-[#7a6a56]">
                {isAr ? 'لا توجد نتائج' : 'No matches'}
              </li>
            )}
            {filtered.map((c) => {
              const selected = c.code === country.code;
              return (
                <li key={c.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => pickCountry(c)}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-start transition-colors ${
                      selected ? 'bg-[#F3E3CF]/60' : 'hover:bg-[#F7F4F0]'
                    }`}
                  >
                    <span className="text-xl leading-none" aria-hidden="true">
                      {c.flag}
                    </span>
                    <span className="flex-1 truncate text-sm font-medium text-[#002B49]">
                      {isAr ? c.nameAr : c.nameEn}
                    </span>
                    <span className="text-sm text-[#7a6a56]" dir="ltr">
                      {c.dial}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
