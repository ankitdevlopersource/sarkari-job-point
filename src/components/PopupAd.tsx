import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PopupAdProps {
  location: 'home' | 'blog';
}

export default function PopupAd({ location }: PopupAdProps) {
  const [ad, setAd] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // We can add a slight delay for better UX
    const timer = setTimeout(() => {
      fetch(`/api/ads/active?location=${location}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            // Pick a random active ad for the location
            const randomAd = data[Math.floor(Math.random() * data.length)];
            setAd(randomAd);
            setIsVisible(true);
          }
        })
        .catch(err => console.error('Failed to fetch ads', err));
    }, 1500);

    return () => clearTimeout(timer);
  }, [location]);

  if (!ad) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/70 backdrop-blur-md">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Global Close Button (Always visible on all screens) */}
            <button 
              onClick={() => setIsVisible(false)}
              className="fixed top-6 right-6 md:top-10 md:right-10 z-[110] p-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-red-500/50"
              title="Close Advertisement"
            >
              <X size={28} strokeWidth={3} />
              <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black text-white text-xs font-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:block whitespace-nowrap shadow-xl">
                CLOSE ADs
              </span>
            </button>

            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 40 }}
              className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20"
            >
              {/* Ad Content */}
              {ad.linkUrl ? (
                <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <img src={ad.imageUrl} alt="Advertisement" className="w-full h-auto object-contain hover:opacity-95 transition-opacity" />
                </a>
              ) : (
                <img src={ad.imageUrl} alt="Advertisement" className="w-full h-auto object-contain" />
              )}
              
              <div className="p-2 bg-gray-50 text-center border-t border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Advertisement</p>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
