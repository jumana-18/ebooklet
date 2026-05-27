import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ArrowLeft, ShoppingBag, Trash2, Library, Sparkles, BookOpen } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const WishlistPage = () => {
  const navigate = useNavigate();
  const { wishlist: rawWishlist, removeFromWishlist, addToCart } = useShop();
  const wishlist = Array.isArray(rawWishlist) ? rawWishlist : [];

  const handleAddToCart = (e: React.MouseEvent, book: any) => {
    e.stopPropagation();
    addToCart(book, 1, 'Ebook');
  };

  return (
    <main className="min-h-screen bg-parchment dark:bg-dark-bg pb-28 pt-4 px-6 md:px-8 select-none transition-colors duration-300">
      
      {/* Header */}
      <header className="max-w-5xl mx-auto mb-8 space-y-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-earth-brown/60 dark:text-dark-muted hover:text-earth-brown dark:hover:text-dark-text transition-colors text-xs font-bold uppercase tracking-widest cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-moss-green" />
          Back
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-mushroom-red/10 flex items-center justify-center text-mushroom-red shadow-inner">
               <Heart className="w-6 h-6 fill-mushroom-red" />
            </div>
            <div>
               <h1 className="text-3xl font-serif font-bold text-earth-brown dark:text-dark-text tracking-wide uppercase">Your Wishlist</h1>
               <p className="text-xs text-earth-brown/50 dark:text-dark-muted font-sans font-medium">Books waiting to be added to your library.</p>
            </div>
          </div>
          <span className="text-[10px] font-sans font-bold bg-[#ebe3d3] dark:bg-dark-card text-earth-brown/70 dark:text-dark-text px-3 py-1 rounded-full uppercase tracking-widest">
            {wishlist.length} Items
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto">
        <AnimatePresence mode="popLayout">
          {wishlist.length === 0 ? (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="py-16 px-6 bg-white/40 dark:bg-dark-card/20 rounded-[2.5rem] border border-earth-brown/5 text-center space-y-5"
            >
              <div className="text-5xl animate-bounce">🌟</div>
              <div className="space-y-1.5">
                 <h2 className="text-xl font-serif font-bold text-earth-brown dark:text-dark-text">Your Bookshelf Awaits...</h2>
                 <p className="text-xs text-earth-brown/60 dark:text-dark-muted max-w-sm mx-auto leading-relaxed">
                   Your wishlist is currently empty. Browse our catalog and save your favorite books.
                 </p>
              </div>
              <button 
                onClick={() => navigate('/')}
                className="px-6 py-3.5 bg-moss-green text-white text-xs font-bold uppercase tracking-widest rounded-2xl shadow-lg shadow-moss-green/10 hover:bg-moss-green/90 transition-all cursor-pointer"
              >
                 Discover New Books
              </button>
            </motion.div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {wishlist.map((book) => (
                <motion.div
                  key={book.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ y: -6 }}
                  onClick={() => navigate(`/book/${book.id}`)}
                  className="bg-[#f9f5eb] dark:bg-dark-card rounded-[2rem] p-3 border border-earth-brown/5 shadow-xs transition-shadow hover:shadow-md cursor-pointer select-none group relative"
                >
                  
                  {/* Delete Badge handle */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWishlist(book.id);
                    }}
                    className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-black/40 text-earth-brown/60 dark:text-dark-muted hover:text-[#cd4e4e] hover:bg-white dark:hover:bg-dark-card/90 flex items-center justify-center transition-all shadow-xs border border-earth-brown/5 cursor-pointer"
                    title="Remove from Wishlist"
                  >
                     <Trash2 size={13} />
                  </button>

                  <div className="relative aspect-[3/4.5] rounded-xl overflow-hidden mb-3 bg-[#e4ded0] dark:bg-[#1a231a] shadow-inner">
                     <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                     {book.isBestSeller && (
                       <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-[#d4a373] text-earth-brown text-[8px] font-sans font-bold tracking-widest uppercase rounded">Bestseller</span>
                     )}
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-serif text-xs font-bold text-earth-brown dark:text-dark-text leading-tight group-hover:text-moss-green transition-colors truncate">
                       {book.title}
                    </h3>
                    <p className="text-[10px] text-earth-brown/50 dark:text-dark-muted font-sans font-medium hover:underline truncate">
                       {book.author}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                       <span className="text-xs font-serif font-bold text-[#4d3615] dark:text-dark-text">${book.discountPrice || book.price}</span>
                       <button
                         onClick={(e) => handleAddToCart(e, book)}
                         className="p-2 bg-moss-green text-white hover:bg-moss-green/90 rounded-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-md shadow-moss-green/5 cursor-pointer"
                         title="Add to Library Cart"
                       >
                         <ShoppingBag size={12} />
                       </button>
                    </div>
                  </div>

                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </main>
  );
};
