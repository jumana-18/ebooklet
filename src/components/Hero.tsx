import { motion } from 'motion/react';
import { BookOpen, Leaf, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-[450px] mx-4 my-2 rounded-[2.5rem] overflow-hidden flex flex-col justify-center p-8 bg-forest-green dark:bg-black">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=1200" 
          alt="Magical Ebookstore" 
          className="w-full h-full object-cover brightness-75 scale-110 opacity-70 group-dark:opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        
        {/* Floating Book Silhouettes */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`book-${i}`}
            className="absolute text-white/5 pointer-events-none"
            initial={{ 
              x: Math.random() * 1000, 
              y: Math.random() * 500,
              rotate: Math.random() * 360,
              scale: 0.8 + Math.random() * 0.5
            }}
            animate={{
              y: [null, '-=40', '-=20', '-=40'],
              rotate: [null, i % 2 === 0 ? 10 : -10, 0],
              opacity: [0.02, 0.08, 0.02],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              left: `${15 + i * 20}%`,
              top: `${20 + (i % 2) * 40}%`,
            }}
          >
            <BookOpen size={120 + Math.random() * 80} strokeWidth={0.5} />
          </motion.div>
        ))}

        {/* Floating Leaves */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`leaf-${i}`}
            className="absolute text-moss-green/20 dark:text-moss-green/10 pointer-events-none"
            animate={{
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 200 + 100],
              rotate: [0, 360],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `-50px`,
            }}
          >
            <Leaf size={20 + Math.random() * 20} fill="currentColor" />
          </motion.div>
        ))}

        {/* Glowing Mushrooms / Spots */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`glow-${i}`}
            className="absolute flex items-center justify-center pointer-events-none"
            style={{
              left: `${20 + i * 15}%`,
              bottom: `${10 + (i % 2) * 5}%`,
            }}
          >
             <div className="text-2xl drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] opacity-40">🍄</div>
             <motion.div
               animate={{
                 scale: [1, 1.5, 1],
                 opacity: [0.3, 0.7, 0.3],
               }}
               transition={{
                 duration: 3 + Math.random() * 3,
                 repeat: Infinity,
                 ease: "easeInOut"
               }}
               className="absolute"
             >
                <Sparkles className="w-8 h-8 text-yellow-100" />
             </motion.div>
          </motion.div>
        ))}
        
        {/* Animated Particles (Fireflies) */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`firefly-${i}`}
            className="absolute w-1 h-1 bg-yellow-200/40 dark:bg-yellow-100/60 rounded-full blur-[2px]"
            animate={{
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
              opacity: [0, 0.8, 0],
              scale: [1, 1.8, 1],
            }}
            transition={{
              duration: 5 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
          />
        ))}
      </div>

      <motion.div 
        className="relative z-10 space-y-4 max-w-sm"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-7xl font-serif text-white tracking-tight leading-tight uppercase font-bold">
          Ebooklet
        </h1>
        <p className="text-3xl font-serif text-white/90">
          Where <span className="italic">Stories</span> Begin
        </p>
        <p className="text-sm text-white/70 font-sans leading-relaxed">
          Step into a world of digital imagination and endless adventures.
        </p>

        <div className="flex flex-col gap-3 pt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/discover')}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-[#1e271c] dark:bg-moss-green text-white rounded-full font-sans font-medium text-sm transition-colors border border-white/10"
          >
            Explore Ebooks 🌿
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/library')}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-white text-[#2d3a2a] rounded-full font-sans font-medium text-sm transition-colors shadow-lg"
          >
            Continue Reading →
          </motion.button>
        </div>
      </motion.div>

      {/* Pagination dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        <div className="w-2 h-2 bg-white/30 rounded-full" />
        <div className="w-4 h-2 bg-white rounded-full" />
        <div className="w-2 h-2 bg-white/30 rounded-full" />
      </div>
    </section>
  );
};
