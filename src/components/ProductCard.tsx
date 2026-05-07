import { motion, AnimatePresence } from 'motion/react';
import { Star, ShoppingBag, Zap, Check, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ProductModal from './ProductModal';

export interface ProductCardProps {
  key?: React.Key;
  product: {
    id: number | string;
    name: string;
    price: string | number;
    oldPrice?: string | number;
    discount?: string;
    image: string;
    images?: string[];
    desc?: string;
    features?: string[];
  };
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const { addToCart } = useCart();
  const { user, openModal: openAuthModal } = useAuth();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [addedItem, setAddedItem] = useState<boolean>(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);

  // Reviews State
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    const checkWishlist = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid, 'favorites', product.id.toString());
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setIsWishlisted(true);
          } else {
            setIsWishlisted(false);
          }
        } catch (error) {
          console.error("Error checking wishlist: ", error);
        }
      } else {
        setIsWishlisted(false);
      }
    };
    checkWishlist();
  }, [user, product.id]);

  useEffect(() => {
    fetchReviews();
  }, [product.id]);

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const q = query(collection(db, 'reviews'), where('productId', '==', product.id.toString()));
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setReviews(list.sort((a, b) => b.createdAt - a.createdAt)); // fallback sort
    } catch (err) {
      console.error("Error fetching reviews", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const avgRating = calculateAverageRating();

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addToCart({
      id: product.id.toString(),
      name: product.name,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      image: product.image
    }, 1);

    setAddedItem(true);
    setTimeout(() => setAddedItem(false), 2000);
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal('signIn');
      return;
    }

    const newStatus = !isWishlisted;
    setIsWishlisted(newStatus); // Optimistic UI update

    try {
      const docRef = doc(db, 'users', user.uid, 'favorites', product.id.toString());
      if (newStatus) {
        await setDoc(docRef, { productId: product.id, addedAt: new Date().toISOString() });
      } else {
        await deleteDoc(docRef);
      }
    } catch (error) {
      console.error("Error updating wishlist: ", error);
      setIsWishlisted(!newStatus); // Revert on failure
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        className="group flex flex-col bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300 relative"
      >
        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-4 start-4 bg-[#ccff00] text-coffee-dark text-[10px] font-bold px-2.5 py-1 flex items-center rounded-full z-10">
            <Zap className="w-3 h-3 me-1 fill-current rtl:scale-x-[-1]" /> {product.discount}
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={toggleWishlist}
          className={`absolute top-4 end-4 z-10 transition-colors ${isWishlisted ? 'text-red-500' : 'text-gray-300 hover:text-red-400'
            }`}
        >
          <Heart className="w-5 h-5 fill-current" />
        </button>

        {/* Product Image area */}
        <div
          onClick={() => setModalOpen(true)}
          className="relative h-56 mb-4 mt-8 flex justify-center items-center cursor-pointer overflow-hidden"
        >
          <AnimatePresence>
            {addedItem && (
              <motion.div
                className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 rounded-xl flex flex-col items-center justify-center text-brand font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-brand text-white p-3 rounded-full mb-2 shadow-lg"
                >
                  <Check className="w-6 h-6" />
                </motion.div>
                <span className="text-sm font-sans tracking-wide uppercase">{isAr ? 'تمت الإضافة' : 'Added'}</span>
              </motion.div>
            )}
          </AnimatePresence>
          <img
            src={product.image}
            alt={product.name}
            className="h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col flex-1 mt-auto">
          {/* Stars */}
          <div className="flex text-yellow-400 mb-3 items-center">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-coffee-muted text-xs ms-1.5 font-bold mt-0.5">
              {reviews.length > 0 ? `${avgRating} (${reviews.length})` : (isAr ? 'بدون تقييم' : 'No reviews')}
            </span>
          </div>

          {/* Title */}
          <h3
            className="font-serif text-[17px] font-bold text-coffee-dark mb-4 cursor-pointer hover:text-brand transition-colors"
            onClick={() => setModalOpen(true)}
          >
            {product.name}
          </h3>

          {/* Footer Row: Price & Cart */}
          <div className="flex justify-between items-center mt-auto">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="font-sans font-bold text-sm text-coffee-dark">{product.price} {isAr ? 'رس' : 'SAR'}</span>
              {product.oldPrice && (
                <span className="relative font-sans text-xs text-gray-400">
                  {product.oldPrice} {isAr ? 'رس' : 'SAR'}
                  <span className="absolute top-1/2 start-0 w-full h-[1.5px] bg-red-400/80 -translate-y-1/2"></span>
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={addedItem}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-coffee-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        product={product} 
      />
    </>
  );
}

