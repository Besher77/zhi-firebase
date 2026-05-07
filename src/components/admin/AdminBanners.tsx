import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Edit, Trash2, Plus, Loader2, X, AlertTriangle, UploadCloud, GripVertical, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Banner {
  id: string;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  btnTextEn: string;
  btnTextAr: string;
  btnLink: string;
  image: string;
  enabled: boolean;
  order: number;
}

const emptyBanner = (): Omit<Banner, 'id'> => ({
  titleEn: '', titleAr: '',
  subtitleEn: '', subtitleAr: '',
  btnTextEn: '', btnTextAr: '',
  btnLink: '',
  image: '',
  enabled: true,
  order: 0,
});

export default function AdminBanners() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyBanner());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'banners'), orderBy('order', 'asc')));
      const data: Banner[] = [];
      snap.forEach(d => data.push({ id: d.id, ...d.data() } as Banner));
      setBanners(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (banner?: Banner) => {
    if (banner) {
      setEditingId(banner.id);
      setForm({
        titleEn: banner.titleEn || '',
        titleAr: banner.titleAr || '',
        subtitleEn: banner.subtitleEn || '',
        subtitleAr: banner.subtitleAr || '',
        btnTextEn: banner.btnTextEn || '',
        btnTextAr: banner.btnTextAr || '',
        btnLink: banner.btnLink || '',
        image: banner.image || '',
        enabled: banner.enabled !== false,
        order: banner.order || 0,
      });
      setImagePreview(banner.image || '');
    } else {
      setEditingId(null);
      setForm({ ...emptyBanner(), order: banners.length });
      setImagePreview('');
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let imageUrl = form.image;
      if (imageFile) {
        const imageRef = ref(storage, `banners/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }
      const data = { ...form, image: imageUrl };
      if (editingId) {
        await updateDoc(doc(db, 'banners', editingId), data);
      } else {
        await addDoc(collection(db, 'banners'), data);
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (err) {
      console.error(err);
      alert(isAr ? 'حدث خطأ أثناء الحفظ' : 'Error saving banner');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleEnabled = async (banner: Banner) => {
    await updateDoc(doc(db, 'banners', banner.id), { enabled: !banner.enabled });
    fetchBanners();
  };

  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    setSubmitting(true);
    try {
      await deleteDoc(doc(db, 'banners', deleteConfirmId));
      fetchBanners();
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); setDeleteConfirmId(null); }
  };

  const field = (key: keyof Omit<Banner, 'id'>) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm(f => ({ ...f, [key]: e.target.value }));

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-brand" /></div>;

  return (
    <div dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-coffee-dark font-serif">{isAr ? 'بانرات الصفحة الرئيسية' : 'Hero Banners'}</h3>
        <button onClick={() => openModal()} className="bg-brand text-white px-4 py-2 rounded-lg flex items-center hover:bg-brand/90 transition-colors">
          <Plus className="w-4 h-4 me-2" /> {isAr ? 'إضافة بانر' : 'Add Banner'}
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-light p-16 text-center text-coffee-muted">
          {isAr ? 'لا توجد بانرات. أضف بانراً جديداً.' : 'No banners yet. Add your first banner.'}
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-xl border border-border-light overflow-hidden flex items-center gap-4 p-3 shadow-sm">
              <GripVertical className="w-5 h-5 text-gray-300 shrink-0 cursor-grab" />
              <div className="w-24 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {banner.image ? (
                  <img src={banner.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-coffee-dark truncate">{isAr ? banner.titleAr : banner.titleEn}</p>
                <p className="text-xs text-coffee-muted truncate">{isAr ? banner.subtitleAr : banner.subtitleEn}</p>
                {banner.btnLink && <p className="text-xs text-brand truncate mt-0.5">{banner.btnLink}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleEnabled(banner)}
                  className={`p-2 rounded-lg transition-colors ${banner.enabled ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 bg-gray-100 hover:bg-gray-200'}`}
                  title={banner.enabled ? (isAr ? 'مفعّل' : 'Enabled') : (isAr ? 'معطّل' : 'Disabled')}
                >
                  {banner.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => openModal(banner)} className="text-blue-500 hover:text-blue-700 p-2"><Edit className="w-4 h-4" /></button>
                <button onClick={() => setDeleteConfirmId(banner.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[120] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-coffee-dark mb-2 font-serif">{isAr ? 'تأكيد الحذف' : 'Confirm Delete'}</h3>
            <p className="text-coffee-muted mb-6 text-sm">{isAr ? 'هل أنت متأكد من حذف هذا البانر؟' : 'Are you sure you want to delete this banner?'}</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50">{isAr ? 'إلغاء' : 'Cancel'}</button>
              <button onClick={executeDelete} disabled={submitting} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center">
                {submitting && <Loader2 className="w-4 h-4 animate-spin me-2" />}
                {isAr ? 'حذف' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-border-light flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold font-serif">{editingId ? (isAr ? 'تعديل البانر' : 'Edit Banner') : (isAr ? 'إضافة بانر' : 'Add Banner')}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{isAr ? 'صورة البانر' : 'Banner Image'}</label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors relative"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <UploadCloud className="w-8 h-8 text-white" />
                        <span className="text-white text-sm ms-2">{isAr ? 'تغيير الصورة' : 'Change Image'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 flex flex-col items-center justify-center">
                      <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-coffee-dark">{isAr ? 'اضغط لرفع صورة' : 'Click to upload image'}</p>
                      <p className="text-xs text-gray-400 mt-1">{isAr ? 'PNG, JPG — يُنصح بـ 1920×900' : 'PNG, JPG — recommended 1920×900'}</p>
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              </div>

              {/* Titles */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title (EN)</label>
                  <input type="text" value={form.titleEn} onChange={field('titleEn')} className="w-full p-2 border border-border-light rounded-lg focus:border-brand outline-none" placeholder="Start Your Day" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">العنوان (AR)</label>
                  <input type="text" value={form.titleAr} onChange={field('titleAr')} className="w-full p-2 border border-border-light rounded-lg focus:border-brand outline-none text-right" placeholder="ابدأ يومك" dir="rtl" />
                </div>
              </div>

              {/* Subtitles */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (EN)</label>
                  <input type="text" value={form.subtitleEn} onChange={field('subtitleEn')} className="w-full p-2 border border-border-light rounded-lg focus:border-brand outline-none" placeholder="New Collection" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">العنوان الفرعي (AR)</label>
                  <input type="text" value={form.subtitleAr} onChange={field('subtitleAr')} className="w-full p-2 border border-border-light rounded-lg focus:border-brand outline-none text-right" placeholder="تشكيلة جديدة" dir="rtl" />
                </div>
              </div>

              {/* Button Text */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Text (EN)</label>
                  <input type="text" value={form.btnTextEn} onChange={field('btnTextEn')} className="w-full p-2 border border-border-light rounded-lg focus:border-brand outline-none" placeholder="Explore Now" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نص الزر (AR)</label>
                  <input type="text" value={form.btnTextAr} onChange={field('btnTextAr')} className="w-full p-2 border border-border-light rounded-lg focus:border-brand outline-none text-right" placeholder="استكشف الآن" dir="rtl" />
                </div>
              </div>

              {/* Button Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'رابط الزر' : 'Button Link'}</label>
                <input type="text" value={form.btnLink} onChange={field('btnLink')} className="w-full p-2 border border-border-light rounded-lg focus:border-brand outline-none" placeholder="/shop or https://..." />
              </div>

              {/* Order & Enabled */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'الترتيب' : 'Order'}</label>
                  <input type="number" min={0} value={form.order} onChange={field('order')} className="w-full p-2 border border-border-light rounded-lg focus:border-brand outline-none" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.enabled} onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))} className="w-4 h-4 accent-brand" />
                    <span className="text-sm font-medium text-gray-700">{isAr ? 'مفعّل' : 'Enabled'}</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border-light">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50">{isAr ? 'إلغاء' : 'Cancel'}</button>
                <button type="submit" disabled={submitting} className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 disabled:opacity-50 flex items-center font-medium">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin me-2" />}
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
