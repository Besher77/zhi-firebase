import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [popupData, setPopupData] = useState({
    enabled: false,
    image: '',
    link: '',
    title: '',
    desc: '',
    buttonText: ''
  });

  useEffect(() => {
    // Listen to global settings for popup configuration
    const unsubscribe = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPopupData({
          enabled: data.popupEnabled === true,
          image: data.popupImage || '',
          link: data.popupLink || '',
          title: data.popupTitle || '',
          desc: data.popupDesc || '',
          buttonText: data.popupButtonText || ''
        });
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (popupData.enabled && popupData.image) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setIsOpen(false);
    }
  }, [popupData]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleContentClick = () => {
    if (popupData.link) {
      window.location.href = popupData.link;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Close Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="absolute top-4 end-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all z-20"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Ad Image */}
            {popupData.image && (
              <div 
                className="relative w-full aspect-video sm:aspect-[4/3] overflow-hidden bg-coffee-light cursor-pointer group"
                onClick={handleContentClick}
              >
                <img 
                  src={popupData.image} 
                  alt={popupData.title || "Promotion"} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Content Area */}
            {(popupData.title || popupData.desc || popupData.buttonText) && (
              <div className="p-8 text-center flex flex-col items-center">
                {popupData.title && (
                  <h3 className="text-2xl font-serif font-bold text-coffee-dark mb-3 leading-tight">
                    {popupData.title}
                  </h3>
                )}
                
                {popupData.desc && (
                  <p className="text-coffee-muted font-sans mb-6 leading-relaxed text-sm md:text-base">
                    {popupData.desc}
                  </p>
                )}

                {popupData.buttonText && (
                  <button 
                    onClick={handleContentClick}
                    className="px-8 py-3 bg-brand text-white rounded-full font-bold uppercase tracking-widest text-sm hover:bg-brand/90 transition-colors shadow-lg shadow-brand/20 w-full sm:w-auto"
                  >
                    {popupData.buttonText}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
