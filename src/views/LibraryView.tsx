import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Library, BookOpen, Clock, ArrowLeft, Sparkles, BookMarked, Compass, CheckCircle2, Bookmark } from 'lucide-react';
import { READING_BOOKS } from '../constants';
import { useNavigate, useLocation } from 'react-router-dom';

export const LibraryView = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Load currently reading list from local storage or fall back to READING_BOOKS
  const [readingList, setReadingList] = useState<any[]>(() => {
    const saved = localStorage.getItem('ebooklet_currently_reading');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return READING_BOOKS;
  });

  // Load newly purchased non-physical books
  const [purchasedList, setPurchasedList] = useState<any[]>(() => {
    const saved = localStorage.getItem('ebooklet_purchased_library');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const [activeBook, setActiveBook] = useState<any>(null);
  const [readingOverlay, setReadingOverlay] = useState(false);
  const [readingPagesText, setReadingPagesText] = useState('');

  // Handle resume action for active reading list explicitly
  const handleResumeCurrentlyReading = (book: any) => {
    setActiveBook(book);
    setReadingOverlay(true);
    setReadingPagesText('Synchronizing reading bookmarks...');

    setTimeout(() => {
      setReadingPagesText('Loading page content...');
    }, 1000);

    setTimeout(() => {
      setReadingPagesText(`Resuming "${book.title}"...`);
    }, 2000);

    setTimeout(() => {
      setReadingOverlay(false);
    }, 3200);
  };

  // Listen to remote resume events on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const resumeId = params.get('resume');
    if (resumeId) {
      const bookToResume = readingList.find(b => b.id === resumeId) || purchasedList.find(b => b.id === resumeId);
      if (bookToResume) {
        if (purchasedList.some(b => b.id === resumeId)) {
          handleStartReading(bookToResume);
        } else {
          handleResumeCurrentlyReading(bookToResume);
        }
        // Scrub search query to avoid infinite re-triggering
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location.search, readingList, purchasedList]);

  const handleStartReading = (book: any) => {
    setActiveBook(book);
    setReadingOverlay(true);
    setReadingPagesText('Loading your book...');

    setTimeout(() => {
      setReadingPagesText('Preparing pages...');
    }, 1000);

    setTimeout(() => {
      setReadingPagesText('Opening reader...');
    }, 2000);

    // Transition book from purchased list to reading list
    setTimeout(() => {
      setReadingOverlay(false);
      
      const exists = readingList.some(b => b.id === book.id || b.title === book.title);
      if (!exists) {
        const updatedBook = {
          ...book,
          progress: 4, // start with 4% animation progress
          lastRead: 'Just now'
        };
        const nextReadingList = [updatedBook, ...readingList];
        setReadingList(nextReadingList);
        localStorage.setItem('ebooklet_currently_reading', JSON.stringify(nextReadingList));

        // Filter out of purchasedList
        const nextPurchased = purchasedList.filter(b => b.id !== book.id && b.title !== book.title);
        setPurchasedList(nextPurchased);
        localStorage.setItem('ebooklet_purchased_library', JSON.stringify(nextPurchased));
      }
    }, 3200);
  };

  const updateProgress = (bookId: string, currentVal: number) => {
    const nextVal = Math.min(100, currentVal + 15);
    const updated = readingList.map(b => {
      if (b.id === bookId) {
        return { ...b, progress: nextVal, lastRead: 'Just now' };
      }
      return b;
    });
    setReadingList(updated);
    localStorage.setItem('ebooklet_currently_reading', JSON.stringify(updated));
  };

  return (
    <main className="min-h-screen bg-[#faf8f5] dark:bg-dark-bg pb-28 pt-4 px-4 md:px-6 transition-all duration-300 relative select-none">
      
      {/* Magical Reading Immersive Light Overlay */}
      <AnimatePresence>
        {readingOverlay && activeBook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#1e1309]/95 backdrop-blur-lg z-[999] flex flex-col items-center justify-center text-white p-6"
          >
            <motion.div
              initial={{ scale: 0.8, rotate: -3 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8, rotate: 3 }}
              className="relative w-44 h-64 rounded-3xl overflow-hidden shadow-2xl mb-8 border-2 border-amber-300/30"
            >
              <img src={activeBook.coverImage} alt={activeBook.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent flex flex-col justify-end p-4">
                <span className="text-[9px] text-[#ffd166] font-mono tracking-widest uppercase mb-1">E-BOOK</span>
                <h3 className="font-serif text-sm font-bold truncate">{activeBook.title}</h3>
              </div>
            </motion.div>

            <div className="text-center space-y-4 max-w-sm">
              <div className="flex justify-center items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
                <h2 className="font-serif text-xl font-bold tracking-wider text-[#eae0d5] uppercase">
                  Opening Your Grimoire
                </h2>
              </div>
              <p className="text-xs text-[#eae0d5]/70 italic mt-1 h-6">
                "{readingPagesText}"
              </p>
              <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden mx-auto mt-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3 }}
                  className="h-full bg-gradient-to-r from-amber-200 to-green-400"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-4 border-b border-earth-brown/10 dark:border-white/5 pb-6">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-earth-brown/60 dark:text-dark-muted hover:text-earth-brown dark:hover:text-dark-text transition-colors text-[10px] font-bold uppercase tracking-widest"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-moss-green" />
            Back to Home
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-moss-green/10 flex items-center justify-center">
              <Library className="w-6 h-6 text-moss-green" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-earth-brown dark:text-dark-text uppercase tracking-normal">
                E-Library Sanctuary
              </h1>
              <p className="text-earth-brown/50 dark:text-dark-muted font-sans font-medium text-xs">
                Your mystical study where digital scrolls and purchased grimoires wait for your eyes.
              </p>
            </div>
          </div>
        </header>

        {/* Section 1: Purchased Tomes (Waiting to be opened) */}
        {purchasedList.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-earth-brown/5 pb-2">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <h2 className="text-xs font-bold text-earth-brown dark:text-dark-text uppercase tracking-widest font-sans">
                Newly Purchased Tomes ({purchasedList.length})
              </h2>
            </div>
            <p className="text-xs text-earth-brown/60 dark:text-dark-muted font-sans font-medium">
              These digital treasures have been delivered and bound to your account. Tap to initialize reading.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {purchasedList.map((book) => (
                <motion.div
                  key={book.id}
                  whileHover={{ y: -3, scale: 1.01 }}
                  className="bg-white/90 dark:bg-dark-card/90 border border-[#e8dfcf] dark:border-white/5 shadow-md rounded-[2rem] p-4 flex gap-4 items-center"
                >
                  <div className="w-16 h-24 rounded-xl overflow-hidden shadow-md flex-shrink-0 border border-earth-brown/5">
                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="text-[8px] px-1.5 py-0.5 rounded font-bold font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 uppercase tracking-widest block w-max mb-1">
                      {book.format || 'E-Book'} Ready
                    </span>
                    <h3 className="text-sm font-serif font-bold text-earth-brown dark:text-dark-text truncate">
                      {book.title}
                    </h3>
                    <p className="text-[10px] text-earth-brown/50 dark:text-dark-muted truncate mt-0.5">
                      by {book.author}
                    </p>
                    <button
                      onClick={() => handleStartReading(book)}
                      className="mt-3 px-3 py-1.5 bg-moss-green hover:bg-moss-green/90 text-white rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-moss-green/10"
                    >
                      <BookOpen size={10} /> Resume
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Section 2: Active Reading List */}
        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-earth-brown/5 pb-2">
            <h2 className="text-xs font-bold text-earth-brown dark:text-dark-text uppercase tracking-widest font-sans flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-moss-green" />
              Currently Reading Stories
            </h2>
            <span className="text-[10px] font-bold text-earth-brown/40 dark:text-dark-muted font-mono uppercase tracking-widest">
              {readingList.length} Active Journey{readingList.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-4">
            {readingList.map((book) => (
              <motion.div 
                key={book.id}
                whileHover={{ y: -2 }}
                className="bg-white/95 dark:bg-dark-card rounded-[2.5rem] p-5 flex flex-col gap-4 shadow-sm border border-[#ede9dc] dark:border-white/5 transition-colors"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-28 rounded-2xl overflow-hidden shadow-lg flex-shrink-0 border border-earth-brown/5">
                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                    <div>
                      <h3 className="text-base font-serif font-bold text-earth-brown dark:text-dark-text leading-snug truncate">
                        {book.title}
                      </h3>
                      <p className="text-[11px] text-earth-brown/60 dark:text-dark-muted mt-0.5 truncate">
                        by {book.author}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2 text-[9px] text-[#4f5e41] dark:text-moss-green font-bold uppercase tracking-wider font-sans">
                        <Clock className="w-3 h-3" />
                        <span>Last Opened: {book.lastRead || 'Recently'}</span>
                      </div>
                      
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleResumeCurrentlyReading(book)}
                          className="px-4 py-2 bg-moss-green hover:bg-moss-green/90 text-white rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-1 hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer shadow-xs shadow-moss-green/10"
                        >
                          <BookOpen size={11} /> Resume
                        </button>

                        <button 
                          onClick={() => updateProgress(book.id, book.progress || 0)}
                          disabled={book.progress >= 100}
                          className={`px-4 py-2 text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            book.progress >= 100
                            ? 'bg-green-500/15 text-green-600 dark:text-green-400 cursor-not-allowed'
                            : 'bg-earth-brown/10 dark:bg-white/10 text-earth-brown dark:text-dark-text hover:bg-earth-brown/20'
                          }`}
                        >
                          {book.progress >= 100 ? (
                            <>
                              <CheckCircle2 size={11} className="text-green-500" /> Finished Story
                            </>
                          ) : (
                            <>
                              <Bookmark size={11} /> Turn 15 Pages
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center px-1 text-[9px] font-bold text-earth-brown/40 dark:text-dark-muted uppercase font-sans">
                    <span>Reading Progress</span>
                    <span className="text-earth-brown dark:text-dark-text">{book.progress || 0}% Complete</span>
                  </div>
                  <div className="h-1.5 bg-earth-brown/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${book.progress || 0}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full shadow-[0_0_8px_rgba(79,94,65,0.4)] ${
                        book.progress >= 100 ? 'bg-green-500' : 'bg-moss-green'
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Empty state recommendation */}
        {readingList.length === 0 && purchasedList.length === 0 && (
          <section className="text-center py-16 bg-white/70 dark:bg-dark-card/50 rounded-[3rem] border border-dashed border-earth-brown/20 dark:border-white/5 space-y-4">
            <div className="text-level text-4xl">📚</div>
            <h3 className="font-serif text-lg font-bold text-earth-brown dark:text-dark-text uppercase">Your study is empty</h3>
            <p className="text-xs text-earth-brown/60 dark:text-dark-muted max-w-sm mx-auto leading-relaxed">
              No digital books are currently checked out. Visit the tavern library to select your next tale!
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-moss-green text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-[#34442a] active:scale-[0.98] transition-all cursor-pointer"
            >
              Discover Stories
            </button>
          </section>
        )}

        <section className="text-center pt-8">
          <p className="text-earth-brown/30 dark:text-dark-muted font-serif italic text-xs">
            "A reader lives a thousand lives before he dies..."
          </p>
        </section>
      </div>
    </main>
  );
};
