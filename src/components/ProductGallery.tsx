import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, Shield, Sparkles, BookOpen, Volume2, Award, FileText, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ProductGalleryProps {
  coverImage: string;
  title: string;
  author: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ coverImage, title, author }) => {
  const [activeTab, setActiveTab] = useState<'cover' | 'hardback' | 'inside' | 'audio'>('cover');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ backgroundPosition: '0% 0%' });
  const [insidePageNum, setInsidePageNum] = useState(1);

  const images = {
    cover: coverImage,
    hardback: `https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800`,
    audio: `https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=800`,
  };

  const tabs = [
    { id: 'cover' as const, label: 'Dust Jacket', icon: Sparkles, desc: 'Original illustration' },
    { id: 'hardback' as const, label: 'Gilded Leather', icon: Award, desc: 'Special edition backing' },
    { id: 'inside' as const, label: 'Inside Pages', icon: BookOpen, desc: 'Interactive excerpt' },
    { id: 'audio' as const, label: 'Audio Edition', icon: Volume2, desc: 'Narrated companion' },
  ];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      backgroundPosition: `${x}% ${y}%`,
      backgroundImage: `url(${images[activeTab === 'inside' ? 'cover' : activeTab === 'audio' ? 'audio' : activeTab]})`,
    });
  };

  const insideExcerpts = [
    {
      page: 1,
      ch: "Chapter I: The Whispering Oaks",
      text: "The twilight filtered down in long, soft needles of emerald dust. Aria pulled her forest cowl tighter, her boots making absolutely no sound on the ancient damp loam. The spellwood was breathing, and with each exhale, the silver runes along the tree trunks flared with pale warning fires. 'They are coming,' she whispered to the wind."
    },
    {
      page: 2,
      ch: "Chapter I: The Whispering Oaks",
      text: "According to ancient parchment scrolls kept in the Citadel vaults, spellwoods only whisper to those who carry the ember-blood. For three cycles, Aria had hidden her sparking fingers, fearing the King's Pyre-Knights. But tonight, with the stars falling as golden sparks from a hearth, the secrets of the moss would be hidden no longer."
    }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Immersive Main Showcase Frame */}
      <div className="relative aspect-[3/4] md:aspect-[4/5] rounded-[2.5rem] bg-gradient-to-tr from-[#ebe3d3] to-[#fbf8f3] dark:from-[#1b251b] dark:to-dark-card p-6 md:p-10 flex items-center justify-center border border-earth-brown/5 shadow-inner overflow-hidden select-none">
        
        {/* Soft magical backdrop lighting */}
        <div className="absolute w-72 h-72 bg-moss-green/10 dark:bg-moss-green/20 rounded-full blur-[80px] -top-10 -right-10 pointer-events-none animate-pulse" />
        <div className="absolute w-72 h-72 bg-terracotta/5 dark:bg-terracotta/10 rounded-full blur-[80px] -bottom-10 -left-10 pointer-events-none" />

        {/* Dynamic Inner Component Renderer */}
        <AnimatePresence mode="wait">
          {activeTab === 'cover' && (
            <motion.div 
              key="cover"
              initial={{ opacity: 0, scale: 0.93, rotateY: -15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.93 }}
              transition={{ duration: 0.4 }}
              className="relative w-full h-full flex items-center justify-center group/cover"
            >
              {/* Apple Zoom Hover Glass */}
              <div 
                onMouseMove={handleMouseMove}
                className="relative w-3/4 max-w-[270px] aspect-[2/3] transition-all duration-500 rounded-xl shadow-[15px_25px_45px_rgba(0,0,0,0.15)] dark:shadow-[15px_25px_45px_rgba(0,0,0,0.35)] overflow-hidden cursor-zoom-in"
                style={{ perspective: '1000px' }}
              >
                {/* 3D Book Cover Wrap */}
                <div className="w-full h-full relative transform hover:rotate-y-6 transition-transform duration-500 origin-left">
                  <img src={coverImage} alt={title} className="w-full h-full object-cover rounded-sm" />
                  
                  {/* Magical Foil Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/cover:translate-x-[100%] transition-transform duration-1000 ease-out" />
                  
                  {/* Subtle Spine depth border on left */}
                  <div className="absolute top-0 left-0 w-3 h-full bg-gradient-to-r from-black/25 to-transparent rounded-l-sm" />
                </div>

                {/* Overlaid Zoom Panel */}
                <div className="absolute inset-0 opacity-0 group-hover/cover:opacity-100 transition-opacity bg-no-repeat bg-[length:200%] pointer-events-none" style={zoomStyle} />
              </div>
            </motion.div>
          )}

          {activeTab === 'hardback' && (
            <motion.div 
              key="hardback"
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full flex items-center justify-center group/hard"
            >
              <div className="relative w-3/4 max-w-[270px] aspect-[2/3] rounded-xl overflow-hidden shadow-2xl bg-amber-900 border-4 border-amber-800 flex flex-col justify-between p-6 text-[#f9e8cc] select-none cursor-zoom-in">
                {/* Simulated leather textures */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600')] bg-cover opacity-10 mix-blend-multiply" />
                
                <div className="border border-[#e2c18d]/40 rounded-lg p-3 h-full flex flex-col justify-between items-center text-center relative z-10">
                   <div className="w-8 h-8 rounded-full border border-[#e2c18d]/50 flex items-center justify-center text-xs mt-2 font-serif">❦</div>
                   
                   <div className="space-y-2">
                     <h2 className="font-serif text-lg tracking-wider font-bold uppercase">{title}</h2>
                     <div className="h-[1px] w-12 bg-[#e2c18d]/40 mx-auto" />
                     <p className="text-[10px] font-sans uppercase tracking-[0.15em] opacity-80">{author}</p>
                   </div>
                   
                   <div className="text-[9px] uppercase tracking-widest text-[#e2c18d] font-bold">Limited Collector's Folio</div>
                </div>
                {/* Gold corner accents */}
                <div className="absolute top-1 left-1 font-serif text-[10px] text-[#e2c18d]/65">🙠</div>
                <div className="absolute top-1 right-1 font-serif text-[10px] text-[#e2c18d]/65">🙢</div>
                <div className="absolute bottom-1 left-1 font-serif text-[10px] text-[#e2c18d]/65">🙡</div>
                <div className="absolute bottom-1 right-1 font-serif text-[10px] text-[#e2c18d]/65">🙣</div>
              </div>
            </motion.div>
          )}

          {activeTab === 'inside' && (
            <motion.div 
              key="inside"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full flex flex-col items-center justify-center p-4 max-w-sm"
            >
              <div className="w-full bg-[#fcf9f2] dark:bg-[#faf4e8] rounded-3xl p-6 shadow-2xl border-2 border-amber-900/10 flex flex-col justify-between space-y-4 relative min-h-[300px] text-earth-brown text-left">
                {/* Aged paper watermark pattern */}
                <div className="absolute inset-0 bg-stone-900/[0.02] bg-[radial-gradient(#d4a373_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none rounded-3xl" />
                
                <div className="relative z-10 space-y-3 flex-1 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-moss-green uppercase tracking-widest block border-b border-earth-brown/10 pb-1 font-sans">
                    {insideExcerpts[insidePageNum - 1].ch}
                  </span>
                  
                  <p className="font-serif italic text-sm text-earth-brown/80 leading-relaxed indent-4">
                     "{insideExcerpts[insidePageNum - 1].text}"
                  </p>
                </div>
                
                <div className="relative z-10 flex items-center justify-between border-t border-earth-brown/10 pt-3 text-[10px] font-bold text-earth-brown/50 uppercase tracking-widest font-sans">
                  <span>Page {insidePageNum} of 2</span>
                  <div className="flex gap-2">
                     <button 
                       disabled={insidePageNum === 1}
                       onClick={() => setInsidePageNum(1)}
                       className="w-6 h-6 rounded-lg bg-earth-brown/5 flex items-center justify-center hover:bg-moss-green hover:text-white transition-all disabled:opacity-30"
                     >
                       <ChevronLeft size={14} />
                     </button>
                     <button 
                       disabled={insidePageNum === 2}
                       onClick={() => setInsidePageNum(2)}
                       className="w-6 h-6 rounded-lg bg-earth-brown/5 flex items-center justify-center hover:bg-moss-green hover:text-white transition-all disabled:opacity-30"
                     >
                       <ChevronRight size={14} />
                     </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'audio' && (
            <motion.div 
              key="audio"
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full flex flex-col items-center justify-center"
            >
              <div className="relative w-56 h-56 rounded-full overflow-hidden shadow-2xl flex items-center justify-center bg-zinc-900 border-4 border-earth-brown/10 ring-8 ring-earth-brown/5">
                <img src={coverImage} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity scale-110" />
                
                {/* Glowing Core Vinyl Effect */}
                <div className="absolute inset-4 rounded-full border border-white/20 flex flex-col justify-center items-center text-center p-3 z-10 bg-black/60 backdrop-blur-sm">
                   <Volume2 className="w-8 h-8 text-white mb-2 animate-bounce" />
                   <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-sans font-bold">Aura-Book Link</span>
                   <p className="text-white text-xs font-serif font-bold mt-1 line-clamp-1">{title}</p>
                </div>
                <div className="absolute w-5 h-5 bg-[#ebe3d3] dark:bg-dark-bg rounded-full border border-black/45 z-20" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Maximize Action Badge */}
        <button 
          onClick={() => setIsFullscreen(true)}
          className="absolute bottom-6 right-6 w-11 h-11 rounded-2xl bg-white dark:bg-dark-card shadow-lg flex items-center justify-center text-earth-brown dark:text-dark-text hover:bg-moss-green hover:text-white dark:hover:bg-moss-green transition-all cursor-pointer border border-earth-brown/5"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Selector Micro-Tabs */}
      <div className="grid grid-cols-4 gap-2.5">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`relative p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                 isSelected 
                   ? 'bg-white dark:bg-dark-card border-moss-green text-moss-green shadow-xl shadow-moss-green/5' 
                   : 'bg-white/60 dark:bg-dark-card/30 border-earth-brown/5 text-earth-brown/55 dark:text-dark-muted hover:bg-white dark:hover:bg-dark-card hover:border-earth-brown/15'
               }`}
            >
               <TabIcon className={`w-5 h-5 ${isSelected ? 'text-moss-green' : 'text-earth-brown/40 dark:text-dark-muted'}`} />
               <span className="text-[10px] font-bold uppercase tracking-wider block leading-none">{tab.label}</span>
               <span className="text-[7.5px] text-earth-brown/45 dark:text-dark-muted/60 lowercase tracking-tight hidden sm:block">{tab.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Safety & Premium Guarantee Bar */}
      <div className="p-4 bg-earth-brown/[0.02] dark:bg-white/[0.02] rounded-2xl border border-earth-brown/5 flex items-center gap-3">
         <Shield className="w-5 h-5 text-moss-green" />
         <div className="text-xs">
           <span className="font-bold text-earth-brown dark:text-dark-text">Booklet Gilded Seal 🌿</span>
           <p className="text-[10px] text-earth-brown/50 dark:text-dark-muted">Verified digital DRM matching highest global standards.</p>
         </div>
      </div>

      {/* Fullscreen Modal Portal Container */}
      <AnimatePresence>
        {isFullscreen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-lg p-6">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-lg w-full aspect-[3/4.5] flex items-center justify-center p-4 bg-[#f8f5eb] dark:bg-dark-bg rounded-[3rem] overflow-hidden"
            >
              <button 
                onClick={() => setIsFullscreen(false)}
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white backdrop-blur-md cursor-pointer transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="w-3/4 aspect-[2/3] shadow-2xl rounded-2xl overflow-hidden border border-white/10">
                 <img src={coverImage} alt={title} className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
