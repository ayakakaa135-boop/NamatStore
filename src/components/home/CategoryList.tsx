import { CATEGORIES } from '../../lib/constants';
import { motion } from 'motion/react';

export default function CategoryList() {
  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">تسوق حسب القسم</h2>
          <a href="#" className="text-primary font-medium hover:underline">عرض الكل</a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {CATEGORIES.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-all">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              </div>
              <h3 className="text-center font-semibold group-hover:text-primary transition-colors">
                {category.name}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
