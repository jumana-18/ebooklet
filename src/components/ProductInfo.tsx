import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  MapPin, 
  CheckCircle2, 
  BookOpen, 
  Calendar, 
  Globe, 
  Compass, 
  ChevronDown, 
  AlertCircle,
  Quote,
  Flame,
  Hash
} from 'lucide-react';

interface ProductInfoProps {
  book: {
    id: string;
    title: string;
    author: string;
    price: number;
    rating: number;
    category: string;
    isBestSeller?: boolean;
    isNew?: boolean;
  };
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ book }) => {
  const [openSection, setOpenSection] = useState<string | null>('synopsis');
  const [selectedCharacter, setSelectedCharacter] = useState<number>(0);

  // Dynamic Metadata generator based on genre
  const metadata = {
    pages: book.title.length * 15 + 240, // realistic randomized page length
    language: 'English (US)',
    publisher: 'Woodland Scrollpress, Ltd.',
    released: 'October 2025',
    format: 'EPUB / PDF / Interactive',
    edition: 'First Folio Illustrated'
  };

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  // Custom medieval quotes based on title/category
  const currentQuote = {
    text: "Some secrets are woven in ancient forest loom, so tight that only midnight tears can dissolve the binding.",
    citation: `Chronicles of ${book.author}, Vol. IX`
  };

  // Custom narrative state data
  const mainCharacters = [
    { name: "Aria Woodsworn", role: "High Elven Ranger", bio: "Guards the northern boundary of the spellwood, wielding an ancient silver bow that whispers warnings." },
    { name: "Kaelen Emberforge", role: "Rogue Pyromancer", bio: "Banished from the Pyre Citadel, Kaelen uses raw sparkcraft to keep the shadowy corruption at bay." },
    { name: "Zephyr", role: "Ancient Owlbear Companion", bio: "A majestic creature of mossy plumage who guides lost wanderers back to safe parchment clearings." }
  ];

  const sensoryVibes = [
    { label: "Woodland Atmosphere & Spruce Needle Vibe", value: 92 },
    { label: "Cozy Hearth Fire & Hot Tea Infusion", value: 85 },
    { label: "Rainy Midnight Suspense / Shadow Level", value: 74 }
  ];

  return (
    <div className="w-full space-y-8 text-earth-brown dark:text-dark-text select-none">
      
      {/* Title & Author Info Card */}
      <div className="space-y-3">
         <div className="flex flex-wrap items-center gap-2">
            {book.isBestSeller && (
              <span className="px-3 py-1 bg-[#d4a373] text-earth-brown text-[9px] font-sans font-bold tracking-widest uppercase rounded-full flex items-center gap-1">
                <Flame size={10} className="text-earth-brown" />
                BookTok Bestseller
              </span>
            )}
            <span className="px-3 py-1 bg-[#ebe3d3] dark:bg-dark-card text-earth-brown/70 dark:text-dark-muted text-[9px] font-sans font-bold tracking-widest uppercase rounded-full">
              {book.category} Anthology
            </span>
            <span className="px-3 py-1 bg-moss-green/10 text-moss-green text-[9px] font-sans font-bold tracking-widest uppercase rounded-full">
               Verified Manuscript
            </span>
         </div>

         <div className="space-y-1">
            <h1 className="text-3xl md:text-4.5xl font-serif font-bold tracking-tight text-earth-brown dark:text-dark-text capitalize">
               {book.title}
            </h1>
            <p className="text-base font-serif italic text-earth-brown/65 dark:text-dark-muted">
               by <span className="font-bold underline decoration-moss-green/50 hover:text-moss-green cursor-pointer transition-colors">{book.author}</span>
            </p>
         </div>

         {/* Ratings Header Inline */}
         <div className="flex items-center gap-3 py-1">
           <div className="flex items-center gap-1">
              <Star className="w-4.5 h-4.5 text-terracotta fill-terracotta" />
              <span className="text-sm font-bold">{book.rating}</span>
           </div>
           <span className="text-earth-brown/25">|</span>
           <span className="text-xs font-bold text-moss-green hover:underline cursor-pointer">
              {book.title.length * 4 + 48} Editorial Reviews
           </span>
           <span className="text-earth-brown/25">|</span>
           <span className="text-xs text-earth-brown/40 dark:text-dark-muted flex items-center gap-1">
              <CheckCircle2 size={13} className="text-moss-green" />
              In Stock & DRM Sealed
           </span>
         </div>
      </div>

      {/* Mini spec grid */}
      <div className="grid grid-cols-3 gap-2.5">
         <div className="p-3 bg-white/50 dark:bg-dark-card/50 rounded-2xl border border-earth-brown/5 text-center">
            <BookOpen className="w-5 h-5 text-moss-green mx-auto mb-1 opacity-70" />
            <span className="text-[10px] text-earth-brown/40 dark:text-dark-muted font-bold block uppercase leading-none">Pages</span>
            <span className="text-xs font-bold font-mono">{metadata.pages}</span>
         </div>
         <div className="p-3 bg-white/50 dark:bg-dark-card/50 rounded-2xl border border-earth-brown/5 text-center">
            <Globe className="w-5 h-5 text-moss-green mx-auto mb-1 opacity-70" />
            <span className="text-[10px] text-earth-brown/40 dark:text-dark-muted font-bold block uppercase leading-none">Language</span>
            <span className="text-xs font-bold line-clamp-1">EN</span>
         </div>
         <div className="p-3 bg-white/50 dark:bg-dark-card/50 rounded-2xl border border-earth-brown/5 text-center">
            <Calendar className="w-5 h-5 text-moss-green mx-auto mb-1 opacity-70" />
            <span className="text-[10px] text-earth-brown/40 dark:text-dark-muted font-bold block uppercase leading-none">Released</span>
            <span className="text-xs font-bold line-clamp-1">2025</span>
         </div>
      </div>

      {/* Accordion Expandables Section */}
      <div className="space-y-3.5">
         
         {/* 1. SYNOPSIS BANNER (Always on top) */}
         <div className="border border-earth-brown/5 rounded-3xl bg-white/30 dark:bg-dark-card/10 overflow-hidden">
            <button 
              onClick={() => toggleSection('synopsis')}
              className="w-full px-6 py-4 flex items-center justify-between text-left font-serif text-sm font-bold uppercase tracking-wide cursor-pointer"
            >
              <span className="flex items-center gap-2">
                 <Compass size={16} className="text-moss-green" />
                 Book Synopsis
              </span>
              <ChevronDown className={`w-4 h-4 text-earth-brown/40 transition-transform ${openSection === 'synopsis' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
               {openSection === 'synopsis' && (
                 <motion.div 
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: 'auto', opacity: 1 }}
                   exit={{ height: 0, opacity: 0 }}
                   className="overflow-hidden"
                 >
                   <div className="px-6 pb-5 pt-1 text-xs md:text-sm text-earth-brown/70 dark:text-dark-muted leading-relaxed font-serif space-y-3">
                      <p>
                        In a world buried beneath eternal twilight, the only light source remaining is the spellwood's leaves. For centuries, the Woodland Scrollpress scribes have kept the peace by documenting every spell cast in physical bindings. But when a lone ranger uncovers a blank folio with living warmth, the ink of history begins to reshape itself.
                      </p>
                      <p>
                        Determined to decipher the blank leather binding before the Citadel Pyre-Knights find her, she embarks on a dangerous flight alongside an exiled pyromancer. This spectacular fantasy story combines cozy cottagecore escapism with breathtaking high-stakes intrigue.
                      </p>
                   </div>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* 2. CHARACTER DIRECTORY (Unique fantasy feature!) */}
         <div className="border border-earth-brown/5 rounded-3xl bg-white/30 dark:bg-dark-card/10 overflow-hidden">
            <button 
              onClick={() => toggleSection('characters')}
              className="w-full px-6 py-4 flex items-center justify-between text-left font-serif text-sm font-bold uppercase tracking-wide cursor-pointer"
            >
              <span className="flex items-center gap-2">
                 <Star size={16} className="text-moss-green" />
                 Character Highlights
              </span>
              <ChevronDown className={`w-4 h-4 text-earth-brown/40 transition-transform ${openSection === 'characters' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
               {openSection === 'characters' && (
                 <motion.div 
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: 'auto', opacity: 1 }}
                   exit={{ height: 0, opacity: 0 }}
                   className="overflow-hidden"
                 >
                   <div className="px-6 pb-6 pt-1 space-y-4">
                      {/* Interactive profile chips */}
                      <div className="flex gap-2">
                         {mainCharacters.map((char, index) => (
                            <button
                               key={index}
                               onClick={() => setSelectedCharacter(index)}
                               className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
                                 selectedCharacter === index 
                                 ? 'bg-moss-green text-white border-moss-green shadow-md shadow-moss-green/15' 
                                 : 'bg-white dark:bg-dark-card text-earth-brown border-earth-brown/5 hover:bg-earth-brown/5'
                               }`}
                            >
                               {char.name}
                            </button>
                         ))}
                      </div>

                      {/* Display detail for active character */}
                      <div className="p-4 bg-[#fbfaf6] dark:bg-dark-card/40 rounded-2xl border border-earth-brown/5 space-y-1">
                         <div className="flex justify-between items-center">
                            <span className="font-bold text-xs">{mainCharacters[selectedCharacter].name}</span>
                            <span className="text-[9px] font-bold uppercase text-[#d4a373] tracking-widest bg-[#d4a373]/10 px-2 py-0.5 rounded-lg">{mainCharacters[selectedCharacter].role}</span>
                         </div>
                         <p className="text-[11px] text-earth-brown/65 dark:text-dark-muted font-sans font-medium pt-1">
                            {mainCharacters[selectedCharacter].bio}
                         </p>
                      </div>
                   </div>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* 3. READING MOOD METER */}
         <div className="border border-earth-brown/5 rounded-3xl bg-white/30 dark:bg-dark-card/10 overflow-hidden">
            <button 
              onClick={() => toggleSection('mood')}
              className="w-full px-6 py-4 flex items-center justify-between text-left font-serif text-sm font-bold uppercase tracking-wide cursor-pointer"
            >
              <span className="flex items-center gap-2">
                 <Hash size={16} className="text-moss-green" />
                 Environmental Reading Mood
              </span>
              <ChevronDown className={`w-4 h-4 text-earth-brown/40 transition-transform ${openSection === 'mood' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
               {openSection === 'mood' && (
                 <motion.div 
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: 'auto', opacity: 1 }}
                   exit={{ height: 0, opacity: 0 }}
                   className="overflow-hidden"
                 >
                   <div className="px-6 pb-6 pt-1 space-y-3 font-sans">
                      {sensoryVibes.map((vibe, idx) => (
                         <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-earth-brown/60 dark:text-dark-muted">
                               <span>{vibe.label}</span>
                               <span>{vibe.value}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-earth-brown/5 dark:bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full bg-moss-green" style={{ width: `${vibe.value}%` }} />
                            </div>
                         </div>
                      ))}
                   </div>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* 4. CHRONICLES CITATION QUOTE */}
         <div className="border border-earth-brown/5 rounded-3xl bg-white/30 dark:bg-dark-card/10 overflow-hidden">
            <button 
              onClick={() => toggleSection('quotes')}
              className="w-full px-6 py-4 flex items-center justify-between text-left font-serif text-sm font-bold uppercase tracking-wide cursor-pointer"
            >
              <span className="flex items-center gap-2">
                 <Quote size={16} className="text-moss-green" />
                 Historical Book Quote
              </span>
              <ChevronDown className={`w-4 h-4 text-earth-brown/40 transition-transform ${openSection === 'quotes' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
               {openSection === 'quotes' && (
                 <motion.div 
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: 'auto', opacity: 1 }}
                   exit={{ height: 0, opacity: 0 }}
                   className="overflow-hidden"
                 >
                   <div className="px-6 pb-6 pt-1">
                      <div className="relative p-5 bg-[#faf6ed] dark:bg-dark-card/30 rounded-2xl border-l-4 border-moss-green italic font-serif text-earth-brown/80 dark:text-dark-text">
                         <span className="absolute -top-1 left-2 text-6xl text-moss-green/10 font-serif leading-none">“</span>
                         <p className="text-xs md:text-sm pl-2 leading-relaxed">
                            {currentQuote.text}
                         </p>
                         <p className="text-right text-[10px] font-sans font-bold uppercase tracking-widest text-moss-green mt-3">
                            — {currentQuote.citation}
                         </p>
                      </div>
                   </div>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* 5. TRIGGER RATING NOTES */}
         <div className="border border-earth-brown/5 rounded-3xl bg-white/30 dark:bg-dark-card/10 overflow-hidden">
            <button 
              onClick={() => toggleSection('warnings')}
              className="w-full px-6 py-4 flex items-center justify-between text-left font-serif text-sm font-bold uppercase tracking-wide cursor-pointer"
            >
              <span className="flex items-center gap-2">
                 <AlertCircle size={16} className="text-[#cd4e4e]" />
                 Content Advisory Guidance
              </span>
              <ChevronDown className={`w-4 h-4 text-earth-brown/40 transition-transform ${openSection === 'warnings' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
               {openSection === 'warnings' && (
                 <motion.div 
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: 'auto', opacity: 1 }}
                   exit={{ height: 0, opacity: 0 }}
                   className="overflow-hidden"
                 >
                   <div className="px-6 pb-6 pt-1 space-y-2 text-[11px] font-sans text-earth-brown/60 dark:text-dark-muted leading-relaxed">
                      <p>
                        This fantastical digital record is crafted mostly for family-friendly enjoyment, but does feature several elements to enhance atmospheric immersion:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Fictional high-fantasy elemental sword-fights.</li>
                        <li>Themes of light wilderness betrayal and ancient runes.</li>
                        <li>Overlapping suspenseful shadows and eerie night whispers.</li>
                      </ul>
                   </div>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>

      </div>

    </div>
  );
};
