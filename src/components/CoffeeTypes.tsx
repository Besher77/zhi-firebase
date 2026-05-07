import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export default function CoffeeTypes() {
  const { t } = useTranslation();

  return (
    <section className="bg-coffee-light overflow-hidden">
      <div className="w-full relative flex flex-col md:grid md:grid-cols-2">

        {/* Center Connecting Element */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-48 h-48 lg:w-60 lg:h-60 items-center justify-center pointer-events-none transform-gpu will-change-transform">
          {/* Dashed outer ring */}
          <div className="absolute inset-0 rounded-full border-[2px] border-dashed border-brand/60 scale-[1.12]"></div>
          {/* Solid inner background */}
          <div className="absolute inset-0 rounded-full bg-[#EADDCD] shadow-[0_10px_40px_rgba(0,0,0,0.3)]"></div>
          {/* Core circular image representing the connection */}
          <img
            src="https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=500&auto=format&fit=crop"
            alt="Coffee Beans Connector"
            className="w-[90%] h-[90%] object-cover rounded-full relative z-10"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Arabica Image (Top Left) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative h-[400px] md:h-auto md:min-h-[600px] order-1 md:order-1"
        >
          <img src="https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=1000&auto=format&fit=crop" alt="Arabica Coffee" className="absolute inset-0 w-full h-full object-cover rounded-none" referrerPolicy="no-referrer" />
        </motion.div>

        {/* Arabica Text (Top Right) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-white p-10 md:p-14 lg:p-20 flex flex-col justify-center order-2 md:order-2"
        >
          <h2 className="text-4xl lg:text-5xl font-serif text-coffee-dark mb-6">{t('coffeeTypes.arabica')}</h2>
          <p className="text-coffee-muted leading-relaxed mb-10 text-justify">
            {t('coffeeTypes.arabicaDesc')}
          </p>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-y-8 gap-x-4 text-center border-t border-border-light pt-8">
            <div>
              <div className="text-brand mb-2 mx-auto flex justify-center"><CoffeeBeanIcon /></div>
              <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-coffee-dark mb-1">{t('coffeeTypes.altitude')}</h4>
              <p className="text-sm font-serif text-coffee-muted">800 - 2000 M</p>
            </div>
            <div>
              <div className="text-brand mb-2 mx-auto flex justify-center"><ThermometerIcon /></div>
              <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-coffee-dark mb-1">{t('coffeeTypes.temp')}</h4>
              <p className="text-sm font-serif text-coffee-muted">16 - 24°C</p>
            </div>
            <div>
              <div className="text-brand mb-2 mx-auto flex justify-center"><ChemistryIcon /></div>
              <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-coffee-dark mb-1">{t('coffeeTypes.caffeine')}</h4>
              <p className="text-sm font-serif text-coffee-muted">1.1 - 1.7%</p>
            </div>
            <div>
              <div className="text-brand mb-2 mx-auto flex justify-center"><GlobeIcon /></div>
              <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-coffee-dark mb-1">{t('coffeeTypes.production')}</h4>
              <p className="text-sm font-serif text-coffee-muted">60%</p>
            </div>
          </div>
        </motion.div>

        {/* Robusta Text (Bottom Left) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-coffee-light p-10 md:p-14 lg:p-20 flex flex-col justify-center order-4 md:order-3 pt-16 md:pt-14"
        >
          <h2 className="text-4xl lg:text-5xl font-serif text-coffee-dark mb-6">{t('coffeeTypes.robusta')}</h2>
          <p className="text-coffee-muted leading-relaxed mb-10 text-justify">
            {t('coffeeTypes.robustaDesc')}
          </p>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-y-8 gap-x-4 text-center border-t border-border-light pt-8">
            <div>
              <div className="text-brand mb-2 mx-auto flex justify-center"><CoffeeBeanIcon /></div>
              <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-coffee-dark mb-1">{t('coffeeTypes.altitude')}</h4>
              <p className="text-sm font-serif text-coffee-muted">- 800 M</p>
            </div>
            <div>
              <div className="text-brand mb-2 mx-auto flex justify-center"><ThermometerIcon /></div>
              <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-coffee-dark mb-1">{t('coffeeTypes.temp')}</h4>
              <p className="text-sm font-serif text-coffee-muted">22 - 30°C</p>
            </div>
            <div>
              <div className="text-brand mb-2 mx-auto flex justify-center"><ChemistryIcon /></div>
              <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-coffee-dark mb-1">{t('coffeeTypes.caffeine')}</h4>
              <p className="text-sm font-serif text-coffee-muted">2 - 4.5%</p>
            </div>
            <div>
              <div className="text-brand mb-2 mx-auto flex justify-center"><GlobeIcon /></div>
              <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-coffee-dark mb-1">{t('coffeeTypes.production')}</h4>
              <p className="text-sm font-serif text-coffee-muted">30%</p>
            </div>
          </div>
        </motion.div>

        {/* Robusta Image (Bottom Right) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative h-[400px] md:h-auto md:min-h-[600px] order-3 md:order-4"
        >
          <img src="https://images.unsplash.com/photo-1587734195503-904fca47e0e9?q=80&w=1000&auto=format&fit=crop" alt="Robusta Coffee" className="absolute inset-0 w-full h-full object-cover rounded-none" referrerPolicy="no-referrer" />
        </motion.div>

      </div>
    </section>
  );
}

// Simple Mock SVGs for the icons
function CoffeeBeanIcon() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8 2 4 6 4 12c0 6 4 10 8 10s8-4 8-10c0-6-4-10-8-10z" /><path d="M12 2c0 0-4 4-2 10 2 6 2 10 2 10" /></svg>; }
function ThermometerIcon() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" /></svg>; }
function ChemistryIcon() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" /><path d="M8.5 2h7" /></svg>; }
function GlobeIcon() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><path d="M2 12h20" /></svg>; }
