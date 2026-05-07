import { motion, AnimatePresence } from 'motion/react';
import { Play, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

function getEmbedUrl(url: string): string {
  if (!url) return '';
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  // Direct video file or other embed — return as-is
  return url;
}

export default function VideoStory() {
  const { t } = useTranslation();
  const [videoUrl, setVideoUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'general'));
        if (snap.exists()) setVideoUrl(snap.data().storyVideoUrl || '');
      } catch {}
    };
    fetch();
  }, []);

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <>
      <section className="relative py-32 flex items-center justify-center min-h-[60vh] overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524350876685-274059332603?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center bg-fixed bg-no-repeat rtl:scale-x-[-1]"
          style={{ backgroundBlendMode: 'multiply', backgroundColor: 'rgba(26, 22, 21, 0.7)' }}
        />

        <div className="container relative z-10 mx-auto px-4 text-center max-w-3xl text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="font-serif italic text-2xl mb-4 block">{t('story.tag')}</span>
            <h2 className="text-5xl md:text-6xl font-serif mb-6 uppercase tracking-wider text-white">{t('story.title')}</h2>
            <p className="text-white/80 leading-relaxed mb-12">{t('story.desc')}</p>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => videoUrl && setIsOpen(true)}
              className={`w-20 h-20 mx-auto border border-white/50 rounded-full flex items-center justify-center hover:bg-brand/80 hover:border-brand transition-all group duration-300 backdrop-blur-sm ${!videoUrl ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              title={videoUrl ? undefined : 'No video configured'}
            >
              <Play className="w-8 h-8 text-white fill-white ms-1 transition-transform group-hover:scale-110" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Video Lightbox Modal */}
      <AnimatePresence>
        {isOpen && embedUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Story Video"
              />
            </motion.div>
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 end-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
