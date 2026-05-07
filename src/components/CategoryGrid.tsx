import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface Category {
  id: string;
  titleEn: string;
  titleAr: string;
  image: string;
  isActive: boolean;
}

export default function CategoryGrid() {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const cats: Category[] = [];
        querySnapshot.forEach((doc) => {
          cats.push({ id: doc.id, ...doc.data() } as Category);
        });
        
        // Only show active categories
        setCategories(cats.filter(c => c.isActive));
      } catch (error) {
        console.error("Error fetching categories: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="w-full bg-coffee-light pb-24 flex justify-center items-center h-[500px]">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  // Fallback to static if no data in DB yet
  const fallbackCategories = [
    { titleEn: t('categories.c1'), titleAr: t('categories.c1'), image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=1000&auto=format&fit=crop" },
    { titleEn: t('categories.c2'), titleAr: t('categories.c2'), image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=1000&auto=format&fit=crop" },
    { titleEn: t('categories.c3'), titleAr: t('categories.c3'), image: "https://images.unsplash.com/photo-1610889556528-9a770e32642f?q=80&w=1000&auto=format&fit=crop" }
  ];

  const displayCats = categories.length > 0 ? categories : fallbackCategories;

  return (
    <section className="w-full bg-coffee-light pb-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row min-h-[900px] md:min-h-[500px]">
          {displayCats.map((cat, index) => {
            const title = i18n.language === 'ar' ? cat.titleAr : cat.titleEn;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative flex-1 hover:flex-[1.3] md:hover:flex-[1.8] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] h-[300px] md:h-auto overflow-hidden group cursor-pointer"
              >
                <img 
                  src={cat.image} 
                  alt={title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 start-0 w-full p-8 text-center text-white">
                  <h3 className="text-xl md:text-2xl font-serif tracking-wide px-2">{title}</h3>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
