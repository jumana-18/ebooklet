import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { REVIEWS } from '../constants';

export const CommunityReviews = () => {
  return (
    <section className="py-12 px-6">
      <h2 className="text-2xl font-serif mb-8 text-center text-earth-brown dark:text-dark-text">Reader Echoes</h2>
      <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-8">
        {REVIEWS.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="flex-shrink-0 w-80 bg-parchment dark:bg-dark-card p-8 rounded-[2rem] border border-earth-brown/5 dark:border-white/5 shadow-sm hover:shadow-md transition-all relative"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-sage-green/20">
                <img src={review.avatar} alt={review.userName} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-serif text-earth-brown dark:text-dark-text">{review.userName}</h4>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < review.rating ? 'text-terracotta fill-current' : 'text-earth-brown/20 dark:text-white/10'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-earth-brown/70 dark:text-dark-text/70 italic leading-relaxed">"{review.comment}"</p>
            <div className="absolute top-4 right-8 text-6xl text-earth-brown/5 dark:text-white/5 font-serif select-none">"</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
