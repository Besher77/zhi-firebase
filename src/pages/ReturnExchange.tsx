import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { RefreshCcw, Package, Clock, ShieldCheck, AlertCircle, Phone, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ReturnExchange() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [contactEmail, setContactEmail] = useState('support@zhicoffee.sa');
  const [contactPhone, setContactPhone] = useState('+966 50 000 0000');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.contactEmail) setContactEmail(data.contactEmail);
          if (data.contactPhone) setContactPhone(data.contactPhone);
        }
      } catch (err) {
        console.error("Error fetching settings", err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <section className="bg-coffee-light pt-32 pb-20 min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <RefreshCcw className="w-8 h-8 text-brand" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-coffee-dark mb-4">
              {isAr ? 'سياسة الاستبدال والاسترجاع' : 'Return & Exchange Policy'}
            </h1>
            <p className="text-coffee-muted text-lg max-w-2xl mx-auto">
              {isAr 
                ? 'نحن نسعى جاهدين لضمان رضاكم الكامل. إليك كافة التفاصيل حول كيفية استبدال أو استرجاع منتجاتكم.'
                : 'We strive to ensure your complete satisfaction. Here are all the details on how to exchange or return your products.'}
            </p>
          </div>

          {/* Contact Info Banner */}
          <div className="bg-coffee-dark text-white rounded-2xl p-6 mb-12">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand" />
                <span className="font-medium">{contactPhone}</span>
              </div>
              <div className="hidden md:block w-px h-6 bg-white/20"></div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand" />
                <span className="font-medium">{contactEmail}</span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Return Conditions */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-6 h-6 text-brand" />
                <h2 className="text-xl font-bold text-coffee-dark">
                  {isAr ? 'شروط الاسترجاع' : 'Return Conditions'}
                </h2>
              </div>
              <ul className="space-y-4 text-coffee-muted">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-brand rounded-full mt-2 shrink-0"></span>
                  <span>{isAr 
                    ? 'يجب أن يكون المنتج في حالته الأصلية وغير مستخدم' 
                    : 'Product must be in original condition and unused'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-brand rounded-full mt-2 shrink-0"></span>
                  <span>{isAr 
                    ? 'العبوة الأصلية سليمة وغير مفتوحة (للأغذية والمشروبات)' 
                    : 'Original packaging intact and unopened (for food & beverages)'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-brand rounded-full mt-2 shrink-0"></span>
                  <span>{isAr 
                    ? 'إرفاق الفاتورة الأصلية أو إثبات الشراء' 
                    : 'Include original invoice or proof of purchase'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-brand rounded-full mt-2 shrink-0"></span>
                  <span>{isAr 
                    ? 'طلب الاسترجاع خلال 14 يوماً من تاريخ الاستلام' 
                    : 'Request return within 14 days of receiving the order'}</span>
                </li>
              </ul>
            </div>

            {/* Exchange Conditions */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6 text-brand" />
                <h2 className="text-xl font-bold text-coffee-dark">
                  {isAr ? 'شروط الاستبدال' : 'Exchange Conditions'}
                </h2>
              </div>
              <ul className="space-y-4 text-coffee-muted">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-brand rounded-full mt-2 shrink-0"></span>
                  <span>{isAr 
                    ? 'الاستبدال متاح فقط للمنتجات ذات عيب مصنعي' 
                    : 'Exchange available only for products with manufacturing defects'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-brand rounded-full mt-2 shrink-0"></span>
                  <span>{isAr 
                    ? 'يجب إبلاغنا بالعيب خلال 48 ساعة من الاستلام' 
                    : 'Must report defect within 48 hours of receiving'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-brand rounded-full mt-2 shrink-0"></span>
                  <span>{isAr 
                    ? 'توفير صور واضحة للمنتج المعيب' 
                    : 'Provide clear photos of the defective product'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-brand rounded-full mt-2 shrink-0"></span>
                  <span>{isAr 
                    ? 'الاستبدال بمنتج مماثل أو استرداد المبلغ' 
                    : 'Exchange for similar product or full refund'}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-brand" />
              <h2 className="text-xl font-bold text-coffee-dark">
                {isAr ? 'مدة معالجة الطلب' : 'Processing Timeline'}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-coffee-light/50 rounded-xl">
                <div className="text-3xl font-bold text-brand mb-2">24-48h</div>
                <p className="text-sm text-coffee-muted">
                  {isAr ? 'الرد على طلب الاسترجاع' : 'Response to return request'}
                </p>
              </div>
              <div className="text-center p-4 bg-coffee-light/50 rounded-xl">
                <div className="text-3xl font-bold text-brand mb-2">3-5 days</div>
                <p className="text-sm text-coffee-muted">
                  {isAr ? 'استلام المنتج وفحصه' : 'Receiving and inspecting product'}
                </p>
              </div>
              <div className="text-center p-4 bg-coffee-light/50 rounded-xl">
                <div className="text-3xl font-bold text-brand mb-2">7-14 days</div>
                <p className="text-sm text-coffee-muted">
                  {isAr ? 'استرداد المبلغ أو الاستبدال' : 'Refund or exchange completion'}
                </p>
              </div>
            </div>
          </div>

          {/* Non-Returnable Items */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-amber-800 mb-2">
                  {isAr ? 'منتجات لا يمكن استرجاعها' : 'Non-Returnable Items'}
                </h3>
                <p className="text-amber-700 text-sm">
                  {isAr 
                    ? 'المنتجات المفتوحة أو المستخدمة، المشروبات والأغذية بعد فتح العبوة، البطاقات الرقمية، والمنتجات المخصصة حسب الطلب.'
                    : 'Opened or used products, beverages and food after opening packaging, digital cards, and customized/personalized items.'}
                </p>
              </div>
            </div>
          </div>

          {/* Commercial Registration */}
          <div className="text-center text-coffee-muted text-sm">
            <p className="mb-2">
              {isAr ? 'السجل التجاري: ' : 'Commercial Registration: '}
              <span className="font-bold text-coffee-dark">1234567890</span>
            </p>
            <p>{isAr 
              ? 'متجر ZHI Coffee - متجر إلكتروني مرخص من وزارة التجارة السعودية'
              : 'ZHI Coffee Store - Licensed E-Commerce by Saudi Ministry of Commerce'}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
