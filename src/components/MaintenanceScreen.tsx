import { motion } from 'motion/react';
import { Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function MaintenanceScreen() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div className="min-h-screen bg-coffee-dark flex flex-col items-center justify-center text-white px-6 relative overflow-hidden font-sans">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-2xl mx-auto"
      >
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 mx-auto mb-8 bg-brand/20 rounded-full flex items-center justify-center text-brand border border-brand/30"
        >
          <Settings className="w-12 h-12" />
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-wide mb-6">
          {isAr ? 'نعمل على تحسين الموقع' : 'Under Maintenance'}
        </h1>
        
        <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-8 max-w-lg mx-auto font-sans">
          {isAr 
            ? 'نعتذر عن الإزعاج! الموقع يخضع حالياً لبعض التحديثات والتحسينات لنقدم لك تجربة أفضل. سنعود للعمل في أقرب وقت ممكن.' 
            : 'Sorry for the inconvenience! We are currently performing some updates to improve your experience. We will be back online shortly.'}
        </p>

        <div className="inline-block px-6 py-2 border border-brand/50 text-brand rounded-full text-sm font-bold tracking-widest uppercase">
          {isAr ? 'قريباً' : 'Coming Soon'}
        </div>
      </motion.div>
    </div>
  );
}
