import { motion } from 'motion/react';
import { Instagram, Twitter, Facebook, Mail, MapPin, Phone } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="relative mt-20 pt-20 pb-10 px-6 bg-earth-brown text-parchment overflow-hidden">
      {/* Footer background styling */}
      <div className="absolute top-0 left-0 w-full h-20 bg-parchment" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 0)' }}></div>
      <div className="absolute top-0 right-0 w-full h-20 bg-parchment opacity-30" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%, 100% 0)' }}></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <h2 className="text-4xl font-serif tracking-tight uppercase font-bold">Ebooklet</h2>
            <p className="text-parchment/60 leading-relaxed max-w-xs">
              Nestled between the digital whispers of the ancient woods and the dreams of storytellers. Your journey into magic begins here.
            </p>
            <div className="flex gap-4">
               {[Instagram, Twitter, Facebook].map((Icon, i) => (
                 <motion.a
                   key={i}
                   href="#"
                   whileHover={{ y: -5, color: '#8da399' }}
                   className="p-2 rounded-full border border-parchment/20 hover:border-sage-green transition-all"
                 >
                   <Icon className="w-5 h-5" />
                 </motion.a>
               ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-serif mb-6 text-sage-green">Company</h4>
            <ul className="space-y-4 text-parchment/70">
              {['About Us', 'Our Story', 'Wholesale', 'Careers', 'Blog'].map((item) => (
                <li key={item} className="hover:text-parchment transition-colors cursor-pointer">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-serif mb-6 text-sage-green">Support</h4>
            <ul className="space-y-4 text-parchment/70">
              {['Contact Us', 'FAQ', 'Shipping Policy', 'Returns', 'Privacy'].map((item) => (
                <li key={item} className="hover:text-parchment transition-colors cursor-pointer">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-serif mb-6 text-sage-green">Join Our Circle</h4>
            <p className="text-parchment/60 text-sm mb-4">Subscribe to receive weekly updates and exclusive discounts.</p>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Your email address"
                className="bg-parchment/10 border border-parchment/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage-green transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-parchment text-earth-brown rounded-xl py-3 text-sm font-bold shadow-xl shadow-black/20"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-parchment/10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-parchment/40">
          <p>© 2026 Ebooklet. All digital stories preserved.</p>
          <div className="flex gap-8">
            <span className="cursor-pointer hover:text-parchment transition-colors">Terms of Magic</span>
            <span className="cursor-pointer hover:text-parchment transition-colors">Fairytale Privacy</span>
          </div>
          <div className="flex gap-4 opacity-50 grayscale">
             {/* Payment Icons Simulation */}
             <div className="w-8 h-5 bg-parchment/20 rounded" />
             <div className="w-8 h-5 bg-parchment/20 rounded" />
             <div className="w-8 h-5 bg-parchment/20 rounded" />
          </div>
        </div>
      </div>

      {/* Decorative floating mushrooms at footer bottom */}
      <div className="absolute -bottom-10 -right-10 opacity-10 blur-sm">🍄</div>
      <div className="absolute -bottom-10 left-20 opacity-10 blur-sm">🍄</div>
    </footer>
  );
};
