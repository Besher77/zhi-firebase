import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Edit, Trash2, Plus, Loader2, X, AlertTriangle, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Courier {
  id: string;
  name: string;
  cost: number;
  phone: string;
  isActive: boolean;
}

export default function AdminDelivery() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [cost, setCost] = useState<number | ''>('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCouriers();
  }, []);

  const fetchCouriers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'couriers'));
      const list: Courier[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Courier);
      });
      setCouriers(list);
    } catch (error) {
      console.error("Error fetching couriers: ", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (courier?: Courier) => {
    if (courier) {
      setEditingId(courier.id);
      setName(courier.name || '');
      setCost(courier.cost ?? '');
      setPhone(courier.phone || '');
      setIsActive(courier.isActive ?? true);
    } else {
      setEditingId(null);
      setName('');
      setCost('');
      setPhone('');
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = {
        name: name.trim(),
        cost: cost === '' ? 0 : Number(cost),
        phone: phone.trim(),
        isActive,
      };

      if (editingId) {
        await updateDoc(doc(db, 'couriers', editingId), payload);
      } else {
        await addDoc(collection(db, 'couriers'), payload);
      }

      setIsModalOpen(false);
      fetchCouriers();
    } catch (error) {
      console.error("Error saving courier: ", error);
      alert(isAr ? "حدث خطأ أثناء الحفظ" : "Error saving courier");
    } finally {
      setSubmitting(false);
    }
  };

  const executeDelete = async () => {
    if (deleteConfirmId) {
      setSubmitting(true);
      try {
        await deleteDoc(doc(db, 'couriers', deleteConfirmId));
        fetchCouriers();
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
        <h3 className="text-lg font-bold text-coffee-dark font-serif">{isAr ? 'مناديب وشركات الشحن' : 'Delivery & Couriers'}</h3>
        <button 
          onClick={() => openModal()}
          className="bg-brand text-white px-4 py-2 rounded-lg flex items-center hover:bg-brand/90 transition-colors"
        >
          <Plus className="w-4 h-4 me-2" /> {isAr ? 'إضافة مندوب' : 'Add Courier'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border-light overflow-x-auto">
        <table className="w-full text-start border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-coffee-light/50 border-b border-border-light text-coffee-muted text-sm uppercase">
              <th className="p-4 text-start font-medium">{isAr ? 'الاسم' : 'Name'}</th>
              <th className="p-4 text-start font-medium">{isAr ? 'تكلفة التوصيل' : 'Delivery Cost'}</th>
              <th className="p-4 text-start font-medium">{isAr ? 'رقم الهاتف' : 'Phone'}</th>
              <th className="p-4 text-center font-medium">{isAr ? 'الحالة' : 'Status'}</th>
              <th className="p-4 text-end font-medium">{isAr ? 'إجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {couriers.map(cr => (
              <tr key={cr.id} className="border-b border-border-light last:border-0 hover:bg-coffee-light/30">
                <td className="p-4 font-bold text-coffee-dark tracking-wide">
                  <div className="flex items-center">
                    <Truck className="w-4 h-4 me-2 text-brand" />
                    {cr.name}
                  </div>
                </td>
                <td className="p-4 font-bold text-brand">
                  {cr.cost} {isAr ? 'رس' : 'SAR'}
                </td>
                <td className="p-4 text-sm text-coffee-muted">
                  <div className="flex items-center gap-1" dir="ltr">
                    {cr.phone || '-'}
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${cr.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {cr.isActive ? (isAr ? 'متاح' : 'Active') : (isAr ? 'غير متاح' : 'Inactive')}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openModal(cr)} className="text-blue-500 hover:text-blue-700 p-2"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteConfirmId(cr.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {couriers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-coffee-muted">{isAr ? 'لا يوجد مناديب مضافين' : 'No couriers found.'}</td>
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
            <p className="text-coffee-muted font-sans mb-6">{isAr ? 'هل أنت متأكد أنك تريد حذف هذا المندوب/الشركة؟' : 'Are you sure you want to delete this courier?'}</p>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-border-light flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold font-serif">
                {editingId 
                  ? (isAr ? 'تعديل بيانات المندوب' : 'Edit Courier') 
                  : (isAr ? 'إضافة مندوب جديد' : 'Add Courier')}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'اسم المندوب / الشركة' : 'Courier Name'} <span className="text-red-500">*</span></label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border border-border-light rounded-lg focus:border-brand outline-none" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'تكلفة الشحن الثابتة' : 'Flat Delivery Cost'} <span className="text-red-500">*</span></label>
                    <input required type="number" step="0.01" min="0" value={cost} onChange={e => setCost(e.target.value ? parseFloat(e.target.value) : '')} className="w-full p-2 border border-border-light rounded-lg focus:border-brand outline-none" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'رقم الهاتف (اختياري)' : 'Phone Number (Optional)'}</label>
                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} dir="ltr" className="w-full p-2 border border-border-light rounded-lg focus:border-brand outline-none text-left" />
                  </div>
                </div>

              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 text-brand accent-brand cursor-pointer" />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">{isAr ? 'المندوب متاح للعمل' : 'Courier is active'}</label>
              </div>

              <div className="pt-6 flex justify-end gap-3 mt-4 border-t border-border-light">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50">{isAr ? 'إلغاء' : 'Cancel'}</button>
                <button type="submit" disabled={submitting || name.trim() === ''} className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 disabled:opacity-50 flex items-center font-medium">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : null}
                  {editingId ? (isAr ? 'تحديث' : 'Update') : (isAr ? 'حفظ' : 'Save')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
