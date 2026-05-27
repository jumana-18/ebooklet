import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Search, 
  Heart, 
  ShoppingBag, 
  Star, 
  Share2, 
  Check, 
  ShieldCheck, 
  Truck, 
  RefreshCcw, 
  ChevronRight,
  Flame,
  MessageSquare,
  Sparkles,
  HelpCircle
} from 'lucide-react';

import { useShop } from '../context/ShopContext';
import { BOOKS, NEW_ARRIVALS, READING_BOOKS, REVIEWS } from '../constants';
import { ProductGallery } from '../components/ProductGallery';
import { ProductInfo } from '../components/ProductInfo';
import { ReviewsSection } from '../components/ReviewsSection';
import { RecommendationCarousel } from '../components/RecommendationCarousel';
import { StickyCartBar } from '../components/StickyCartBar';

export const ProductDetailPage = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { cartCount, addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useShop();

  // Scroll to top on mount / change
  useEffect(() => {
     window.scrollTo(0, 0);
  }, [bookId]);

  // Wishlist state tracking integrated directly
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [showShareConfirm, setShowShareConfirm] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  // Dynamic format state logic
  const [purchaseType, setPurchaseType] = useState<'physical' | 'ebook'>('physical');
  const [ebookFormat, setEbookFormat] = useState<'PDF' | 'EPUB' | 'Audio'>('PDF');

  // Core book registry locator with highly interactive fallbacks
  const book = useMemo(() => {
    const allBooks = [...BOOKS, ...NEW_ARRIVALS, ...READING_BOOKS];
    const found = allBooks.find((b) => b.id === bookId);
    
    if (found) {
       return {
          ...found,
          price: found.price || 15.99, // safeguard
       };
    }

    // Dynamic, high-quality, story-rich fallback generator so ANY custom clicked book ID fully resolves
    return {
       id: bookId || '999',
       title: 'The Codex of Lost Realms',
       author: 'L. K. Wilder',
       price: 24.99,
       discountPrice: 18.99,
       discountPercent: '-24%',
       rating: 4.8,
       coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
       category: 'Fantasy',
       isBestSeller: true,
       isNew: true,
       bookType: 'ebook' as const
    };
  }, [bookId]);

  // Sync default format with default bookType & Store to Recently Viewed Books
  useEffect(() => {
     if (book) {
        setPurchaseType(book.bookType === 'physical' ? 'physical' : 'ebook');

        // Add to recently viewed list in localStorage
        try {
          const raw = localStorage.getItem('recently_viewed_books');
          let currentList: any[] = [];
          if (raw) {
            currentList = JSON.parse(raw);
          }
          if (!Array.isArray(currentList)) {
            currentList = [];
          }
          // Remove if it already exists to put it first
          currentList = currentList.filter(b => b.id !== book.id);
          // Prepend
          currentList.unshift(book);
          // Keep only top 12 books
          if (currentList.length > 12) {
             currentList = currentList.slice(0, 12);
          }
          localStorage.setItem('recently_viewed_books', JSON.stringify(currentList));
        } catch (e) {
          console.error("Error storing recently viewed book:", e);
        }
     }
  }, [book]);

  // Dynamic price mapping based on user formats selection
  const currentFormatPrice = useMemo(() => {
     const basePrice = book.discountPrice || book.price;
     if (purchaseType === 'physical') {
        return book.bookType === 'physical' ? basePrice : basePrice + 7.00;
     } else {
        return book.bookType === 'ebook' ? basePrice : Math.max(4.99, basePrice - 6.00);
     }
  }, [book, purchaseType]);

  const currentOriginalPrice = useMemo(() => {
     const baseOrig = book.price;
     if (purchaseType === 'physical') {
        return book.bookType === 'physical' ? baseOrig : baseOrig + 7.00;
     } else {
        return book.bookType === 'ebook' ? baseOrig : Math.max(4.99, baseOrig - 6.00);
     }
  }, [book, purchaseType]);

  const cartFormatCode = purchaseType === 'physical' ? 'physical' : (ebookFormat === 'Audio' ? 'Audiobook' : ebookFormat);
  const userFriendlyFormatLabel = purchaseType === 'physical' ? 'Printed Book' : (ebookFormat === 'Audio' ? 'Audiobook' : `${ebookFormat} E-Book`);

  const handleAddToCart = () => {
     const bookWithPrice = {
        ...book,
        price: purchaseType === 'physical' 
           ? (book.bookType === 'physical' ? book.price : book.price + 7.00)
           : (book.bookType === 'ebook' ? book.price : Math.max(4.99, book.price - 6.00)),
        discountPrice: book.discountPrice ? (purchaseType === 'physical'
           ? (book.bookType === 'physical' ? book.discountPrice : book.discountPrice + 7.00)
           : (book.bookType === 'ebook' ? book.discountPrice : Math.max(4.99, book.discountPrice - 6.00))) : undefined
     };
     addToCart(bookWithPrice, purchaseQuantity, cartFormatCode);
     setIsAddedToCart(true);
     setTimeout(() => setIsAddedToCart(false), 2500);
  };

  const handleBuyNow = () => {
     const bookWithPrice = {
        ...book,
        price: purchaseType === 'physical' 
           ? (book.bookType === 'physical' ? book.price : book.price + 7.00)
           : (book.bookType === 'ebook' ? book.price : Math.max(4.99, book.price - 6.00)),
        discountPrice: book.discountPrice ? (purchaseType === 'physical'
           ? (book.bookType === 'physical' ? book.discountPrice : book.discountPrice + 7.00)
           : (book.bookType === 'ebook' ? book.discountPrice : Math.max(4.99, book.discountPrice - 6.00))) : undefined
     };
     addToCart(bookWithPrice, purchaseQuantity, cartFormatCode);
     navigate('/checkout');
  };

  const handleShareClick = () => {
     setShowShareConfirm(true);
     setTimeout(() => setShowShareConfirm(false), 2000);
  };

  const salesTax = 1.25;
  const deliveryCharges = purchaseType === 'physical' ? 4.99 : 0.00;
  const checkoutTotal = currentFormatPrice * purchaseQuantity + salesTax;
  const isWishlisted = isInWishlist(book.id);

  return (
    <div className="min-h-screen bg-parchment dark:bg-dark-bg transition-colors duration-300 pb-16">
       
       {/* Premium Glass Sticky Header */}
       <header className="sticky top-0 z-[100] bg-parchment/85 dark:bg-dark-bg/85 backdrop-blur-md border-b border-earth-brown/[0.03] transition-all">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              
              {/* Back CTA Button */}
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-earth-brown/60 dark:text-dark-muted hover:text-earth-brown transition-colors text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                 <ArrowLeft size={16} className="text-moss-green" />
                 <span>Back</span>
              </button>

              {/* Centered Brand Title */}
              <span className="font-serif text-xl font-bold tracking-widest text-[#4d3615] dark:text-dark-text uppercase select-none flex items-center gap-1.5 cursor-pointer" onClick={() => navigate('/')}>
                 <span className="text-moss-green">⚜</span> Booklet <span className="text-[9px] px-1.5 py-0.5 bg-moss-green text-white rounded font-sans tracking-tight uppercase">PDP</span>
              </span>

              {/* Utility actions inside PDP header */}
              <div className="flex items-center gap-4">
                 <button 
                   onClick={handleShareClick}
                   className="p-1 px-2.5 bg-earth-brown/[0.03] hover:bg-earth-brown/[0.08] dark:bg-white/[0.02] dark:hover:bg-white/[0.06] rounded-xl text-earth-brown/60 dark:text-dark-muted hover:text-earth-brown dark:hover:text-dark-text transition-all cursor-pointer flex items-center gap-1.5"
                 >
                    <Share2 size={15} />
                    <span className="text-[10px] font-bold font-sans uppercase tracking-wider hidden sm:inline">Share</span>
                 </button>

                 {/* Simulated Live Wishlist indicator */}
                 <button 
                   onClick={() => isWishlisted ? removeFromWishlist(book.id) : addToWishlist(book)}
                   className="p-2 bg-white dark:bg-dark-card rounded-xl shadow-xs border border-earth-brown/5 text-earth-brown dark:text-dark-text cursor-pointer hover:bg-earth-brown/5"
                 >
                    <Heart 
                      className={`w-5 h-5 transition-transform hover:scale-110 ${
                         isWishlisted ? 'text-mushroom-red fill-mushroom-red scale-105' : 'text-earth-brown/50 dark:text-dark-muted'
                      }`} 
                    />
                 </button>

                 {/* Simulated active cart status bundle */}
                 <div className="relative cursor-pointer" onClick={() => navigate('/cart')}>
                    <ShoppingBag className="w-6 h-6 text-earth-brown dark:text-dark-text" />
                    <span className="absolute -top-1 -right-1 bg-mushroom-red text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                       {cartCount}
                    </span>
                 </div>
              </div>

          </div>
       </header>

       {/* Temporary Toast for Dynamic Social Shares */}
       <AnimatePresence>
         {showShareConfirm && (
           <motion.div 
             initial={{ y: -30, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             exit={{ y: -30, opacity: 0 }}
             className="fixed top-24 left-1/2 -translate-x-1/2 bg-moss-green text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl flex items-center gap-2 z-[200] border border-white/20"
           >
              <Check size={14} className="text-white" />
              Manuscript Link Copied to Clipboard
           </motion.div>
         )}
       </AnimatePresence>

       {/* Toast notification for basket additions */}
       <AnimatePresence>
         {isAddedToCart && (
           <motion.div 
             initial={{ x: 100, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             exit={{ x: 100, opacity: 0 }}
             className="fixed bottom-36 right-6 bg-[#1a2d1d] text-white px-6 py-4 rounded-[2rem] text-xs font-bold uppercase tracking-widest shadow-2xl flex items-center gap-3 z-[200] border-l-4 border-moss-green max-w-sm"
           >
              <div className="w-8 h-8 rounded-full bg-moss-green/20 flex items-center justify-center">
                 <ShoppingBag size={14} className="text-moss-green" />
              </div>
              <div>
                 <span className="block font-serif text-white font-bold leading-tight line-clamp-1">{book.title}</span>
                 <span className="text-[10px] text-zinc-300 font-sans tracking-wide lowercase pt-0.5 block">added to woodland library bags</span>
              </div>
           </motion.div>
         )}
       </AnimatePresence>

       {/* Main Content Layout Container */}
       <main className="max-w-7xl mx-auto px-6 py-8">
          
          {/* Breadcrumb row */}
          <nav className="mb-8 flex items-center gap-1.5 text-[10px] font-bold text-earth-brown/40 dark:text-dark-muted uppercase tracking-widest">
             <span className="hover:text-moss-green cursor-pointer" onClick={() => navigate('/')}>Home</span>
             <ChevronRight size={10} />
             <span className="hover:text-moss-green cursor-pointer" onClick={() => navigate(`/category/${book.category}`)}>{book.category}</span>
             <ChevronRight size={10} />
             <span className="text-earth-brown/80 dark:text-dark-text truncate max-w-xs">{book.title}</span>
          </nav>

          {/* Symmetrical Two-Column Master Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
             
             {/* LEFT COLUMN: Sticky Visual Showcase */}
             <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start space-y-6">
                <ProductGallery 
                  coverImage={book.coverImage} 
                  title={book.title} 
                  author={book.author} 
                />
             </div>

             {/* RIGHT COLUMN: Interactive editorial spec descriptions, reviews section, buy panels */}
             <div className="lg:col-span-7 space-y-10">
                
                {/* 1. Interactive Core Specifications */}
                <ProductInfo book={book} />

                {/* 2. Cozy Premium Pricing & Checkout Section */}
                <section className="p-6 md:p-8 bg-white/60 dark:bg-dark-card/30 rounded-[2.5rem] border border-earth-brown/5 space-y-6 shadow-xs select-none">
                   
                   {/* Format / Delivery Method Select Cards */}
                   <div className="space-y-3">
                      <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#2c3d2e] dark:text-dark-muted block">Select Edition Format</span>
                      <div className="grid grid-cols-2 gap-3">
                         
                         {/* Printed Selection Card */}
                         <button
                            type="button"
                            onClick={() => setPurchaseType('physical')}
                            className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-24 w-full cursor-pointer ${
                               purchaseType === 'physical'
                                  ? 'bg-moss-green/10 dark:bg-[#1a2d1d] border-moss-green font-bold'
                                  : 'bg-white/40 dark:bg-dark-card/20 border-earth-brown/5 hover:bg-earth-brown/[0.03]'
                            }`}
                         >
                            <div className="flex items-center justify-between w-full">
                               <span className="font-serif font-bold text-xs text-earth-brown dark:text-dark-text">Printed Bound Book</span>
                               <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${purchaseType === 'physical' ? 'border-moss-green bg-moss-green' : 'border-earth-brown/25'}`}>
                                  {purchaseType === 'physical' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                               </span>
                            </div>
                            <div>
                               <span className="text-[10px] text-earth-brown/50 dark:text-dark-muted block font-sans">Hardcover / Paperback</span>
                               <span className="font-mono text-xs font-bold text-earth-brown dark:text-dark-text">
                                  ${(book.bookType === 'physical' ? (book.discountPrice || book.price) : (book.discountPrice || book.price) + 7.00).toFixed(2)}
                               </span>
                            </div>
                         </button>

                         {/* Ebook Selection Card */}
                         <button
                            type="button"
                            onClick={() => setPurchaseType('ebook')}
                            className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-24 w-full cursor-pointer ${
                               purchaseType === 'ebook'
                                  ? 'bg-moss-green/10 dark:bg-[#1a2d1d] border-moss-green font-bold'
                                  : 'bg-white/40 dark:bg-dark-card/20 border-earth-brown/5 hover:bg-earth-brown/[0.03]'
                            }`}
                         >
                            <div className="flex items-center justify-between w-full">
                               <span className="font-serif font-bold text-xs text-earth-brown dark:text-dark-text">E-Book Edition</span>
                               <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${purchaseType === 'ebook' ? 'border-moss-green bg-moss-green' : 'border-earth-brown/25'}`}>
                                  {purchaseType === 'ebook' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                               </span>
                            </div>
                            <div>
                               <span className="text-[10px] text-earth-brown/50 dark:text-dark-muted block font-sans">Instant Download</span>
                               <span className="font-mono text-xs font-bold text-moss-green">
                                  ${(book.bookType === 'ebook' ? (book.discountPrice || book.price) : Math.max(4.99, (book.discountPrice || book.price) - 6.00)).toFixed(2)}
                               </span>
                            </div>
                         </button>

                      </div>
                   </div>

                   {/* Subformat choosing for E-Books */}
                   <AnimatePresence>
                      {purchaseType === 'ebook' && (
                         <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3 bg-earth-brown/[0.02] dark:bg-white/[0.02] p-4 rounded-2xl border border-earth-brown/5"
                         >
                            <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-[#2c3d2e] dark:text-dark-muted flex items-center gap-1">
                               ⚡ Select Digital File Extension:
                            </span>
                            <div className="grid grid-cols-3 gap-2">
                               {['PDF', 'EPUB', 'Audio'].map((fmt) => (
                                  <button
                                     key={fmt}
                                     type="button"
                                     onClick={() => setEbookFormat(fmt as any)}
                                     className={`py-2 px-1 rounded-xl text-[10px] font-sans font-bold tracking-wider transition-all uppercase cursor-pointer ${
                                        ebookFormat === fmt
                                           ? 'bg-moss-green text-white shadow-md shadow-moss-green/15'
                                           : 'bg-white dark:bg-dark-card border border-earth-brown/5 text-earth-brown/70 dark:text-dark-muted hover:bg-earth-brown/5'
                                     }`}
                                  >
                                     {fmt === 'Audio' ? 'Audiobook' : fmt}
                                  </button>
                               ))}
                            </div>
                            <p className="text-[9px] font-sans text-earth-brown/50 dark:text-dark-muted leading-relaxed mt-1">
                               {ebookFormat === 'PDF' && '📥 High fidelity PDF file, beautiful layout with original illustrations.'}
                               {ebookFormat === 'EPUB' && '📱 Flowable text EPUB format, optimal for Kindle, Kobo, and phone screens.'}
                               {ebookFormat === 'Audio' && '🎙️ Full-cast audio recording + immersive background soundtrack in high quality.'}
                            </p>
                         </motion.div>
                      )}
                   </AnimatePresence>

                   {/* Main numbers breakdown */}
                   <div className="flex flex-wrap items-center justify-between gap-4">
                      
                      {/* Price labels */}
                      <div className="space-y-1">
                         <span className="text-[10px] font-bold text-earth-brown/40 dark:text-dark-muted uppercase tracking-widest block font-sans">Active Format Subtotal</span>
                         <div className="flex items-baseline gap-3">
                            <span className="text-3xl md:text-4.5xl font-serif font-bold text-earth-brown dark:text-dark-text leading-none">
                               ${currentFormatPrice.toFixed(2)}
                            </span>
                            {book.discountPrice && (
                               <>
                                 <span className="text-sm text-earth-brown/40 dark:text-dark-muted line-through">
                                    ${currentOriginalPrice.toFixed(2)}
                                 </span>
                                 <span className="text-[10px] bg-[#d4a373] text-white px-2 py-0.5 rounded-lg font-bold">
                                    Save {book.discountPercent || '-29%'}
                                 </span>
                               </>
                            )}
                         </div>
                      </div>

                      {/* Stock Level Countdown */}
                      <div className="px-4 py-2 bg-[#faf9f6] dark:bg-dark-bg rounded-xl border border-earth-brown/10 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-moss-green opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-moss-green"></span>
                        </span>
                        <span className="text-[10px] font-bold text-moss-green uppercase tracking-wider">
                           {purchaseType === 'physical' ? `Only ${book.title.length % 4 + 2} printed copies left!` : 'Instant delivery guaranteed'}
                        </span>
                      </div>

                   </div>

                   {/* Add-to-cart Quantity Selector and Quick CTA buttons row */}
                   <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-3.5">
                         
                         {/* Interactive state counter */}
                         <div className="flex items-center justify-between bg-earth-brown/[0.03] dark:bg-white/[0.03] border border-earth-brown/5 px-4.5 py-4 rounded-2xl w-full sm:w-32">
                            <button 
                              onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}
                              className="w-8 h-8 rounded-full bg-white dark:bg-dark-card shadow-xs flex items-center justify-center font-bold text-lg text-earth-brown border border-earth-brown/5 cursor-pointer hover:bg-earth-brown/5"
                            >
                               -
                            </button>
                            <span className="font-bold font-serif text-earth-brown dark:text-dark-text self-center text-sm">{purchaseQuantity}</span>
                            <button 
                              onClick={() => setPurchaseQuantity(purchaseQuantity + 1)}
                              className="w-8 h-8 rounded-full bg-white dark:bg-dark-card shadow-xs flex items-center justify-center font-bold text-lg text-earth-brown border border-earth-brown/5 cursor-pointer hover:bg-earth-brown/5"
                            >
                               +
                            </button>
                         </div>

                         {/* Add To Cart button with live visual feedback */}
                         <button
                           onClick={handleAddToCart}
                           className="flex-1 bg-moss-green hover:bg-moss-green/90 text-white py-4 px-6 rounded-2xl font-bold uppercase text-xs tracking-widest shadow-xl shadow-moss-green/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                         >
                            <ShoppingBag className="w-4 h-4 text-white" />
                            Add to bag - {userFriendlyFormatLabel}
                         </button>
                      </div>

                      {/* Prime speed buy-now */}
                      <button
                        onClick={handleBuyNow}
                        className="w-full bg-[#fcfcfc] dark:bg-dark-card/90 border border-moss-green/20 hover:bg-moss-green/5 text-earth-brown dark:text-dark-text py-3.5 rounded-2xl font-bold uppercase text-xs tracking-widest transition-colors cursor-pointer"
                      >
                         Secure Checkout: Buy Now
                      </button>
                   </div>

                   {/* Assured Delivery Badging */}
                   <div className="grid grid-cols-3 gap-2.5 border-t border-earth-brown/[0.05] pt-5 select-none text-[9.5px] font-bold text-earth-brown/45 dark:text-dark-muted uppercase tracking-wider">
                      <div className="flex items-center gap-1.5 justify-center">
                         <Truck size={13} className="text-moss-green" />
                         <span>Realmwide Shipping</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-center">
                         <RefreshCcw size={13} className="text-moss-green" />
                         <span>Easy Scroll Swap</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-center">
                         <ShieldCheck size={13} className="text-moss-green" />
                         <span>Safe DRM Sealing</span>
                      </div>
                   </div>

                </section>

                {/* 3. Highly structured reviews interface */}
                <ReviewsSection 
                  initialReviews={REVIEWS} 
                  bookTitle={book.title} 
                />

                {/* 4. Horizontal Immersive Carousel Recommendations */}
                <RecommendationCarousel 
                  currentBookId={book.id} 
                  category={book.category} 
                />

             </div>

          </div>
       </main>

       {/* Smart Scroll Sticky Checkout Bar */}
       <StickyCartBar book={book} />

       {/* Real Interactive Checkout Modal Box for simulated "Buy Now" flow */}
       <AnimatePresence>
         {checkoutModalOpen && (
           <>
             {/* Blur Backdrop overlay */}
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setCheckoutModalOpen(false)}
               className="fixed inset-0 z-[500] bg-black/75 backdrop-blur-md"
             />

             {/* Interactive modal popup */}
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 50 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 50 }}
               className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-parchment dark:bg-dark-bg z-[510] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] rounded-[3rem] p-8 text-earth-brown border border-moss-green/10"
             >
                <div className="text-center space-y-4">
                   <div className="w-16 h-16 bg-moss-green/15 text-moss-green rounded-full flex items-center justify-center mx-auto mb-2">
                       <Sparkles size={28} className="animate-pulse" />
                   </div>
                   
                   <div className="space-y-1.5 selection:bg-moss-green/10">
                      <h3 className="font-serif text-2xl font-bold">Secure Sanctuary Order</h3>
                      <p className="text-xs text-earth-brown/60 dark:text-dark-muted leading-relaxed max-w-xs mx-auto">
                         The manuscript bindings are ready for dispatch to your digital e-library sanctuary.
                      </p>
                   </div>

                   {/* Cost list review */}
                   <div className="bg-[#fcfaf5] dark:bg-dark-card/40 p-4.5 rounded-2xl text-xs space-y-2 text-left border border-earth-brown/5">
                      <div className="flex justify-between font-medium">
                         <span>{book.title} (x{purchaseQuantity})</span>
                         <span>${((book.discountPrice || book.price) * purchaseQuantity).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                         <span>Gilded Scribe Seal & Tax</span>
                         <span>${salesTax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium text-moss-green">
                         <span>Shipping Charge</span>
                         <span>FREE</span>
                      </div>
                      <div className="h-[1px] bg-earth-brown/10 dark:bg-white/10 my-1" />
                      <div className="flex justify-between font-bold text-sm">
                         <span>Grand Sanctuary Total</span>
                         <span className="font-mono text-moss-green">${checkoutTotal.toFixed(2)}</span>
                      </div>
                   </div>

                   {/* Custom credentials fields */}
                   <div className="space-y-3 pt-2 text-left">
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold text-earth-brown/50 dark:text-dark-muted uppercase tracking-wider block">Recipient Digital Address</label>
                        <input 
                          type="email" 
                          value="jjjumanaaaa@gmail.com" 
                          disabled
                          className="w-full bg-[#fdfaf1] dark:bg-dark-card px-4 py-2.5 rounded-lg border border-earth-brown/10 text-xs font-semibold text-earth-brown/65" 
                        />
                     </div>
                   </div>

                   {/* Confirmation trigger */}
                   <div className="flex gap-3 pt-4">
                      <button 
                        onClick={() => setCheckoutModalOpen(false)}
                        className="flex-1 py-3 border border-earth-brown/15 rounded-xl text-xs font-bold uppercase tracking-wider text-earth-brown/60 hover:bg-earth-brown/5"
                      >
                         Cancel
                      </button>
                      <button 
                        onClick={() => {
                          setCheckoutModalOpen(false);
                          setIsAddedToCart(true);
                          navigate('/library');
                        }}
                        className="flex-1 py-3 bg-moss-green hover:bg-moss-green/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-moss-green/10"
                      >
                         Seal Checkout
                      </button>
                   </div>
                </div>
             </motion.div>
           </>
         )}
       </AnimatePresence>

    </div>
  );
};
