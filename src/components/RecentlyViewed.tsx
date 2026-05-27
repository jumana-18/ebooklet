import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MoreVertical, BookOpen, Clock, Footprints } from 'lucide-react';
import { READING_BOOKS } from '../constants';
import { useNavigate } from 'react-router-dom';

export const RecentlyViewed = () => {
  const navigate = useNavigate();

  // Load from local storage sync
  const [readingList, setReadingList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('ebooklet_currently_reading');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return READING_BOOKS;
  });

  const [recentlyViewed, setRecentlyViewed] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('recently_viewed_books');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  // central resume logic redirects to central LibraryView with resume parameter
  const handleResumeEbook = (bookId: string) => {
    navigate(`/library?resume=${bookId}`);
  };

  return (
    <section className="py-6 space-y-8 select-none">
      {/* Continue Reading Section */}
      <div>
        <div className="px-6 flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-moss-green" />
            <h2 className="text-xl font-serif font-bold text-earth-brown dark:text-dark-text">Continue Reading Ebooks</h2>
          </div>
          <button 
            onClick={() => navigate('/library')}
            className="text-xs font-sans text-earth-brown hover:text-moss-green dark:text-dark-muted dark:hover:text-[#eae0d5] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View All</span>
            <span>→</span>
          </button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto hide-scrollbar px-6">
          {readingList.map((book) => (
            <motion.div
              key={book.id}
              whileHover={{ y: -3, scale: 1.01 }}
              onClick={() => handleResumeEbook(book.id)}
              className="flex-shrink-0 w-[250px] bg-white/95 dark:bg-dark-card rounded-2xl p-3 flex items-center gap-3.5 cursor-pointer border border-[#eee5d3] dark:border-white/5 shadow-sm hover:shadow-md transition-all text-left"
            >
              <div className="w-16 h-22 rounded-lg overflow-hidden flex-shrink-0 shadow-md relative border border-earth-brown/5">
                <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between gap-1">
                  <h4 className="font-serif text-xs font-bold text-earth-brown dark:text-dark-text line-clamp-1 leading-snug">{book.title}</h4>
                  <MoreVertical className="w-3 h-3 text-earth-brown/40 dark:text-dark-muted flex-shrink-0" />
                </div>
                <p className="text-[10px] text-earth-brown/60 dark:text-dark-muted truncate leading-none">by {book.author}</p>
                
                <div className="space-y-1">
                   <div className="flex justify-between items-center text-[8px] font-bold">
                      <span className="text-earth-brown/40 dark:text-dark-muted">Progress</span>
                      <span className="text-[#8b8a6e]">{book.progress || 0}%</span>
                   </div>
                   <div className="w-full h-1 bg-earth-brown/5 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${book.progress || 0}%` }}
                         className="h-full bg-moss-green"
                      />
                   </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResumeEbook(book.id);
                  }}
                  className="w-full py-1 bg-moss-green hover:bg-moss-green/90 text-white rounded-lg text-[9px] font-bold shadow-xs transition-colors cursor-pointer uppercase tracking-wider"
                >
                  Resume
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dynamic Recently Viewed History */}
      {recentlyViewed.length > 0 && (
        <div className="border-t border-earth-brown/10 dark:border-white/5 pt-6">
          <div className="px-6 flex items-center gap-2 mb-4">
            <Footprints className="w-4 h-4 text-[#d4a373]" />
            <h2 className="text-xl font-serif font-bold text-earth-brown dark:text-dark-text">Your Recently Viewed Tomes</h2>
          </div>
          
          <div className="flex gap-4 overflow-x-auto hide-scrollbar px-6 pb-2">
            {recentlyViewed.map((book) => (
              <motion.div
                key={book.id}
                whileHover={{ y: -3, scale: 1.01 }}
                onClick={() => navigate(`/product/${book.id}`)}
                className="flex-shrink-0 w-[150px] bg-white/60 dark:bg-dark-card/50 border border-earth-brown/10 hover:border-moss-green/30 rounded-2xl p-2.5 cursor-pointer shadow-xs hover:shadow-md transition-all text-left"
              >
                <div className="aspect-[3/4.2] w-full rounded-xl overflow-hidden shadow-xs border border-earth-brown/5 bg-parchment/10 relative">
                  <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                </div>
                <div className="mt-2 space-y-0.5">
                  <h4 className="font-serif text-[11px] font-bold text-earth-brown dark:text-dark-text truncate leading-tight">
                    {book.title}
                  </h4>
                  <p className="text-[9px] text-earth-brown/50 dark:text-dark-muted truncate">
                    {book.author}
                  </p>
                  <div className="flex justify-between items-center text-[9px] pt-1">
                     <span className="text-moss-green font-mono font-bold">${book.discountPrice || book.price}</span>
                     <span className="text-earth-brown/40 dark:text-dark-muted text-[7px] uppercase font-bold tracking-widest">
                       Inspect
                     </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
