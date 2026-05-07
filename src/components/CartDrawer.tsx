import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cartItems, updateQuantity, removeFromCart, cartSubtotal, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === 'ar';

  const taxRate = 0.15; // 15% Tax (inclusive)

  // Reset discount if cart becomes empty
  useEffect(() => {
    if (cartItems.length === 0) {
      setDiscountAmount(0);
      setCouponCode('');
    }
  }, [cartItems.length]);

  const applyCoupon = async () => {
    let rawCode = couponCode.trim();
    if (!rawCode) return;

    setLoadingCoupon(true);
    try {
      const q = query(collection(db, 'coupons'), where('code', '==', rawCode.toUpperCase()), where('isActive', '==', true));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setDiscountAmount(0);
        alert(isAr ? 'كود الخصم غير صحيح أو غير نشط' : 'Invalid or inactive coupon code');
        setLoadingCoupon(false);
        return;
      }

      const couponDoc = querySnapshot.docs[0];
      const couponData = couponDoc.data();

      // Check expiry
      if (couponData.expiryDate) {
        const expiry = new Date(couponData.expiryDate);
        if (expiry < new Date()) {
          setDiscountAmount(0);
          alert(isAr ? 'هذا الكود منتهي الصلاحية' : 'This coupon is expired');
          setLoadingCoupon(false);
          return;
        }
      }

      // Check Min Cart Value
      if (couponData.minCartValue && cartSubtotal < couponData.minCartValue) {
        setDiscountAmount(0);
        alert(isAr ? `يجب أن يكون الإجمالي أكثر من ${couponData.minCartValue} رس لاستخدام هذا الكود` : `Cart subtotal must be at least ${couponData.minCartValue} SAR to use this coupon`);
        setLoadingCoupon(false);
        return;
      }

      // Check Total Usage Limit
      if (couponData.totalUsageLimit && couponData.currentUsageCount !== undefined && couponData.currentUsageCount >= couponData.totalUsageLimit) {
        setDiscountAmount(0);
        alert(isAr ? 'لقد تجاوز هذا الكود الحد الأقصى للاستخدام' : 'This coupon has reached its total usage limit');
        setLoadingCoupon(false);
        return;
      }

      if (couponData.discountType === 'percentage') {
        let val = (cartSubtotal * (couponData.discountValue / 100));
        if (couponData.maxDiscountAmount && val > couponData.maxDiscountAmount) {
          val = couponData.maxDiscountAmount;
        }
        setDiscountAmount(val);
      } else if (couponData.discountType === 'fixed') {
        setDiscountAmount(Math.min(cartSubtotal, couponData.discountValue));
      }

    } catch (error) {
      console.error("Error applying coupon", error);
      alert(isAr ? 'حدث خطأ أثناء تطبيق الكود' : 'Error applying coupon');
    } finally {
      setLoadingCoupon(false);
    }
  };

  // Price Calculation Constraints: Price includes Tax.
  // We only detail it, not add it.
  const total = cartSubtotal - discountAmount;
  // If Total is 115, Subtotal without tax is 100, Tax is 15.
  // total = basePrice + (basePrice * rate) = basePrice * (1 + rate)
  // basePrice = total / (1 + rate)
  // tax = total - basePrice
  const basePrice = total / (1 + taxRate);
  const taxDetailAmount = total - basePrice;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: isAr ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isAr ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 ${isAr ? 'start-0' : 'end-0'} h-full w-full max-w-md bg-white z-[101] flex flex-col shadow-2xl`}
            dir={isAr ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border-light bg-coffee-light/20 shrink-0">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-brand" />
                <h2 className="text-xl font-bold font-serif text-coffee-dark">{isAr ? 'سلة المشتريات' : 'Your Cart'}</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-black/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-coffee-muted">
                  <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
                  <p className="font-medium">{isAr ? 'سلتك فارغة' : 'Your cart is empty'}</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-6 px-6 py-2 bg-brand text-white rounded-full font-bold tracking-widest uppercase text-xs hover:bg-brand/90 transition"
                  >
                    {isAr ? 'متابعة التسوق' : 'Continue Shopping'}
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg border border-border-light shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-coffee-dark truncate">{item.name}</h3>
                      <p className="text-sm font-bold text-brand mt-1">{Number(item.price).toFixed(2)} {isAr ? 'رس' : 'SAR'}</p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-border-light rounded-lg overflow-hidden h-8">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-full flex items-center justify-center hover:bg-coffee-light transition-colors text-coffee-dark"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-full flex items-center justify-center hover:bg-coffee-light transition-colors text-coffee-dark"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-border-light bg-coffee-light/20 shrink-0">
                {/* Coupon Code */}
                <div className="flex gap-2 mb-6">
                  <input
                    type="text"
                    placeholder={isAr ? "أدخل كود الخصم" : "Enter coupon code"}
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-4 py-2 border border-border-light rounded-lg text-sm bg-white outline-none focus:border-brand uppercase"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={loadingCoupon}
                    className="px-4 py-2 bg-coffee-dark text-white rounded-lg text-sm font-bold tracking-wider hover:bg-coffee-dark/90 transition-colors shrink-0 disabled:opacity-50"
                  >
                    {loadingCoupon ? (isAr ? 'جاري..' : 'Wait..') : (isAr ? 'تطبيق' : 'Apply')}
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm text-coffee-muted">
                    <span>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span className="font-bold text-coffee-dark">{cartSubtotal.toFixed(2)} {isAr ? 'رس' : 'SAR'}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-sm text-green-600">
                      <span>{isAr ? 'الخصم' : 'Discount'}</span>
                      <span className="font-bold">-{discountAmount.toFixed(2)} {isAr ? 'رس' : 'SAR'}</span>
                    </div>
                  )}
                  {/* Tax is already included, just show the details */}
                  <div className="flex items-center justify-between text-xs text-coffee-muted/70">
                    <span>{isAr ? 'يشمل ضريبة القيمة المضافة (15%)' : 'Includes VAT (15%)'}</span>
                    <span className="font-medium">{taxDetailAmount.toFixed(2)} {isAr ? 'رس' : 'SAR'}</span>
                  </div>
                  <div className="h-px bg-border-light my-2"></div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-serif text-coffee-dark">{isAr ? 'الإجمالي' : 'Total'}</span>
                    <span className="text-xl font-bold text-brand">{total.toFixed(2)} {isAr ? 'رس' : 'SAR'}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/checkout');
                  }}
                  className="w-full py-4 bg-coffee-dark text-white rounded-full hover:bg-brand transition-colors font-bold uppercase tracking-widest text-sm flex items-center justify-center group"
                >
                  {isAr ? 'إتمام الطلب' : 'Proceed to Checkout'}
                  <ArrowRight className={`w-4 h-4 ms-2 transition-transform ${isAr ? 'rotate-0 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                </button>

                <button
                  onClick={clearCart}
                  className="w-full mt-3 py-2 text-sm text-coffee-muted hover:text-red-500 transition-colors"
                >
                  {isAr ? 'إفراغ السلة' : 'Clear Cart'}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
