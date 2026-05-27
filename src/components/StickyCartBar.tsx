import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ArrowUp, Star, Sparkles, Check } from 'lucide-react';
import { useShop } from '../context/ShopContext';

interface StickyCartBarProps {
  book: {
    id: string;
    title: string;
    author: string;
    price: number;
    discountPrice?: number;
    coverImage: string;
    rating: number;
  };
}

export const StickyCartBar: React.FC<StickyCartBarProps> = ({ book }) => {
  const { addToCart } = useShop();
  const [isVisible, setIsVisible] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Toggle visibility based on offset depth
      if (window.scrollY > 420) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleQuickAdd = () => {
    const fullBook = {
      ...book,
      category: 'Fantasy',
      bookType: 'ebook' as const
    };
    addToCart(fullBook);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleScrollToTop = () => {
     window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const finalPrice = book.discountPrice || book.price;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          style={{ zIndex: 90 }}
          className="fixed bottom-[74px] left-0 right-0 max-w-lg mx-auto px-4 select-none"
        >
          {/* Main sticky glass bubble card */}
          <div className="bg-white/90 dark:bg-[#1a2d1d]/90 backdrop-blur-xl border border-moss-green/15 rounded-3xl py-3 px-4 shadow-[0_22px_45px_rgba(0,0,0,0.15)] flex items-center justify-between gap-3 gap-y-1 relative">
             
             {/* Left preview info segment */}
             <div className="flex items-center gap-3 min-w-0">
                <img 
                  src={book.coverImage} 
                  alt={book.title} 
                  className="w-10 h-13 rounded-lg object-cover shadow-md border border-earth-brown/10 flex-shrink-0"
                />
                <div className="min-w-0">
                   <h3 className="font-serif text-xs font-bold text-earth-brown dark:text-dark-text truncate leading-relaxed">
                      {book.title}
                   </h3>
                   <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-moss-green font-mono">${finalPrice.toFixed(2)}</span>
                      <span className="text-[10px] text-earth-brown/30 dark:text-dark-muted">•</span>
                      <div className="flex items-center gap-0.5 text-[10px] text-earth-brown dark:text-dark-text font-bold">
                         <Star className="w-3 h-3 text-terracotta fill-terracotta" />
                         <span>{book.rating}</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* Right speed purchase triggers */}
             <div className="flex items-center gap-2 flex-shrink-0">
                <button
                   onClick={handleScrollToTop}
                   className="w-9 h-9 rounded-xl bg-earth-brown/[0.04] dark:bg-white/[0.04] hover:bg-moss-green hover:text-white transition-all flex items-center justify-center text-earth-brown/60 dark:text-dark-muted cursor-pointer"
                   title="Scroll back to top"
                >
                   <ArrowUp size={15} />
                </button>

                <button
                   onClick={handleQuickAdd}
                   className={`h-9 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                      added
                      ? 'bg-moss-green text-white shadow-moss-green/20'
                      : 'bg-moss-green text-white hover:bg-moss-green/90 shadow-moss-green/20'
                   }`}
                >
                   {added ? (
                      <>
                        <Check size={13} className="animate-ping" />
                        Inscribed!
                      </>
                   ) : (
                      <>
                        <ShoppingBag size={13} className="text-white" />
                        Add to Cart
                      </>
                   )}
                </button>
             </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
