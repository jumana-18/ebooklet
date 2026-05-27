import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Filter, 
  ChevronDown, 
  Search, 
  Mic,
  X, 
  LayoutGrid, 
  List,
  Sparkles,
  Tag
} from 'lucide-react';
import { BOOKS, CATEGORIES, READING_BOOKS, NEW_ARRIVALS } from '../constants';
import { BookCard } from '../components/BookCard';
import { Book } from '../types';

export const CategoryView = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = React.useRef<any>(null);

  const [activeFilters, setActiveFilters] = useState({
    priceRange: [0, 50],
    rating: 0,
    format: 'All',
    category: categoryId || 'all'
  });

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser. Please use Google Chrome, Safari, or Microsoft Edge.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSearchQuery(transcript);
        }
      };

      recognition.start();
    } catch (err) {
      console.error("Could not start speech recognition:", err);
      setIsListening(false);
    }
  };

  // Sync state when URL params change
  useEffect(() => {
    setActiveFilters(prev => ({
      ...prev,
      category: categoryId || 'all'
    }));
  }, [categoryId]);

  // Sync URL search queries and filter menu toggles
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam !== null) {
      setSearchQuery(searchParam);
    }
    
    if (params.get('filter') === 'true') {
      setIsFilterOpen(true);
    }
  }, [location.search]);

  // Resolve dynamic banner information
  const themeColors = useMemo(() => {
    switch (categoryId) {
      case 'all': return { 
        name: 'All Ebooks',
        icon: '📚',
        primary: 'from-emerald-900/60', 
        accent: 'text-emerald-400', 
        bg: 'bg-emerald-950',
        image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1200',
        subtitle: 'Explore our entire catalog in one beautifully simple place.'
      };
      case 'trending': return { 
        name: 'Trending Ebooks',
        icon: '🔥',
        primary: 'from-[#604212]/60', 
        accent: 'text-orange-400', 
        bg: 'bg-[#402a0a]',
        image: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=1200',
        subtitle: "Our readers' favorite digital pages and highly demanded stories."
      };
      case 'new-arrivals': return { 
        name: 'New Ebook Arrivals',
        icon: '✨',
        primary: 'from-rose-900/60', 
        accent: 'text-pink-400', 
        bg: 'bg-rose-950',
        image: 'https://images.unsplash.com/photo-1543004218-ee141104332f?auto=format&fit=crop&q=80&w=1200',
        subtitle: 'Explore the newest additions to our collection.'
      };
      case 'recently-viewed': return { 
        name: 'Recently Viewed',
        icon: '📖',
        primary: 'from-[#425042]/60', 
        accent: 'text-emerald-400', 
        bg: 'bg-[#1a2d1d]',
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=1200',
        subtitle: 'Keep tracing your footprints on these continuation books.'
      };
      case 'fantasy': return { 
        name: 'Fantasy',
        icon: '🏰',
        primary: 'from-purple-900/60', 
        accent: 'text-purple-400', 
        bg: 'bg-indigo-950',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200',
        subtitle: 'Curated fantasy stories, selected for an unforgettable reading experience.'
      };
      case 'horror': return { 
        name: 'Horror',
        icon: '🕯️',
        primary: 'from-black/80', 
        accent: 'text-red-500', 
        bg: 'bg-black',
        image: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=1200',
        subtitle: 'Spooky entries, chilling tales and dark shadows of late night.'
      };
      case 'romance': return { 
        name: 'Romance',
        icon: '🌹',
        primary: 'from-pink-900/60', 
        accent: 'text-pink-400', 
        bg: 'bg-rose-950',
        image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=1200',
        subtitle: 'Romantic books focusing on warmth, connection, and devotion.'
      };
      case 'sci-fi': return { 
        name: 'Sci-Fi',
        icon: '🪐',
        primary: 'from-blue-900/60', 
        accent: 'text-cyan-400', 
        bg: 'bg-slate-900',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200',
        subtitle: 'Cosmic explorations, advanced technology and far futures.'
      };
      default: {
        const cat = CATEGORIES.find(c => c.id === categoryId);
        return { 
          name: cat?.name || 'Curated Books', 
          icon: cat?.icon || '📚',
          primary: 'from-forest-green/60', 
          accent: 'text-moss-green', 
          bg: 'bg-forest-green',
          image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200',
          subtitle: `Curated digital ${cat?.name.toLowerCase() || 'stories'} for your daily reading.`
        };
      }
    }
  }, [categoryId]);

  const filteredBooks = useMemo(() => {
    let result: Book[] = [];

    // Select base data according to category context
    const currentCat = activeFilters.category || 'all';

    if (currentCat === 'trending') {
      result = [...BOOKS].filter(book => book.isBestSeller);
    } else if (currentCat === 'new-arrivals') {
      result = [...BOOKS].filter(b => b.isNew).concat([...NEW_ARRIVALS]);
    } else if (currentCat === 'recently-viewed') {
      // Use both dynamic local storage items AND fallbacks
      try {
        const raw = localStorage.getItem('recently_viewed_books');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            result = parsed;
          }
        }
      } catch (e) {}
      if (result.length === 0) {
        result = [...READING_BOOKS].map(b => ({
           ...b,
           price: 15.99, // map prices so they show in grid
        }));
      }
    } else if (currentCat === 'all') {
      result = [...BOOKS];
    } else {
      result = [...BOOKS].filter(book => book.category.toLowerCase() === currentCat.toLowerCase());
    }

    // Apply Search Query: works by book name, author, and category!
    if (searchQuery) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.category.toLowerCase().includes(query)
      );
    }

    // Apply Price filter dynamically
    result = result.filter(book => {
      const price = book.discountPrice || book.price;
      return price >= activeFilters.priceRange[0] && price <= activeFilters.priceRange[1];
    });

    // Apply Rating filter
    if (activeFilters.rating > 0) {
      result = result.filter(book => book.rating >= activeFilters.rating);
    }

    // Apply Format filter
    if (activeFilters.format && activeFilters.format !== 'All') {
      const f = activeFilters.format.toLowerCase();
      if (f === 'e-book' || f === 'pdf' || f === 'epub' || f === 'audiobook') {
        result = result.filter(book => book.bookType === 'ebook');
      } else if (f === 'physical book') {
        result = result.filter(book => book.bookType === 'physical');
      }
    }

    // Apply Sorting logic
    switch (sortBy) {
      case 'price-low': 
        result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price)); 
        break;
      case 'price-high': 
        result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price)); 
        break;
      case 'rating': 
        result.sort((a, b) => b.rating - a.rating); 
        break;
      case 'newest': 
        result.sort((a, b) => (a.isNew ? -1 : 1)); 
        break;
      default: 
        result.sort((a, b) => (b.isBestSeller ? 1 : b.rating - a.rating));
    }

    return result;
  }, [activeFilters, searchQuery, sortBy]);

  const handleCategoryFilterSelect = (catId: string) => {
    setActiveFilters(prev => ({ ...prev, category: catId }));
    navigate(`/category/${catId}${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`);
  };

  const handlePriceLimitChange = (value: number) => {
    setActiveFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], value] }));
  };

  const handleRatingFilterSelect = (ratingVal: number) => {
    setActiveFilters(prev => ({ 
      ...prev, 
      rating: prev.rating === ratingVal ? 0 : ratingVal 
    }));
  };

  const handleFormatFilterSelect = (fmt: string) => {
    setActiveFilters(prev => ({
      ...prev,
      format: prev.format === fmt ? 'All' : fmt
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({
      priceRange: [0, 50],
      rating: 0,
      format: 'All',
      category: categoryId || 'all'
    });
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-parchment dark:bg-dark-bg transition-colors duration-300">
      
      {/* Back to Home explicit top navigation button */}
      <div className="pt-6 px-6">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-earth-brown/60 dark:text-dark-muted hover:text-earth-brown dark:hover:text-dark-text transition-colors text-xs font-bold uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>

      {/* Category Hero */}
      <section className={`relative h-64 mx-4 mt-3 rounded-[2.5rem] overflow-hidden flex flex-col justify-end p-8 ${themeColors.bg}`}>
        <img 
          src={themeColors.image} 
          alt={themeColors.name} 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40 scale-105"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${themeColors.primary} via-transparent to-transparent z-0`} />
        
        {/* Animated Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full blur-[1px]"
              animate={{
                y: [-20, 20],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-3">
             <span className="text-4.5xl">{themeColors.icon}</span>
             <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight uppercase">
               {themeColors.name}
             </h1>
          </div>
          <p className="text-white/70 font-serif italic max-w-md text-xs md:text-sm">
             {themeColors.subtitle}
          </p>
        </div>
      </section>

      {/* Toolbar */}
      <div className="sticky top-20 z-30 px-4 py-4 bg-parchment/80 dark:bg-dark-bg/80 backdrop-blur-md flex items-center justify-between gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-brown/40 dark:text-dark-muted group-focus-within:text-moss-green transition-colors" />
          <input 
            type="text" 
            placeholder={isListening ? "🎙️ Listening... Speak now!" : "Search books, author, category..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-white dark:bg-dark-card border-none rounded-2xl py-3 pl-11 pr-12 text-sm shadow-sm transition-all focus:ring-1 focus:ring-moss-green dark:text-dark-text ${isListening ? 'ring-1 ring-red-500 bg-red-500/5 dark:bg-red-500/10' : ''}`}
          />
          <Mic 
            onClick={handleVoiceSearch}
            className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 cursor-pointer transition-all ${
              isListening 
                ? 'text-red-500 scale-110 animate-bounce' 
                : 'text-earth-brown/40 dark:text-dark-muted hover:text-earth-brown dark:hover:text-dark-text'
            }`} 
          />
        </div>

        <button 
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-dark-card rounded-2xl shadow-sm hover:shadow-md transition-all text-xs font-bold text-earth-brown dark:text-dark-text border border-earth-brown/5 dark:border-white/5 cursor-pointer hover:bg-earth-brown/5"
        >
          <Filter className="w-4 h-4 text-moss-green" />
          Filter {(activeFilters.rating > 0 || activeFilters.priceRange[1] < 50 || activeFilters.format !== 'All' || activeFilters.category !== 'all') && '●'}
        </button>

        <div className="relative group">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none bg-white dark:bg-dark-card px-5 py-3 pr-10 rounded-2xl shadow-sm text-xs font-bold text-earth-brown dark:text-dark-text border border-earth-brown/5 dark:border-white/5 cursor-pointer focus:ring-1 focus:ring-moss-green"
          >
            <option value="popular">Popularity</option>
            <option value="rating">Top Rated</option>
            <option value="price-low">Price: Low</option>
            <option value="price-high">Price: High</option>
            <option value="newest">Newest</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-brown/40 pointer-events-none" />
        </div>
      </div>

      {/* Result Meta */}
      <div className="px-6 py-2 flex flex-wrap gap-3 items-center justify-between text-[10px] font-bold text-earth-brown/40 dark:text-dark-muted uppercase tracking-widest">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-[#ebe3d3] dark:bg-[#1a2d1d] px-3 py-1 rounded-full text-earth-brown dark:text-dark-text">Total Listing: {filteredBooks.length}</span>
          <span className="bg-moss-green/15 text-moss-green px-3 py-1 rounded-full">📖 {filteredBooks.filter(b => b.bookType === 'physical').length} Printed</span>
          <span className="bg-moss-green/15 text-moss-green px-3 py-1 rounded-full">⚡ {filteredBooks.filter(b => b.bookType === 'ebook').length} E-Books</span>
        </div>
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="text-moss-green font-bold text-[10px] hover:underline"
          >
            Clear Search Query: "{searchQuery}"
          </button>
        )}
        <div className="flex gap-4">
           <LayoutGrid className="w-4 h-4 text-moss-green cursor-pointer" />
           <List className="w-4 h-4 text-earth-brown/20 cursor-pointer" />
        </div>
      </div>

      {/* Product Grid */}
      <section className="px-6 py-4">
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
             <div className="w-20 h-20 bg-earth-brown/5 dark:bg-white/5 rounded-full flex items-center justify-center">
                <Search className="w-10 h-10 text-earth-brown/20 dark:text-dark-muted" />
             </div>
             <div className="space-y-1">
                <h3 className="font-serif text-xl text-earth-brown dark:text-dark-text">No stories aligned with parameters</h3>
                <p className="text-sm text-earth-brown/40 dark:text-dark-muted">Try sliding up the max price scale or clearing some keyword match filters.</p>
             </div>
             <button 
               onClick={clearAllFilters}
               className="px-6 py-2.5 bg-moss-green text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-md"
             >
               Clear all filters
             </button>
          </div>
        )}
      </section>

      {/* Filter Sidebar / Modal Simulation */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-parchment dark:bg-dark-bg z-[110] shadow-2xl p-8 overflow-y-auto flex flex-col"
            >
              <div className="flex items-center justify-between pb-6 border-b border-earth-brown/5 dark:border-white/5 mb-6">
                <div className="flex items-center gap-2">
                   <Filter className="w-5 h-5 text-moss-green" />
                   <h2 className="text-2xl font-serif text-earth-brown dark:text-dark-text font-bold">Refine Books</h2>
                </div>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="w-8 h-8 rounded-full bg-earth-brown/5 dark:bg-white/5 flex items-center justify-center text-earth-brown/60 hover:text-earth-brown transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 space-y-8 select-none">
                
                {/* 1. CATEGORY FILTERS */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-earth-brown/40 dark:text-dark-muted">Book Categories</h4>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                    <button
                      onClick={() => handleCategoryFilterSelect('all')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                        activeFilters.category === 'all'
                          ? 'bg-moss-green text-white border-moss-green shadow-md shadow-moss-green/10'
                          : 'bg-white dark:bg-dark-card border-earth-brown/10 dark:border-white/10 text-earth-brown dark:text-dark-text hover:bg-earth-brown/5'
                      }`}
                    >
                      All Ebooks 📚
                    </button>
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryFilterSelect(cat.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                          activeFilters.category === cat.id
                            ? 'bg-moss-green text-white border-moss-green shadow-md shadow-moss-green/10'
                            : 'bg-white dark:bg-dark-card border-earth-brown/10 dark:border-white/10 text-earth-brown dark:text-dark-text hover:bg-earth-brown/5'
                        }`}
                      >
                        {cat.name} {cat.icon}
                      </button>
                    ))}
                    <div className="w-full border-t border-earth-brown/5 dark:border-white/5 my-2" />
                    {/* Special collections filterable */}
                    {[
                      { id: 'trending', label: 'Trending', icon: '🔥' },
                      { id: 'new-arrivals', label: 'New Arrivals', icon: '✨' },
                      { id: 'recently-viewed', label: 'Recently Viewed', icon: '📖' },
                    ].map(special => (
                      <button
                        key={special.id}
                        onClick={() => handleCategoryFilterSelect(special.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                          activeFilters.category === special.id
                            ? 'bg-moss-green text-white border-moss-green shadow-md shadow-moss-green/10'
                            : 'bg-white dark:bg-dark-card border-earth-brown/10 dark:border-white/10 text-earth-brown dark:text-dark-text hover:bg-earth-brown/5'
                        }`}
                      >
                        {special.label} {special.icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. DYNAMIC PRICE SLIDER & QUICK SELECTORS */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-earth-brown/40 dark:text-dark-muted">Price Scale</h4>
                    <span className="text-xs font-bold text-moss-green bg-moss-green/10 px-2 py-0.5 rounded-lg">
                      Up to ${activeFilters.priceRange[1]}
                    </span>
                  </div>
                  
                  <input 
                    type="range" 
                    min="5" 
                    max="50" 
                    step="1"
                    value={activeFilters.priceRange[1]} 
                    onChange={(e) => handlePriceLimitChange(Number(e.target.value))}
                    className="w-full h-1.5 bg-earth-brown/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-moss-green"
                  />
                  
                  <div className="flex justify-between text-[10px] font-bold text-earth-brown/40 dark:text-dark-muted">
                    <span>Min: $0</span>
                    <span>Max: $50</span>
                  </div>

                  {/* Quick price limits matches exact user preferences */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                     {[12, 15, 20, 25].map((lim) => (
                        <button
                          key={lim}
                          onClick={() => handlePriceLimitChange(lim)}
                          className={`py-2 rounded-xl text-center text-xs font-bold border transition-all ${
                             activeFilters.priceRange[1] === lim
                             ? 'bg-moss-green/15 text-moss-green border-moss-green/20'
                             : 'bg-white dark:bg-dark-card border-earth-brown/10 dark:border-white/10 text-earth-brown dark:text-dark-text hover:bg-earth-brown/5'
                          }`}
                        >
                          Under ${lim}
                        </button>
                     ))}
                  </div>
                </div>

                {/* 3. FORMAT SELECTOR */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-earth-brown/40 dark:text-dark-muted">Delivery Format</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['E-Book', 'Physical Book', 'PDF', 'EPUB', 'Audiobook'].map(format => (
                      <button 
                        key={format}
                        onClick={() => handleFormatFilterSelect(format)}
                        className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all text-center ${
                          activeFilters.format === format
                          ? 'bg-moss-green text-white border-moss-green shadow-md shadow-moss-green/10'
                          : 'bg-white dark:bg-dark-card border-earth-brown/10 dark:border-white/10 text-earth-brown dark:text-dark-text hover:bg-earth-brown/5'
                        }`}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. RATINGS FILTER */}
                <div className="space-y-3">
                   <h4 className="text-xs font-bold uppercase tracking-widest text-earth-brown/40 dark:text-dark-muted font-sans gap-1 flex items-center">
                      Minimum Quality (Stars)
                   </h4>
                   <div className="flex gap-2 justify-between">
                     {[4, 4.5, 4.8].map((score) => (
                        <button
                          key={score}
                          onClick={() => handleRatingFilterSelect(score)}
                          className={`flex-1 py-2 text-center text-xs font-bold border rounded-xl transition-all ${
                             activeFilters.rating === score
                             ? 'bg-moss-green text-white border-moss-green'
                             : 'bg-white dark:bg-dark-card border-earth-brown/10 dark:border-white/10 text-earth-brown dark:text-dark-text hover:bg-earth-brown/5'
                          }`}
                        >
                           {score} ★ +
                        </button>
                     ))}
                   </div>
                </div>

              </div>

              {/* Apply & Reset Buttons */}
              <div className="pt-6 border-t border-earth-brown/5 dark:border-white/5 flex gap-3 mt-auto">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-earth-brown/50 dark:text-dark-muted hover:text-earth-brown transition-colors border border-earth-brown/10 dark:border-white/10 rounded-2xl"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-[2] py-3 bg-moss-green text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-moss-green/20"
                >
                  Apply Filter Setup
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
