import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, CheckCircle, ThumbsUp, Send, Image, MessageSquare, AlertTriangle, EyeOff } from 'lucide-react';
import { Review } from '../types';

interface ReviewsSectionProps {
  initialReviews: Review[];
  bookTitle: string;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ initialReviews, bookTitle }) => {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [sortBy, setSortBy] = useState<'highest' | 'newest'>('highest');
  
  // Feedback form controls
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [newName, setNewName] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSpoiler, setIsSpoiler] = useState(false);

  // Incremental helpful ratings dictionary
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({
    '1': 42,
    '2': 18
  });
  const [votedIds, setVotedIds] = useState<Record<string, boolean>>({});

  // Star hover feedback state
  const [hoverRating, setHoverRating] = useState<number>(0);

  // Hidden states for spoilers
  const [unmaskedSpoilers, setUnmaskedSpoilers] = useState<Record<string, boolean>>({});

  const toggleSpoilerText = (id: string) => {
    setUnmaskedSpoilers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleHelpfulClick = (id: string) => {
    if (votedIds[id]) return;
    setHelpfulVotes(prev => ({
       ...prev,
       [id]: (prev[id] || 0) + 1
    }));
    setVotedIds(prev => ({ ...prev, [id]: true }));
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const formattedComment = isSpoiler ? `[SPOILER] ${newComment.trim()}` : newComment.trim();

    const createdReview: Review = {
      id: Date.now().toString(),
      userName: newName.trim() || 'Anonymous Companion 🍃',
      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(newName || 'anon')}`,
      rating: newRating,
      comment: formattedComment
    };

    setReviews([createdReview, ...reviews]);
    
    // Reset fields & transition form closed
    setNewName('');
    setNewComment('');
    setIsSpoiler(false);
    setShowForm(false);
  };

  const sortedReviews = React.useMemo(() => {
    const list = [...reviews];
    if (sortBy === 'highest') {
       return list.sort((a, b) => b.rating - a.rating);
    } else {
       return list.sort((a, b) => b.id.localeCompare(a.id));
    }
  }, [reviews, sortBy]);

  // Distribution figures for review bars
  const distribution = [
    { stars: 5, percentage: 76 },
    { stars: 4, percentage: 18 },
    { stars: 3, percentage: 4 },
    { stars: 2, percentage: 2 },
    { stars: 1, percentage: 0 },
  ];

  return (
    <div className="space-y-8 select-none">
       <div className="border-t border-earth-brown/5 pt-8">
          <h3 className="text-2xl font-serif text-earth-brown dark:text-dark-text font-bold mb-1">
             Reader Sanctuary Logs
          </h3>
          <p className="text-xs text-earth-brown/60 dark:text-dark-muted font-sans font-medium mb-6">
             Discover genuine words from woodland scrollkeepers around the realm.
          </p>
       </div>

       {/* Apple App Store style Score Breakdown Widget */}
       <div className="p-6 bg-white/40 dark:bg-dark-card/20 rounded-[2rem] border border-earth-brown/5 flex flex-col md:flex-row gap-6 items-center">
          
          {/* Main Average Circle */}
          <div className="text-center md:border-r border-earth-brown/10 p-2 md:pr-10">
             <span className="text-5.5xl font-serif font-bold text-earth-brown dark:text-dark-text inline-block">4.8</span>
             <p className="text-[10px] text-earth-brown/40 dark:text-dark-muted font-bold font-sans uppercase tracking-wider">Out of 5 Stars</p>
             <div className="flex justify-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-terracotta fill-terracotta" />
                ))}
             </div>
             <p className="text-[10px] text-earth-brown/50 dark:text-dark-muted font-bold font-sans uppercase tracking-widest mt-3">
                {reviews.length} total votes
             </p>
          </div>

          {/* Spliced Meter Levels */}
          <div className="flex-1 w-full space-y-2">
             {distribution.map((item) => (
                <div key={item.stars} className="flex items-center gap-3">
                   <span className="text-[10px] text-earth-brown/50 dark:text-dark-muted font-bold w-12 text-right">{item.stars} Stars</span>
                   <div className="flex-1 h-2 bg-earth-brown/5 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-moss-green rounded-full transition-all duration-700" 
                        style={{ width: `${item.percentage}%` }}
                      />
                   </div>
                   <span className="text-[10px] text-earth-brown/65 dark:text-dark-muted font-bold w-10 text-left">{item.percentage}%</span>
                </div>
             ))}
          </div>

          {/* Log Trigger Button */}
          <div className="w-full md:w-auto md:pl-4 flex flex-col items-center">
             <button
               onClick={() => setShowForm(!showForm)}
               className="w-full px-6 py-3.5 bg-moss-green text-white font-bold text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-moss-green/10 hover:bg-moss-green/90 transition-colors flex items-center justify-center gap-2 cursor-pointer"
             >
                <MessageSquare size={14} />
                Inscribe of Experience
             </button>
          </div>
       </div>

       {/* Review form expands nicely */}
       <AnimatePresence>
         {showForm && (
           <motion.form 
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: 'auto', opacity: 1 }}
             exit={{ height: 0, opacity: 0 }}
             onSubmit={handleReviewSubmit}
             className="p-6 bg-[#fcf9f3] dark:bg-dark-card rounded-[2rem] border border-moss-green/20 space-y-4 overflow-hidden"
           >
              <h4 className="font-serif text-sm font-bold text-earth-brown dark:text-dark-text uppercase tracking-wider">
                 Inscribe Your Review for «{bookTitle}»
              </h4>

              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-earth-brown/60 dark:text-dark-muted uppercase tracking-wider block">Align Star level rating</label>
                 <div className="flex gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((index) => (
                       <button
                         key={index}
                         type="button"
                         onClick={() => setNewRating(index)}
                         onMouseEnter={() => setHoverRating(index)}
                         onMouseLeave={() => setHoverRating(0)}
                         className="p-0.5 cursor-pointer text-terracotta"
                       >
                          <Star 
                            className={`w-6 h-6 transition-all scale-100 hover:scale-110 ${
                              (hoverRating || newRating) >= index ? 'fill-terracotta' : 'text-earth-brown/15'
                            }`} 
                          />
                       </button>
                    ))}
                    <span className="text-xs font-bold font-serif text-earth-brown/65 dark:text-dark-muted ml-3 pt-1 self-center">
                       {newRating === 5 ? 'Masterpiece 🕊️' : newRating === 4 ? 'Enchanting Story ✨' : newRating === 3 ? 'Decent Scroll 📜' : newRating === 2 ? 'Weak Spell 🕯️' : 'Lost Binding 🪵'}
                    </span>
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-earth-brown/60 dark:text-dark-muted uppercase tracking-wider block">Your Persona Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Ranger Aria"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-white dark:bg-dark-card/50 px-4 py-3 rounded-xl border border-earth-brown/10 dark:border-white/10 text-xs text-earth-brown font-semibold focus:ring-1 focus:ring-moss-green"
                    />
                 </div>
                 
                 <div className="flex items-center gap-3 pt-6 pl-1 select-none">
                     <input 
                       type="checkbox"
                       id="spoiler"
                       checked={isSpoiler}
                       onChange={(e) => setIsSpoiler(e.target.checked)}
                       className="w-4.5 h-4.5 accent-moss-green rounded-lg cursor-pointer"
                     />
                     <label htmlFor="spoiler" className="text-[11px] font-bold text-earth-brown/65 dark:text-dark-muted uppercase tracking-widest cursor-pointer flex items-center gap-1.5">
                        <AlertTriangle size={12} className="text-terracotta" />
                        Contains Plot Spoilers
                     </label>
                 </div>
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-earth-brown/60 dark:text-dark-muted uppercase tracking-wider block">Commentary Excerpt</label>
                 <textarea 
                   rows={3}
                   placeholder="How did the manuscript feel to your senses? Did the wood whispers realign your reading paths?"
                   value={newComment}
                   onChange={(e) => setNewComment(e.target.value)}
                   className="w-full bg-white dark:bg-dark-card/50 px-4 py-3 rounded-xl border border-earth-brown/10 dark:border-white/10 text-xs text-earth-brown font-semibold focus:ring-1 focus:ring-moss-green resize-none"
                 />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                 <button 
                   type="button"
                   onClick={() => setShowForm(false)}
                   className="px-5 py-2.5 rounded-xl border border-earth-brown/10 text-xs font-bold uppercase tracking-widest text-earth-brown/50 hover:bg-earth-brown/5 cursor-pointer"
                 >
                    Discard
                 </button>
                 <button 
                   type="submit"
                   className="px-6 py-2.5 bg-moss-green text-white font-bold rounded-xl text-xs uppercase tracking-widest shadow-md flex items-center gap-2 cursor-pointer"
                 >
                    Inscribe Log
                    <Send size={12} />
                 </button>
              </div>
           </motion.form>
         )}
       </AnimatePresence>

       {/* Toolbar sorting elements */}
       <div className="flex items-center justify-between border-b border-earth-brown/5 pb-4">
          <span className="text-xs font-bold text-earth-brown/50 dark:text-dark-muted uppercase tracking-widest">
             Arranging logs ({reviews.length})
          </span>
          <div className="flex gap-2 text-xs font-bold">
             <button 
               onClick={() => setSortBy('highest')}
               className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                 sortBy === 'highest'
                   ? 'bg-moss-green/10 text-moss-green'
                   : 'text-earth-brown/40 hover:text-earth-brown'
               }`}
             >
                Top Rated
             </button>
             <button 
               onClick={() => setSortBy('newest')}
               className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                 sortBy === 'newest'
                   ? 'bg-moss-green/10 text-moss-green'
                   : 'text-earth-brown/40 hover:text-earth-brown'
               }`}
             >
                Recently Inscribed
             </button>
          </div>
       </div>

       {/* List of custom reviews */}
       <div className="space-y-5">
          {sortedReviews.map((review) => {
             const hasSpoiler = review.comment.startsWith('[SPOILER]');
             const cleanComment = hasSpoiler ? review.comment.replace('[SPOILER]', '') : review.comment;
             const isMasked = hasSpoiler && !unmaskedSpoilers[review.id];

             return (
                <motion.div 
                   key={review.id}
                   layout
                   className="p-5 bg-white/60 dark:bg-dark-card/40 rounded-2xl border border-earth-brown/5 space-y-3 relative group"
                >
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <img src={review.avatar} alt={review.userName} className="w-10 h-10 rounded-full object-cover border border-earth-brown/5 shadow-xs" referrerPolicy="no-referrer" />
                         <div>
                            <span className="text-xs font-serif font-bold text-earth-brown dark:text-dark-text block">{review.userName}</span>
                            <span className="text-[9px] font-bold text-moss-green uppercase tracking-widest flex items-center gap-1 leading-none mt-0.5">
                               <CheckCircle size={10} /> Verified Warden
                            </span>
                         </div>
                      </div>
                      <div className="flex gap-0.5">
                         {[...Array(5)].map((_, i) => (
                           <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-terracotta fill-terracotta' : 'text-earth-brown/10 dark:text-white/10'}`} />
                         ))}
                      </div>
                   </div>

                   {/* Custom spoiler cover masks */}
                   {isMasked ? (
                      <div className="p-4 bg-amber-900/5 dark:bg-black/40 border border-amber-900/10 rounded-xl flex items-center justify-between gap-3 text-left">
                         <div className="flex items-center gap-2">
                           <EyeOff size={14} className="text-terracotta" />
                           <div className="text-[11px] font-bold text-earth-brown/85 dark:text-dark-text uppercase tracking-wider">
                              Plot Spoiler Warning Included
                           </div>
                         </div>
                         <button 
                           onClick={() => toggleSpoilerText(review.id)}
                           className="px-3 py-1 bg-moss-green text-white text-[9px] font-bold uppercase tracking-widest rounded-lg"
                         >
                            Reveal
                         </button>
                      </div>
                   ) : (
                      <div className="space-y-4">
                         <p className="text-xs md:text-sm text-earth-brown/70 dark:text-dark-muted font-serif italic leading-relaxed">
                            "{cleanComment}"
                         </p>
                         {hasSpoiler && (
                            <button 
                              onClick={() => toggleSpoilerText(review.id)}
                              className="text-[9px] font-bold uppercase text-earth-brown/30 hover:text-earth-brown/60 transition-colors flex items-center gap-1"
                            >
                               <EyeOff size={10} /> Cover Spoilers Back
                            </button>
                         )}
                      </div>
                   )}

                   {/* Review Footer Helpful rating click triggers */}
                   <div className="flex items-center gap-4 pt-1 border-t border-earth-brown/[0.03]">
                      <button
                        onClick={() => handleHelpfulClick(review.id)}
                        disabled={votedIds[review.id]}
                        className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                          votedIds[review.id] 
                          ? 'text-moss-green' 
                          : 'text-earth-brown/40 hover:text-earth-brown hover:scale-105'
                        }`}
                      >
                         <ThumbsUp size={11} />
                         Helpful ({helpfulVotes[review.id] || 0})
                      </button>
                      <span className="text-earth-brown/10 dark:text-white/10">|</span>
                      <span className="text-[10px] text-earth-brown/30 dark:text-dark-muted font-sans font-medium">Inscribed 4 days cycle ago</span>
                   </div>
                </motion.div>
             );
          })}
       </div>
    </div>
  );
};
