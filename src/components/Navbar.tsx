import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Search, ShoppingBag, Heart, Menu, Mic, SlidersHorizontal, BookOpen, Home } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { cartCount, toggleMenu } = useShop();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const isHomePage = location.pathname === '/';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      navigate(`/category/all?search=${encodeURIComponent(searchText.trim())}`);
    } else {
      navigate(`/category/all`);
    }
  };

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
          setSearchText(transcript);
          navigate(`/category/all?search=${encodeURIComponent(transcript.trim())}`);
        }
      };

      recognition.start();
    } catch (err) {
      console.error("Could not start speech recognition:", err);
      setIsListening(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-parchment/95 dark:bg-dark-bg/95 backdrop-blur-sm px-4 py-4 space-y-4 transition-colors">
      <div className={`flex items-center ${!isAuthenticated ? 'justify-center' : 'justify-between'}`}>
        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <Menu 
              className="w-7 h-7 text-earth-brown dark:text-dark-text cursor-pointer hover:text-moss-green transition-colors" 
              onClick={toggleMenu}
            />
            {!isHomePage && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => navigate('/')}
                className="w-9 h-9 rounded-full bg-white dark:bg-dark-card flex items-center justify-center shadow-sm cursor-pointer hover:bg-moss-green hover:text-white transition-all text-earth-brown dark:text-dark-text"
              >
                <Home size={18} />
              </motion.div>
            )}
          </div>
        )}
        
        <Link to="/" className="flex items-center gap-2 group">
          <BookOpen className="w-7 h-7 text-terracotta transition-transform group-hover:scale-110" />
          <h1 className="text-3xl font-serif font-bold text-earth-brown dark:text-dark-text tracking-tight uppercase">Ebooklet</h1>
        </Link>

        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <Heart 
              className="w-7 h-7 text-earth-brown dark:text-dark-text cursor-pointer hover:text-red-500 transition-colors" 
              onClick={() => navigate('/wishlist')}
            />
            <div className="relative cursor-pointer" onClick={() => navigate('/cart')}>
              <ShoppingBag className="w-7 h-7 text-earth-brown dark:text-dark-text" />
              <span className="absolute -top-1 -right-1 bg-mushroom-red text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            </div>
          </div>
        )}
      </div>

      {isAuthenticated && (
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={isListening ? "🎙️ Listening... Speak now!" : "Search books, authors, genres..."}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className={`w-full bg-[#fdfaf2] dark:bg-dark-card border-none rounded-2xl py-3.5 pl-12 pr-12 text-sm placeholder:text-earth-brown/40 dark:placeholder:text-dark-muted shadow-sm transition-all focus:ring-1 focus:ring-moss-green dark:text-dark-text animate-none ${isListening ? 'ring-1 ring-red-500 bg-red-500/5 dark:bg-red-500/10' : ''}`}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-brown/50 dark:text-dark-muted cursor-pointer" onClick={handleSearchSubmit} />
            <Mic 
              onClick={handleVoiceSearch}
              className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 cursor-pointer transition-all ${
                isListening 
                  ? 'text-red-500 scale-110 animate-bounce' 
                  : 'text-earth-brown/50 dark:text-dark-muted hover:text-earth-brown dark:hover:text-dark-text'
              }`} 
            />
          </div>
          <button 
            type="button"
            onClick={() => navigate('/category/all?filter=true')}
            className="p-3 bg-moss-green text-parchment rounded-xl shadow-lg shadow-moss-green/20 cursor-pointer hover:bg-moss-green/90 transition-colors"
          >
            <SlidersHorizontal className="w-6 h-6" />
          </button>
        </form>
      )}
    </nav>
  );
};
