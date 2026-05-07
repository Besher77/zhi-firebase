import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export default function WhyChooseUs() {
  const { t } = useTranslation();

  const reasons = [
    { img: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=300&auto=format&fit=crop" },
    { img: "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=300&auto=format&fit=crop" },
    { img: "https://images.unsplash.com/photo-1610889556528-9a770e32642f?q=80&w=300&auto=format&fit=crop" },
    { img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop" }
  ];

  const items = t('why.items', { returnObjects: true }) as { title: string; desc: string }[];

  return (
    <section className="py-24 bg-white relative">
      {/* Torn Edge Bottom */}
      <div className="absolute bottom-0 start-0 w-full translate-y-[98%] z-20 pointer-events-none rotate-180">
         <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-20 text-white rtl:scale-x-[-1]" preserveAspectRatio="none">
            <path d="M0,80 C120,60 240,80 360,60 C480,40 600,70 720,50 C840,30 960,60 1080,40 C1200,20 1320,50 1440,30 L1440,80 L0,80 Z" fill="currentColor"></path>
         </svg>
      </div>

      <div className="container mx-auto px-4 text-center border-t border-border-light pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <span className="text-sm font-sans tracking-widest text-coffee-muted uppercase mb-4 block">{t('benefits.process')}</span>
          <h2 className="text-4xl font-serif text-coffee-dark mb-6">{t('why.title')}</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="group cursor-pointer"
            >
              <div className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-[6px] border-coffee-light group-hover:border-brand/50 transition-colors duration-300">
                <img src={item.img} alt={items[i]?.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
              </div>
              <h3 className="text-lg font-serif text-coffee-dark font-semibold mb-3 group-hover:text-brand transition-colors">{items[i]?.title}</h3>
              <p className="text-sm text-coffee-muted leading-relaxed px-4">{items[i]?.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
