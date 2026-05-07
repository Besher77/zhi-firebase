import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';

interface Review {
  id: string;
  userName: string;
  comment: string;
  userImage: string;
  rating?: number;
}

export default function Testimonials() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Fallback data if DB is empty
  const defaultReviews: Review[] = [
    {
      id: '1',
      userName: t('testimonials.user'),
      comment: t('testimonials.quote'),
      userImage: "https://randomuser.me/api/portraits/women/68.jpg",
      rating: 5
    },
    {
      id: '2',
      userName: isAr ? "أحمد - الرياض" : "Ahmed - Riyadh",
      comment: isAr ? "أفضل قهوة تذوقتها على الإطلاق! التوصيل كان سريعاً والمنتج رائع." : "Best coffee I've ever tasted! Delivery was fast and the product is great.",
      userImage: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 5
    },
    {
      id: '3',
      userName: isAr ? "سارة - جدة" : "Sarah - Jeddah",
      comment: isAr ? "نكهة فريدة وجودة عالية. أصبحت مدمنة على قهوة ZHI." : "Unique flavor and high quality. I'm addicted to ZHI coffee.",
      userImage: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 4
    }
  ];

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(
          collection(db, 'reviews'), 
          where('rating', '>=', 4),
          limit(10)
        );
        const snap = await getDocs(q);
        const fetched = snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            userName: data.userName || 'Customer',
            comment: data.comment || '',
            userImage: data.userImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.userName || 'C')}&background=EADDCD&color=3A2D23`,
            rating: data.rating
          };
        });
        
        // Filter out empty comments
        const validReviews = fetched.filter(r => r.comment.trim().length > 0);

        if (validReviews.length > 0) {
          setReviews(validReviews);
        } else {
          setReviews(defaultReviews);
        }
      } catch (err) {
        console.error("Error fetching reviews", err);
        setReviews(defaultReviews);
      }
    };
    fetchReviews();
  }, [i18n.language]);

  const displayReviews = reviews.length > 0 ? reviews : defaultReviews;
  const currentReview = displayReviews[activeIndex];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % displayReviews.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + displayReviews.length) % displayReviews.length);
  };

  // Helper to get 5 surrounding avatars
  const getVisibleAvatars = () => {
    const avatars = [];
    const n = displayReviews.length;
    for (let i = -2; i <= 2; i++) {
      const idx = (activeIndex + i + n * 2) % n;
      avatars.push({ ...displayReviews[idx], isCenter: i === 0, originalIndex: idx });
    }
    return avatars;
  };

  if (displayReviews.length === 0) return null;

  return (
    <section className="py-24 bg-white text-center border-b border-border-light/50 overflow-hidden">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Quote Icon */}
        <div className="text-brand flex justify-center mb-6">
           <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="rtl:scale-x-[-1]"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
        </div>

        <span className="text-xs font-sans tracking-[0.2em] text-coffee-dark uppercase mb-8 block font-semibold">
          {t('testimonials.tag')}
        </span>

        {/* Rating Stars */}
        <div className="flex justify-center mb-6">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-5 h-5 ${i < (currentReview.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} 
            />
          ))}
        </div>

        <div className="min-h-[120px] mb-12 relative flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p 
              key={activeIndex}
              initial={{ opacity: 0, filter: "blur(4px)", scale: 0.95 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, filter: "blur(4px)", scale: 1.05 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-2xl md:text-3xl font-serif text-coffee-muted italic leading-relaxed absolute w-full px-4"
            >
              "{currentReview.comment}"
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Slider Controls & Avatars */}
        <div className="flex items-center justify-center space-x-4 md:space-x-6 rtl:space-x-reverse mb-8 mt-12">
           <button 
             onClick={handlePrev}
             className="w-10 h-10 shrink-0 rounded-full border border-border-light flex items-center justify-center text-coffee-muted hover:text-coffee-dark hover:bg-gray-50 hover:border-coffee-dark transition-all z-10"
           >
              <ChevronLeft className="w-5 h-5 rtl:hidden" />
              <ChevronRight className="w-5 h-5 hidden rtl:block" />
           </button>

           <motion.div layout className="flex space-x-2 md:space-x-4 rtl:space-x-reverse items-center justify-center min-w-[200px] md:min-w-[300px]">
             <AnimatePresence mode="popLayout">
               {getVisibleAvatars().map((item, i) => (
                  <motion.div 
                    layout
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ 
                      opacity: item.isCenter ? 1 : 0.4, 
                      scale: item.isCenter ? 1.15 : 0.9 
                    }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    onClick={() => setActiveIndex(item.originalIndex)}
                    className={`rounded-full overflow-hidden border-2 cursor-pointer shrink-0 ${
                      item.isCenter 
                        ? 'w-16 h-16 md:w-20 md:h-20 border-brand shadow-xl' 
                        : 'w-10 h-10 md:w-12 md:h-12 border-transparent hover:opacity-80'
                    }`}
                  >
                    <img src={item.userImage} alt={item.userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </motion.div>
               ))}
             </AnimatePresence>
           </motion.div>

           <button 
             onClick={handleNext}
             className="w-10 h-10 shrink-0 rounded-full border border-border-light flex items-center justify-center text-coffee-muted hover:text-coffee-dark hover:bg-gray-50 hover:border-coffee-dark transition-all z-10"
           >
              <ChevronRight className="w-5 h-5 rtl:hidden" />
              <ChevronLeft className="w-5 h-5 hidden rtl:block" />
           </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.p 
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-serif text-coffee-dark font-bold px-4"
          >
            {currentReview.userName}
          </motion.p>
        </AnimatePresence>

      </div>
    </section>
  );
}
