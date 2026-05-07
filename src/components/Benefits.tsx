import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Brain, Heart, Shield, Droplets, Zap, Dumbbell, Scale, Activity } from 'lucide-react';

export default function Benefits() {
  const { t } = useTranslation();

  const leftBenefits = [
    { icon: Brain, title: t('benefits.l1') },
    { icon: Heart, title: t('benefits.l2') },
    { icon: Shield, title: t('benefits.l3') },
    { icon: Droplets, title: t('benefits.l4') },
  ];

  const rightBenefits = [
    { icon: Dumbbell, title: t('benefits.r1') },
    { icon: Scale, title: t('benefits.r2') },
    { icon: Zap, title: t('benefits.r3') },
    { icon: Activity, title: t('benefits.r4') },
  ];

  return (
    <section className="relative w-full bg-coffee-light pt-20 pb-32">
      {/* Wave Edge Top Overlay (Static) */}
      <div className="absolute top-0 start-0 w-full -translate-y-[99%] z-20 pointer-events-none overflow-hidden" dir="ltr">
        <div className="flex w-[200%] md:w-full">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full md:w-full h-16 md:h-24 text-coffee-light shrink-0 md:shrink" preserveAspectRatio="none">
            <path d="M0,40 C400,120 1000,-40 1440,60 L1440,120 L0,120 Z" fill="currentColor"></path>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 text-center max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <span className="text-sm font-sans tracking-widest text-coffee-muted uppercase mb-4 block">{t('benefits.process')}</span>
          <h2 className="text-4xl md:text-5xl font-serif text-coffee-dark mb-6">{t('benefits.title')}</h2>
          <p className="text-coffee-muted max-w-2xl mx-auto italic font-serif leading-relaxed">
            {t('benefits.desc')}
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative">
          
          <div className="flex-1 space-y-10 text-end pe-4 md:pe-0">
            {leftBenefits.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex items-center justify-end group cursor-default"
              >
                <span className="font-serif text-coffee-dark group-hover:text-brand transition-colors text-sm md:text-base font-semibold md:font-normal">{item.title}</span>
                <motion.div 
                  animate={{ y: [-4, 4, -4] }}
                  transition={{ repeat: Infinity, duration: 3, delay: index * 0.2, ease: "easeInOut" }}
                  className="ms-6 w-12 h-12 rounded-full border border-border-light flex items-center justify-center text-brand shrink-0"
                >
                  <item.icon className="w-5 h-5 rtl:scale-x-[-1]" strokeWidth={1.5} />
                </motion.div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="flex-shrink-0 w-64 h-64 md:w-80 md:h-80 mx-4 z-10"
          >
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-full h-full relative"
            >
              <img 
                src="https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=1000&auto=format&fit=crop" 
                alt="Cup of fresh coffee" 
                className="w-full h-full object-cover rounded-full shadow-2xl border-4 border-white rtl:scale-x-[-1]"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>

          <div className="flex-1 space-y-10 text-start ps-4 md:ps-0">
            {rightBenefits.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex items-center group cursor-default"
              >
                <motion.div 
                  animate={{ y: [-4, 4, -4] }}
                  transition={{ repeat: Infinity, duration: 3, delay: index * 0.2 + 0.5, ease: "easeInOut" }}
                  className="me-6 w-12 h-12 rounded-full border border-border-light flex items-center justify-center text-brand shrink-0"
                >
                  <item.icon className="w-5 h-5 rtl:scale-x-[-1]" strokeWidth={1.5} />
                </motion.div>
                <span className="font-serif text-coffee-dark group-hover:text-brand transition-colors text-sm md:text-base font-semibold md:font-normal">{item.title}</span>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
