import { Search, User, Heart, Globe, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import logo from '../assets/logo.png';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import React, { useState } from 'react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, openModal } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const navKeys = ['home', 'shop', 'product', 'pages', 'blog'];

  // Check if we're on the home page
  const isHomePage = location.pathname === '/';

  const toggleLang = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className={`${isHomePage ? 'absolute' : 'fixed bg-coffee-dark shadow-lg'} top-0 start-0 w-full z-50 px-8 py-6 flex items-center justify-between text-white`}
    >
      {/* Logo */}
      <div className="flex-1">
        <Link to="/">
          <img src={logo} alt="ZHI Coffee" className="h-12 w-auto object-contain" />
        </Link>
      </div>

      {/* Center Links */}
      <div className="hidden lg:flex items-center space-x-8 rtl:space-x-reverse text-sm font-medium tracking-wide font-sans">
        {navKeys.map((key) => (
          <Link key={key} to="/" className="hover:text-brand transition-colors duration-300 uppercase">
            {t(`nav.${key}`)}
          </Link>
        ))}
      </div>

      {/* Right Icons & Search */}
      <div className="flex-1 flex items-center justify-end space-x-6 rtl:space-x-reverse">
        
        {/* Lang Toggle */}
        <button onClick={toggleLang} className="flex items-center hover:text-brand transition-colors font-sans text-xs font-bold bg-white/10 px-3 py-1.5 rounded-full border border-white/20 hover:bg-white/20">
          <Globe className="w-3.5 h-3.5 me-1.5" />
          {i18n.language === 'en' ? 'عربي' : 'EN'}
        </button>

        <button onClick={() => openModal()} className="flex items-center hover:text-brand transition-colors font-sans text-sm">
          <User className="w-5 h-5" />
          {user && <span className="ms-2 hidden md:block border-s border-white/30 ps-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-24">{user.name.split(' ')[0]}</span>}
        </button>
        <Link to="/favorites" className="hover:text-brand transition-colors">
          <Heart className="w-5 h-5" />
        </Link>
        <button onClick={() => setIsCartOpen(true)} className="relative hover:text-brand transition-colors">
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -end-1.5 bg-brand text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </button>
        
        {/* Search Bar pill */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-row items-center bg-white/10 rounded-full px-4 py-2 border border-white/20 hover:bg-white/20 transition-all focus-within:bg-white/20 focus-within:w-64 w-52 overflow-hidden">
          <Search className="w-4 h-4 me-2" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('nav.search')} 
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-white/70"
          />
        </form>
      </div>
    </motion.nav>
  );
}
