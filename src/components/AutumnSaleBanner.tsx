import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AutumnSaleBanner = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    days: '02',
    hours: '14',
    mins: '36',
    secs: '58'
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      // Simple logic to decrement or use a fixed end date
      // Let's just decrement for visual feedback if we don't have a specific end date
      setTimeLeft(prev => {
        let s = parseInt(prev.secs) - 1;
        let m = parseInt(prev.mins);
        let h = parseInt(prev.hours);
        let d = parseInt(prev.days);

        if (s < 0) {
          s = 59;
          m -= 1;
        }
        if (m < 0) {
          m = 59;
          h -= 1;
        }
        if (h < 0) {
          h = 23;
          d -= 1;
        }
        if (d < 0) {
          return { days: '00', hours: '00', mins: '00', secs: '00' };
        }

        return {
          days: d.toString().padStart(2, '0'),
          hours: h.toString().padStart(2, '0'),
          mins: m.toString().padStart(2, '0'),
          secs: s.toString().padStart(2, '0')
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeData = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Mins', value: timeLeft.mins },
    { label: 'Secs', value: timeLeft.secs },
  ];

  return (
    <section className="px-4 py-8">
      <div className="relative h-[300px] rounded-[2.5rem] overflow-hidden flex flex-col justify-center px-10">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=1200" 
            alt="Autumn Sale" 
            className="w-full h-full object-cover brightness-50"
          />
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-600/20 backdrop-blur-md rounded-full flex items-center justify-center border border-orange-400/30">
               <Sparkles className="w-5 h-5 text-orange-400" />
            </div>
            <h2 className="text-3xl font-serif text-white font-bold tracking-wide uppercase">Magical Autumn Sale</h2>
          </div>

          <div className="space-y-4">
             <p className="text-white/80 font-sans text-sm">Up to 40% Off on Selected Ebooks</p>
             
             <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex gap-4">
                  {timeData.map((time, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="w-14 h-14 bg-black/40 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-xl">
                        <span className="text-xl font-bold text-white">{time.value}</span>
                      </div>
                      <span className="text-[10px] text-white/60 mt-1 uppercase font-bold tracking-widest">{time.label}</span>
                    </div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/sale')}
                  className="px-10 py-3.5 bg-[#4a5d45] text-white rounded-full font-bold text-sm shadow-2xl shadow-black/40 border border-white/10"
                >
                  Shop The Sale
                </motion.button>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};
