import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Sparkles, Tag } from 'lucide-react';
import { BOOKS } from '../constants';
import { BookCard } from '../components/BookCard';

export const SaleView = () => {
  const navigate = useNavigate();
  
  const saleBooks = useMemo(() => {
    return BOOKS.filter(book => book.discountPrice);
  }, []);

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
        
        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <Tag className="w-6 h-6" />
              <h1 className="text-4xl font-serif font-bold uppercase tracking-tight">Special Offers</h1>
           </div>
           <p className="text-earth-brown/60 dark:text-dark-muted font-serif italic text-sm">
             Great books and beloved stories at discounted prices.
           </p>
        </div>
      </header>

      {/* Sale Banner Overlay Style */}
      <section className="px-6 mb-12">
        <div className="bg-orange-600 dark:bg-orange-950/40 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-orange-600/10">
           <div className="relative z-10 space-y-4 flex-1">
              <div className="inline-block px-4 py-1 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">Limited Time</div>
              <h2 className="text-3xl font-serif font-bold">The Autumn Collection Sale</h2>
              <p className="text-white/70 text-sm max-w-sm">Enjoy up to 40% off on selected ebooks. High-quality reading at an exceptional value.</p>
           </div>
           <Sparkles className="absolute -top-10 -right-10 w-48 h-48 text-white/5" />
           <div className="relative z-10 w-32 h-32 flex items-center justify-center bg-white/10 rounded-full border border-white/20 backdrop-blur-md">
              <span className="text-4xl font-serif font-bold">40%</span>
           </div>
        </div>
      </section>

      <section className="px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {saleBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
        
        {saleBooks.length === 0 && (
           <div className="py-20 text-center opacity-40">
              <p className="font-serif italic">There are no active sales at the moment. Please check back soon.</p>
           </div>
        )}
      </section>
    </main>
  );
};
