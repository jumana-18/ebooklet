import { motion } from 'motion/react';
import { Quote } from 'lucide-react';

export const AuthorSpotlight = () => {
  return (
    <section className="px-6 py-12">
      <div className="bg-beige-cream dark:bg-dark-card rounded-[2.5rem] p-10 relative overflow-hidden border border-earth-brown/5 transition-colors">
        <div className="absolute top-0 right-0 w-64 h-64 bg-moss-green/5 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="relative flex-shrink-0">
            <div className="w-48 h-48 rounded-[2rem] overflow-hidden rotate-6 shadow-2xl border-4 border-parchment dark:border-dark-bg">
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400"
                alt="Author"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-terracotta text-parchment rounded-full flex items-center justify-center shadow-lg">
               ✨
            </div>
          </div>

          <div className="space-y-6 text-center md:text-left">
            <div className="inline-block px-4 py-1 rounded-full bg-earth-brown/5 dark:bg-white/5 text-xs font-bold tracking-widest text-earth-brown dark:text-dark-text uppercase">
              Author Spotlight
            </div>
            <h2 className="text-4xl font-serif text-earth-brown dark:text-dark-text">Elara Moonwhisper</h2>
            <div className="relative">
              <Quote className="absolute -top-6 -left-6 w-12 h-12 text-earth-brown/5 dark:text-white/5" />
              <p className="text-xl font-serif italic text-earth-brown/80 dark:text-dark-text/80 leading-relaxed">
                "Every tree has a story to tell, and every leaf is a digital page in the grand ebook of the forest."
              </p>
            </div>
            <p className="text-earth-brown/60 dark:text-dark-muted max-w-md">
              Elara is an award-winning fantasy writer known for her deeply atmospheric digital woodland sagas and magical realism.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
               <button className="px-6 py-2 bg-earth-brown dark:bg-moss-green text-parchment dark:text-white rounded-xl text-sm font-medium hover:bg-forest-green transition-colors">
                 Follow Author
               </button>
               <button className="px-6 py-2 bg-transparent border border-earth-brown/20 dark:border-white/20 text-earth-brown dark:text-dark-text rounded-xl text-sm font-medium hover:bg-earth-brown/5 dark:hover:bg-white/5 transition-colors">
                 Read Biography
               </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
