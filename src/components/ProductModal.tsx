import { motion, AnimatePresence } from 'motion/react';
import { Star, ShoppingBag, X, ChevronLeft, ChevronRight, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
  productId: string;
}

interface Product {
  id: number | string;
  name: string;
  price: string | number;
  oldPrice?: string | number;
  discount?: string;
  image: string;
  images?: string[];
  desc?: string;
  features?: string[];
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export default function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const { addToCart } = useCart();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const imagesList = product.images && product.images.length > 0 ? product.images : [product.image];

  useEffect(() => {
    if (isOpen) {
      fetchReviews();
      setCurrentImageIndex(0);
      setIsImageLoading(true);
    }
  }, [isOpen, product.id]);

  useEffect(() => {
    setIsImageLoading(true);
  }, [currentImageIndex]);

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const q = query(collection(db, 'reviews'), where('productId', '==', product.id.toString()));
      const snap = await getDocs(q);
      const list: Review[] = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Review));
      setReviews(list.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()));
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

  const handleAddToCart = () => {
    addToCart({
      id: product.id.toString(),
      name: product.name,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      image: product.image
    }, 1);
    onClose();
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % imagesList.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row max-h-[90vh]"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            <button
              onClick={onClose}
              className="absolute top-4 end-4 w-10 h-10 bg-white/90 backdrop-blur-sm text-coffee-dark rounded-full flex items-center justify-center hover:bg-white hover:shadow-lg transition-all z-20 shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Section */}
            <div className="w-full md:w-1/2 bg-gradient-to-br from-coffee-light to-white flex flex-col min-h-[350px] md:min-h-0">
              {/* Main Image */}
              <div className="flex-1 p-6 md:p-10 flex items-center justify-center relative">
                {imagesList.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute start-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:scale-105 text-coffee-dark z-10 transition-all"
                    >
                      <ChevronLeft className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute end-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:scale-105 text-coffee-dark z-10 transition-all"
                    >
                      <ChevronRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
                    </button>
                  </>
                )}
                
                {isImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 border-3 border-coffee-dark/20 border-t-coffee-dark rounded-full animate-spin" />
                  </div>
                )}
                
                <motion.img 
                  key={currentImageIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  src={imagesList[currentImageIndex]} 
                  alt={product.name} 
                  onLoad={() => setIsImageLoading(false)}
                  className="w-full max-h-[380px] object-contain mix-blend-multiply"
                  referrerPolicy="no-referrer" 
                />

                {/* Discount Badge */}
                {product.discount && (
                  <div className="absolute top-6 start-6 bg-[#ccff00] text-coffee-dark text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                    {product.discount}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {imagesList.length > 1 && (
                <div className="px-6 pb-6 flex justify-center gap-2">
                  {imagesList.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === currentImageIndex ? 'border-coffee-dark shadow-md' : 'border-transparent hover:border-coffee-dark/30'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto bg-white">
              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Number(avgRating) ? 'fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm font-medium text-coffee-muted">
                  {reviews.length > 0 ? `${avgRating} ` : ''}({reviews.length} {isAr ? 'تقييم' : 'reviews'})
                </span>
              </div>

              {/* Title */}
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-coffee-dark mb-4 leading-tight">{product.name}</h2>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-sans text-3xl font-bold text-coffee-dark">{product.price} {isAr ? 'رس' : 'SAR'}</span>
                {product.oldPrice && (
                  <span className="font-sans text-lg text-coffee-muted/70 line-through">{product.oldPrice} {isAr ? 'رس' : 'SAR'}</span>
                )}
                {product.oldPrice && (
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {Math.round(((Number(product.oldPrice) - Number(product.price)) / Number(product.oldPrice)) * 100)}% {isAr ? 'خصم' : 'OFF'}
                  </span>
                )}
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-3 mb-6 text-xs text-coffee-muted">
                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-2 rounded-full">
                  <Truck className="w-3.5 h-3.5" />
                  <span>{isAr ? 'شحن سريع' : 'Fast Shipping'}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-2 rounded-full">
                  <Shield className="w-3.5 h-3.5" />
                  <span>{isAr ? 'جودة مضمونة' : 'Quality Guaranteed'}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-2 rounded-full">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إرجاع خلال 14 يوم' : '14-Day Returns'}</span>
                </div>
              </div>

              {/* Description */}
              <div className="text-coffee-muted text-sm leading-relaxed mb-6">
                {product.desc ? (
                  <p className="line-clamp-3">{product.desc}</p>
                ) : (
                  <p className="italic text-coffee-muted/60">{isAr ? 'لا يوجد وصف متاح لهذا المنتج.' : 'No description available for this product.'}</p>
                )}
              </div>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-coffee-dark mb-3">{isAr ? 'المميزات:' : 'Features:'}</h4>
                  <ul className="space-y-2">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-coffee-muted">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reviews Section */}
              <div className="mt-auto pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-coffee-dark flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    {isAr ? 'تقييمات العملاء' : 'Customer Reviews'}
                  </h4>
                  {reviews.length > 0 && (
                    <span className="text-xs text-coffee-muted">{isAr ? 'الأحدث' : 'Most Recent'}</span>
                  )}
                </div>

                {reviewsLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="w-6 h-6 border-2 border-coffee-dark/20 border-t-coffee-dark rounded-full animate-spin" />
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="bg-gray-50/50 p-5 rounded-2xl text-center">
                    <Star className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-coffee-muted">{isAr ? 'لا توجد تقييمات بعد. كن أول من يقيم!' : 'No reviews yet. Be the first to review!'}</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[180px] overflow-y-auto pe-2">
                    {reviews.slice(0, 3).map(rev => (
                      <div key={rev.id} className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand/20 to-brand/40 flex items-center justify-center text-xs font-bold text-coffee-dark">
                              {rev.userName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-coffee-dark text-sm">{rev.userName}</span>
                          </div>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, j) => <Star key={j} className={`w-3 h-3 ${j < rev.rating ? 'fill-current' : 'text-gray-300'}`} />)}
                          </div>
                        </div>
                        <p className="text-sm text-coffee-muted leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                    {reviews.length > 3 && (
                      <button className="text-sm text-brand font-medium hover:underline w-full text-center py-2">
                        {isAr ? `عرض جميع ${reviews.length} التقييمات` : `View all ${reviews.length} reviews`}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-4 bg-coffee-dark text-white rounded-2xl hover:bg-brand hover:shadow-lg hover:shadow-brand/25 transition-all flex items-center justify-center font-bold text-sm shadow-md active:scale-[0.98]"
                >
                  <ShoppingBag className="w-5 h-5 me-2" />
                  {isAr ? 'أضف للسلة' : 'Add to Cart'}
                </button>
                <button 
                  className="w-14 h-14 rounded-2xl border-2 border-gray-200 flex items-center justify-center text-coffee-muted hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-[0.98]"
                >
                  <Heart className="w-5 h-5" />
                </button>
                <button 
                  className="w-14 h-14 rounded-2xl border-2 border-gray-200 flex items-center justify-center text-coffee-muted hover:border-coffee-dark hover:text-coffee-dark hover:bg-gray-50 transition-all active:scale-[0.98]"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
