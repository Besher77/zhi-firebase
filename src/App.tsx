import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AuthModal from './components/AuthModal';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import MaintenanceWrapper from './components/MaintenanceWrapper';
import PromoPopup from './components/PromoPopup';

// Pages
import Home from './pages/Home';
import TextPage from './pages/TextPage';
import SearchResults from './pages/SearchResults';
import AdminDashboard from './pages/AdminDashboard';
import Favorites from './pages/Favorites';
import Addresses from './pages/Addresses';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import ReturnExchange from './pages/ReturnExchange';

// Layout for standard pages
const MainLayout = () => (
  <main className="min-h-screen bg-coffee-dark antialiased overflow-x-hidden relative">
    <Navbar />
    <Outlet />
    <Footer />
  </main>
);

export default function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <AuthProvider>
      <CartProvider>
        <PromoPopup />
        <AuthModal />
        <CartDrawer />
        <Routes>
          {/* Admin Route - No Standard Navbar/Footer */}
          <Route path="/admin/*" element={<AdminDashboard />} />

          {/* Regular Routes */}
          <Route element={
            <MaintenanceWrapper>
              <MainLayout />
            </MaintenanceWrapper>
          }>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/help" element={<TextPage titleKey="pages.help" />} />
            <Route path="/shipping" element={<TextPage titleKey="pages.shipping" />} />
            <Route path="/terms" element={<TextPage titleKey="pages.terms" />} />
            <Route path="/refund" element={<TextPage titleKey="pages.refund" />} />
            <Route path="/return-exchange" element={<ReturnExchange />} />
            <Route path="/addresses" element={<Addresses />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
          </Route>
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}
