import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { collection, query, getDocs, doc, setDoc, serverTimestamp, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MapPin, Truck, CreditCard, CheckCircle2, Loader2, ArrowLeft, Plus, Ticket, Receipt, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Address } from './Addresses';

interface Courier {
  id: string;
  name: string;
  cost: number;
  phone: string;
  isActive: boolean;
}

export default function Checkout() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const { cartItems, cartSubtotal, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedCourierId, setSelectedCourierId] = useState<string | null>(null);

  // Custom Payment Form States
  const [ccName, setCcName] = useState('');
  const [ccNumber, setCcNumber] = useState('');
  const [ccExpiry, setCcExpiry] = useState('');
  const [ccCvv, setCcCvv] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);

  // Coupons and Pricing
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  useEffect(() => {
    // 3D Secure Callback Listener
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const status = params.get('status');
    const message = params.get('message');

    if (id && status) {
      handleCallbackReturn(id, status, message);
    } else if (user && !authLoading) {
      fetchInitialData();
    }
  }, [user, authLoading]);

  const handleCallbackReturn = async (id: string, status: string, message: string | null) => {
    setIsProcessing(true);
    setStep(3);

    // Listen for the webhook to update the document
    const unsub = onSnapshot(doc(db, 'orders', id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.paymentStatus === 'paid') {
          unsub();
          clearCart();
          localStorage.removeItem('zhi_checkout_meta');
          setOrderSuccessId(id);
          setStep(1);
          setIsProcessing(false);
          window.history.replaceState({}, document.title, window.location.pathname);
        } else if (data.paymentStatus === 'failed') {
          unsub();
          setPaymentError(message || (isAr ? 'فشلت عملية الدفع في البنك.' : 'Payment failed at bank gate.'));
          setIsProcessing(false);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    });

    // Timeout just in case webhook never arrives
    setTimeout(() => {
      unsub();
      setIsProcessing(prev => {
        if (prev) {
          setPaymentError(isAr ? 'انتهى وقت الانتظار لتأكيد الدفع. يرجى مراجعة الطلبات لاحقاً.' : 'Payment confirmation timeout. Please check your orders later.');
          window.history.replaceState({}, document.title, window.location.pathname);
          return false;
        }
        return prev;
      });
    }, 45000); // 45 seconds timeout
  };

  const finishFulfillment = async (paymentId: string, paymentStatus: string, meta: any) => {
    const orderId = paymentId;
    await setDoc(doc(db, 'orders', orderId), {
      userId: user?.uid,
      items: meta.cartItems,
      subtotal: meta.cartSubtotal,
      shippingCost: meta.shippingCost,
      discount: meta.discountVal || 0,
      tax: meta.taxCost || 0,
      total: meta.finalTotal,
      coupon: meta.couponStr || null,
      address: meta.address,
      courier: meta.courier,
      paymentId: paymentId,
      paymentStatus: paymentStatus,
      status: 'placed',
      createdAt: serverTimestamp()
    });
    clearCart();
    localStorage.removeItem('zhi_checkout_meta');
    setOrderSuccessId(orderId);
    setStep(1);
  };


  const fetchInitialData = async () => {
    setLoading(true);
    try {
      if (!user) return;
      // Fetch Addresses
      const addrQuery = query(collection(db, 'users', user.uid, 'addresses'));
      const addrSnap = await getDocs(addrQuery);
      const addrList: Address[] = [];
      addrSnap.forEach(doc => addrList.push({ id: doc.id, ...doc.data() } as Address));
      setAddresses(addrList);
      if (addrList.length > 0) setSelectedAddressId(addrList[0].id);

      // Fetch active couriers
      const courQuery = query(collection(db, 'couriers'));
      const courSnap = await getDocs(courQuery);
      const courList: Courier[] = [];
      courSnap.forEach(doc => {
        const c = { id: doc.id, ...doc.data() } as Courier;
        if (c.isActive) courList.push(c);
      });
      setCouriers(courList);
      if (courList.length > 0) setSelectedCourierId(courList[0].id);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActiveCourierCost = () => {
    return couriers.find(c => c.id === selectedCourierId)?.cost || 0;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCheckingCoupon(true);
    setCouponError('');
    try {
      const q = query(collection(db, 'coupons'), where('code', '==', couponCode.toUpperCase()));
      const snap = await getDocs(q);
      if (snap.empty) {
        setCouponError(isAr ? 'كود الخصم غير صالح' : 'Invalid coupon code');
        setAppliedCoupon(null);
      } else {
        const cp = snap.docs[0].data();
        if (!cp.isActive) {
          setCouponError(isAr ? 'كود الخصم منتهي الصلاحية' : 'Coupon is expired');
          setAppliedCoupon(null);
        } else {
          setAppliedCoupon(cp); // { type: 'fixed' | 'percent', value: 10 }
          setCouponError('');
        }
      }
    } catch (err) {
      console.error(err);
      setCouponError(isAr ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setCheckingCoupon(false);
    }
  };

  const shippingCost = getActiveCourierCost();

  // Calculate discount
  let discountValue = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      discountValue = cartSubtotal * (Number(appliedCoupon.value) / 100);
    } else {
      discountValue = Number(appliedCoupon.value);
    }
  }

  // Prices and shipping are VAT inclusive. Calculate the extracted tax
  const finalTotal = Math.max(0, cartSubtotal - discountValue + shippingCost);
  const taxCost = finalTotal - (finalTotal / 1.15);


  // Custom REST API Payment Submission
  const processCustomPayment = async () => {
    if (!ccName || !ccNumber || !ccExpiry || !ccCvv) {
      setPaymentError(isAr ? 'يرجى تعبئة جميع بيانات البطاقة' : 'Please fill all card details');
      return;
    }

    setIsProcessing(true);
    setPaymentError('');

    try {
      const [month, year] = ccExpiry.split('/');
      if (!month || !year || month.length !== 2 || year.length !== 2) {
        setPaymentError(isAr ? 'تاريخ الانتهاء غير صحيح (MM/YY)' : 'Invalid expiry format (MM/YY)');
        setIsProcessing(false);
        return;
      }

      const metaData = {
        cartItems,
        cartSubtotal,
        shippingCost: shippingCost,
        discountVal: discountValue,
        taxCost: Number(taxCost.toFixed(2)),
        finalTotal: Number(finalTotal.toFixed(2)),
        couponStr: appliedCoupon ? appliedCoupon.code : null,
        address: addresses.find(a => a.id === selectedAddressId),
        courier: couriers.find(c => c.id === selectedCourierId)
      };

      localStorage.setItem('zhi_checkout_meta', JSON.stringify(metaData));

      const rawParams = JSON.stringify({
        amount: Math.round(finalTotal * 100),
        currency: "SAR",
        description: `ZHI Coffe Order - ${user?.uid}`,
        callback_url: window.location.href.split('?')[0],
        source: {
          type: "creditcard",
          name: ccName.trim(),
          number: ccNumber.replace(/\s/g, ''),
          cvc: ccCvv,
          month: month,
          year: year
        }
      });

      // Test API KEY natively embedded for custom POST
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("Authorization", "Basic " + btoa("pk_test_639CMT5gk9dB6rZaYigza6UPhLnm4SwUn2qkRoFN:"));

      const response = await fetch("https://api.moyasar.com/v1/payments", {
        method: 'POST',
        headers: headers,
        body: rawParams
      });

      const result = await response.json();

      if (result.type && (result.type.includes('error') || result.type === 'invalid_request_error')) {
        setPaymentError(result.message || 'Payment failed validation check');
        setIsProcessing(false);
        return;
      }

      if (result.status === 'initiated' && result.source.transaction_url) {
        // Save pending order before redirect so webhook has a document to update
        await setDoc(doc(db, 'orders', result.id), {
          userId: user?.uid,
          items: metaData.cartItems,
          subtotal: metaData.cartSubtotal,
          shippingCost: metaData.shippingCost,
          discount: metaData.discountVal || 0,
          tax: metaData.taxCost || 0,
          total: metaData.finalTotal,
          coupon: metaData.couponStr || null,
          address: metaData.address,
          courier: metaData.courier,
          paymentId: result.id,
          paymentStatus: 'initiated',
          status: 'pending',
          createdAt: serverTimestamp()
        });

        // 3D Secure Window Redirect Hook
        window.location.href = result.source.transaction_url;
      } else if (result.status === 'paid') {
        // Success directly
        await finishFulfillment(result.id, result.status, metaData);
        setIsProcessing(false);
      } else if (result.status === 'failed') {
        setPaymentError(result.source?.message || 'Payment failed from Bank Gateway.');
        setIsProcessing(false);
      }

    } catch (e) {
      console.error('Custom REST error: ', e);
      setPaymentError(isAr ? 'حدث خطأ في شبكة الدفع.' : 'Payment network error.');
      setIsProcessing(false);
    }
  };


  if (authLoading) return null;
  if (!user || (!authLoading && cartItems.length === 0 && !orderSuccessId)) return <Navigate to="/" replace />;

  if (orderSuccessId) {
    return (
      <div className="container mx-auto px-4 max-w-2xl py-32 min-h-[70vh] flex flex-col items-center justify-center text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-coffee-dark text-white rounded-full flex items-center justify-center mb-8 shadow-xl">
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        <h1 className="text-4xl font-serif text-coffee-dark mb-4">{isAr ? 'تم تأكيد طلبك بنجاح!' : 'Order Confirmed successfully!'}</h1>
        <p className="text-coffee-muted font-sans text-lg max-w-md mx-auto mb-8">
          {isAr ? `يسعدنا خدمتك. رقم الطلب الخاص بك هو #${orderSuccessId.substring(0, 8).toUpperCase()}` : `Thank you for your order. Your Order ID is #${orderSuccessId.substring(0, 8).toUpperCase()}`}
        </p>
        <Link to="/" className="px-10 py-4 bg-brand text-white rounded-full hover:bg-coffee-dark transition-colors font-bold uppercase tracking-widest text-sm">
          {t('nav.home')}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-6xl py-20 font-sans">
      <div className="bg-white rounded-3xl shadow-xl p-6 md:p-12">
        <div className="mb-12 border-b border-border-light pb-6">
          <h1 className="text-4xl md:text-5xl font-serif text-coffee-dark mb-2">
            {isAr ? 'إتمام الطلب' : 'Checkout'}
          </h1>
          <p className="text-coffee-muted text-sm text-balance">
            {isAr ? 'يُرجى إكمال بيانات التوصيل والدفع لإنهاء الطلب.' : 'Please complete your delivery and payment details to finish your order.'}
          </p>
        </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-12 h-12 animate-spin text-coffee-dark mb-4" />
          <p className="text-coffee-muted font-bold text-sm tracking-widest uppercase">{isAr ? 'يتم تهيئة الاتصال...' : 'Loading Gateway...'}</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 space-y-8">

            {/* Step 1: Address */}
            <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${step === 1 ? 'border-brand shadow-lg' : 'border-border-light bg-coffee-light/20'}`}>
              <div className={`p-6 flex items-center justify-between cursor-pointer ${step === 1 ? 'bg-brand/5' : ''}`} onClick={() => step > 1 && setStep(1)}>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-serif me-4 ${step === 1 ? 'bg-brand text-white' : 'bg-coffee-muted text-white'}`}>1</div>
                  <h2 className="text-xl font-bold text-coffee-dark">{isAr ? 'عنوان التوصيل' : 'Delivery Address'}</h2>
                </div>
                {step > 1 && <span className="text-coffee-dark text-sm font-bold capitalize">{addresses.find(a => a.id === selectedAddressId)?.name || 'Selected'}</span>}
              </div>

              <AnimatePresence>
                {step === 1 && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-6 pb-6 overflow-hidden">
                    {addresses.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-coffee-muted mb-4">{isAr ? 'لا يوجد عناوين محفوظة لديك.' : 'You have no saved addresses.'}</p>
                        <Link to="/addresses" className="inline-flex items-center px-6 py-3 border border-coffee-dark text-coffee-dark hover:bg-coffee-dark hover:text-white transition-colors rounded-full font-bold text-sm">
                          <Plus className="w-4 h-4 me-2" /> {isAr ? 'إضافة عنوان جديد' : 'Add New Address'}
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map(addr => (
                          <label key={addr.id} className={`relative flex items-start p-4 border rounded-xl cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-brand bg-brand/5' : 'border-border-light hover:border-brand/40'}`}>
                            <input type="radio" className="mt-1 accent-brand w-4 h-4 cursor-pointer" checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} />
                            <div className="ms-3 flex-1">
                              <p className="font-bold text-coffee-dark capitalize">{addr.name}</p>
                              <p className="text-sm text-coffee-muted mt-1 leading-snug">{addr.street}</p>
                              {addr.neighborhood && <p className="text-sm text-coffee-muted">{addr.neighborhood}</p>}
                            </div>
                          </label>
                        ))}

                        {addresses.length < 3 && (
                          <Link to="/addresses" className="flex items-center justify-center p-4 border border-dashed border-coffee-muted rounded-xl text-coffee-muted hover:border-coffee-dark hover:text-coffee-dark transition-colors">
                            <Plus className="w-5 h-5 me-2" /> {isAr ? 'إضافة' : 'Add New'}
                          </Link>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => setStep(2)}
                      disabled={!selectedAddressId}
                      className="w-full py-4 mt-6 bg-coffee-dark text-white rounded-full hover:bg-brand transition-colors font-bold uppercase tracking-widest text-sm disabled:opacity-50"
                    >
                      {isAr ? 'متابعة لاختيار الشحن' : 'Continue to Delivery'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Step 2: Courier */}
            <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${step === 2 ? 'border-brand shadow-lg' : 'border-border-light bg-coffee-light/20 ' + (step < 2 ? 'opacity-60' : '')}`}>
              <div className={`p-6 flex items-center justify-between cursor-pointer ${step === 2 ? 'bg-brand/5' : ''}`} onClick={() => step > 1 && setStep(2)}>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-serif me-4 ${step === 2 ? 'bg-brand text-white' : 'bg-coffee-muted text-white'}`}>2</div>
                  <h2 className="text-xl font-bold text-coffee-dark">{isAr ? 'طريقة الشحن' : 'Delivery Method'}</h2>
                </div>
                {step > 2 && <span className="text-coffee-dark text-sm font-bold capitalize">{couriers.find(a => a.id === selectedCourierId)?.name || 'Selected'}</span>}
              </div>

              <AnimatePresence>
                {step === 2 && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-6 pb-6 overflow-hidden">
                    <div className="grid grid-cols-1 gap-4">
                      {couriers.length === 0 ? (
                        <div className="text-center py-6 text-coffee-muted">{isAr ? 'لا توجد خيارات شحن متاحة.' : 'No delivery options available.'}</div>
                      ) : (
                        couriers.map(cour => (
                          <label key={cour.id} className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${selectedCourierId === cour.id ? 'border-brand bg-brand/5' : 'border-border-light hover:border-brand/40'}`}>
                            <input type="radio" className="accent-brand w-4 h-4 cursor-pointer" checked={selectedCourierId === cour.id} onChange={() => setSelectedCourierId(cour.id)} />
                            <div className="ms-4 flex-1">
                              <p className="font-bold text-coffee-dark capitalize flex items-center"><Truck className="w-4 h-4 me-2 text-coffee-dark" /> {cour.name}</p>
                            </div>
                            <div className="font-bold text-coffee-dark">{cour.cost} {isAr ? 'رس' : 'SAR'}</div>
                          </label>
                        ))
                      )}
                    </div>

                    <div className="flex gap-4 mt-6">
                      <button onClick={() => setStep(1)} className="px-6 py-4 rounded-full border border-border-light hover:bg-coffee-light flex items-center transition-colors">
                        <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-0' : ''}`} />
                      </button>
                      <button
                        onClick={() => setStep(3)}
                        disabled={!selectedCourierId}
                        className="flex-1 py-4 bg-coffee-dark text-white rounded-full hover:bg-brand transition-colors font-bold uppercase tracking-widest text-sm disabled:opacity-50"
                      >
                        {isAr ? 'متابعة للدفع' : 'Continue to Payment'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Step 3: Payment */}
            <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${step === 3 ? 'border-brand shadow-lg' : 'border-border-light bg-coffee-light/20 ' + (step < 3 ? 'opacity-60' : '')}`}>
              <div className={`p-6 flex items-center justify-between`}>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-serif me-4 ${step === 3 ? 'bg-brand text-white' : 'bg-coffee-muted text-white'}`}>3</div>
                  <h2 className="text-xl font-bold text-coffee-dark">{isAr ? 'طريقة الدفع' : 'Payment Method'}</h2>
                </div>
              </div>

              <AnimatePresence>
                {step === 3 && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-6 pb-6 overflow-hidden">

                    {paymentError && (
                      <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center mb-6">
                        <AlertCircle className="w-5 h-5 text-red-500 me-3 shrink-0" />
                        <p className="text-sm font-bold text-red-700">{paymentError}</p>
                      </div>
                    )}

                    <div className="bg-coffee-light/50 p-6 md:p-8 rounded-xl border border-border-light relative">
                      {isProcessing && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl transition-all">
                          <Loader2 className="w-10 h-10 animate-spin text-coffee-dark mb-4 shadow-lg rounded-full" />
                          <p className="text-sm font-bold tracking-widest text-coffee-dark uppercase text-center px-4">
                            {isAr ? 'جاري تأكيد الدفع... يرجى الانتظار.' : 'Confirming Payment... Please wait.'}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-8">
                        <h4 className="font-bold font-serif text-coffee-dark flex items-center">
                          <CreditCard className="w-5 h-5 me-2 text-coffee-dark" /> {isAr ? 'البطاقة الائتمانية' : 'Credit Card'}
                        </h4>
                        <div className="flex gap-2">
                          {/* Simulated Card Network Badges */}
                          <div className="h-6 w-10 bg-blue-800 rounded flex items-center justify-center text-white text-[8px] font-bold italic">VISA</div>
                          <div className="h-6 w-10 bg-red-600 rounded flex items-center justify-center text-white text-[8px] font-bold">MASTER</div>
                          <div className="h-6 w-10 bg-green-500 rounded flex items-center justify-center text-white text-[10px] font-bold border border-green-600"> مدى </div>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div>
                          <label className="block text-xs font-bold text-coffee-muted uppercase tracking-wider mb-2">{isAr ? 'الاسم على البطاقة' : 'Cardholder Name'}</label>
                          <input
                            type="text"
                            placeholder={isAr ? 'الاسم كامل' : 'Full Name'}
                            value={ccName}
                            onChange={(e) => setCcName(e.target.value)}
                            className="w-full bg-white border border-border-light rounded-xl px-4 py-3 font-bold text-coffee-dark outline-none focus:border-brand transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-coffee-muted uppercase tracking-wider mb-2">{isAr ? 'رقم البطاقة' : 'Card Number'}</label>
                          <input
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            value={ccNumber.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ').trim()}
                            onChange={(e) => setCcNumber(e.target.value)}
                            className="w-full bg-white border border-border-light rounded-xl px-4 py-3 font-bold text-coffee-dark font-sans tracking-widest outline-none focus:border-brand transition-colors text-left dir-ltr"
                            dir="ltr"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-border-light/50 pt-5 mt-2">
                          <div>
                            <label className="block text-xs font-bold text-coffee-muted uppercase tracking-wider mb-2">{isAr ? 'تاريخ الانتهاء' : 'Expiry Date'}</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              maxLength={5}
                              value={ccExpiry}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, '');
                                if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2);
                                setCcExpiry(val);
                              }}
                              className="w-full bg-white border border-border-light rounded-xl px-4 py-3 font-bold text-coffee-dark text-center tracking-widest outline-none focus:border-brand transition-colors"
                              dir="ltr"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-coffee-muted uppercase tracking-wider mb-2">{isAr ? 'رمز التحقق' : 'CVV/CVC'}</label>
                            <input
                              type="text"
                              placeholder="123"
                              maxLength={4}
                              value={ccCvv}
                              onChange={(e) => setCcCvv(e.target.value.replace(/\D/g, ''))}
                              className="w-full bg-white border border-border-light rounded-xl px-4 py-3 font-bold text-coffee-dark text-center tracking-widest outline-none focus:border-brand transition-colors"
                              dir="ltr"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button onClick={() => setStep(2)} className="px-6 py-4 rounded-full border border-border-light hover:bg-gray-50 flex items-center transition-colors">
                        <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-0' : ''}`} />
                      </button>
                      <button
                        onClick={processCustomPayment}
                        disabled={isProcessing}
                        className="flex-1 py-4 bg-brand text-white rounded-full hover:bg-coffee-dark shadow-md transition-all font-bold uppercase tracking-widest text-sm"
                      >
                        {isAr ? `دفع ${finalTotal.toFixed(2)} رس` : `Pay ${finalTotal.toFixed(2)} SAR`}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Checkout Summary & Coupon Sidebar */}
          <div className="lg:w-96 shrink-0">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-border-light shadow-sm sticky top-24">
              <h3 className="text-xl font-bold text-coffee-dark mb-6 border-b border-border-light pb-4 font-serif">
                {isAr ? 'ملخص الطلب' : 'Order Summary'}
              </h3>

              <div className="space-y-4 max-h-[300px] overflow-y-auto mb-6 pe-2">
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <img src={item.image} className="w-16 h-16 object-cover rounded-lg bg-coffee-light mix-blend-multiply" alt={item.name} />
                    <div className="flex-1">
                      <p className="font-bold text-sm text-coffee-dark leading-snug">{item.name}</p>
                      <p className="text-xs text-coffee-muted mt-1">{item.quantity} x {item.price} {isAr ? 'رس' : 'SAR'}</p>
                    </div>
                    <div className="font-bold text-coffee-dark text-sm">{Number(item.price) * item.quantity} {isAr ? 'رس' : 'SAR'}</div>
                  </div>
                ))}
              </div>

              {/* Coupon Code Section */}
              <div className="border-t border-border-light pt-6 mb-6">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Ticket className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder={isAr ? 'كود الخصم' : 'Coupon Code'}
                      disabled={!!appliedCoupon || checkingCoupon}
                      className="w-full ps-10 pe-4 py-3 bg-gray-50 border border-border-light rounded-xl outline-none focus:border-brand font-sans text-sm uppercase transition-colors disabled:opacity-50"
                    />
                  </div>
                  {!appliedCoupon ? (
                    <button
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || checkingCoupon}
                      className="px-6 py-3 bg-coffee-dark text-white rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-brand transition-colors flex items-center justify-center"
                    >
                      {checkingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : (isAr ? 'تطبيق' : 'Apply')}
                    </button>
                  ) : (
                    <button
                      onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                      className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
                    >
                      {isAr ? 'حذف' : 'Remove'}
                    </button>
                  )}
                </div>
                {couponError && <p className="text-red-500 text-xs mt-2 font-bold">{couponError}</p>}
                {appliedCoupon && <p className="text-coffee-dark text-xs mt-2 font-bold">{isAr ? 'تم تطبيق الخصم بنجاح!' : 'Coupon applied successfully!'}</p>}
              </div>

              {/* Pricing Line Items */}
              <div className="border-t border-border-light pt-4 space-y-3 font-sans text-sm">
                <div className="flex justify-between text-coffee-muted">
                  <span>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span className="font-bold text-coffee-dark">{cartSubtotal.toFixed(2)} {isAr ? 'رس' : 'SAR'}</span>
                </div>

                {step >= 2 && selectedCourierId && (
                  <div className="flex justify-between text-coffee-muted">
                    <span>{isAr ? 'رسوم التوصيل' : 'Delivery Fee'}</span>
                    <span className="font-bold text-coffee-dark">{shippingCost.toFixed(2)} {isAr ? 'رس' : 'SAR'}</span>
                  </div>
                )}

                {discountValue > 0 && (
                  <div className="flex justify-between text-green-700 font-bold bg-green-50 p-2 rounded-lg -mx-2 px-2">
                    <span>{isAr ? 'الخصم' : 'Discount'} ({appliedCoupon?.code})</span>
                    <span>- {discountValue.toFixed(2)} {isAr ? 'رس' : 'SAR'}</span>
                  </div>
                )}

                <div className="flex justify-between text-coffee-muted pt-2 border-t border-border-light/50">
                  <span className="flex items-center"><Receipt className="w-3 h-3 me-1" /> {isAr ? 'الضريبة (مشمولة 15%)' : 'VAT (Included 15%)'}</span>
                  <span className="font-bold text-coffee-dark">{taxCost.toFixed(2)} {isAr ? 'رس' : 'SAR'}</span>
                </div>

                {step >= 2 && selectedCourierId && (
                  <div className="flex justify-between items-center text-xl font-bold text-coffee-dark pt-5 mt-2 border-t border-border-light">
                    <span>{isAr ? 'الإجمالي' : 'Total'}</span>
                    <span className="text-coffee-dark">{finalTotal.toFixed(2)} {isAr ? 'رس' : 'SAR'}</span>
                  </div>
                )}
              </div>

              <div className="mt-8 bg-coffee-light/50 p-4 rounded-xl flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-coffee-dark shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-coffee-dark mb-1">{isAr ? 'دفع إلكتروني آمن' : 'Secure Online Payment'}</p>
                  <p className="text-[10px] text-coffee-muted leading-relaxed">
                    {isAr ? 'جميع المعاملات مشفرة ومحمية بالكامل عبر بروتوكول 3D Secure. متوافق مع معايير البنك المركزي السعودي.' : 'Transactions are deeply encrypted and protected by 3D Secure protocol.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
