import { Truck, ShieldCheck, RefreshCcw, BookOpenCheck, HeartHandshake, Moon } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';

export const ValueProps = () => {
  const { toggleDarkMode } = useShop();
  const navigate = useNavigate();

  const props = [
    { 
      icon: ShieldCheck, 
      title: 'Secure Payments', 
      desc: 'Industry-standard SSL encryption and protected checkout for a safe digital journey.',
      policy: true
    },
    { 
      icon: BookOpenCheck, 
      title: 'Daily New Ebooks', 
      desc: 'Fresh Stories Added Daily',
      action: () => navigate('/category/fantasy') // Or a general new arrivals page
    },
    { 
      icon: HeartHandshake, 
      title: 'Wishlist Sync', 
      desc: 'Your all activities and saved stories are instantly synced across all your digital devices.',
      note: true
    },
    { 
      icon: Moon, 
      title: 'Dark Mode', 
      desc: 'Eye Friendly Aesthetic', 
      action: toggleDarkMode 
    },
  ];

  return (
    <section className="px-6 py-8">
      <div className="bg-[#f9f5eb] dark:bg-dark-card rounded-3xl p-8 flex flex-col gap-8 border border-earth-brown/5 dark:border-white/5 shadow-sm transition-colors">
        {props.map((prop, i) => (
          <div 
            key={i} 
            className={`flex items-start gap-4 group ${prop.action ? 'cursor-pointer' : ''}`}
            onClick={prop.action}
          >
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex flex-shrink-0 items-center justify-center text-earth-brown dark:text-dark-text shadow-sm group-hover:bg-moss-green group-hover:text-white transition-all">
               <prop.icon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
               <h4 className="text-sm font-bold text-earth-brown dark:text-dark-text">{prop.title}</h4>
               <p className="text-[11px] text-earth-brown/60 dark:text-dark-muted font-medium leading-relaxed max-w-[240px]">
                 {prop.desc}
               </p>
               {(prop.policy || prop.note) && (
                 <div className="pt-1">
                    <span className="text-[9px] font-bold text-moss-green uppercase tracking-widest opacity-60">Verified Connection</span>
                 </div>
               )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
