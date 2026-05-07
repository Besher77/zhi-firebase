import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Edit, Trash2, Plus, Loader2, X, AlertTriangle, Ticket, Calendar, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  isActive: boolean;
  expiryDate?: string;
  minCartValue?: number;
  maxDiscountAmount?: number;
  usageLimitPerUser?: number;
  totalUsageLimit?: number;
  currentUsageCount?: number;
}

export default function AdminCoupons() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [expiryDate, setExpiryDate] = useState('');
  
  const [minCartValue, setMinCartValue] = useState<number | ''>('');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | ''>('');
  const [usageLimitPerUser, setUsageLimitPerUser] = useState<number | ''>('');
  const [totalUsageLimit, setTotalUsageLimit] = useState<number | ''>('');
  const [currentUsageCount, setCurrentUsageCount] = useState<number>(0);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'coupons'));
      const cps: Coupon[] = [];
      querySnapshot.forEach((doc) => {
        cps.push({ id: doc.id, ...doc.data() } as Coupon);
      });
      setCoupons(cps);
    } catch (error) {
      console.error("Error fetching coupons: ", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingId(coupon.id);
      setCode(coupon.code || '');
      setDiscountType(coupon.discountType || 'percentage');
      setDiscountValue(coupon.discountValue || 0);
      setIsActive(coupon.isActive ?? true);
      setExpiryDate(coupon.expiryDate || '');
      setMinCartValue(coupon.minCartValue || '');
      setMaxDiscountAmount(coupon.maxDiscountAmount || '');
      setUsageLimitPerUser(coupon.usageLimitPerUser || '');
      setTotalUsageLimit(coupon.totalUsageLimit || '');
      setCurrentUsageCount(coupon.currentUsageCount || 0);
    } else {
      setEditingId(null);
      setCode('');
      setDiscountType('percentage');
      setDiscountValue(0);
      setIsActive(true);
      setExpiryDate('');
      setMinCartValue('');
      setMaxDiscountAmount('');
      setUsageLimitPerUser('');
      setTotalUsageLimit('');
      setCurrentUsageCount(0);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const upperCode = code.toUpperCase().trim();
      const payload: any = {
        code: upperCode,
        discountType,
        discountValue: Number(discountValue),
        isActive,
        minCartValue: minCartValue !== '' ? Number(minCartValue) : null,
        maxDiscountAmount: maxDiscountAmount !== '' ? Number(maxDiscountAmount) : null,
        usageLimitPerUser: usageLimitPerUser !== '' ? Number(usageLimitPerUser) : null,
        totalUsageLimit: totalUsageLimit !== '' ? Number(totalUsageLimit) : null,
      };

      if (!editingId) {
        payload.currentUsageCount = 0;
      }

      if (expiryDate) {
        payload.expiryDate = expiryDate;
      } else {
        payload.expiryDate = null;
      }

      if (editingId) {
        await updateDoc(doc(db, 'coupons', editingId), payload);
      } else {
        await addDoc(collection(db, 'coupons'), payload);
      }

      setIsModalOpen(false);
      fetchCoupons();
    } catch (error) {
      console.error("Error saving coupon: ", error);
      alert(isAr ? "حدث خطأ أثناء الحفظ" : "Error saving coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const executeDelete = async () => {
    if (deleteConfirmId) {
      setSubmitting(true);
      try {
        await deleteDoc(doc(db, 'coupons', deleteConfirmId));
        fetchCoupons();
      } catch (error) {
         console.error("Error deleting: ", error);
      } finally {
        setSubmitting(false);
        setDeleteConfirmId(null);
      }
    }
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-brand" /></div>;

  return (
    <div dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-coffee-dark font-serif">{isAr ? 'أكواد الخصم' : 'Coupons'}</h3>
        <button 
          onClick={() => openModal()}
          className="bg-brand text-white px-4 py-2 rounded-lg flex items-center hover:bg-brand/90 transition-colors"
        >
          <Plus className="w-4 h-4 me-2" /> {isAr ? 'إضافة كود' : 'Add Coupon'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border-light overflow-x-auto">
        <table className="w-full text-start border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-coffee-light/50 border-b border-border-light text-coffee-muted text-sm uppercase">
              <th className="p-4 text-start font-medium">{isAr ? 'الكود' : 'Code'}</th>
              <th className="p-4 text-start font-medium">{isAr ? 'النوع' : 'Type'}</th>
              <th className="p-4 text-start font-medium">{isAr ? 'القيمة' : 'Value'}</th>
              <th className="p-4 text-start font-medium">{isAr ? 'الاستخدامات' : 'Usages'}</th>
              <th className="p-4 text-start font-medium">{isAr ? 'تاريخ الانتهاء' : 'Expiry'}</th>
              <th className="p-4 text-center font-medium">{isAr ? 'الحالة' : 'Status'}</th>
              <th className="p-4 text-end font-medium">{isAr ? 'إجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(cp => {
              const isExpired = cp.expiryDate ? new Date(cp.expiryDate) < new Date() : false;
              const isLimitReached = cp.totalUsageLimit ? (cp.currentUsageCount || 0) >= cp.totalUsageLimit : false;
              return (
              <tr key={cp.id} className="border-b border-border-light last:border-0 hover:bg-coffee-light/30">
                <td className="p-4 font-bold text-coffee-dark tracking-wide">
                  <div className="flex items-center">
                    <Ticket className={`w-4 h-4 me-2 ${isExpired || isLimitReached ? 'text-gray-400' : 'text-brand'}`} />
                    <span className={isExpired || isLimitReached ? 'line-through text-gray-400' : ''}>{cp.code}</span>
                  </div>
                </td>
                <td className="p-4 text-coffee-dark text-sm">
                  {cp.discountType === 'percentage' ? (isAr ? 'نسبة مئوية' : 'Percentage') : (isAr ? 'مبلغ ثابت' : 'Fixed Amount')}
                </td>
                <td className="p-4 font-bold text-brand">
                  {cp.discountType === 'percentage' ? `${cp.discountValue}%` : `${cp.discountValue} ${isAr ? 'رس' : 'SAR'}`}
                </td>
                <td className="p-4 text-sm text-coffee-muted">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-coffee-muted" />
                    <span>{cp.currentUsageCount || 0}</span>
                    {cp.totalUsageLimit ? <span className="text-xs text-gray-400">/ {cp.totalUsageLimit}</span> : null}
                  </div>
                </td>
                <td className="p-4 text-sm text-coffee-muted">
                  {cp.expiryDate ? (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {cp.expiryDate} {isExpired && <span className="text-red-500 text-xs font-bold px-1">({isAr ? 'منتهي' : 'Expired'})</span>}
                    </div>
                  ) : (isAr ? 'لا يوجد' : 'None')}
                </td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${cp.isActive && !isExpired && !isLimitReached ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {cp.isActive && !isExpired && !isLimitReached ? (isAr ? 'نشط' : 'Active') : (isLimitReached ? (isAr ? 'مستنفذ' : 'Exhausted') : (isAr ? 'غير نشط' : 'Inactive'))}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openModal(cp)} className="text-blue-500 hover:text-blue-700 p-2"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteConfirmId(cp.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            )})}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-coffee-muted">{isAr ? 'لا توجد أكواد خصم' : 'No coupons found.'}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[120] bg-black/60 flex items-center justify-center p-4" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-coffee-dark mb-2 font-serif">{isAr ? 'تأكيد الحذف' : 'Confirm Delete'}</h3>
            <p className="text-coffee-muted font-sans mb-6">{isAr ? 'هل أنت متأكد أنك تريد حذف هذا الكود؟' : 'Are you sure you want to delete this coupon?'}</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 flex-1">{isAr ? 'إلغاء' : 'Cancel'}</button>
              <button 
                onClick={executeDelete} 
                disabled={submitting} 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center flex-1"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : null}
                {isAr ? 'حذف' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-border-light flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold font-serif">
                {editingId 
                  ? (isAr ? 'تعديل كود الخصم' : 'Edit Coupon') 
                  : (isAr ? 'إضافة كود خصم' : 'Add Coupon')}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'كود الخصم' : 'Coupon Code'} <span className="text-red-500">*</span></label>
                  <input required type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="w-full p-2 border border-border-light rounded-lg focus:border-brand outline-none uppercase font-bold" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'تاريخ الانتهاء ' : 'Expiry Date'}</label>
                  <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="w-full p-2 border border-border-light rounded-lg focus:border-brand outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'نوع الخصم' : 'Discount Type'} <span className="text-red-500">*</span></label>
                  <select required value={discountType} onChange={e => setDiscountType(e.target.value as any)} className="w-full p-2 border border-border-light rounded-lg focus:border-brand outline-none bg-white">
                    <option value="percentage">{isAr ? 'نسبة مئوية (%)' : 'Percentage (%)'}</option>
                    <option value="fixed">{isAr ? 'مبلغ ثابت' : 'Fixed Amount'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'قيمة الخصم' : 'Discount Value'} <span className="text-red-500">*</span></label>
                  <input required type="number" step="0.01" min="0" value={discountValue} onChange={e => setDiscountValue(parseFloat(e.target.value))} className="w-full p-2 border border-border-light rounded-lg focus:border-brand outline-none" />
                </div>
              </div>

              <h4 className="text-md font-bold text-coffee-dark mb-4 border-b border-border-light pb-2">{isAr ? 'شروط متقدمة (اختياري)' : 'Advanced Conditions (Optional)'}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'الحد الأدنى لقيمة السلة' : 'Minimum Cart Value'}</label>
                  <input type="number" step="0.01" min="0" value={minCartValue} onChange={e => setMinCartValue(e.target.value ? parseFloat(e.target.value) : '')} placeholder={isAr ? 'مثال: 100' : 'e.g. 100'} className="w-full p-2 border border-border-light rounded-lg focus:border-brand outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'أقصى مبلغ للخصم (للنسبة المئوية)' : 'Max Discount Amount'}</label>
                  <input type="number" step="0.01" min="0" value={maxDiscountAmount} onChange={e => setMaxDiscountAmount(e.target.value ? parseFloat(e.target.value) : '')} disabled={discountType !== 'percentage'} placeholder={isAr ? 'مثال: 50' : 'e.g. 50'} className="w-full p-2 border border-border-light rounded-lg focus:border-brand outline-none disabled:bg-gray-100" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'الحد الأقصى لاستخدام الكود (للكل)' : 'Total Usage Limit'}</label>
                  <input type="number" step="1" min="1" value={totalUsageLimit} onChange={e => setTotalUsageLimit(e.target.value ? parseInt(e.target.value) : '')} placeholder={isAr ? 'مثال: 100' : 'e.g. 100'} className="w-full p-2 border border-border-light rounded-lg focus:border-brand outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'الحد الأقصى للاستخدام (لكل مستخدم)' : 'Usage Limit Per User'}</label>
                  <input type="number" step="1" min="1" value={usageLimitPerUser} onChange={e => setUsageLimitPerUser(e.target.value ? parseInt(e.target.value) : '')} placeholder={isAr ? 'مثال: 1' : 'e.g. 1'} className="w-full p-2 border border-border-light rounded-lg focus:border-brand outline-none" />
                </div>
              </div>

              {editingId && (
                <div className="mt-4 p-4 bg-coffee-light rounded-lg border border-border-light flex items-center justify-between">
                  <span className="text-sm font-medium text-coffee-dark">{isAr ? 'مرات الاستخدام الحالية:' : 'Current Usages:'}</span>
                  <span className="font-bold text-brand text-lg">{currentUsageCount}</span>
                </div>
              )}

              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border-light">
                <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 text-brand accent-brand cursor-pointer" />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">{isAr ? 'الكود نشط (يمكن استخدامه)' : 'Coupon is active (Can be used)'}</label>
              </div>

              <div className="pt-6 flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50">{isAr ? 'إلغاء' : 'Cancel'}</button>
                <button type="submit" disabled={submitting || code.trim() === ''} className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 disabled:opacity-50 flex items-center font-medium">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : null}
                  {editingId ? (isAr ? 'تحديث كود الخصم' : 'Update Coupon') : (isAr ? 'حفظ كود الخصم' : 'Save Coupon')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
