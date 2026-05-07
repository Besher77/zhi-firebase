import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import ProductCard from '../components/ProductCard';
import { useProducts, ProductFrontend } from '../data/products';
import { Coffee, Loader2, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Favorites() {
  const { user, loading: authLoading } = useAuth();
  const { products, loading: productsLoading } = useProducts();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  
  const [favoriteProducts, setFavoriteProducts] = useState<ProductFrontend[]>([]);
  const [loadingFavs, setLoadingFavs] = useState(true);

  useEffect(() => {
    const fetchFavoriteIds = async () => {
      if (!user) {
        setFavoriteProducts([]);
        setLoadingFavs(false);
        return;
      }

      try {
        const favsRef = collection(db, 'users', user.uid, 'favorites');
        const snap = await getDocs(favsRef);
        const ids = snap.docs.map(doc => doc.data().productId.toString());
        
        // Match with products
        const favProds = products.filter(p => ids.includes(p.id.toString()));
        setFavoriteProducts(favProds);
      } catch (error) {
        console.error("Error fetching favorites", error);
      } finally {
        setLoadingFavs(false);
      }
    };

    if (!authLoading && !productsLoading) {
      fetchFavoriteIds();
    }
  }, [user, authLoading, products, productsLoading]);

  if (authLoading || productsLoading || loadingFavs) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-coffee-light pt-24 pb-12">
        <Loader2 className="w-10 h-10 animate-spin text-brand" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-coffee-light pt-32 pb-20 px-4 text-center">
        <Coffee className="w-16 h-16 text-coffee-muted mb-4 opacity-50" />
        <h2 className="text-2xl font-bold font-serif text-coffee-dark mb-4">
          {isAr ? 'عليك تسجيل الدخول لرؤية المفضلة' : 'Please Sign In to view your Favorites'}
        </h2>
        <Link to="/" className="px-6 py-3 bg-brand text-white font-bold rounded-lg hover:bg-brand/90 transition-colors uppercase tracking-widest text-sm">
          {isAr ? 'العودة للرئيسية' : 'Return Home'}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-coffee-light min-h-screen pt-32 pb-20 px-4 sm:px-8" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="container mx-auto max-w-[1400px]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 border-b border-border-light pb-6"
        >
          <h1 className="text-4xl md:text-5xl font-serif text-coffee-dark mb-4">{isAr ? 'المفضلة' : 'My Favorites'}</h1>
          <div className="w-16 h-0.5 bg-brand"></div>
        </motion.div>

        {favoriteProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {favoriteProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="w-16 h-16 text-coffee-muted mb-4 opacity-50" />
            <p className="text-xl font-medium text-coffee-dark mb-6">
              {isAr ? 'لا توجد منتجات في المفضلة الخاصة بك' : 'You have no favorite products yet.'}
            </p>
            <Link to="/" className="px-8 py-3 bg-coffee-dark text-white rounded-lg hover:bg-brand transition-colors uppercase font-bold tracking-widest text-sm">
              {isAr ? 'تصفح المنتجات' : 'Browse Products'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
