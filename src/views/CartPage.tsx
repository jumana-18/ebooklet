import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  ArrowLeft, 
  Trash2, 
  Heart, 
  ChevronRight, 
  Tag, 
  Sparkles, 
  Activity, 
  Clock, 
  Gift, 
  Plus, 
  Minus, 
  CheckCircle, 
  Compass, 
  ShieldCheck,
  AlertCircle,
  Truck
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const CartPage = () => {
  const navigate = useNavigate();
  const { cart: rawCart, wishlist: rawWishlist, removeFromCart, updateCartQuantity, addToWishlist, removeFromWishlist, isInWishlist } = useShop();

  const cart = Array.isArray(rawCart) ? rawCart : [];
  const wishlist = Array.isArray(rawWishlist) ? rawWishlist : [];

  const [promoCode, setPromoCode] = useState('');
  const [activeDiscount, setActiveDiscount] = useState<{ code: string; percent: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Handle promo code submissions
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === 'COZYMOSS' || code === 'BOOKLET25') {
      setActiveDiscount({ code, percent: 0.25 });
      setPromoSuccess('Promo code applied successfully! You saved 25% on your order!');
      setPromoError('');
    } else if (code === 'FAIRYTALE' || code === 'ELF') {
      setActiveDiscount({ code, percent: 0.15 });
      setPromoSuccess('Promo code applied successfully! You saved 15% on your order!');
      setPromoError('');
    } else if (code) {
      setPromoError('This code is incorrect or expired. Try using "COZYMOSS" instead!');
      setPromoSuccess('');
    }
  };

  // Move item to Wishlist helper
  const handleMoveToWishlist = (item: any) => {
    if (!isInWishlist(item.book.id)) {
      addToWishlist(item.book);
    }
    removeFromCart(item.book.id);
  };

  // Monetary calculations & format splitting
  const physicalItems = cart.filter(item => item.format === 'physical' || item.format === 'Printed Book' || item.format === 'Printed Codex');
  const ebookItems = cart.filter(item => item.format !== 'physical' && item.format !== 'Printed Book' && item.format !== 'Printed Codex');

  const totalPhysicalQuantity = physicalItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalEbookQuantity = ebookItems.reduce((acc, item) => acc + item.quantity, 0);

  const physicalSubtotal = physicalItems.reduce((acc, item) => {
    const price = item.book.discountPrice || item.book.price;
    return acc + price * item.quantity;
  }, 0);

  const ebookSubtotal = ebookItems.reduce((acc, item) => {
    const price = item.book.discountPrice || item.book.price;
    return acc + price * item.quantity;
  }, 0);

  const subtotal = physicalSubtotal + ebookSubtotal;

  const discountAmount = activeDiscount ? subtotal * activeDiscount.percent : 0;
  
  // Determine if there are physical printed books
  const hasPhysicalBooks = physicalItems.length > 0;
  
  // Tax rate (8.5%)
  const taxRate = 0.085;
  const salesTax = (subtotal - discountAmount) * taxRate;
  
  // If only ebooks are in the cart, delivery is completely free.
  // Otherwise, standard shipping is free for orders over $35, else $4.99.
  const deliveryCharges = !hasPhysicalBooks ? 0 : (subtotal > 35 ? 0 : 4.99);
  const estimatedGrandTotal = subtotal + salesTax + deliveryCharges - discountAmount;

  return (
    <main className="min-h-screen bg-parchment dark:bg-dark-bg pb-32 pt-4 px-4 md:px-8 transition-colors duration-300 select-none">
      <div className="max-w-6xl mx-auto">
        
        {/* Sticky PDP styled Header */}
        <header className="mb-8 space-y-4">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-earth-brown/60 dark:text-dark-muted hover:text-earth-brown dark:hover:text-dark-text transition-colors text-xs font-bold uppercase tracking-widest cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-moss-green" />
            Back to Book Shop
          </button>
          
          <div className="flex items-center justify-between border-b border-earth-brown/10 dark:border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-moss-green/10 flex items-center justify-center text-moss-green">
                 <ShoppingBag className="w-5.5 h-5.5" />
              </div>
              <div>
                 <h1 className="text-3xl font-serif font-bold text-earth-brown dark:text-dark-text tracking-wide uppercase">Your Shopping Cart</h1>
                 <p className="text-xs text-earth-brown/50 dark:text-dark-muted font-sans font-medium">Review your reading list and physical books before checkout.</p>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
               <span className="text-[10px] font-mono font-bold bg-[#ebe3d3] dark:bg-dark-card text-earth-brown/70 dark:text-dark-text px-3 py-1 rounded-full uppercase tracking-widest">
                  {cart.length} {cart.length === 1 ? 'Book' : 'Books'}
               </span>
               {cart.length > 0 && subtotal > 35 && hasPhysicalBooks && (
                 <span className="text-[9px] text-[#2e7d32] dark:text-moss-green font-bold uppercase tracking-wider flex items-center gap-1">
                   <Sparkles className="w-3 h-3 animate-pulse" /> Free Shipping Unlocked!
                 </span>
               )}
            </div>
          </div>
        </header>

        <AnimatePresence mode="popLayout">
          {cart.length === 0 ? (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="py-20 px-6 bg-[#f9f5eb] dark:bg-dark-card/20 rounded-[2.5rem] border border-earth-brown/5 text-center space-y-6 max-w-xl mx-auto shadow-inner"
            >
              <div className="text-6xl select-none animate-pulse">📚✨</div>
              <div className="space-y-1.5">
                 <h2 className="text-2xl font-serif font-bold text-earth-brown dark:text-dark-text uppercase font-bold tracking-wide">Your Cart is Empty</h2>
                 <p className="text-xs text-earth-brown/60 dark:text-dark-muted max-w-sm mx-auto leading-relaxed">
                   You don't have any books in your cart yet. Explore our curated library of beautiful e-books and printed classics to find your next adventure!
                 </p>
              </div>
              <button 
                onClick={() => navigate('/')}
                className="px-8 py-4 bg-earth-brown dark:bg-moss-green hover:bg-[#32230e] text-white text-xs font-bold uppercase tracking-widest rounded-2xl shadow-xl transition-all flex items-center gap-2 mx-auto cursor-pointer"
              >
                 <Compass size={14} /> Browse Catalog
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Cart items scroller */}
              <div className="lg:col-span-7 space-y-8">
                
                {/* 1. Printed Books Section */}
                {physicalItems.length > 0 && (
                   <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-earth-brown/10 dark:border-white/5 pb-2">
                         <span className="text-sm font-serif font-bold text-earth-brown dark:text-dark-text uppercase tracking-wider">Printed Bound Books</span>
                         <span className="text-[10px] bg-earth-brown/5 dark:bg-dark-card px-2 py-0.5 rounded-full font-mono text-earth-brown/70 dark:text-dark-muted">
                            {totalPhysicalQuantity} {totalPhysicalQuantity === 1 ? 'item' : 'items'}
                         </span>
                      </div>
                      
                      <div className="space-y-4">
                         {physicalItems.map((item, idx) => {
                           const isLoved = isInWishlist(item.book.id);
                           const bookPrice = item.book.discountPrice || item.book.price;
                           const rowTotal = bookPrice * item.quantity;
                           
                           return (
                             <motion.div
                               key={`${item.book.id}-${item.format}-${idx}`}
                               layout
                               initial={{ opacity: 0, y: 15 }}
                               animate={{ opacity: 1, y: 0 }}
                               exit={{ opacity: 0, x: -60 }}
                               className="bg-white/80 dark:bg-dark-card/80 border border-earth-brown/5 rounded-[2rem] p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs relative hover:border-moss-green/10 transition-colors"
                             >
                                <div className="flex gap-4 items-center w-full sm:w-auto">
                                  {/* Book Image */}
                                  <div 
                                    onClick={() => navigate(`/book/${item.book.id}`)}
                                    className="w-20 h-28 rounded-xl overflow-hidden shadow-lg border border-earth-brown/10 dark:border-white/5 flex-shrink-0 cursor-pointer"
                                  >
                                    <img src={item.book.coverImage} alt={item.book.title} className="w-full h-full object-cover select-none" referrerPolicy="no-referrer" />
                                  </div>

                                  {/* Basic metadata */}
                                  <div className="min-w-0 pr-2">
                                    <h3 
                                      onClick={() => navigate(`/book/${item.book.id}`)}
                                      className="font-serif text-sm font-bold text-earth-brown dark:text-dark-text hover:text-moss-green transition-colors cursor-pointer truncate leading-snug"
                                    >
                                      {item.book.title}
                                    </h3>
                                    <p className="text-[10px] text-earth-brown/50 dark:text-dark-muted font-sans font-semibold mt-0.5 truncate">{item.book.author}</p>
                                    
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                      <span className="text-[9px] px-2 py-0.5 rounded font-sans font-bold bg-[#ebe3d3] dark:bg-dark-card text-earth-brown/70 dark:text-dark-text select-none uppercase tracking-widest leading-none">
                                        Printed Edition
                                      </span>
                                      <span className="text-[10px] font-semibold text-[#8b5a2b] dark:text-amber-500/80 flex items-center gap-1">
                                         <Truck className="w-3 h-3" /> Parcel Delivery
                                      </span>
                                    </div>

                                    {item.book.isBestSeller && (
                                      <div className="text-[9px] font-bold text-terracotta bg-terracotta/5 rounded px-1.5 py-0.5 w-max mt-2 text-center select-none uppercase tracking-widest leading-none">
                                         In high demand
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Quantity steerers & removal controls */}
                                <div className="flex flex-col items-start sm:items-end justify-center gap-2.5 w-full sm:w-auto mt-4 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-earth-brown/5">
                                   <div className="text-right hidden sm:block">
                                      <p className="text-[10px] font-sans font-bold uppercase text-earth-brown/40 dark:text-dark-muted">Sum</p>
                                      <p className="text-sm font-mono font-bold text-earth-brown dark:text-dark-text">${rowTotal.toFixed(2)}</p>
                                      <span className="text-[10px] text-earth-brown/40 dark:text-dark-muted">${bookPrice.toFixed(2)} ea</span>
                                   </div>

                                   <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                                      {/* Stepper with custom bounce microinteractions */}
                                      <div className="flex items-center p-1 bg-parchment dark:bg-dark-bg border border-earth-brown/10 rounded-xl shadow-inner select-none">
                                         <button
                                           onClick={() => updateCartQuantity(item.book.id, item.format, item.quantity - 1)}
                                           className="w-7 h-7 bg-white dark:bg-dark-card rounded-lg flex items-center justify-center text-earth-brown dark:text-dark-text hover:bg-moss-green hover:text-white dark:hover:bg-moss-green active:scale-90 transition-all cursor-pointer"
                                         >
                                            <Minus size={11} />
                                         </button>
                                         <span className="font-mono text-xs font-bold w-7 text-center dark:text-dark-text select-none">
                                           {item.quantity}
                                         </span>
                                         <button
                                           onClick={() => updateCartQuantity(item.book.id, item.format, item.quantity + 1)}
                                           className="w-7 h-7 bg-white dark:bg-dark-card rounded-lg flex items-center justify-center text-earth-brown dark:text-dark-text hover:bg-moss-green hover:text-white dark:hover:bg-moss-green active:scale-90 transition-all cursor-pointer"
                                         >
                                            <Plus size={11} />
                                         </button>
                                      </div>

                                      <span className="font-mono text-sm font-bold text-earth-brown dark:text-dark-text sm:hidden select-none">${rowTotal.toFixed(2)}</span>
                                   </div>

                                   {/* Dual utility actions */}
                                   <div className="flex gap-2.5 items-center sm:mt-1 justify-between w-full sm:w-auto">
                                      <button 
                                        onClick={() => handleMoveToWishlist(item)}
                                        className="p-1 px-2.5 hover:text-mushroom-red dark:text-dark-muted hover:bg-mushroom-red/10 dark:hover:bg-mushroom-red/15 rounded-lg text-earth-brown/50 transition-all flex items-center justify-center gap-1 cursor-pointer"
                                        title={isLoved ? "In wishlist" : "Save for later"}
                                      >
                                         <Heart size={13} className={isLoved ? "text-mushroom-red fill-mushroom-red animate-pulse" : ""} />
                                         <span className="text-[10px] uppercase tracking-widest font-bold">Save</span>
                                      </button>

                                      <button 
                                        onClick={() => removeFromCart(item.book.id, item.format)}
                                        className="p-1 px-2.5 hover:text-[#cd4e4e] dark:text-dark-muted hover:bg-red-500/10 rounded-lg text-earth-brown/50 transition-all flex items-center justify-center gap-1 cursor-pointer"
                                        title="Remove from Cart"
                                      >
                                         <Trash2 size={13} />
                                         <span className="text-[10px] uppercase tracking-widest font-bold">Remove</span>
                                      </button>
                                   </div>
                                </div>
                             </motion.div>
                           );
                         })}
                      </div>
                   </div>
                )}

                {/* 2. E-Books Section */}
                {ebookItems.length > 0 && (
                   <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-earth-brown/10 dark:border-white/5 pb-2">
                         <span className="text-sm font-serif font-bold text-earth-brown dark:text-dark-text uppercase tracking-wider">Instant E-Books & Audiobooks</span>
                         <span className="text-[10px] bg-moss-green/10 dark:bg-[#152417] px-2 py-0.5 rounded-full font-mono text-moss-green font-bold">
                            {totalEbookQuantity} {totalEbookQuantity === 1 ? 'item' : 'items'}
                         </span>
                      </div>
                      
                      <div className="space-y-4">
                         {ebookItems.map((item, idx) => {
                           const isLoved = isInWishlist(item.book.id);
                           const bookPrice = item.book.discountPrice || item.book.price;
                           const rowTotal = bookPrice * item.quantity;
                           
                           return (
                             <motion.div
                               key={`${item.book.id}-${item.format}-${idx}`}
                               layout
                               initial={{ opacity: 0, y: 15 }}
                               animate={{ opacity: 1, y: 0 }}
                               exit={{ opacity: 0, x: -60 }}
                               className="bg-white/80 dark:bg-dark-card/80 border border-earth-brown/5 rounded-[2rem] p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs relative hover:border-moss-green/10 transition-colors"
                             >
                                <div className="flex gap-4 items-center w-full sm:w-auto">
                                  {/* Book Image */}
                                  <div 
                                    onClick={() => navigate(`/book/${item.book.id}`)}
                                    className="w-20 h-28 rounded-xl overflow-hidden shadow-lg border border-earth-brown/10 dark:border-white/5 flex-shrink-0 cursor-pointer"
                                  >
                                    <img src={item.book.coverImage} alt={item.book.title} className="w-full h-full object-cover select-none" referrerPolicy="no-referrer" />
                                  </div>

                                  {/* Basic metadata */}
                                  <div className="min-w-0 pr-2">
                                    <h3 
                                      onClick={() => navigate(`/book/${item.book.id}`)}
                                      className="font-serif text-sm font-bold text-earth-brown dark:text-dark-text hover:text-moss-green transition-colors cursor-pointer truncate leading-snug"
                                    >
                                      {item.book.title}
                                    </h3>
                                    <p className="text-[10px] text-earth-brown/50 dark:text-dark-muted font-sans font-semibold mt-0.5 truncate">{item.book.author}</p>
                                    
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                      <span className="text-[9px] px-2 py-0.5 rounded font-sans font-bold bg-[#1a3d24]/10 dark:bg-moss-green/20 text-moss-green select-none uppercase tracking-widest leading-none">
                                        E-Book ({item.format})
                                      </span>
                                      <span className="text-[10px] font-semibold text-moss-green flex items-center gap-1">
                                         <Clock className="w-3 h-3 text-moss-green" /> Instant Download
                                      </span>
                                    </div>

                                    {item.book.isBestSeller && (
                                      <div className="text-[9px] font-bold text-terracotta bg-terracotta/5 rounded px-1.5 py-0.5 w-max mt-2 text-center select-none uppercase tracking-widest leading-none">
                                         In high demand
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Quantity steerers & removal controls */}
                                <div className="flex flex-col items-start sm:items-end justify-center gap-2.5 w-full sm:w-auto mt-4 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-earth-brown/5">
                                   <div className="text-right hidden sm:block">
                                      <p className="text-[10px] font-sans font-bold uppercase text-earth-brown/40 dark:text-dark-muted">Sum</p>
                                      <p className="text-sm font-mono font-bold text-earth-brown dark:text-dark-text">${rowTotal.toFixed(2)}</p>
                                      <span className="text-[10px] text-earth-brown/40 dark:text-dark-muted">${bookPrice.toFixed(2)} ea</span>
                                   </div>

                                   <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                                      {/* Stepper with custom bounce microinteractions */}
                                      <div className="flex items-center p-1 bg-parchment dark:bg-dark-bg border border-earth-brown/10 rounded-xl shadow-inner select-none">
                                         <button
                                           onClick={() => updateCartQuantity(item.book.id, item.format, item.quantity - 1)}
                                           className="w-7 h-7 bg-white dark:bg-dark-card rounded-lg flex items-center justify-center text-earth-brown dark:text-dark-text hover:bg-moss-green hover:text-white dark:hover:bg-moss-green active:scale-90 transition-all cursor-pointer"
                                         >
                                            <Minus size={11} />
                                         </button>
                                         <span className="font-mono text-xs font-bold w-7 text-center dark:text-dark-text select-none">
                                           {item.quantity}
                                         </span>
                                         <button
                                           onClick={() => updateCartQuantity(item.book.id, item.format, item.quantity + 1)}
                                           className="w-7 h-7 bg-white dark:bg-dark-card rounded-lg flex items-center justify-center text-earth-brown dark:text-dark-text hover:bg-moss-green hover:text-white dark:hover:bg-moss-green active:scale-90 transition-all cursor-pointer"
                                         >
                                            <Plus size={11} />
                                         </button>
                                      </div>

                                      <span className="font-mono text-sm font-bold text-earth-brown dark:text-dark-text sm:hidden select-none">${rowTotal.toFixed(2)}</span>
                                   </div>

                                   {/* Dual utility actions */}
                                   <div className="flex gap-2.5 items-center sm:mt-1 justify-between w-full sm:w-auto">
                                      <button 
                                        onClick={() => handleMoveToWishlist(item)}
                                        className="p-1 px-2.5 hover:text-mushroom-red dark:text-dark-muted hover:bg-mushroom-red/10 dark:hover:bg-mushroom-red/15 rounded-lg text-earth-brown/50 transition-all flex items-center justify-center gap-1 cursor-pointer"
                                        title={isLoved ? "In wishlist" : "Save for later"}
                                      >
                                         <Heart size={13} className={isLoved ? "text-mushroom-red fill-mushroom-red animate-pulse" : ""} />
                                         <span className="text-[10px] uppercase tracking-widest font-bold">Save</span>
                                      </button>

                                      <button 
                                        onClick={() => removeFromCart(item.book.id, item.format)}
                                        className="p-1 px-2.5 hover:text-[#cd4e4e] dark:text-dark-muted hover:bg-red-500/10 rounded-lg text-earth-brown/50 transition-all flex items-center justify-center gap-1 cursor-pointer"
                                        title="Remove from Cart"
                                      >
                                         <Trash2 size={13} />
                                         <span className="text-[10px] uppercase tracking-widest font-bold">Remove</span>
                                      </button>
                                   </div>
                                </div>
                             </motion.div>
                           );
                         })}
                      </div>
                   </div>
                )}

                {/* Additional cozy prompt */}
                <div className="p-4 bg-white/40 dark:bg-dark-card/10 border border-dashed border-earth-brown/10 rounded-2xl flex items-center gap-3">
                   <ShieldCheck className="w-5 h-5 text-moss-green flex-shrink-0" />
                   <p className="text-[11px] text-earth-brown/60 dark:text-dark-muted leading-relaxed">
                      All digital e-books and audiobooks are protected with standard DRM encryption and can be accessed directly across your favorite reading devices immediately after checkout.
                   </p>
                </div>
              </div>

              {/* Right Column: Calculations Receipt & Promos */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Promo Code Invocation Entry */}
                <div className="bg-white/85 dark:bg-dark-card/90 border border-earth-brown/5 p-5 rounded-[2rem] shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                     <Tag className="w-4 h-4 text-moss-green" />
                     <h3 className="text-xs font-bold text-earth-brown dark:text-dark-text uppercase tracking-widest font-sans">Coupons & Promo Codes</h3>
                  </div>

                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                     <input 
                       type="text" 
                       placeholder="Enter promo code (e.g. COZYMOSS)" 
                       value={promoCode}
                       onChange={(e) => setPromoCode(e.target.value)}
                       className="flex-1 bg-parchment dark:bg-dark-bg border border-earth-brown/10 rounded-xl text-xs font-mono py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-moss-green dark:text-dark-text"
                     />
                     <button
                       type="submit"
                       className="px-5 py-2.5 bg-earth-brown dark:bg-moss-green hover:bg-earth-brown/95 text-[#fdfaf2] text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
                     >
                        Apply
                     </button>
                  </form>

                  {promoError && (
                     <div className="text-[10px] text-red-500 font-medium flex items-center gap-1.5 bg-red-500/5 p-2 rounded">
                        <AlertCircle size={12} /> {promoError}
                     </div>
                  )}

                  {promoSuccess && (
                     <div className="text-[10px] text-green-600 dark:text-moss-green font-medium flex items-center gap-1.5 bg-green-500/5 dark:bg-moss-green/5 p-2 rounded">
                        <CheckCircle size={12} /> {promoSuccess}
                     </div>
                  )}

                  {!activeDiscount && (
                     <div className="p-3 bg-[#fbf9f3] dark:bg-dark-card/50 rounded-xl border border-[#ede9df] dark:border-white/5 space-y-1">
                        <p className="text-[10px] font-sans font-bold text-moss-green flex items-center gap-1 uppercase">
                           <Sparkles className="w-3 h-3 animate-bounce" /> Available Deals
                        </p>
                        <p className="text-[10px] text-earth-brown/60 dark:text-dark-muted leading-relaxed">
                           Use code <strong className="font-mono text-earth-brown dark:text-dark-text bg-[#efeada] dark:bg-dark-card px-1 rounded">COZYMOSS</strong> to save 25% on your entire order.
                        </p>
                     </div>
                  )}
                </div>

                {/* Ledger calculations block */}
                <div className="bg-[#fcfaf5] dark:bg-dark-card border border-earth-brown/10 p-6 rounded-[2.5rem] shadow-lg relative overflow-hidden space-y-6">
                  {/* Subtle watermarks */}
                  <div className="absolute right-0 bottom-0 text-7xl opacity-5 select-none pointer-events-none transform translate-y-4 translate-x-4">🦉</div>
                  
                  <div className="border-b border-earth-brown/10 dark:border-white/5 pb-4">
                     <h3 className="font-serif text-lg font-bold text-earth-brown dark:text-dark-text uppercase tracking-wide">Order Summary</h3>
                     <p className="text-[10px] text-earth-brown/50 dark:text-dark-muted mt-0.5">Summary of prices and shipping fees.</p>
                  </div>

                  <div className="space-y-3">
                     {physicalItems.length > 0 && (
                        <div className="flex justify-between items-center text-xs text-earth-brown/80 dark:text-dark-muted">
                           <span>Printed Books ({totalPhysicalQuantity} {totalPhysicalQuantity === 1 ? 'item' : 'items'})</span>
                           <span className="font-mono font-medium">${physicalSubtotal.toFixed(2)}</span>
                        </div>
                     )}

                     {ebookItems.length > 0 && (
                        <div className="flex justify-between items-center text-xs text-earth-brown/80 dark:text-dark-muted">
                           <span>E-Books & Audios ({totalEbookQuantity} {totalEbookQuantity === 1 ? 'item' : 'items'})</span>
                           <span className="font-mono font-medium text-moss-green">${ebookSubtotal.toFixed(2)}</span>
                        </div>
                     )}

                     <div className="flex justify-between items-center text-xs text-earth-brown/80 dark:text-dark-text border-b border-earth-brown/5 pb-2">
                        <span className="font-bold">Combined Subtotal</span>
                        <span className="font-mono font-bold">${subtotal.toFixed(2)}</span>
                      </div>

                     {activeDiscount && (
                        <div className="flex justify-between items-center text-xs text-[#cd5a11] dark:text-[#f8a87a]">
                           <span>Discount ({activeDiscount.code})</span>
                           <span className="font-mono font-bold">-${discountAmount.toFixed(2)}</span>
                        </div>
                     )}

                     <div className="flex justify-between items-center text-xs text-earth-brown/80 dark:text-dark-muted">
                        <span>Shipping & Delivery Fee</span>
                        {deliveryCharges === 0 ? (
                          <span className="font-bold text-moss-green uppercase text-[10px] tracking-wider">
                            {!hasPhysicalBooks ? "Free Digital Delivery" : "Free Shipping"}
                          </span>
                        ) : (
                          <span className="font-mono font-bold">${deliveryCharges.toFixed(2)}</span>
                        )}
                     </div>

                     <div className="flex justify-between items-center text-xs text-earth-brown/80 dark:text-dark-muted">
                        <span>Sales Tax</span>
                        <span className="font-mono font-bold">${salesTax.toFixed(2)}</span>
                     </div>

                     <div className="border-t border-dashed border-earth-brown/10 dark:border-white/5 pt-4 flex justify-between items-center">
                        <span className="font-serif text-sm font-bold text-earth-brown dark:text-dark-text">Estimated Order Total</span>
                        <div className="text-right">
                           <span className="font-mono text-xl font-bold text-earth-brown dark:text-dark-text">${estimatedGrandTotal.toFixed(2)}</span>
                           <p className="text-[8px] text-earth-brown/40 dark:text-dark-muted uppercase font-sans tracking-widest mt-0.5">Prices in USD</p>
                        </div>
                     </div>
                  </div>

                  {/* Complete Secure Checkout button */}
                  <button 
                    onClick={() => navigate('/checkout', { state: { grandTotal: estimatedGrandTotal, discountCode: activeDiscount?.code || null } })}
                    className="w-full py-4 bg-moss-green hover:bg-moss-green/95 text-[#fdfaf2] text-xs font-serif font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-moss-green/20 transition-all transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                     Proceed to Checkout <ChevronRight size={13} />
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[9px] text-earth-brown/40 dark:text-dark-muted uppercase font-bold tracking-widest">
                     <ShieldCheck size={11} className="text-moss-green" /> 100% Secure Checkout Guaranteed
                  </div>

                </div>

              </div>

            </div>
          )}
        </AnimatePresence>

      </div>

      {/* Floating mobile bottom checkout summary bar - visible on small viewports */}
      {cart.length > 0 && (
         <div className="fixed bottom-20 left-0 right-0 z-[49] px-4 sm:hidden select-none">
            <motion.div 
               initial={{ y: 80, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="bg-white/95 dark:bg-[#152417]/95 backdrop-blur-md rounded-2xl p-4 border border-moss-green/15 flex items-center justify-between shadow-2xl"
            >
               <div className="space-y-0.5">
                  <span className="text-[9px] font-sans font-bold text-earth-brown/40 dark:text-dark-muted uppercase tracking-widest">Grand Total</span>
                  <p className="font-mono text-base font-bold text-[#443621] dark:text-dark-text">${estimatedGrandTotal.toFixed(2)}</p>
                  <p className="text-[8px] text-moss-green font-bold uppercase tracking-widest leading-none">{cart.length} {cart.length === 1 ? 'book' : 'books'}</p>
               </div>
               <button 
                 onClick={() => navigate('/checkout', { state: { grandTotal: estimatedGrandTotal, discountCode: activeDiscount?.code || null } })}
                 className="px-5 py-3 bg-moss-green text-white font-serif text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg cursor-pointer"
               >
                  Checkout Now
               </button>
            </motion.div>
         </div>
      )}

    </main>
  );
};
