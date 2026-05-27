import { motion } from 'motion/react';
import { CATEGORIES } from '../constants';
import { useNavigate } from 'react-router-dom';

export const CategorySlider = () => {
  const navigate = useNavigate();

  return (
    <section id="genres-section" className="py-6 px-6 scroll-mt-24">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-serif font-bold text-earth-brown dark:text-dark-text">Explore Ebook Genres</h2>
        <button 
          onClick={() => navigate('/category/all')}
          className="text-xs font-sans text-earth-brown/60 dark:text-dark-muted font-medium hover:text-moss-green transition-colors"
        >
          View all
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
        {CATEGORIES.map((category, index) => (
          <motion.div
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/category/${category.id}`)}
            className="flex-shrink-0 flex flex-col items-center gap-3 w-28 py-4 bg-[#f2ecdc] dark:bg-dark-card rounded-2xl cursor-pointer transition-all border border-earth-brown/5 shadow-sm"
          >
            <div className="w-14 h-14 flex items-center justify-center bg-white dark:bg-white/5 rounded-xl shadow-inner text-3xl">
              {category.icon}
            </div>
            <span className="text-xs font-sans font-bold text-earth-brown dark:text-dark-text tracking-tighter truncate w-full text-center px-1">
              {category.name}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

