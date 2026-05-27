import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, BookOpen, Flame, Library, Star } from 'lucide-react';
import { BOOKS, NEW_ARRIVALS } from '../constants';
import { Book } from '../types';

interface RecommendationCarouselProps {
  currentBookId: string;
  category: string;
}

export const RecommendationCarousel: React.FC<RecommendationCarouselProps> = ({ currentBookId, category }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'similar' | 'bestsellers' | 'trending'>('similar');

  // Unified registry of all available books
  const allCollection = useMemo(() => {
    return [...BOOKS, ...NEW_ARRIVALS].filter((b) => b.id !== currentBookId);
  }, [currentBookId]);

  const recommendedList = useMemo(() => {
    if (activeTab === 'similar') {
      // Find books in the same category, or default back if few matches
      let matches = allCollection.filter(b => b.category.toLowerCase() === category.toLowerCase());
      if (matches.length < 3) {
         matches = [...matches, ...allCollection.slice(0, 4)];
      }
      return matches.slice(0, 6);
    } else if (activeTab === 'bestsellers') {
      return allCollection.filter(b => b.isBestSeller || b.rating >= 4.7).slice(0, 6);
    } else {
      return allCollection.filter(b => b.isNew || b.price < 20).slice(0, 6);
    }
  }, [activeTab, allCollection, category]);

  const tabOptions = [
    { id: 'similar' as const, label: 'Readers Also Loved', icon: CompassOption },
    { id: 'bestsellers' as const, label: 'Similar Worlds', icon: FlameOption },
    { id: 'trending' as const, label: 'Trending BookTok', icon: SparklesOption },
  ];

  function CompassOption() { return <Library size={12} />; }
  function FlameOption() { return <Flame size={12} />; }
  function SparklesOption() { return <Sparkles size={12} />; }

  return (
    <div className="space-y-6 select-none">
       {/* Section Header */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
             <h3 className="text-2xl font-serif text-earth-brown dark:text-dark-text font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#d4a373] animate-pulse" />
                Tales of Sanctuary Alignments
             </h3>
             <p className="text-xs text-earth-brown/60 dark:text-dark-muted font-medium font-sans">
                Curated vectors crafted by booklet woodland librarians.
             </p>
          </div>

          <button 
            onClick={() => navigate('/category/all')}
            className="flex items-center gap-1 text-[11px] font-bold text-moss-green uppercase tracking-widest hover:underline cursor-pointer pt-1"
          >
             Observe Entire Archive
             <ArrowRight size={13} />
          </button>
       </div>

       {/* Selector Tabs */}
       <div className="flex gap-2.5 overflow-x-auto pb-1 hide-scrollbar">
          {tabOptions.map((opt) => {
             const Icon = opt.icon;
             const isSelected = activeTab === opt.id;
             return (
                <button
                   key={opt.id}
                   onClick={() => setActiveTab(opt.id)}
                   className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                      ? 'bg-moss-green text-white border-moss-green shadow-lg shadow-moss-green/10 font-bold'
                      : 'bg-white/40 dark:bg-dark-card/30 border-earth-brown/5 text-earth-brown hover:bg-white dark:hover:bg-dark-card'
                   }`}
                >
                   <Icon />
                   {opt.label}
                </button>
             );
          })}
       </div>

       {/* Horizontal Immersive Carousel List */}
       <div className="flex gap-5 overflow-x-auto pb-4 hide-scrollbar -mx-2 px-2 snap-x">
          {recommendedList.map((recBook) => (
             <motion.div
                key={recBook.id}
                whileHover={{ y: -5 }}
                onClick={() => {
                  navigate(`/book/${recBook.id}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-[170px] flex-shrink-0 bg-white/60 dark:bg-dark-card/40 rounded-[2.2rem] p-3 border border-earth-brown/5 shadow-sm hover:shadow-md transition-all cursor-pointer relative snap-start"
             >
                {/* Book Jacket wrapper */}
                <div className="relative aspect-[3/4.5] rounded-2xl overflow-hidden shadow-inner mb-3 bg-[#e4ded0] dark:bg-[#1a231a]">
                   <img src={recBook.coverImage} alt={recBook.title} className="w-full h-full object-cover" />
                   
                   {recBook.isBestSeller && (
                     <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#d4a373] text-earth-brown text-[8px] font-bold rounded-md uppercase tracking-wider scale-90">
                       Best
                     </div>
                   )}

                   {/* Format badge overlay */}
                   <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 text-white text-[7.5px] font-bold rounded-sm tracking-widest uppercase">
                     Ebook
                   </span>
                </div>

                {/* Info block */}
                <div className="space-y-1 text-left">
                   <h4 className="font-serif text-xs font-bold text-earth-brown dark:text-dark-text leading-tight truncate">
                      {recBook.title}
                   </h4>
                   <p className="text-[10px] text-earth-brown/50 dark:text-dark-muted font-sans font-medium hover:underline truncate">
                      {recBook.author}
                   </p>

                   {/* Custom Rating Row */}
                   <div className="flex items-center gap-1 text-[10px] text-earth-brown dark:text-dark-text font-bold">
                      <Star className="w-3.5 h-3.5 text-terracotta fill-terracotta" />
                      <span>{recBook.rating}</span>
                      <span className="text-earth-brown/20 font-light">•</span>
                      <span className="text-earth-brown/40 dark:text-dark-muted font-sans text-[9px] font-medium leading-none">
                         {recBook.title.length * 3 + 12} read
                      </span>
                   </div>

                   {/* Dynamic pricing display */}
                   <div className="pt-1 flex items-center justify-between text-xs font-bold leading-none">
                      <span className="text-earth-brown dark:text-dark-text">
                         ${recBook.discountPrice || recBook.price}
                      </span>
                      {recBook.discountPrice && (
                         <span className="text-[9px] text-[#cd4e4e] bg-[#cd4e4e]/10 px-1 py-0.2 rounded-md font-bold">
                            {recBook.discountPercent || '-30%'}
                         </span>
                      )}
                   </div>
                </div>
             </motion.div>
          ))}
       </div>

    </div>
  );
};
