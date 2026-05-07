import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, query, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Loader2, Package, Search, ChevronDown, Check, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STATUS_OPTIONS = [
  { id: 'placed', ar: 'تم الأرسال', en: 'Placed', color: 'bg-blue-100 text-blue-700' },
  { id: 'preparing', ar: 'قيد التجيهز', en: 'Preparing', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'ready', ar: 'تم التجهيز', en: 'Ready', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'shipping', ar: 'قيد الشحن', en: 'Shipping', color: 'bg-purple-100 text-purple-700' },
  { id: 'shipped', ar: 'تم الشحن', en: 'Shipped', color: 'bg-pink-100 text-pink-700' },
  { id: 'delivered', ar: 'تم التوصيل', en: 'Delivered', color: 'bg-green-100 text-green-700' },
  { id: 'cancelled', ar: 'ملغي', en: 'Cancelled', color: 'bg-red-100 text-red-700' }
];

export default function AdminOrders() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [visibleDropdown, setVisibleDropdown] = useState<string | null>(null);

  // Calculate order counts by status
  const getOrderCounts = () => {
    const counts: Record<string, number> = { all: orders.length };
    STATUS_OPTIONS.forEach(status => {
      counts[status.id] = orders.filter(o => o.status === status.id).length;
    });
    return counts;
  };
  const orderCounts = getOrderCounts();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setOrders(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    setVisibleDropdown(null);
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const shareOrder = (order: any) => {
    const addr = order.address || {};
    const lat = addr.lat;
    const lng = addr.lng;
    const mapUrl = lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : null;
    const lines = [
      `🛵 *طلب جديد للتوصيل*`,
      `━━━━━━━━━━━━━━━`,
      `📦 *رقم الطلب:* #${order.id.substring(0, 8).toUpperCase()}`,
      ``,
      `👤 *بيانات العميل*`,
      `• الاسم: ${addr.name || order.address?.name || '-'}`,
      `• الهاتف: ${addr.phone ? `+966${addr.phone}` : '-'}`,
      ``,
      `📍 *عنوان التوصيل*`,
      `• المدينة: ${addr.city === 'taif' ? 'الطائف' : addr.city || '-'}`,
      `• الشارع: ${addr.street || '-'}`,
      addr.neighborhood ? `• الحي: ${addr.neighborhood}` : null,
      addr.building ? `• المبنى: ${addr.building}` : null,
      addr.postalCode ? `• الرمز البريدي: ${addr.postalCode}` : null,
      mapUrl ? `• 🗺️ الموقع: ${mapUrl}` : null,
      ``,
      `🚚 *شركة الشحن:* ${order.courier?.name || '-'}`,
      `💰 *الإجمالي:* ${order.total} ريال`,
      `━━━━━━━━━━━━━━━`,
    ].filter(Boolean).join('\n');
    const encoded = encodeURIComponent(lines);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (o.paymentId && o.paymentId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-brand" /></div>;

  return (
    <div dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-coffee-dark">{isAr ? 'إدارة الطلبات' : 'Order Management'}</h2>
          <p className="text-sm text-coffee-muted">{isAr ? 'تحديث ومتابعة حالات جميع الطلبات في المتجر' : 'Track and update fulfillment statuses for all orders'}</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={isAr ? 'بحث برقم الطلب...' : 'Search by Order ID...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full ps-10 pe-4 py-2 border border-border-light rounded-xl outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all font-sans text-sm bg-white"
            />
          </div>
        </div>
      </div>

      {/* Status Filter Badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            filterStatus === 'all' 
              ? 'bg-coffee-dark text-white' 
              : 'bg-gray-100 text-coffee-muted hover:bg-gray-200'
          }`}
        >
          {isAr ? 'الكل' : 'All'}
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            filterStatus === 'all' ? 'bg-white/20' : 'bg-brand/10 text-brand'
          }`}>
            {orderCounts.all || 0}
          </span>
        </button>
        {STATUS_OPTIONS.map(status => (
          <button
            key={status.id}
            onClick={() => setFilterStatus(status.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              filterStatus === status.id 
                ? `${status.color} ring-2 ring-offset-1 ring-${status.color.split(' ')[0].replace('bg-', '').replace('100', '300')}` 
                : 'bg-gray-100 text-coffee-muted hover:bg-gray-200'
            }`}
          >
            {isAr ? status.ar : status.en}
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              filterStatus === status.id ? 'bg-white/50' : 'bg-brand/10 text-brand'
            }`}>
              {orderCounts[status.id] || 0}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border-light shadow-sm overflow-x-auto min-h-[500px]">
        <table className="w-full text-start border-collapse min-w-[800px]">
           <thead>
             <tr className="bg-gray-50 border-b border-border-light text-coffee-muted text-xs uppercase tracking-wider">
               <th className="p-4 font-semibold text-start">{isAr ? 'الطلب / التاريخ' : 'Order / Date'}</th>
               <th className="p-4 font-semibold text-start">{isAr ? 'العميل' : 'Customer'}</th>
               <th className="p-4 font-semibold text-start">{isAr ? 'الإجمالي / الشحن' : 'Total / Shipping'}</th>
               <th className="p-4 font-semibold text-center">{isAr ? 'الحالة الحالية' : 'Current Status'}</th>
               <th className="p-4 font-semibold text-center">{isAr ? 'مشاركة' : 'Share'}</th>
             </tr>
           </thead>
           <tbody>
             {filteredOrders.length === 0 ? (
               <tr><td colSpan={5} className="p-8 text-center text-gray-400">{isAr ? 'لا توجد طلبات' : 'No orders found.'}</td></tr>
             ) : (
               filteredOrders.map(order => {
                  const currentOpt = STATUS_OPTIONS.find(s => s.id === order.status) || STATUS_OPTIONS[0];
                  return (
                    <tr key={order.id} className="border-b border-border-light hover:bg-coffee-light/20 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center shrink-0">
                             <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-coffee-dark font-sans tracking-wide block">#{order.id.substring(0, 8).toUpperCase()}</span>
                            <span className="text-xs text-coffee-muted">
                              {order.createdAt?.toDate().toLocaleString(isAr ? 'ar-SA' : 'en-US')}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-bold block text-coffee-dark">{order.address?.name || 'Default User'}</span>
                        <span className="text-xs text-coffee-muted truncate max-w-[150px] inline-block">{order.address?.street || 'N/A'}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-bold text-brand block">{order.total} {isAr ? 'رس' : 'SAR'}</span>
                        <span className="text-xs text-coffee-muted flex items-center">
                          {order.courier?.name || 'Unknown'} ({(order.shippingCost || 0)} {isAr ? 'رس' : 'SAR'})
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => shareOrder(order)}
                          title={isAr ? 'مشاركة بيانات التوصيل عبر واتساب' : 'Share delivery info via WhatsApp'}
                          className="w-9 h-9 rounded-full bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center mx-auto transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        <div className="relative inline-block text-start w-full max-w-[160px] mx-auto">
                          <button 
                            onClick={() => setVisibleDropdown(visibleDropdown === order.id ? null : order.id)}
                            disabled={updatingId === order.id}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold font-sans border transition-colors ${currentOpt.color} border-${currentOpt.color.split(' ')[0].replace('bg-', '')}`}
                          >
                             {updatingId === order.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (
                               <>
                                 {isAr ? currentOpt.ar : currentOpt.en}
                                 <ChevronDown className="w-4 h-4 ms-2" />
                               </>
                             )}
                          </button>

                          <AnimatePresence>
                            {visibleDropdown === order.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setVisibleDropdown(null)} />
                                <motion.div 
                                  initial={{ opacity: 0, y: -10 }} 
                                  animate={{ opacity: 1, y: 0 }} 
                                  exit={{ opacity: 0, y: -10 }}
                                  className="absolute top-full mt-1 w-48 bg-white border border-border-light shadow-xl rounded-xl z-20 py-1 overflow-hidden"
                                >
                                  {STATUS_OPTIONS.map(opt => (
                                    <button 
                                      key={opt.id}
                                      onClick={() => updateStatus(order.id, opt.id)}
                                      className={`w-full text-start px-4 py-2 text-sm font-bold flex items-center justify-between transition-colors hover:bg-gray-50 ${order.status === opt.id ? 'text-brand bg-brand/5' : 'text-coffee-dark'}`}
                                    >
                                      {isAr ? opt.ar : opt.en}
                                      {order.status === opt.id && <Check className="w-4 h-4" />}
                                    </button>
                                  ))}
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    </tr>
                  );
               })
             )}
           </tbody>
        </table>
      </div>
    </div>
  );
}
