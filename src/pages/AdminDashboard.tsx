import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Users, ShoppingBag, BarChart3, Settings, LogOut, Menu, X, Package, Ticket, Truck, ImagePlay } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import AdminCategories from '../components/admin/AdminCategories';
import AdminProducts from '../components/admin/AdminProducts';
import AdminCoupons from '../components/admin/AdminCoupons';
import AdminDelivery from '../components/admin/AdminDelivery';
import AdminUsers from '../components/admin/AdminUsers';
import AdminOrders from '../components/admin/AdminOrders';
import AdminOverview from '../components/admin/AdminOverview';
import AdminSettings from '../components/admin/AdminSettings';
import AdminBanners from '../components/admin/AdminBanners';

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  
  // Order counts for badges
  const [orderCounts, setOrderCounts] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipping: 0,
    shipped: 0,
    delivered: 0
  });

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // Fetch order counts
  useEffect(() => {
    const fetchOrderCounts = async () => {
      try {
        const q = query(collection(db, 'orders'));
        const snap = await getDocs(q);
        const orders = snap.docs.map(doc => doc.data());
        
        setOrderCounts({
          total: orders.length,
          pending: orders.filter(o => o.status === 'pending').length,
          processing: orders.filter(o => o.status === 'processing').length,
          shipping: orders.filter(o => o.status === 'shipping').length,
          shipped: orders.filter(o => o.status === 'shipped').length,
          delivered: orders.filter(o => o.status === 'delivered').length
        });
      } catch (err) {
        console.error('Error fetching order counts:', err);
      }
    };
    
    fetchOrderCounts();
    // Refresh every 30 seconds
    const interval = setInterval(fetchOrderCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-coffee-light">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Protected Route Logic
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { id: 'overview', label: t('admin.overview'), icon: BarChart3 },
    { id: 'banners', label: isAr ? 'البانرات' : 'Banners', icon: ImagePlay },
    { id: 'categories', label: t('nav.product') + ' Categories', icon: Package },
    { id: 'products', label: t('admin.products'), icon: Package },
    { id: 'orders', label: t('admin.orders'), icon: ShoppingBag, badge: orderCounts.shipping, badgeColor: 'bg-brand' },
    { id: 'coupons', label: isAr ? 'أكواد الخصم' : 'Coupons', icon: Ticket },
    { id: 'delivery', label: isAr ? 'الشحن والتوصيل' : 'Delivery', icon: Truck },
    { id: 'users', label: t('admin.users'), icon: Users },
    { id: 'settings', label: t('admin.settings'), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-coffee-light flex font-sans">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        className={`fixed inset-y-0 start-0 z-50 w-64 bg-coffee-dark text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'}`}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <h2 className="text-2xl font-serif font-bold text-brand tracking-widest">{t('admin.title')}</h2>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/70 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4 border-b border-white/10">
          <p className="text-sm text-white/50 mb-1">{t('admin.loggedInAs')}</p>
          <p className="font-bold">{user.name}</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-brand text-white font-bold' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <Icon className={`w-5 h-5 me-3 ${isActive ? 'text-white' : 'text-white/70'}`} />
                  {item.label}
                </div>
                {item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${item.badgeColor || 'bg-white/20'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
          
          {/* Order Status Sub-badges */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-3 px-3">
              {isAr ? 'حالات الطلب' : 'Order Status'}
            </p>
            {orderCounts.pending > 0 && (
              <div className="flex items-center justify-between px-3 py-2 text-sm text-white/60">
                <span>{isAr ? 'معلق' : 'Pending'}</span>
                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold">
                  {orderCounts.pending}
                </span>
              </div>
            )}
            {orderCounts.processing > 0 && (
              <div className="flex items-center justify-between px-3 py-2 text-sm text-white/60">
                <span>{isAr ? 'قيد المعالجة' : 'Processing'}</span>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold">
                  {orderCounts.processing}
                </span>
              </div>
            )}
            {orderCounts.shipped > 0 && (
              <div className="flex items-center justify-between px-3 py-2 text-sm text-white/60">
                <span>{isAr ? 'تم الشحن' : 'Shipped'}</span>
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs font-bold">
                  {orderCounts.shipped}
                </span>
              </div>
            )}
          </div>
        </nav>

        <div className="p-4 mt-auto border-t border-white/10">
          <button 
            onClick={logout}
            className="w-full flex items-center p-3 text-red-400 hover:bg-red-400/10 hover:text-red-300 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5 me-3" />
            {t('admin.signOut')}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar for Mobile */}
        <header className="bg-white px-6 py-4 border-b border-border-light flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="me-4 text-coffee-dark lg:hidden hover:text-brand"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-coffee-dark hidden sm:block font-serif">
              {navItems.find(i => i.id === activeTab)?.label}
            </h1>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
          
          {/* Main Area based on Tab */}
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`bg-white rounded-2xl shadow-sm border border-border-light ${activeTab === 'overview' || activeTab === 'settings' ? 'p-6 min-h-[400px]' : 'p-4 md:p-8'}`}
          >
            {activeTab === 'overview' ? (
              <AdminOverview />
            ) : activeTab === 'banners' ? (
              <AdminBanners />
            ) : activeTab === 'categories' ? (
              <AdminCategories />
            ) : activeTab === 'products' ? (
              <AdminProducts />
            ) : activeTab === 'coupons' ? (
              <AdminCoupons />
            ) : activeTab === 'delivery' ? (
              <AdminDelivery />
            ) : activeTab === 'users' ? (
              <AdminUsers />
            ) : activeTab === 'orders' ? (
              <AdminOrders />
            ) : activeTab === 'settings' ? (
              <AdminSettings />
            ) : (
              <>
                <h2 className="text-xl font-bold text-coffee-dark mb-4 border-b border-border-light pb-4 font-serif">
                  {navItems.find(i => i.id === activeTab)?.label} - {t('admin.management')}
                </h2>
                
                <div className="text-center text-coffee-muted py-20 flex flex-col items-center">
                  <Package className="w-16 h-16 mx-auto mb-4 text-brand/50" />
                  <p className="text-lg font-serif font-bold text-coffee-dark mb-2">{t('admin.underConstruction')}</p>
                  <p className="text-sm font-sans max-w-sm mx-auto">
                    {t('admin.functionalList', { module: navItems.find(i => i.id === activeTab)?.label })}
                  </p>
                </div>
              </>
            )}
          </motion.div>

        </div>
      </main>

    </div>
  );
}
