import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProducts } from '../data/products';
import ProductCard from '../components/ProductCard';
import { motion } from 'motion/react';
import { Search, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q')?.toLowerCase() || '';
  const { t } = useTranslation();
  const { products: allProducts, loading } = useProducts();

  // Scroll to top when search query changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [query]);

  // Filter products by searching in name
  const filteredProducts = query
    ? allProducts.filter((product) =>
        product.name.toLowerCase().includes(query)
      )
    : [];

  return (
    <div className="min-h-screen bg-coffee-light pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-border-light p-8 md:p-12 mb-12"
        >
          <div className="flex items-center space-x-4 flex-col md:flex-row rtl:space-x-reverse text-center md:text-start">
            <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center shrink-0 mb-4 md:mb-0">
              {loading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <Search className="w-8 h-8" />
              )}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif text-coffee-dark mb-2">
                {t('search.title')}
              </h1>
              {query ? (
                <p className="text-coffee-muted font-sans text-lg">
                  {t('search.resultsFor')} <span className="font-semibold text-coffee-text px-1">"{query}"</span>
                </p>
              ) : (
                <p className="text-coffee-muted font-sans p-1 text-lg text-amber-600">
                  {t('search.emptyQuery')}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {loading ? (
           <div className="flex justify-center py-20">
             <Loader2 className="w-12 h-12 text-brand animate-spin" />
           </div>
        ) : query && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : query ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl p-16 text-center shadow-sm border border-border-light"
          >
            <p className="text-xl font-sans text-coffee-muted mb-6">
              {t('search.noResults')}
            </p>
            <button 
              onClick={() => window.history.back()}
              className="px-8 py-3 bg-coffee-dark text-white rounded-full hover:bg-brand transition-colors font-sans text-sm font-bold tracking-widest uppercase"
            >
               Go Back
            </button>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
