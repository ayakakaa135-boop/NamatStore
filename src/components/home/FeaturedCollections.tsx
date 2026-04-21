import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FeaturedCollections: React.FC = () => {
  const { t } = useTranslation();

  const collections = [
    { id: 'earthy-abayas', key: 'ramadan' as const, image: '/image/abaya-brown-1.jpeg', link: '/shop?category=abaya', size: 'large' as const },
    {
      id: 'soft-hijabs',
      key: 'modern' as const,
      image: '/image/cashmere-hijab.webp',
      link: '/shop?category=accessories',
      size: 'small' as const,
    },
    {
      id: 'occasion-pieces',
      key: 'women' as const,
      image: '/image/yasu-shots-_y6hMz1pJC0-unsplash.webp',
      link: '/shop?category=women',
      size: 'small' as const,
    },
    {
      id: 'family-looks',
      key: 'men' as const,
      image: '/image/kids-thobe-formal.webp',
      link: '/shop?category=kids',
      size: 'small' as const,
    },
  ];

  return (
    <section className="py-20 bg-background pattern-bg overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 space-y-3 md:space-y-0 text-start">
          <div className="md:w-1/2">
            <span className="text-primary font-medium tracking-wider mb-2 block">{t('collections.label')}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {t('collections.title')} <span className="text-gold">{t('collections.titleSpan')}</span>
            </h2>
          </div>
          <Link
            to="/shop"
            className="group flex items-center gap-2 text-foreground font-medium hover:text-primary transition-colors duration-300"
          >
            <span>{t('collections.viewAll')}</span>
            <ArrowLeft className="w-5 h-5 rtl:group-hover:-translate-x-1 ltr:rotate-180 ltr:group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col) => (
            <div
              key={col.id}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer hover-lift shadow-sm ${
                col.size === 'large' ? 'md:col-span-2 lg:col-span-2 aspect-[16/10] md:aspect-auto' : 'aspect-square md:aspect-auto h-[400px]'
              }`}
            >
              <img
                src={col.image}
                alt={t(`collections.${col.key}.title`)}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/20 to-transparent group-hover:from-secondary transition-all duration-500" />

              <div className="absolute inset-0 p-8 flex flex-col justify-end text-start">
                <span className="text-white/70 text-sm font-medium mb-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  {t(`collections.${col.key}.subtitle`)}
                </span>
                <h3 className={`text-white font-bold mb-4 ${col.size === 'large' ? 'text-3xl md:text-5xl' : 'text-2xl'}`}>
                  {t(`collections.${col.key}.title`)}
                </h3>
                <Link
                  to={col.link}
                  className="w-fit ms-0 me-auto bg-primary hover:bg-white text-secondary hover:text-primary px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all duration-300 transform group-hover:translate-y-0 translate-y-8 opacity-0 group-hover:opacity-100"
                >
                  <span>{t(`collections.${col.key}.cta`)}</span>
                  <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
