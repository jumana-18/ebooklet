import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, Heart, ShoppingBag } from 'lucide-react';
import { Book } from '../types';
import { useShop } from '../context/ShopContext';

interface BookCardProps {
  book: Book;
  variant?: 'readers-loving' | 'new-arrival';
}

export const BookCard: React.FC<BookCardProps> = ({ book, variant = 'readers-loving' }) => {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useShop();
  const navigate = useNavigate();
  const loved = isInWishlist(book.id);

  const handleCardClick = () => {
    navigate(`/book/${book.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(book);
  };

  const handleLoveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loved) {
      removeFromWishlist(book.id);
    } else {
      addToWishlist(book);
    }
  };

  if (variant === 'new-arrival') {
    return (
      <motion.div
        whileHover={{ y: -5 }}
        onClick={handleCardClick}
        className="w-full group cursor-pointer"
      >
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md mb-2">
           <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
           <div className="absolute inset-0 bg-black/10 transition-opacity opacity-0 group-hover:opacity-100" />
           {book.isNew && (
             <div className="absolute top-2 left-2 px-2 py-0.5 bg-moss-green text-white text-[8px] font-bold rounded uppercase tracking-wider">
               New
             </div>
           )}
           <button 
             onClick={handleAddToCart}
             className="absolute bottom-2 right-2 w-8 h-8 bg-white/95 dark:bg-dark-card/90 rounded-full flex items-center justify-center shadow shadow-black/25 text-earth-brown dark:text-dark-text hover:bg-moss-green hover:text-white transition-colors"
           >
             <ShoppingBag className="w-3.5 h-3.5" />
           </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      onClick={handleCardClick}
      className="flex-shrink-0 w-[165px] bg-[#f9f5eb] dark:bg-dark-card rounded-[2rem] p-3 border border-earth-brown/5 shadow-sm transition-all cursor-pointer group select-none"
    >
      <div className="relative aspect-[3/4.5] rounded-xl overflow-hidden mb-3">
         <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
         {book.isBestSeller && (
           <div className="absolute top-0 left-0 bg-[#d4a373] text-earth-brown text-[8px] font-bold px-2 py-1 rounded-br-lg uppercase tracking-wider">
             Bestseller
           </div>
         )}
         
         <div className={`absolute bottom-2 left-2 px-2 py-0.5 text-[8px] font-sans font-bold uppercase rounded-md tracking-wider ${
           book.bookType === 'ebook' 
             ? 'bg-moss-green/95 text-white' 
             : 'bg-[#8b5a2b]/95 text-white'
         }`}>
           {book.bookType === 'ebook' ? '⚡ E-Book' : '📖 Printed'}
         </div>

         <button 
           onClick={handleLoveToggle}
           className="absolute top-2 right-2 text-white/85 transition-colors hover:scale-110 drop-shadow"
         >
            <Heart className={`w-5 h-5 transition-colors ${loved ? 'text-mushroom-red fill-mushroom-red' : 'text-white'}`} />
         </button>
         <button 
           onClick={handleAddToCart}
           className="absolute bottom-2 right-2 w-8 h-8 bg-white/95 dark:bg-dark-card/90 rounded-full flex items-center justify-center shadow-lg shadow-black/25 text-earth-brown dark:text-dark-text hover:bg-moss-green hover:text-white transition-all opacity-0 group-hover:opacity-100"
         >
           <ShoppingBag className="w-3.5 h-3.5" />
         </button>
      </div>

      <div className="space-y-1">
        <h3 className="font-serif text-sm font-bold text-earth-brown dark:text-dark-text leading-tight group-hover:text-moss-green transition-colors truncate">
          {book.title}
        </h3>
        <p className="text-[10px] text-earth-brown/60 dark:text-dark-muted font-sans truncate">{book.author}</p>
        
        <div className="flex items-center gap-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-2.5 h-2.5 ${i < Math.floor(book.rating) ? 'text-terracotta fill-terracotta' : 'text-earth-brown/10 dark:text-white/10'}`} />
            ))}
          </div>
          <span className="text-[10px] text-earth-brown dark:text-dark-text font-bold">{book.rating}</span>
        </div>

        {/* Clear display of separate Printed and E-book prices */}
        <div className="space-y-1 pt-1.5 border-t border-earth-brown/[0.04] dark:border-white/[0.04] font-sans">
          <div className="flex items-center justify-between text-[10px] text-earth-brown/70 dark:text-dark-muted">
            <span className="flex items-center gap-0.5">📖 Printed:</span>
            <span className="font-bold font-mono text-earth-brown dark:text-dark-text">
              ${book.bookType === 'physical' ? (book.discountPrice || book.price).toFixed(2) : ((book.discountPrice || book.price) + 7.00).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#2c3d2e] dark:text-dark-accent">
            <span className="flex items-center gap-0.5">⚡ E-Book:</span>
            <span className="font-bold font-mono text-moss-green">
              ${book.bookType === 'ebook' ? (book.discountPrice || book.price).toFixed(2) : Math.max(4.99, (book.discountPrice || book.price) - 6.00).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
