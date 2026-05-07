import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import ProductCard from './ProductCard';
import { useProducts } from '../data/products';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Loader2 } from 'lucide-react';

interface Category {
  id: string;
  titleEn: string;
  titleAr: string;
}

export default function BestSelling() {
  const { t, i18n } = useTranslation();
  const { products: allProducts, loading: productsLoading } = useProducts();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const cats: Category[] = [];
        querySnapshot.forEach((doc) => {
          cats.push({ id: doc.id, ...doc.data() } as Category);
        });
        setCategories(cats);
        if (cats.length > 0) {
          setActiveCategoryId(cats[0].id);
        }
      } catch (error) {
        console.error("Error fetching categories", error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const getTitle = (cat: Category) => {
    return i18n.language === 'ar' && cat.titleAr ? cat.titleAr : cat.titleEn;
  };

  const loading = productsLoading || categoriesLoading;

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-[1400px] flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-brand" />
        </div>
      </section>
    );
  }

  // Filter products by category or show first 5 if 'all' (fallback)
  const filteredProducts = activeCategoryId === 'all'
    ? allProducts.slice(0, 5)
    : allProducts.filter(p => p.categoryId === activeCategoryId).slice(0, 5);

  return (
    <section className="py-20 bg-coffee-light">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-border-light/50 pb-6 md:border-0 md:pb-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-serif text-coffee-dark mb-4 md:mb-2">{t('bestselling.title')}</h2>
            <div className="w-16 h-0.5 bg-brand"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap gap-4 md:gap-6 mt-6 md:mt-0 font-sans text-sm font-bold text-coffee-muted uppercase tracking-wider"
          >
            {categories.length === 0 ? (
              // Fallback tabs
              <>
                <button className="text-brand border-b-2 border-brand pb-1">{t('bestselling.t1')}</button>
                <button className="hover:text-coffee-dark transition-colors pb-1">{t('bestselling.t2')}</button>
                <button className="hover:text-coffee-dark transition-colors pb-1">{t('bestselling.t3')}</button>
              </>
            ) : (
              categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`pb-1 transition-colors ${activeCategoryId === cat.id
                    ? 'text-brand border-b-2 border-brand'
                    : 'hover:text-coffee-dark'
                    }`}
                >
                  {getTitle(cat)}
                </button>
              ))
            )}
          </motion.div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center py-20 text-coffee-muted font-sans font-medium">
            {i18n.language === 'ar' ? 'لا توجد منتجات في هذا القسم.' : 'No products found for this category.'}
          </div>
        )}
      </div>
    </section>
  );
}
