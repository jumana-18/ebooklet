import { motion } from 'motion/react';

export const DiscountBanner = () => {
  return (
    <section className="px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden bg-forest-green rounded-[2.5rem] p-8 text-parchment"
      >
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-moss-green rounded-full blur-[60px] opacity-40" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-terracotta rounded-full blur-[60px] opacity-40" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left space-y-4">
            <div className="inline-block px-4 py-1 rounded-full bg-parchment/10 text-xs font-bold tracking-widest uppercase border border-parchment/20">
              Limited Offer
            </div>
            <h2 className="text-4xl md:text-5xl font-serif leading-tight">
              30% Off on Your <br />
              <span className="italic text-sage-green">First Order</span>
            </h2>
            <p className="text-parchment/70 max-w-sm">
              Use code <span className="font-bold text-parchment">INTRO30</span> at checkout to unlock your discount.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-parchment text-forest-green rounded-2xl font-bold hover:bg-beige-cream transition-colors"
            >
              Get Discount
            </motion.button>
          </div>

          <div className="relative w-48 h-48">
            <motion.div
              animate={{ rotate: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="w-full h-full text-sage-green/20"
            >
               <svg viewBox="0 0 200 200" fill="currentColor">
                 <path d="M100 20C100 20 60 40 40 80C20 120 40 160 100 180C160 160 180 120 160 80C140 40 100 20 100 20Z" />
               </svg>
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl text-parchment">🍄</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
