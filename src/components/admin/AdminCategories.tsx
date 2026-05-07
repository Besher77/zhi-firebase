import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Edit, Trash2, Plus, Image as ImageIcon, Loader2, X, AlertTriangle, UploadCloud } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Category {
  id: string;
  titleEn: string;
  titleAr: string;
  image: string;
  isActive: boolean;
}

export default function AdminCategories() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Form State
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [existingImage, setExistingImage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const cats: Category[] = [];
      querySnapshot.forEach((doc) => {
        cats.push({ id: doc.id, ...doc.data() } as Category);
      });
      setCategories(cats);
    } catch (error) {
      console.error("Error fetching categories: ", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingId(category.id);
      setTitleEn(category.titleEn);
      setTitleAr(category.titleAr);
      setIsActive(category.isActive);
      setExistingImage(category.image);
      setImageFile(null);
      setImagePreview('');
    } else {
      setEditingId(null);
      setTitleEn('');
      setTitleAr('');
      setIsActive(true);
      setExistingImage('');
      setImageFile(null);
      setImagePreview('');
    }
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setExistingImage(''); // Replace existing
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setExistingImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let imageUrl = existingImage;

      if (imageFile) {
        const imageRef = ref(storage, `categories/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const categoryData = {
        titleEn,
        titleAr,
        image: imageUrl,
        isActive,
      };

      if (editingId) {
        await updateDoc(doc(db, 'categories', editingId), categoryData);
      } else {
        await addDoc(collection(db, 'categories'), categoryData);
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category: ", error);
      alert(isAr ? "حدث خطأ أثناء الحفظ" : "Error saving category");
    } finally {
      setSubmitting(false);
    }
  };

  const executeDelete = async () => {
    if (deleteConfirmId) {
      setSubmitting(true);
      try {
        await deleteDoc(doc(db, 'categories', deleteConfirmId));
        fetchCategories();
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
        <h3 className="text-lg font-bold text-coffee-dark font-serif">{isAr ? 'الأقسام' : 'Categories'}</h3>
        <button 
          onClick={() => openModal()}
          className="bg-brand text-white px-4 py-2 rounded-lg flex items-center hover:bg-brand/90 transition-colors"
        >
          <Plus className="w-4 h-4 me-2" /> {isAr ? 'إضافة قسم' : 'Add Category'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden">
        <table className="w-full text-start border-collapse">
          <thead>
            <tr className="bg-coffee-light/50 border-b border-border-light text-coffee-muted text-sm uppercase">
              <th className="p-4 text-start font-medium">{isAr ? 'صورة' : 'Image'}</th>
              <th className="p-4 text-start font-medium">{isAr ? 'الاسم (EN)' : 'Title (EN)'}</th>
              <th className="p-4 text-start font-medium">{isAr ? 'الاسم (AR)' : 'Title (AR)'}</th>
              <th className="p-4 text-center font-medium">{isAr ? 'الحالة' : 'Status'}</th>
              <th className="p-4 text-end font-medium">{isAr ? 'إجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id} className="border-b border-border-light last:border-0 hover:bg-coffee-light/30">
                <td className="p-4">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.titleEn} className="w-12 h-12 rounded object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                </td>
                <td className="p-4 font-medium text-coffee-dark">{cat.titleEn}</td>
                <td className="p-4 text-coffee-dark" dir="rtl">{cat.titleAr}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {cat.isActive ? (isAr ? 'نشط' : 'Active') : (isAr ? 'غير نشط' : 'Inactive')}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openModal(cat)} className="text-blue-500 hover:text-blue-700 p-2"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteConfirmId(cat.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-coffee-muted">{isAr ? 'لا توجد أقسام.' : 'No categories found.'}</td>
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
            <p className="text-coffee-muted font-sans mb-6">{isAr ? 'هل أنت متأكد أنك تريد حذف هذا القسم؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this category? This action cannot be undone.'}</p>
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

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-border-light flex justify-between items-center">
              <h2 className="text-xl font-bold font-serif">
                {editingId 
                  ? (isAr ? 'تعديل القسم' : 'Edit Category') 
                  : (isAr ? 'إضافة قسم' : 'Add Category')}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div dir="ltr">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (English)</label>
                <input required type="text" value={titleEn} onChange={e => setTitleEn(e.target.value)} className="w-full p-2 border border-border-light rounded-lg focus:border-brand outline-none" placeholder="e.g. Coffee Beans" />
              </div>
              <div dir="rtl">
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم (عربي)</label>
                <input required type="text" value={titleAr} onChange={e => setTitleAr(e.target.value)} className="w-full p-2 border border-border-light rounded-lg focus:border-brand outline-none" placeholder="مثال: حبوب القهوة" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{isAr ? 'الصورة' : 'Image'}</label>
                
                {/* Modern Image Upload */}
                {!imagePreview && !existingImage ? (
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadCloud className="w-8 h-8 text-gray-400 mb-3" />
                    <p className="text-sm font-medium text-coffee-dark mb-1">{isAr ? 'اضغط لرفع صورة' : 'Click to upload image'}</p>
                    <p className="text-xs text-gray-500">{isAr ? 'PNG, JPG حتى 5 ميجابايت' : 'PNG, JPG up to 5MB'}</p>
                  </div>
                ) : (
                  <div className="relative rounded-xl border border-border-light overflow-hidden group bg-gray-50 flex items-center justify-center p-4">
                    <img 
                      src={imagePreview || existingImage} 
                      alt="Preview" 
                      className="max-h-40 object-contain rounded" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        type="button" 
                        onClick={removeImage}
                        className="bg-white text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors flex items-center gap-2 px-4 shadow-lg text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        {isAr ? 'إزالة الصورة' : 'Remove Image'}
                      </button>
                    </div>
                  </div>
                )}
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
              </div>
              <div className="flex items-center gap-2 mt-4 pt-2">
                <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 text-brand accent-brand cursor-pointer" />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">{isAr ? 'نشط (يظهر للمستخدمين)' : 'Active (visible to users)'}</label>
              </div>
              <div className="pt-6 flex justify-end gap-3 border-t border-border-light mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50">{isAr ? 'إلغاء' : 'Cancel'}</button>
                <button type="submit" disabled={submitting || (!imageFile && !existingImage)} className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 disabled:opacity-50 flex items-center font-medium">
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
