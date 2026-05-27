import { motion } from 'motion/react';
import { Home, ClipboardList, Compass, Heart, ShoppingBag, User } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const BottomNav = () => {
  const { cartCount } = useShop();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const items = [
    { icon: Home, label: 'Home', active: location.pathname === '/', action: () => navigate('/') },
    { 
      icon: ClipboardList, 
      label: 'Orders', 
      active: location.pathname === '/tracking',
      action: () => navigate('/tracking')
    },
    { icon: Compass, label: 'Discover', active: location.pathname === '/discover', action: () => navigate('/discover') },
    { icon: Heart, label: 'Wishlist', active: location.pathname === '/wishlist', action: () => navigate('/wishlist') },
    { icon: ShoppingBag, label: 'Cart', active: location.pathname === '/cart', action: () => navigate('/cart'), badge: cartCount },
    { icon: User, label: 'Profile', active: location.pathname === '/profile', action: () => navigate('/profile') },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 transition-colors">
      <div className="relative h-20 bg-white/80 dark:bg-dark-card/90 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-around shadow-2xl border border-white/50 dark:border-white/10 overflow-hidden">
        {/* Background Mushroom Decoration Sim */}
        <div className="absolute left-4 bottom-2 text-2xl opacity-20 transform -rotate-12 select-none">🍄</div>
        <div className="absolute right-4 bottom-2 text-2xl opacity-20 transform rotate-12 select-none">🍄</div>

        {items.map((item, i) => {
          const isActive = item.active;
          return (
            <div 
              key={i} 
              className="flex flex-col items-center gap-1 cursor-pointer relative"
              onClick={item.action}
            >
              <div className={`p-2 rounded-full transition-all relative ${isActive ? 'text-moss-green' : 'text-earth-brown/40 dark:text-dark-muted'}`}>
                <item.icon className="w-6 h-6" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-0 right-0 bg-mushroom-red text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'text-earth-brown dark:text-dark-text' : 'text-earth-brown/30 dark:text-dark-muted'}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
