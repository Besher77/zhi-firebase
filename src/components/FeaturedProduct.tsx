import { motion } from 'motion/react';
import { Star, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../data/products';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import ProductModal from './ProductModal';


export default function FeaturedProduct() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { products } = useProducts();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);


  const specs = [
    t('featured.s1'),
    t('featured.s2'),
    t('featured.s3'),
    t('featured.s4'),
    t('featured.s5')
  ];

  const featured = products.find(p => p.isFeatured) || products[0];

  if (!featured) return null;

  const currentFeatures = featured.features && featured.features.length > 0 ? featured.features : specs;
  const currentDesc = featured.desc || t('featured.desc');

  return (
    <section className="py-24 bg-coffee-light pt-32" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 relative"
          >
            {featured.discount && (
              <div className="absolute top-4 start-4 bg-accent text-white text-sm font-bold px-3 py-1 flex items-center rounded-sm z-10">
                - {featured.discount}
              </div>
            )}
            <img 
              src={featured.image || "https://images.unsplash.com/photo-1610889556528-9a770e32642f?q=80&w=800&auto=format&fit=crop"} 
              alt={featured.name} 
              className="w-full object-cover rounded-xl shadow-xl rtl:scale-x-[-1]"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1"
          >
            <span className="text-sm font-sans tracking-widest text-coffee-muted uppercase mb-4 block">{t('featured.tag')}</span>
            <h2 className="text-4xl font-serif text-coffee-dark mb-4">{t('featured.title')}</h2>
            
            <div className="flex text-brand mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current text-brand" />)}
              <span className="text-coffee-muted text-sm ms-2">(1)</span>
            </div>

            <h3 className="text-2xl font-serif text-coffee-dark font-medium mb-3">{featured.name || t('featured.product')}</h3>
            
            <div className="flex items-end gap-4 mb-6">
              <span className="text-3xl font-sans font-bold text-coffee-dark">{featured.price || '90.00'} {isAr ? 'رس' : 'SAR'}</span>
              {featured.oldPrice && (
                <span className="text-xl font-sans text-coffee-muted line-through mb-1">{featured.oldPrice} {isAr ? 'رس' : 'SAR'}</span>
              )}
            </div>

            <p className="text-coffee-muted mb-8 pb-8 border-b border-border-light leading-relaxed">
              {currentDesc}
            </p>

            <ul className="space-y-3 mb-10">
              {currentFeatures.map((spec, i) => (
                <li key={i} className="flex items-center text-coffee-dark font-medium">
                  <Check className="w-5 h-5 text-brand me-3" />
                  {spec}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => addToCart(featured)}
                className="bg-coffee-dark text-white px-8 py-4 uppercase font-sans tracking-widest text-xs font-bold hover:bg-brand transition-colors"
              >
                {t('featured.buy')}
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="border border-coffee-dark text-coffee-dark px-8 py-4 uppercase font-sans tracking-widest text-xs font-bold hover:bg-coffee-dark hover:text-white transition-colors"
              >
                {t('featured.learn')}
              </button>
            </div>
          </motion.div>

        </div>
      </div>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={{
          ...featured,
          desc: currentDesc,
          features: currentFeatures
        }} 
      />
    </section>
  );
}
