import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

export default function TextPage({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();

  return (
    <section className="bg-coffee-light pt-48 pb-32 min-h-[70vh] flex items-center justify-center relative">
      {/* Torn Edge Bottom */}
      <div className="absolute bottom-0 start-0 w-full translate-y-[98%] z-20 pointer-events-none rotate-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-20 text-coffee-light rtl:scale-x-[-1]" preserveAspectRatio="none">
          <path d="M0,80 C120,60 240,80 360,60 C480,40 600,70 720,50 C840,30 960,60 1080,40 C1200,20 1320,50 1440,30 L1440,80 L0,80 Z" fill="currentColor"></path>
        </svg>
      </div>

      <div className="container mx-auto px-4 max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-24 h-1 bg-brand mx-auto mb-8"></div>
          <h1 className="text-4xl md:text-5xl font-serif text-coffee-dark mb-10">{t(titleKey)}</h1>

          <div className="text-coffee-muted font-serif text-lg leading-relaxed text-justify space-y-6">
            <p>{t('pages.content')}</p>
            <p>{t('pages.content')}</p>
            <p>{t('pages.content')}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
