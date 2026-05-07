import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, addDoc, serverTimestamp, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Package, Clock, CheckCircle2, XCircle, ChevronDown, MapPin, Truck, Star, X, Loader2, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PrintableInvoice from '../components/PrintableInvoice';

const STATUS_FLOW = [
  { id: 'placed', ar: 'تم الأرسال', en: 'Placed' },
  { id: 'preparing', ar: 'قيد التجيهز', en: 'Preparing' },
  { id: 'ready', ar: 'تم التجهيز', en: 'Ready' },
  { id: 'shipping', ar: 'قيد الشحن', en: 'Shipping' },
  { id: 'shipped', ar: 'تم الشحن', en: 'Shipped' },
  { id: 'delivered', ar: 'تم التوصيل', en: 'Delivered' }
];

export default function Orders() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Review System States
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<any>(null);
  const [selectedProductToReview, setSelectedProductToReview] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Print Invoice State
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<any>(null);

  const handlePrint = (order: any) => {
    setSelectedOrderForPrint(order);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  useEffect(() => {
    if (user && !authLoading) fetchOrders();
  }, [user, authLoading]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      if (!user) return;
      const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach(doc => {
        const data = doc.data();
        // Hide abandoned (pending) or failed payments from the user's order history
        if (data.status === 'pending' || data.paymentStatus === 'failed') {
          return;
        }
        list.push({ id: doc.id, ...data });
      });
      // Sort in memory to avoid requiring a Firestore composite index
      list.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      setOrders(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;
  if (!user) return <Navigate to="/" replace />;

  const toggleExpand = (id: string) => {
    if (expandedId === id) setExpandedId(null);
    else setExpandedId(id);
  };

  const getStatusIndex = (currentStatus: string) => {
    return STATUS_FLOW.findIndex(s => s.id === currentStatus);
  };

  const openReviewModal = (order: any, product: any) => {
    setSelectedOrderForReview(order);
    setSelectedProductToReview(product);
    setRating(5);
    setComment('');
    setReviewModalOpen(true);
  };

  const submitReview = async () => {
    if (!user || !selectedProductToReview) return;
    setSubmittingReview(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        productId: selectedProductToReview.id,
        orderId: selectedOrderForReview.id,
        userId: user.uid,
        userName: user.name || 'Customer',
        rating,
        comment,
        createdAt: serverTimestamp()
      });

      // Mark this product as reviewed in the order document
      await updateDoc(doc(db, 'orders', selectedOrderForReview.id), {
        reviewedProducts: arrayUnion(selectedProductToReview.id)
      });

      // Update local state so UI reflects changes immediately
      setOrders(prev => prev.map(o => {
        if (o.id === selectedOrderForReview.id) {
          return {
            ...o,
            reviewedProducts: [...(o.reviewedProducts || []), selectedProductToReview.id]
          };
        }
        return o;
      }));

      setReviewModalOpen(false);
      alert(isAr ? 'تم إرسال تقييمك بنجاح! شكراً لك.' : 'Review submitted successfully! Thank you.');
    } catch (error) {
      console.error('Error submitting review', error);
      alert(isAr ? 'حدث خطأ.' : 'Error occurred.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-5xl py-20 min-h-[70vh] font-sans">
      <div className="mb-10 text-center md:text-start border-b border-border-light pb-6">
        <h1 className="text-4xl font-serif font-bold text-coffee-dark mb-2">
          {isAr ? 'طلباتي' : 'My Orders'}
        </h1>
        <p className="text-coffee-muted text-sm">
          {isAr ? 'تابع حالة طلباتك وتقييم منتجاتك المفضلة هنا.' : 'Track your order status and review your favorite products here.'}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-brand" /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-border-light shadow-sm">
          <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-coffee-dark mb-2">{isAr ? 'لا يوجد طلبات' : 'No Orders Found'}</h3>
          <p className="text-coffee-muted mb-6">{isAr ? 'لم تقم بإجراء أي طلبات حتى الآن.' : 'You haven\'t placed any orders yet.'}</p>
          <Link to="/" className="px-8 py-3 bg-brand text-white rounded-full font-bold text-sm tracking-wide hover:bg-brand/90 transition-colors">
            {isAr ? 'تصفح المتجر' : 'Browse Store'}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => {
            const isCancelled = order.status === 'cancelled';
            const currentIndex = getStatusIndex(order.status);
            const isExpanded = expandedId === order.id;

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden transition-all hover:border-brand/30">
                {/* Header (Always Visible) */}
                <div
                  className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between cursor-pointer bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(order.id)}
                >
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-coffee-dark font-sans tracking-wide">
                        {isAr ? 'طلب' : 'Order'} #{order.id.substring(0, 8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-coffee-muted mt-1 whitespace-nowrap">
                        {order.createdAt?.toDate().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center w-full md:w-auto justify-between md:justify-end gap-6 border-t md:border-t-0 border-border-light pt-4 md:pt-0">
                    <div className="text-start md:text-end">
                      <p className="text-sm text-coffee-muted">{isAr ? 'الإجمالي' : 'Total'}</p>
                      <p className="font-bold text-lg text-brand font-sans">{order.total} {isAr ? 'رس' : 'SAR'}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {isCancelled ? (
                        <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold whitespace-nowrap">
                          {isAr ? 'ملغي' : 'Cancelled'}
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold whitespace-nowrap">
                          {STATUS_FLOW[currentIndex > -1 ? currentIndex : 0]?.[isAr ? 'ar' : 'en']}
                        </span>
                      )}
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-0' : ''}`} />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden bg-white"
                    >
                      <div className="p-6 border-t border-border-light">

                        {/* Timeline */}
                        {!isCancelled && (
                          <div className="mb-10 px-2 mt-4 overflow-x-auto pb-4">
                            <div className="flex items-center min-w-[600px]">
                              {STATUS_FLOW.map((statusStep, i) => {
                                const isActive = i <= currentIndex;
                                const isCurrent = i === currentIndex;
                                return (
                                  <React.Fragment key={statusStep.id}>
                                    <div className="flex flex-col items-center relative z-10 w-24">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 shadow-sm ${isActive ? 'bg-brand text-white' : 'bg-gray-200 text-gray-400'}`}>
                                        {isActive ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                      </div>
                                      <p className={`text-xs font-bold mt-2 text-center text-balance ${isActive ? 'text-brand' : 'text-gray-400'} ${isCurrent ? 'scale-110' : ''}`}>
                                        {isAr ? statusStep.ar : statusStep.en}
                                      </p>
                                    </div>
                                    {i < STATUS_FLOW.length - 1 && (
                                      <div className={`flex-1 h-1 mx-[-10px] z-0 transition-colors duration-500 ${i < currentIndex ? 'bg-brand' : 'bg-gray-200'}`} />
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {isCancelled && (
                          <div className="bg-red-50 p-4 rounded-xl flex items-center mb-8 border border-red-100">
                            <XCircle className="w-6 h-6 text-red-500 me-3 shrink-0" />
                            <div>
                              <h4 className="font-bold text-red-700">{isAr ? 'تم إلغاء الطلب' : 'Order Cancelled'}</h4>
                              <p className="text-red-600 text-sm">{isAr ? 'تم إلغاء هذا الطلب ولم يتم استكماله.' : 'This order has been cancelled and will not be fulfilled.'}</p>
                            </div>
                          </div>
                        )}

                        {/* Order Layout Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {/* Products Info */}
                          <div className="md:col-span-2 space-y-4">
                            <h4 className="font-bold text-coffee-dark mb-4 border-b border-border-light pb-2">{isAr ? 'المنتجات' : 'Items'}</h4>
                            {order.items?.map((item: any, idx: number) => (
                              <div key={idx} className="flex gap-4 items-center bg-gray-50 p-3 rounded-xl border border-border-light/50">
                                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover mix-blend-multiply bg-white rounded-lg border border-border-light" />
                                <div className="flex-1">
                                  <h5 className="font-bold text-sm text-coffee-dark line-clamp-1">{item.name}</h5>
                                  <p className="text-xs text-coffee-muted mt-1">{item.price} {isAr ? 'رس' : 'SAR'} x {item.quantity}</p>
                                </div>

                                {order.status === 'delivered' && !order.reviewedProducts?.includes(item.id) && (
                                  <button
                                    onClick={() => openReviewModal(order, item)}
                                    className="px-3 py-1.5 text-xs font-bold text-brand border border-brand rounded-full hover:bg-brand hover:text-white transition-colors"
                                  >
                                    <Star className="w-3 h-3 inline me-1" />
                                    {isAr ? 'قيّم المنتج' : 'Review'}
                                  </button>
                                )}
                                {order.status === 'delivered' && order.reviewedProducts?.includes(item.id) && (
                                  <span className="px-3 py-1.5 text-xs font-bold text-coffee-muted bg-gray-100 rounded-full flex items-center">
                                    <CheckCircle2 className="w-3 h-3 inline me-1" />
                                    {isAr ? 'تم التقييم' : 'Reviewed'}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Delivery Info */}
                          <div className="bg-coffee-light/40 p-5 rounded-2xl border border-border-light space-y-4 font-sans h-fit">
                            <h4 className="font-bold text-coffee-dark mb-4 border-b border-border-light pb-2">{isAr ? 'معلومات التوصيل' : 'Delivery Info'}</h4>

                            <div>
                              <p className="text-xs text-coffee-muted mb-1 flex items-center"><MapPin className="w-3 h-3 me-1" /> {isAr ? 'العنوان' : 'Address'}</p>
                              <p className="text-sm font-bold text-coffee-dark capitalize truncate">{order.address?.name || '-'}</p>
                              <p className="text-xs text-coffee-dark mt-1 line-clamp-2">{order.address?.street || '-'}</p>
                            </div>

                            <div className="pt-2">
                              <p className="text-xs text-coffee-muted mb-1 flex items-center"><Truck className="w-3 h-3 me-1" /> {isAr ? 'طريقة الشحن' : 'Courier'}</p>
                              <p className="text-sm font-bold text-coffee-dark">{order.courier?.name || '-'}</p>
                            </div>

                            <button
                              onClick={() => handlePrint(order)}
                              className="w-full mt-4 py-2 border border-brand text-brand font-bold text-sm rounded-xl hover:bg-brand hover:text-white transition-colors flex justify-center items-center gap-2"
                            >
                              <Printer className="w-4 h-4" />
                              {isAr ? 'طباعة الفاتورة' : 'Print Invoice'}
                            </button>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {reviewModalOpen && selectedProductToReview && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !submittingReview && setReviewModalOpen(false)} />

            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
              <button onClick={() => setReviewModalOpen(false)} className="absolute top-4 end-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-coffee-muted transition-colors"><X className="w-5 h-5" /></button>

              <h3 className="text-xl font-bold font-serif text-coffee-dark mb-4">{isAr ? 'تقييم المنتج' : 'Review Product'}</h3>

              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-border-light">
                <img src={selectedProductToReview.image} alt={selectedProductToReview.name} className="w-12 h-12 object-cover mix-blend-multiply" />
                <p className="font-bold text-sm text-coffee-dark flex-1">{selectedProductToReview.name}</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-coffee-dark mb-2">{isAr ? 'التقييم' : 'Rating'}</label>
                <div className="flex gap-1 justify-center py-2 h-12" dir="ltr">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                      <Star className={`w-8 h-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-coffee-dark mb-2">{isAr ? 'رأيك يهمنا' : 'Write a Review'}</label>
                <textarea
                  rows={3}
                  placeholder={isAr ? 'أخبرنا عن تجربتك مع هذا المنتج...' : 'Tell us about your experience...'}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-border-light rounded-xl outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all font-sans text-sm resize-none"
                ></textarea>
              </div>

              <button
                onClick={submitReview}
                disabled={submittingReview}
                className="w-full py-3 bg-brand text-white rounded-full font-bold uppercase text-sm tracking-widest hover:bg-coffee-dark transition-colors disabled:opacity-50 flex items-center justify-center shadow-lg"
              >
                {submittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : isAr ? 'إرسال التقييم' : 'Submit Review'}
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PrintableInvoice order={selectedOrderForPrint} />
    </div>
  );
}
