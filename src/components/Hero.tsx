import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Banner {
  id: string;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  btnTextEn: string;
  btnTextAr: string;
  btnLink: string;
  image: string;
  enabled: boolean;
  order: number;
}

const FALLBACK_BANNERS: Banner[] = [
  {
    id: 'f1',
    titleEn: 'Start Your Day',
    titleAr: 'ابدأ يومك',
    subtitleEn: 'New Collection',
    subtitleAr: 'تشكيلة جديدة',
    btnTextEn: 'Explore Now',
    btnTextAr: 'استكشف الآن',
    btnLink: '/',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1920&auto=format&fit=crop',
    enabled: true,
    order: 0,
  },
  {
    id: 'f2',
    titleEn: 'With a Black Coffee',
    titleAr: 'بقهوة سوداء',
    subtitleEn: 'Premium Roasts',
    subtitleAr: 'تحميص مميز',
    btnTextEn: 'Shop Now',
    btnTextAr: 'تسوق الآن',
    btnLink: '/',
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1920&auto=format&fit=crop',
    enabled: true,
    order: 1,
  },
  {
    id: 'f3',
    titleEn: 'Crafted With Passion',
    titleAr: 'بُنيت بشغف',
    subtitleEn: 'Organic & Sustainable',
    subtitleAr: 'عضوي ومستدام',
    btnTextEn: 'Learn More',
    btnTextAr: 'اعرف المزيد',
    btnLink: '/',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1920&auto=format&fit=crop',
    enabled: true,
    order: 2,
  },
];

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 80 : -80 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -80 : 80 }),
};

export default function Hero() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [banners, setBanners] = useState<Banner[]>([]);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'banners'), orderBy('order', 'asc')));
        const data: Banner[] = [];
        snap.forEach(d => data.push({ id: d.id, ...d.data() } as Banner));
        const enabled = data.filter(b => b.enabled);
        setBanners(enabled.length > 0 ? enabled : FALLBACK_BANNERS);
      } catch {
        setBanners(FALLBACK_BANNERS);
      }
    };
    fetch();
  }, []);

  const count = banners.length;

  const go = useCallback((dir: number) => {
    setDirection(dir);
    setIndex(i => (i + dir + count) % count);
  }, [count]);

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => go(1), 6000);
    return () => clearInterval(id);
  }, [count, go]);

  const banner = banners[index];
  if (!banner) return null;

  const title = isAr ? banner.titleAr : banner.titleEn;
  const subtitle = isAr ? banner.subtitleAr : banner.subtitleEn;
  const btnText = isAr ? banner.btnTextAr : banner.btnTextEn;

  return (
    <section className="relative w-full min-h-[90vh] flex items-center overflow-hidden">

      {/* Background images */}
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.img
          key={banner.id + '-img'}
          src={banner.image}
          alt={title}
          custom={direction}
          variants={{
            enter: { opacity: 0, scale: 1.06 },
            center: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 1 },
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 1.4, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />
      </AnimatePresence>

      {/* Overlays */}
      <div className="absolute inset-0 bg-black/50 z-[1]" />
      <div className="absolute inset-0 bg-coffee-dark/40 mix-blend-multiply z-[1]" />

      {/* Content */}
      <div className="container mx-auto px-8 relative z-10 pt-24 pb-12">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={banner.id + '-text'}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-white space-y-6 max-w-3xl"
          >
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-sm font-sans tracking-[0.2em] text-white/70 uppercase block"
            >
              {subtitle}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-5xl md:text-7xl lg:text-8xl font-serif leading-[1.1]"
            >
              <span className="italic text-white font-serif">{title}</span>
            </motion.h1>

            {btnText && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="pt-6"
              >
                {banner.btnLink ? (
                  <Link
                    to={banner.btnLink}
                    className="inline-block px-8 py-3 rounded-full border border-white hover:bg-white hover:text-coffee-dark transition-all duration-300 font-sans text-sm tracking-wider uppercase font-bold"
                  >
                    {btnText}
                  </Link>
                ) : (
                  <span className="inline-block px-8 py-3 rounded-full border border-white font-sans text-sm tracking-wider uppercase font-bold">
                    {btnText}
                  </span>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Arrows */}
      {count > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            className="absolute start-4 md:start-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => go(1)}
            className="absolute end-4 md:end-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {count > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
              className={`rounded-full transition-all duration-300 ${i === index ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>
      )}

      {/* Animated Bottom Curve */}
      <div className="absolute bottom-0 start-0 w-full z-20 pointer-events-none translate-y-[2px]" dir="ltr">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-12 md:h-24 text-coffee-light shrink-0" preserveAspectRatio="none">
          <path d="M0,40 C400,120 1000,-40 1440,60 L1440,120 L0,120 Z" fill="currentColor">
            <animate attributeName="d" dur="10s" repeatCount="indefinite"
              values="M0,40 C400,120 1000,-40 1440,60 L1440,120 L0,120 Z;
                      M0,60 C400,-40 1000,120 1440,40 L1440,120 L0,120 Z;
                      M0,40 C400,120 1000,-40 1440,60 L1440,120 L0,120 Z"
            />
          </path>
        </svg>
      </div>
    </section>
  );
}
