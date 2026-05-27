import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Library, Compass, ClipboardList, Home, Settings, HelpCircle, Share2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const MenuDrawer = () => {
  const { isMenuOpen, toggleMenu } = useShop();
  const { user } = useAuth();
  const navigate = useNavigate();

  const authUser = user || {
    name: 'Elara Moonwhisper',
    email: 'elara@woodland.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    joinedDate: 'May 2024',
    membership: 'Gold Member'
  };

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Library, label: 'My Library', path: '/library' },
    { icon: Compass, label: 'Discover', path: '/discover' },
    { icon: ClipboardList, label: 'Your Orders', path: '/tracking' },
  ];

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMenu}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-full max-w-[300px] bg-parchment dark:bg-dark-bg z-[110] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-dark-card">
                    <img src={authUser.avatar} alt={authUser.name} className="w-full h-full object-cover" />
                 </div>
                 <div>
                    <h3 className="font-serif font-bold text-earth-brown dark:text-dark-text leading-tight">{authUser.name.split(' ')[0]}</h3>
                    <p className="text-[10px] font-bold text-moss-green uppercase tracking-widest">{authUser.membership || "Premium Member"}</p>
                 </div>
              </div>
              <button 
                onClick={toggleMenu}
                className="w-10 h-10 rounded-full hover:bg-earth-brown/5 dark:hover:bg-white/5 flex items-center justify-center text-earth-brown/40 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
              {menuItems.map((item, i) => (
                <motion.button
                  key={i}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    navigate(item.path);
                    toggleMenu();
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-earth-brown dark:text-dark-text hover:bg-moss-green hover:text-white group transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center shadow-sm group-hover:bg-white/20 transition-colors">
                    <item.icon size={20} />
                  </div>
                  <span className="font-serif font-bold text-lg">{item.label}</span>
                </motion.button>
              ))}
              
              <div className="pt-8 pb-4 px-4">
                 <h4 className="text-[10px] font-bold text-earth-brown/40 dark:text-dark-muted uppercase tracking-[0.2em] mb-4">Support</h4>
                 <div className="space-y-4">
                    <button className="flex items-center gap-3 text-sm font-medium text-earth-brown/60 dark:text-dark-muted hover:text-moss-green transition-colors w-full text-left">
                       <Settings size={18} /> Account Settings
                    </button>
                    <button className="flex items-center gap-3 text-sm font-medium text-earth-brown/60 dark:text-dark-muted hover:text-moss-green transition-colors w-full text-left">
                       <HelpCircle size={18} /> Help & Support
                    </button>
                    <button className="flex items-center gap-3 text-sm font-medium text-earth-brown/60 dark:text-dark-muted hover:text-moss-green transition-colors w-full text-left">
                       <Share2 size={18} /> Refer a Friend
                    </button>
                 </div>
              </div>
            </nav>

            {/* Footer */}
            <div className="p-8 border-t border-earth-brown/5 dark:border-white/5">
               <p className="text-[10px] font-medium text-earth-brown/30 dark:text-dark-muted text-center italic">
                  "Read beautifully, live fully."<br/>
                  v2.4.0 Deluxe Edition
               </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
