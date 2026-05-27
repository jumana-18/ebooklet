import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Sparkles, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react';
import { BOOKS } from '../constants';
import { BookCard } from '../components/BookCard';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';

export const DiscoverView = () => {
  const { cartCount } = useShop();
  const navigate = useNavigate();
  
  // Simulation of "checked out earlier" items
  const savedItems = BOOKS.slice(0, 2); 
  const recommendations = BOOKS.slice(3, 8);

  return (
    <main className="min-h-screen bg-parchment dark:bg-dark-bg pb-20 transition-colors">
      <header className="p-8 space-y-4">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-earth-brown/60 dark:text-dark-muted hover:text-earth-brown dark:hover:text-dark-text transition-colors text-xs font-bold uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
        <div className="space-y-2">
           <h1 className="text-4xl font-serif font-bold text-earth-brown dark:text-dark-text uppercase">Discover</h1>
           <p className="text-earth-brown/60 dark:text-dark-muted font-serif italic text-sm">Find your next digital escape or pick up where you left off.</p>
        </div>
      </header>

      {/* Cart / Saved Items */}
      <section className="px-6 mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-terracotta" />
            <h2 className="text-xl font-serif font-bold text-earth-brown dark:text-dark-text">Ready to Read</h2>
          </div>
          <span className="text-xs font-bold text-moss-green uppercase tracking-widest">{cartCount} Items in Cart</span>
        </div>

        <div className="space-y-4">
          {savedItems.map((book) => (
            <motion.div 
              key={book.id}
              whileHover={{ x: 4 }}
              className="bg-white dark:bg-dark-card rounded-2xl p-4 flex gap-4 shadow-sm border border-earth-brown/5 dark:border-white/5"
            >
               <div className="w-20 h-28 rounded-lg overflow-hidden shadow-md flex-shrink-0">
                 <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
               </div>
               <div className="flex-1 flex flex-col justify-between py-1">
                 <div>
                    <h3 className="font-serif font-bold text-earth-brown dark:text-dark-text">{book.title}</h3>
                    <p className="text-xs text-earth-brown/60 dark:text-dark-muted">{book.author}</p>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-terracotta">${book.discountPrice || book.price}</span>
                    <button className="text-[10px] font-bold text-moss-green uppercase flex items-center gap-1 group">
                      Checkout Now <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                 </div>
               </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recommended For You */}
      <section className="px-6">
        <div className="flex items-center gap-2 mb-8">
          <Sparkles className="w-5 h-5 text-moss-green" />
          <h2 className="text-xl font-serif font-bold text-earth-brown dark:text-dark-text">Magic Selected For You</h2>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {recommendations.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* Daily New Ebooks CTA */}
      <section className="px-4 mt-12 mb-8">
        <div className="bg-forest-green dark:bg-zinc-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
           <div className="relative z-10 space-y-4">
              <h3 className="text-2xl font-serif">Daily New Arrivals</h3>
              <p className="text-white/60 text-sm italic">Fresh stories added every dawn by our woodland curators.</p>
              <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white/20 hover:bg-white/30 backdrop-blur-md px-6 py-3 rounded-full transition-all">
                Explore New <ArrowRight className="w-4 h-4" />
              </button>
           </div>
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        </div>
      </section>
    </main>
  );
};
