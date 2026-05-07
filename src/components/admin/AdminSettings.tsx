import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { db, storage } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Settings, ShieldAlert, CheckCircle2, Save, Image as ImageIcon, UploadCloud, Loader2, Globe, Plus, Trash2, Facebook, Twitter, Instagram, Youtube, Linkedin, Mail, Phone } from 'lucide-react';

export default function AdminSettings() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [popupEnabled, setPopupEnabled] = useState(false);
  const [popupImage, setPopupImage] = useState('');
  const [popupLink, setPopupLink] = useState('');
  const [popupTitle, setPopupTitle] = useState('');
  const [popupDesc, setPopupDesc] = useState('');
  const [popupButtonText, setPopupButtonText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Social Media State
  const [socialLinks, setSocialLinks] = useState<{id: string, platform: string, url: string, icon: string}[]>([]);
  const [newPlatform, setNewPlatform] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newIcon, setNewIcon] = useState('globe');

  // Contact Info State
  const [contactEmail, setContactEmail] = useState('support@zhicoffee.sa');
  const [contactPhone, setContactPhone] = useState('+966 50 000 0000');
  const [storyVideoUrl, setStoryVideoUrl] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setMaintenanceMode(data.maintenanceMode === true);
          setPopupEnabled(data.popupEnabled === true);
          setPopupImage(data.popupImage || '');
          setPopupLink(data.popupLink || '');
          setPopupTitle(data.popupTitle || '');
          setPopupDesc(data.popupDesc || '');
          setPopupButtonText(data.popupButtonText || '');
        setSocialLinks(data.socialLinks || []);
        setContactEmail(data.contactEmail || 'support@zhicoffee.sa');
        setContactPhone(data.contactPhone || '+966 50 000 0000');
        setStoryVideoUrl(data.storyVideoUrl || '');
        }
      } catch (err) {
        console.error("Error fetching settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      let finalImageUrl = popupImage;

      if (imageFile) {
        const imageRef = ref(storage, `settings/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, imageFile);
        finalImageUrl = await getDownloadURL(snapshot.ref);
        setPopupImage(finalImageUrl);
        setImageFile(null);
      }

      await setDoc(doc(db, 'settings', 'general'), {
        maintenanceMode,
        popupEnabled,
        popupImage: finalImageUrl,
        popupLink,
        popupTitle,
        popupDesc,
        popupButtonText,
        socialLinks,
        contactEmail,
        contactPhone,
        storyVideoUrl
      }, { merge: true });
      setMessage(isAr ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
    } catch (err) {
      console.error(err);
      setMessage(isAr ? 'حدث خطأ أثناء الحفظ' : 'Error saving settings');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">{isAr ? 'جاري التحميل...' : 'Loading...'}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 border-b border-border-light pb-4">
        <h2 className="text-2xl font-serif font-bold text-coffee-dark flex items-center">
          <Settings className="w-6 h-6 me-3 text-brand" />
          {t('admin.settings')}
        </h2>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-6 py-2.5 bg-coffee-dark text-white rounded-lg hover:bg-brand transition-colors font-bold disabled:opacity-50 text-sm"
        >
          <Save className="w-4 h-4 me-2" />
          {saving ? '...' : (isAr ? 'حفظ التغييرات' : 'Save Changes')}
        </button>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl flex items-center bg-green-50 text-green-700 border border-green-100"
        >
          <CheckCircle2 className="w-5 h-5 me-2" />
          {message}
        </motion.div>
      )}

      <div className="space-y-6 max-w-3xl">
        {/* Global System Settings */}
        <div className="bg-gray-50 border border-border-light rounded-2xl p-6">
          <h3 className="text-lg font-bold text-coffee-dark mb-6 flex items-center border-b border-border-light pb-3">
            <ShieldAlert className="w-5 h-5 me-2 text-orange-500" />
            {isAr ? 'إعدادات النظام' : 'System Settings'}
          </h3>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-coffee-dark mb-1">{isAr ? 'وضع الصيانة' : 'Maintenance Mode'}</h4>
              <p className="text-sm text-coffee-muted max-w-md">
                {isAr 
                  ? 'عند تفعيل هذا الخيار، سيتم منع جميع المستخدمين (باستثناء الإدارة) من تصفح الموقع وعرض شاشة الصيانة لهم.' 
                  : 'When enabled, all users (except admins) will be locked out of the site and shown a maintenance screen.'}
              </p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                value="" 
                className="sr-only peer" 
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[100%] rtl:peer-checked:after:-translate-x-[100%] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
        </div>

        {/* Promotional Popup Settings */}
        <div className="bg-gray-50 border border-border-light rounded-2xl p-6">
          <h3 className="text-lg font-bold text-coffee-dark mb-6 flex items-center border-b border-border-light pb-3">
            <ImageIcon className="w-5 h-5 me-2 text-brand" />
            {isAr ? 'إعلان النافذة المنبثقة' : 'Promotional Popup Ad'}
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-coffee-dark mb-1">{isAr ? 'تفعيل الإعلان' : 'Enable Popup Ad'}</h4>
                <p className="text-sm text-coffee-muted max-w-md">
                  {isAr 
                    ? 'عند تفعيل هذا الخيار، سيظهر الإعلان المنبثق لجميع زوار الموقع.' 
                    : 'When enabled, the promotional popup will be shown to all site visitors.'}
                </p>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  value="" 
                  className="sr-only peer" 
                  checked={popupEnabled}
                  onChange={(e) => setPopupEnabled(e.target.checked)}
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[100%] rtl:peer-checked:after:-translate-x-[100%] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand"></div>
              </label>
            </div>

            <div className="space-y-4 pt-4 border-t border-border-light">
              <div>
                <label className="block text-sm font-bold text-coffee-dark mb-2">
                  {isAr ? 'العنوان' : 'Title'}
                </label>
                <input 
                  type="text" 
                  value={popupTitle}
                  onChange={(e) => setPopupTitle(e.target.value)}
                  placeholder={isAr ? 'مثال: عرض خاص!' : 'e.g. Special Offer!'}
                  className="w-full px-4 py-3 bg-white border border-border-light rounded-lg outline-none focus:border-brand transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-coffee-dark mb-2">
                  {isAr ? 'الوصف' : 'Description'}
                </label>
                <textarea 
                  value={popupDesc}
                  onChange={(e) => setPopupDesc(e.target.value)}
                  placeholder={isAr ? 'تفاصيل العرض...' : 'Offer details...'}
                  rows={2}
                  className="w-full px-4 py-3 bg-white border border-border-light rounded-lg outline-none focus:border-brand transition-colors text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-coffee-dark mb-2">
                    {isAr ? 'نص الزر' : 'Button Text'}
                  </label>
                  <input 
                    type="text" 
                    value={popupButtonText}
                    onChange={(e) => setPopupButtonText(e.target.value)}
                    placeholder={isAr ? 'تسوق الآن' : 'Shop Now'}
                    className="w-full px-4 py-3 bg-white border border-border-light rounded-lg outline-none focus:border-brand transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-coffee-dark mb-2">
                    {isAr ? 'الرابط عند الضغط (Link)' : 'Click Link (URL)'}
                  </label>
                  <input 
                    type="text" 
                    value={popupLink}
                    onChange={(e) => setPopupLink(e.target.value)}
                    placeholder="https://example.com/promotion"
                    className="w-full px-4 py-3 bg-white border border-border-light rounded-lg outline-none focus:border-brand transition-colors text-sm"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-coffee-dark mb-2 mt-2">
                  {isAr ? 'صورة الإعلان' : 'Ad Image'}
                </label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors mb-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="w-8 h-8 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-coffee-dark mb-1">{isAr ? 'اضغط لرفع صورة الإعلان' : 'Click to upload ad image'}</p>
                  <p className="text-xs text-gray-500">{isAr ? 'أبعاد مربعة أو طولية (PNG, JPG)' : 'Square or portrait (PNG, JPG)'}</p>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImageFile(e.target.files[0]);
                    }
                  }} 
                  className="hidden" 
                />
                
                {(imageFile || popupImage) && (
                  <div className="mt-3 rounded-xl border border-border-light overflow-hidden bg-white w-full sm:w-64 relative aspect-[4/5] shadow-sm">
                    <img 
                      src={imageFile ? URL.createObjectURL(imageFile) : popupImage} 
                      alt="Ad Preview" 
                      className="w-full h-full object-cover" 
                      onError={(e) => (e.currentTarget.style.display = 'none')} 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Story Video URL */}
        <div className="bg-gray-50 border border-border-light rounded-2xl p-6">
          <h3 className="text-lg font-bold text-coffee-dark mb-4 flex items-center border-b border-border-light pb-3">
            <Settings className="w-5 h-5 me-2 text-purple-500" />
            {isAr ? 'فيديو قسم القصة' : 'Story Section Video'}
          </h3>
          <p className="text-sm text-coffee-muted mb-4">
            {isAr ? 'ضع رابط يوتيوب أو فيميو. سيُشغَّل عند الضغط على زر التشغيل في الصفحة الرئيسية.' : 'Paste a YouTube or Vimeo URL. It will play when the user clicks the play button on the home page.'}
          </p>
          <input
            type="url"
            value={storyVideoUrl}
            onChange={(e) => setStoryVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-4 py-3 bg-white border border-border-light rounded-lg outline-none focus:border-brand transition-colors text-sm"
            dir="ltr"
          />
        </div>

        {/* Contact Info Settings */}
        <div className="bg-gray-50 border border-border-light rounded-2xl p-6">
          <h3 className="text-lg font-bold text-coffee-dark mb-6 flex items-center border-b border-border-light pb-3">
            <Mail className="w-5 h-5 me-2 text-green-500" />
            {isAr ? 'معلومات التواصل' : 'Contact Information'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-coffee-dark mb-2">
                {isAr ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="support@example.com"
                className="w-full px-4 py-3 bg-white border border-border-light rounded-lg outline-none focus:border-brand transition-colors text-sm"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-coffee-dark mb-2">
                {isAr ? 'رقم الهاتف' : 'Phone Number'}
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+966 50 000 0000"
                className="w-full px-4 py-3 bg-white border border-border-light rounded-lg outline-none focus:border-brand transition-colors text-sm"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links Management */}
        <div className="bg-gray-50 border border-border-light rounded-2xl p-6">
          <h3 className="text-lg font-bold text-coffee-dark mb-6 flex items-center border-b border-border-light pb-3">
            <Globe className="w-5 h-5 me-2 text-blue-500" />
            {isAr ? 'روابط التواصل الاجتماعي' : 'Social Media Links'}
          </h3>
          
          <div className="space-y-4">
            {/* Existing Links */}
            {socialLinks.map((link, index) => (
              <div key={link.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-border-light">
                <div className="w-10 h-10 bg-coffee-light rounded-lg flex items-center justify-center">
                  {link.icon === 'facebook' && <Facebook className="w-5 h-5 text-blue-600" />}
                  {link.icon === 'twitter' && <Twitter className="w-5 h-5 text-sky-500" />}
                  {link.icon === 'instagram' && <Instagram className="w-5 h-5 text-pink-600" />}
                  {link.icon === 'youtube' && <Youtube className="w-5 h-5 text-red-600" />}
                  {link.icon === 'linkedin' && <Linkedin className="w-5 h-5 text-blue-700" />}
                  {link.icon === 'globe' && <Globe className="w-5 h-5 text-coffee-dark" />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-coffee-dark text-sm capitalize">{link.platform}</p>
                  <p className="text-xs text-coffee-muted truncate" dir="ltr">{link.url}</p>
                </div>
                <button
                  onClick={() => setSocialLinks(socialLinks.filter((_, i) => i !== index))}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Add New Link Form */}
            <div className="bg-white p-4 rounded-xl border-2 border-dashed border-border-light">
              <h4 className="font-bold text-coffee-dark mb-4 text-sm">
                {isAr ? 'إضافة منصة جديدة' : 'Add New Platform'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-coffee-dark mb-2">
                    {isAr ? 'المنصة' : 'Platform'}
                  </label>
                  <select
                    value={newIcon}
                    onChange={(e) => {
                      setNewIcon(e.target.value);
                      setNewPlatform(e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-gray-50 border border-border-light rounded-lg outline-none focus:border-brand transition-colors text-sm"
                  >
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter / X</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="tiktok">TikTok</option>
                    <option value="snapchat">Snapchat</option>
                    <option value="globe">Other / Website</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-coffee-dark mb-2">
                    {isAr ? 'رابط URL' : 'URL Link'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-3 py-2 bg-gray-50 border border-border-light rounded-lg outline-none focus:border-brand transition-colors text-sm"
                      dir="ltr"
                    />
                    <button
                      onClick={() => {
                        if (newUrl.trim()) {
                          setSocialLinks([...socialLinks, {
                            id: Date.now().toString(),
                            platform: newPlatform || newIcon,
                            url: newUrl,
                            icon: newIcon
                          }]);
                          setNewUrl('');
                          setNewPlatform('');
                          setNewIcon('globe');
                        }
                      }}
                      disabled={!newUrl.trim()}
                      className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-coffee-dark transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {socialLinks.length === 0 && (
              <p className="text-center text-coffee-muted text-sm py-4">
                {isAr ? 'لا توجد روابط مضافة. أضف منصات التواصل الاجتماعي.' : 'No links added. Add your social media platforms.'}
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
