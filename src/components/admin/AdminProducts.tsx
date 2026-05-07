import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Edit, Trash2, Plus, Image as ImageIcon, Loader2, X, AlertTriangle, UploadCloud, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CategoryRef {
  id: string;
  titleEn: string;
  titleAr: string;
}

interface Product {
  id: string;
  name: string;
  oldPrice: number;
  newPrice: number;
  desc: string;
  isFeatured: boolean;
  images: string[];
  categoryId?: string;
  features?: string[];
}

export default function AdminProducts() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [oldPrice, setOldPrice] = useState<number>(0);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [isFeatured, setIsFeatured] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodSnap, catSnap] = await Promise.all([
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'categories'))
      ]);

      const prods: Product[] = [];
      prodSnap.forEach((doc) => prods.push({ id: doc.id, ...doc.data() } as Product));
      setProducts(prods);

      const cats: CategoryRef[] = [];
      catSnap.forEach((doc) => cats.push({ id: doc.id, titleEn: doc.data().titleEn, titleAr: doc.data().titleAr } as CategoryRef));
      setCategories(cats);

    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const prods: Product[] = [];
    querySnapshot.forEach((doc) => prods.push({ id: doc.id, ...doc.data() } as Product));
    setProducts(prods);
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setName(product.name || '');
      setDesc(product.desc || '');
      setOldPrice(product.oldPrice || 0);
      setNewPrice(product.newPrice || 0);
      setIsFeatured(product.isFeatured || false);
      setCategoryId(product.categoryId || '');
      setFeatures(product.features || []);
      setExistingImages(product.images || []);
      setImageFiles([]);
    } else {
      setEditingId(null);
      setName('');
      setDesc('');
      setOldPrice(0);
      setNewPrice(0);
      setIsFeatured(false);
      setCategoryId('');
      setFeatures([]);
      setExistingImages([]);
      setImageFiles([]);
    }
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeNewFile = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    const updated = [...existingImages];
    updated.splice(index, 1);
    setExistingImages(updated);
  };

  const updateFeature = (index: number, val: string) => {
    const newFeatures = [...features];
    newFeatures[index] = val;
    setFeatures(newFeatures);
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...features];
    newFeatures.splice(index, 1);
    setFeatures(newFeatures);
  };

  const addFeature = () => {
    setFeatures([...features, '']);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let finalImages = [...existingImages];

      // Upload new images if added
      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(async (file) => {
          const imageRef = ref(storage, `products/${Date.now()}_${file.name}`);
          const snapshot = await uploadBytes(imageRef, file);
          return await getDownloadURL(snapshot.ref);
        });
        const newImageUrls = await Promise.all(uploadPromises);
        finalImages = [...finalImages, ...newImageUrls];
      }

      const productData = {
        name,
        desc,
        oldPrice: Number(oldPrice),
        newPrice: Number(newPrice),
        isFeatured,
        categoryId,
        features: features.filter(f => f.trim() !== ''),
        images: finalImages,
      };

      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), productData);
        if (isFeatured) {
          const batch = writeBatch(db);
          products.forEach(p => {
            if (p.id !== editingId) batch.update(doc(db, 'products', p.id), { isFeatured: false });
          });
          await batch.commit();
        }
      } else {
        const newDoc = await addDoc(collection(db, 'products'), productData);
        if (isFeatured) {
          const batch = writeBatch(db);
          products.forEach(p => batch.update(doc(db, 'products', p.id), { isFeatured: false }));
          await batch.commit();
        }
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product: ", error);
      alert(isAr ? "حدث خطأ أثناء الحفظ" : "Error saving product");
    } finally {
      setSubmitting(false);
    }
  };

  const executeDelete = async () => {
    if (deleteConfirmId) {
      setSubmitting(true);
      try {
        await deleteDoc(doc(db, 'products', deleteConfirmId));
        fetchProducts();
      } catch (error) {
         console.error("Error deleting: ", error);
      } finally {
        setSubmitting(false);
        setDeleteConfirmId(null);
      }
    }
  };

  const setFeatured = async (productId: string) => {
    try {
      const batch = writeBatch(db);
      products.forEach(p => {
        batch.update(doc(db, 'products', p.id), { isFeatured: p.id === productId });
      });
      await batch.commit();
      fetchProducts();
    } catch (error) {
      console.error('Error setting featured:', error);
    }
  };

  const getCategoryName = (id?: string) => {
    if (!id) return '-';
    const cat = categories.find(c => c.id === id);
    if (!cat) return '-';
    return isAr ? cat.titleAr : cat.titleEn;
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-brand" /></div>;

  return (
    <div dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-coffee-dark font-serif">{isAr ? 'المنتجات' : 'Products'}</h3>
        <button 
          onClick={() => openModal()}
          className="bg-brand text-white px-4 py-2 rounded-lg flex items-center hover:bg-brand/90 transition-colors"
        >
          <Plus className="w-4 h-4 me-2" /> {isAr ? 'إضافة منتج' : 'Add Product'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden">
        <table className="w-full text-start border-collapse">
          <thead>
            <tr className="bg-coffee-light/50 border-b border-border-light text-coffee-muted text-sm uppercase">
              <th className="p-4 text-start font-medium">{isAr ? 'صورة' : 'Image'}</th>
              <th className="p-4 text-start font-medium">{isAr ? 'الاسم' : 'Name'}</th>
              <th className="p-4 text-start font-medium">{isAr ? 'القسم' : 'Category'}</th>
              <th className="p-4 text-start font-medium">{isAr ? 'السعر' : 'Price'}</th>
              <th className="p-4 text-center font-medium">{isAr ? 'مميز' : 'Featured'}</th>
              <th className="p-4 text-end font-medium">{isAr ? 'إجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {products.map(prod => (
              <tr key={prod.id} className="border-b border-border-light last:border-0 hover:bg-coffee-light/30">
                <td className="p-4">
                  {prod.images && prod.images.length > 0 ? (
                    <img src={prod.images[0]} alt={prod.name} className="w-12 h-12 rounded object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                </td>
                <td className="p-4 font-medium text-coffee-dark">
                  {prod.name}
                  {prod.desc && <p className="text-xs text-gray-500 font-normal truncate max-w-[150px]">{prod.desc}</p>}
                </td>
                <td className="p-4 text-coffee-dark text-sm">
                  {getCategoryName(prod.categoryId)}
                </td>
                <td className="p-4 text-coffee-dark">
                  <span className="font-bold">{prod.newPrice} {isAr ? 'رس' : 'SAR'}</span>
                  {prod.oldPrice > 0 && <span className="text-gray-400 line-through text-xs ms-2">{prod.oldPrice} {isAr ? 'رس' : 'SAR'}</span>}
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => setFeatured(prod.id)}
                    title={prod.isFeatured ? (isAr ? 'منتج مميز حالياً' : 'Currently featured') : (isAr ? 'تعيين كمنتج مميز' : 'Set as featured')}
                    className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-colors ${
                      prod.isFeatured
                        ? 'bg-amber-100 text-amber-500 cursor-default'
                        : 'bg-gray-100 text-gray-400 hover:bg-amber-100 hover:text-amber-500'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${prod.isFeatured ? 'fill-amber-400' : ''}`} />
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openModal(prod)} className="text-blue-500 hover:text-blue-700 p-2"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteConfirmId(prod.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-coffee-muted">{isAr ? 'لا توجد منتجات' : 'No products found.'}</td>
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
            <p className="text-coffee-muted font-sans mb-6">{isAr ? 'هل أنت متأكد أنك تريد حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this product? This action cannot be undone.'}</p>
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
                  ? (isAr ? 'تعديل المنتج' : 'Edit Product') 
                  : (isAr ? 'إضافة منتج' : 'Add Product')}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'الاسم' : 'Name'}</label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border border-border-light rounded-lg focus:border-brand outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'القسم' : 'Category'}</label>
                  <select required value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full p-2 border border-border-light rounded-lg focus:border-brand outline-none bg-white">
                    <option value="">{isAr ? 'اختر القسم' : 'Select Category'}</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{isAr ? c.titleAr : c.titleEn}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'الوصف' : 'Description'}</label>
                <textarea rows={3} value={desc} onChange={e => setDesc(e.target.value)} className="w-full p-2 border border-border-light rounded-lg focus:border-brand outline-none"></textarea>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">{isAr ? 'المميزات / الخصائص' : 'Features / Highlights'}</label>
                  <button type="button" onClick={addFeature} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded flex items-center">
                    <Plus className="w-3 h-3 me-1" /> {isAr ? 'إضافة ميزة' : 'Add Feature'}
                  </button>
                </div>
                <div className="space-y-2">
                  {features.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={f} 
                        onChange={(e) => updateFeature(idx, e.target.value)} 
                        className="w-full p-2 border border-border-light rounded-lg focus:border-brand outline-none text-sm"
                        placeholder={isAr ? 'مثال: 100% طبيعي' : 'e.g. 100% Organic'}
                      />
                      <button type="button" onClick={() => removeFeature(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {features.length === 0 && (
                    <p className="text-xs text-gray-400 italic">{isAr ? 'لا توجد مميزات مضافة' : 'No features added yet.'}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'السعر القديم (SAR)' : 'Old Price (SAR)'}</label>
                  <input type="number" step="0.01" value={oldPrice} onChange={e => setOldPrice(parseFloat(e.target.value))} className="w-full p-2 border border-border-light rounded-lg focus:border-brand outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'السعر الجديد (SAR)' : 'New Price (SAR)'}</label>
                  <input required type="number" step="0.01" value={newPrice} onChange={e => setNewPrice(parseFloat(e.target.value))} className="w-full p-2 border border-border-light rounded-lg focus:border-brand outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{isAr ? 'الصور' : 'Images'}</label>
                
                {/* Modern Image Upload Zone */}
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors mb-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="w-8 h-8 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-coffee-dark mb-1">{isAr ? 'اضغط لرفع صور متعددة' : 'Click to upload multiple images'}</p>
                  <p className="text-xs text-gray-500">{isAr ? 'PNG, JPG حتى 5 ميجابايت' : 'PNG, JPG up to 5MB'}</p>
                </div>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  ref={fileInputRef}
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                
                {/* Image Previews */}
                {(existingImages.length > 0 || imageFiles.length > 0) && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {/* Existing Images */}
                    {existingImages.map((img, idx) => (
                      <div key={`existing-${idx}`} className="relative group rounded-lg overflow-hidden border border-border-light bg-gray-50 aspect-square flex items-center justify-center">
                        <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            type="button" 
                            onClick={() => removeExistingImage(idx)}
                            className="bg-white text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors shadow-sm"
                            title={isAr ? 'حذف' : 'Remove'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {/* New Selected Images */}
                    {imageFiles.map((file, idx) => (
                      <div key={`new-${idx}`} className="relative group rounded-lg overflow-hidden border border-brand/30 bg-gray-50 aspect-square flex items-center justify-center">
                        <img src={URL.createObjectURL(file)} alt={`New file ${idx}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            type="button" 
                            onClick={() => removeNewFile(idx)}
                            className="bg-white text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors shadow-sm"
                            title={isAr ? 'حذف' : 'Remove'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="absolute top-1 right-1 bg-brand text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm font-medium z-10">
                          {isAr ? 'جديد' : 'New'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4 pt-2">
                <input type="checkbox" id="isFeatured" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="w-4 h-4 text-brand accent-brand cursor-pointer" />
                <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700 cursor-pointer">{isAr ? 'منتج مميز' : 'Featured Product'}</label>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-border-light mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50">{isAr ? 'إلغاء' : 'Cancel'}</button>
                <button type="submit" disabled={submitting} className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 disabled:opacity-50 flex items-center font-medium">
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
