import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Search, MessageSquare, Phone, MapPin, Truck, HelpCircle, 
  RefreshCw, Star, Info, ChevronRight, Bell, User, Clock, Heart, Home, 
  Compass, LayoutGrid, Check, CheckCircle2, ShieldCheck, Mail, Send, 
  Sparkles, Navigation, RotateCcw, ShoppingBag, Gift, PhoneCall, Copy, CheckSquare, Library, Download
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { BOOKS } from '../constants';

interface TrackingStep {
  title: string;
  location: string;
  time: string;
  desc: string;
  detail: string;
  icon: string;
}

const FANTASY_MILESTONES: TrackingStep[] = [
  {
    title: 'Order Confirmed',
    location: 'eBooklet Shop Warehouse',
    time: '10:30 AM',
    desc: 'We received your order and are starting to prepare your books.',
    detail: 'Your order is safely in our bookstore store system.',
    icon: '📜'
  },
  {
    title: 'Payment Received',
    location: 'Online Bank Vault',
    time: '10:35 AM',
    desc: 'Your payment was successfully approved and is fully complete.',
    detail: 'Your billing and checkout steps are verified.',
    icon: '🪙'
  },
  {
    title: 'Books Carefully Wrapped',
    location: 'Book Wrapping Section 4',
    time: '11:00 AM',
    desc: 'Your books are carefully wrapped in beautiful, clean paper.',
    detail: 'Strong packaging keeps your books safe from rain or dust.',
    icon: '📦'
  },
  {
    title: 'Sent Out From Warehouse',
    location: 'Central Sorting Station',
    time: '11:15 AM',
    desc: 'We packed your item and gave it to our friendly delivery owl team.',
    detail: 'We double-checked the address to make sure it is correct.',
    icon: '🏰'
  },
  {
    title: 'Owl Travel In Progress',
    location: 'Flying Delivery Route',
    time: '12:40 PM',
    desc: 'Our delivery owl is flying toward your home address right now.',
    detail: 'The weather is very nice today, helping the owl fly faster.',
    icon: '🦉'
  },
  {
    title: 'Arrived at Local Center',
    location: 'Your Town Delivery Hub',
    time: '02:15 PM',
    desc: 'The owl has stopped here to rest and map out the final path.',
    detail: 'The package is safe here and ready for the last mile.',
    icon: '🍃'
  },
  {
    title: 'Out for Nest-Drop',
    location: 'Near Your Home Street',
    time: '03:30 PM',
    desc: 'Our helper owl is flying down your street. Watch out for it!',
    detail: 'The owl is approaching your doorstep.',
    icon: '🎈'
  },
  {
    title: 'Delivered Successfully',
    location: 'Your Front Door',
    time: '04:12 PM',
    desc: 'Your books have arrived safely! Time to start reading your story!',
    detail: 'Your delivery is complete and placed safely at your entrance.',
    icon: '✨'
  }
];

export const OrderTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart: rawCart, clearCart, user: shopUser } = useShop();
  const { orders: rawOrders, user: authUser } = useAuth();
  
  const cart = Array.isArray(rawCart) ? rawCart : [];
  const orders = Array.isArray(rawOrders) ? rawOrders : [];
  const user = authUser || shopUser;

  // Extract orderId from URL parameters
  const queryParams = new URLSearchParams(location.search);
  const urlOrderId = queryParams.get('orderId');

  // Look up matched order from user orders
  const matchedOrder = orders?.find(o => o.orderNumber === urlOrderId);

  // Load full order details from localstorage if available
  const [fullOrderData, setFullOrderData] = useState<any>(() => {
    if (matchedOrder) {
      return {
        orderNumber: matchedOrder.orderNumber,
        status: matchedOrder.status,
        shipping: {
          fullName: (matchedOrder as any).shippingLabel || matchedOrder?.shipping?.fullName || "Lysandra Elvoria",
          emailAddress: matchedOrder?.shipping?.emailAddress || "lysandra@ebooklet-reader.net",
          street: "77 Whispering Willow Grove",
          city: "Mosswood District",
          zipCode: "ZIP 892040",
          deliveryMethod: "owl",
        },
        payment: {
          selectedMethod: "card",
          cardNumberMasked: "•••• •••• •••• 9012"
        },
        items: (matchedOrder.items || []).map(item => ({
          book: {
            id: item.bookId,
            title: item.title,
            author: item.author,
            coverImage: item.coverImage,
            price: item.price,
            bookType: item.format === 'physical' ? 'physical' : 'epub'
          },
          quantity: item.quantity,
          format: item.format
        }))
      };
    }
    const lastOrder = localStorage.getItem('ebooklet_last_order');
    if (lastOrder) {
      try {
        const parsed = JSON.parse(lastOrder);
        if (parsed && typeof parsed === 'object' && parsed.items) {
          return parsed;
        }
      } catch (e) {}
    }
    return null;
  });

  // Try parsing order from state, or load the checkout's final order from localStorage,
  // or fall back to high-quality mockup list of books matching eBooklet style
  const [orderedItems, setOrderedItems] = useState<any[]>(() => {
    if (matchedOrder) {
      return (matchedOrder.items || []).map(item => ({
        book: {
          id: item.bookId,
          title: item.title,
          author: item.author,
          coverImage: item.coverImage,
          price: item.price,
          bookType: item.format === 'physical' ? 'physical' : 'epub'
        },
        quantity: item.quantity,
        format: item.format
      }));
    }
    if (location.state?.orderedItems) {
      return location.state.orderedItems;
    }
    if (fullOrderData && fullOrderData.items) {
      return fullOrderData.items;
    }
    const lastOrder = localStorage.getItem('ebooklet_last_order');
    if (lastOrder) {
      try {
        const parsed = JSON.parse(lastOrder);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {}
    }
    // Fallback default: a glorious set of eBooklet classics
    const classic1 = BOOKS.find(b => b.id === '1') || BOOKS[0];
    const classic2 = BOOKS.find(b => b.id === '4') || BOOKS[3];
    return [
      { book: classic1, quantity: 1, format: 'epub' },
      { book: classic2, quantity: 2, format: 'physical' }
    ];
  });

  const hasPhysical = orderedItems && orderedItems.length > 0
    ? orderedItems.some(i => i.format === 'physical' || i.book?.bookType === 'physical')
    : false;

  const hasDigital = orderedItems && orderedItems.length > 0
    ? orderedItems.some(i => i.format !== 'physical' && i.book?.bookType !== 'physical')
    : false;

  // Active view tab state: Default to digital if only digital, physical if only physical, or physical if both
  const [activeTab, setActiveTab] = useState<'digital' | 'physical'>('physical');

  useEffect(() => {
    if (hasPhysical) {
      setActiveTab('physical');
    } else if (hasDigital) {
      setActiveTab('digital');
    }
  }, [hasPhysical, hasDigital]);

  // Track specific selected physical book for status tracking
  const [selectedTrackingBookId, setSelectedTrackingBookId] = useState<string | null>(() => {
    const firstPhysicalItem = orderedItems.find(i => i.format === 'physical' || i.book?.bookType === 'physical');
    return firstPhysicalItem ? firstPhysicalItem.book?.id : null;
  });

  const getActiveTrackingBook = () => {
    const matched = orderedItems.find(i => i.book?.id === selectedTrackingBookId);
    if (matched) return matched.book;
    const firstPhysicalItem = orderedItems.find(i => i.format === 'physical' || i.book?.bookType === 'physical');
    if (firstPhysicalItem) return firstPhysicalItem.book;
    return BOOKS[0];
  };

  const currentTrackingBook = getActiveTrackingBook();

  const recipientName = fullOrderData?.shipping?.fullName || "Lysandra Elvoria";
  const recipientEmail = fullOrderData?.shipping?.emailAddress || "lysandra@ebooklet-reader.net";
  const shippingStreet = fullOrderData?.shipping?.street || "77 Whispering Willow Grove";
  const shippingCity = fullOrderData?.shipping?.city || "Mosswood District";
  const shippingZip = fullOrderData?.shipping?.zipCode || "ZIP 892040";

  const paymentMethodLabel = fullOrderData?.payment?.selectedMethod === 'card'
    ? `💳 Card Ending ${fullOrderData?.payment?.cardNumberMasked ? fullOrderData?.payment?.cardNumberMasked.slice(-8) : "in -9012"}`
    : fullOrderData?.payment?.selectedMethod === 'spell'
      ? '🌿 Eco Pay Service'
      : fullOrderData?.payment?.selectedMethod === 'paypal'
        ? '🪙 PayPal Secure Wallet'
        : fullOrderData?.payment?.selectedMethod === 'apple'
          ? '🍎 Apple Pay Wallet'
          : '💳 Card Ending in -9012';

  // Unique Order ID
  const orderId = urlOrderId || (() => {
    const lastOrder = localStorage.getItem('ebooklet_last_order');
    if (lastOrder) {
      try {
        const parsed = JSON.parse(lastOrder);
        if (parsed?.orderNumber) return parsed.orderNumber;
      } catch (e) {}
    }
    return "EBL-DEFAULT";
  })();

  // -------------------------------------------------------------
  // REAL WORLD TIMINGS INTEGRATION ENGINE
  // -------------------------------------------------------------
  const [tick, setTick] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Retrieve exact elapsed minutes since the order was checked out
  const getElapsedTimeInMinutes = () => {
    if (!fullOrderData) return null;
    try {
      const datePart = fullOrderData.date; // 'YYYY-MM-DD'
      const timePart = fullOrderData.timeOfOrder || "10:30 AM";
      
      const cleanTime = timePart.replace(/[^0-9:APM ]/gi, '');
      const match = cleanTime.match(/(\d+):(\d+)(?::(\d+))?\s*(AM|PM)/i);
      let hours = 10;
      let minutes = 30;
      let seconds = 0;
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
        if (match[3]) seconds = parseInt(match[3], 10);
        const ampm = match[4].toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
      }
      
      const [yr, mo, dy] = datePart.split('-').map(Number);
      const placedDate = new Date(yr, mo - 1, dy, hours, minutes, seconds);
      
      const diffMs = Date.now() - placedDate.getTime();
      return Math.floor(diffMs / (60 * 1000));
    } catch (e) {
      return null;
    }
  };

  // Convert real-world elapsed minutes to a milestone stage
  const getStepFromMinutes = (mins: number) => {
    if (mins < 3) return 0;
    if (mins < 12) return 1;
    if (mins < 24) return 2;
    if (mins < 42) return 3;
    if (mins < 70) return 4;
    if (mins < 95) return 5;
    if (mins < 125) return 6;
    return 7;
  };

  // Format milestone dates and times relative to when checkout occurred
  const getMilestoneTimes = () => {
    let baseTime = new Date();
    
    const dateStr = fullOrderData?.date;
    const timeStr = fullOrderData?.timeOfOrder;

    if (dateStr) {
      try {
        const [yr, mo, dy] = dateStr.split('-').map(Number);
        baseTime = new Date(yr, mo - 1, dy, 12, 0, 0);

        if (timeStr) {
          const cleanTime = timeStr.replace(/[^0-9:APM ]/gi, '');
          const match = cleanTime.match(/(\d+):(\d+)(?::(\d+))?\s*(AM|PM)/i);
          if (match) {
            let hours = parseInt(match[1], 10);
            const minutes = parseInt(match[2], 10);
            const seconds = match[3] ? parseInt(match[3], 10) : 0;
            const ampm = match[4].toLowerCase();

            if (ampm === 'pm' && hours < 12) hours += 12;
            if (ampm === 'am' && hours === 12) hours = 0;

            baseTime.setHours(hours, minutes, seconds, 0);
          }
        }
      } catch (e) {
        console.error("Error parsing order time:", e);
      }
    } else {
      // Fallback base time is 45 minutes ago today so they start at a realistic mid-path step
      baseTime = new Date(Date.now() - 45 * 60 * 1000);
    }

    // Offset in minutes of milestones from checkout
    const minuteOffsets = [0, 3, 12, 24, 42, 70, 105, 125];

    return FANTASY_MILESTONES.map((milestone, idx) => {
      const offsetMins = minuteOffsets[idx] !== undefined ? minuteOffsets[idx] : idx * 18;
      const milestoneTime = new Date(baseTime.getTime() + offsetMins * 60 * 1000);
      
      const timeFormatted = milestoneTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      const dateFormatted = milestoneTime.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      return {
        ...milestone,
        time: timeFormatted,
        date: dateFormatted,
        timestamp: milestoneTime.getTime()
      };
    });
  };

  // Tracking Progress Control
  const [currentStep, setCurrentStep] = useState(4); // default startup step
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(2500); // ms per step
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedLogIndex, setSelectedLogIndex] = useState<number | null>(4);
  const [showNotification, setShowNotification] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Map Animation Coordinates & Simulation States
  const [owlProgress, setOwlProgress] = useState(0.55); // value between 0 and 1
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapWidth, setMapWidth] = useState(480);
  const [mapHeight, setMapHeight] = useState(250);
  const [hoveredWaypoint, setHoveredWaypoint] = useState<number | null>(null);

  const milestones = getMilestoneTimes();
  
  // Real-world countdown calculations
  const elapsedMins = getElapsedTimeInMinutes() ?? 45; // default fallback if no order data
  const totalDurationMins = 125; // Delivery target total time (2h 5m)
  
  const minutesRemainingSimulated = Math.max(0, totalDurationMins - Math.round((currentStep / 7) * totalDurationMins));
  const minutesRemainingReal = Math.max(1, totalDurationMins - elapsedMins);
  
  const minutesRemaining = isSimulating ? minutesRemainingSimulated : minutesRemainingReal;
  
  const etaRemainingText = minutesRemaining <= 0 
    ? "Arrived at your Door / Nested" 
    : minutesRemaining > 120 
      ? `About 2 hours remaining`
      : minutesRemaining > 60 
        ? `About 1 hour ${minutesRemaining % 60}m remaining`
        : `About ${minutesRemaining} minutes remaining`;

  const etaTimeStr = milestones[milestones.length - 1]?.time || "4:15 PM";

  // Delivery Owl Courier Info
  const courierInfo = {
    name: 'Snowy the Fleet Owl',
    avatar: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200',
    type: 'Royal Arctic Owl Partner',
    speedRating: '4.95',
    vehicle: 'Swift Wings delivery team',
    eta: etaRemainingText,
    deliveryInstructions: `Kindly place the parcel containing "${currentTrackingBook.title}" safely in the delivery nest support basket by the entryway.`,
    phone: '1-800-OWL-HELP',
    otp: '5819'
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setMapWidth(entry.contentRect.width || 480);
          setMapHeight(entry.contentRect.height || 250);
        }
      }
    });
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Copy order ID function
  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setIsCopied(true);
    triggerNotification('📋 Order ID copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Trigger simulated progression
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulating && activeTab === 'physical') {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          const next = prev + 1;
          if (next >= milestones.length) {
            setIsSimulating(false);
            setShowCelebration(true);
            triggerNotification('🎉 Hooray! Your physical storybooks have arrived at your door!');
            setOwlProgress(1.0);
            return milestones.length - 1;
          }
          setSelectedLogIndex(next);
          // Advance owl on map
          setOwlProgress(next / (milestones.length - 1));
          triggerNotification(`🦉 Location Update: ${milestones[next].title}`);
          return next;
        });
      }, simulationSpeed);
    }
    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed, activeTab, milestones]);

  const lastRealStepRef = useRef<number | null>(null);
  const previousStepRef = useRef<number | null>(null);

  // Auto-synchronize real-world tracker stage to the layout if simulation is idle
  useEffect(() => {
    if (isSimulating || !fullOrderData) return;
    
    if (fullOrderData.status === 'Delivered') {
      setCurrentStep(7);
      setSelectedLogIndex(7);
      setOwlProgress(1.0);
      return;
    }
    
    if (fullOrderData.status === 'Cancelled') {
      setCurrentStep(0);
      setSelectedLogIndex(0);
      setOwlProgress(0.0);
      return;
    }

    const elapsed = getElapsedTimeInMinutes();
    if (elapsed !== null) {
      const calculatedStep = getStepFromMinutes(elapsed);
      
      // Auto-update order state when entering the screen, or when actual time passes over a threshold
      if (lastRealStepRef.current === null || calculatedStep !== lastRealStepRef.current) {
        setCurrentStep(calculatedStep);
        setSelectedLogIndex(calculatedStep);
        setOwlProgress(calculatedStep / 7);
        lastRealStepRef.current = calculatedStep;
      }

      // Notify the user of a physical milestone progression in background
      if (previousStepRef.current !== null && calculatedStep > previousStepRef.current) {
        const nextMilestone = milestones[calculatedStep];
        if (nextMilestone) {
          triggerNotification(`🦉 Delivery Milestone Update: ${nextMilestone.title}!`);
        }
      }
      previousStepRef.current = calculatedStep;
    }
  }, [fullOrderData, tick, isSimulating, milestones]);

  const triggerNotification = (msg: string) => {
    setNotifMessage(msg);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  };

  const handleStepClick = (index: number) => {
    if (index <= currentStep) {
      setSelectedLogIndex(index);
    }
  };

  const handleSimulateToggle = () => {
    if (currentStep === milestones.length - 1) {
      setCurrentStep(0);
      setSelectedLogIndex(0);
      setOwlProgress(0);
      setShowCelebration(false);
      setIsSimulating(true);
      triggerNotification('🔄 Resetting! Starting delivery path simulation from step 1.');
    } else {
      setIsSimulating(!isSimulating);
      triggerNotification(!isSimulating ? '⚡ Fast simulation speed is now active!' : '⏸ Simulation is paused.');
    }
  };

  // Re-order simulation
  const [reorderedItems, setReorderedItems] = useState<Record<string, boolean>>({});
  const handleReorder = (bookId: string) => {
    setReorderedItems(prev => ({ ...prev, [bookId]: true }));
    triggerNotification('🛍️ This book was successfully added back to your cart drafts!');
    setTimeout(() => {
      setReorderedItems(prev => ({ ...prev, [bookId]: false }));
    }, 2000);
  };

  // Review states
  const [reviewedItems, setReviewedItems] = useState<Record<string, boolean>>({});
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');
  const [activeReviewBook, setActiveReviewBook] = useState<any | null>(null);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeReviewBook) {
      setReviewedItems(prev => ({ ...prev, [activeReviewBook.id]: true }));
      triggerNotification(`⭐️ Thank you so much! Your review was successfully submitted.`);
      setActiveReviewBook(null);
      setReviewText('');
    }
  };

  // Downloading eBook flows
  const [downloadingItemId, setDownloadingItemId] = useState<string | null>(null);
  const isOrderDelivered = !hasPhysical || currentStep === milestones.length - 1;
  const isCancelled = matchedOrder?.status === 'Cancelled' || fullOrderData?.status === 'Cancelled' || urlOrderId === 'BKL-11029-DF';

  const handleDownloadEbook = (book: any, format: string) => {
    if (!book) return;
    setDownloadingItemId(book.id);
    triggerNotification(`⚡ Packing and signing electronic digital seals for: "${book.title}"...`);

    setTimeout(() => {
      try {
        const fileContent = `
============================================================
              eBooklet Magical Digital Tome
============================================================

Title:     ${book.title}
Author:    ${book.author}
Category:  ${book.category}
Format:    ${format.toUpperCase()}
Unique Order ID: ${orderId}

------------------------------------------------------------
               C O I N  &  I N K  S E A L
------------------------------------------------------------

Licensed exclusively to: ${recipientName}
Approved for E-Library Check-In under reference ${orderId}.
Thank you for supporting authors and independent booksellers!

This digital publication serves as your dynamic reading copy.
Happy reading!

============================================================
           WOODLAND SANCTUARY AUTHENTICATION KEY
           MD5 [EBOOKLET_${book.title.toUpperCase().replace(/\s+/g, '')}]
============================================================
`;
        const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${format.toLowerCase()}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        triggerNotification(`🎉 Download Complete: "${book.title}" in .${format.toUpperCase()} format!`);
      } catch (err) {
        console.error("Download failed:", err);
      } finally {
        setDownloadingItemId(null);
      }
    }, 1500);
  };

  // Monetary totals based on orderedItems or cached fullOrderData
  const subtotal = fullOrderData?.totals?.subtotal !== undefined
    ? fullOrderData.totals.subtotal
    : orderedItems.reduce((acc, item) => {
        const p = item.book?.discountPrice || item.book?.price || 12.99;
        return acc + (p * item.quantity);
      }, 0);

  // Digital items do not charge shipping fee
  const shippingFee = activeTab === 'digital' 
    ? 0 
    : (fullOrderData?.totals?.shippingFee !== undefined
        ? fullOrderData.totals.shippingFee
        : (hasPhysical ? (currentStep >= 5 ? 4.99 : 0.00) : 0));

  const rawTax = fullOrderData?.totals?.tax !== undefined
    ? fullOrderData.totals.tax
    : subtotal * 0.08;

  const grandTotal = subtotal + shippingFee + rawTax;

  // Custom status parameters based on currentStep for physical books
  const getStatusMeta = () => {
    if (currentStep === milestones.length - 1) {
      return { label: 'Delivered Successfully', color: 'text-moss-green bg-moss-green/10 border-moss-green/20', bgGlow: 'from-green-500/20 to-emerald-600/5' };
    }
    if (currentStep >= 6) {
      return { label: 'Out Holiday Delivery', color: 'text-[#e67e22] bg-[#e67e22]/10 border-[#e67e22]/20', bgGlow: 'from-amber-500/20 to-orange-600/5' };
    }
    if (currentStep >= 4) {
      return { label: 'Owl Flying on Path', color: 'text-moss-green bg-moss-green/10 border-moss-green/15', bgGlow: 'from-[#606c38]/20 to-[#283618]/5' };
    }
    return { label: 'Preparing Books', color: 'text-earth-brown dark:text-dark-text bg-earth-brown/5 dark:bg-dark-card border-earth-brown/10', bgGlow: 'from-[#d4a373]/10 to-transparent' };
  };

  const currentMeta = getStatusMeta();

  // Synchronize on mount/url parameters update
  useEffect(() => {
    if (!urlOrderId) {
      setFullOrderData(null);
      setOrderedItems([]);
      return;
    }
    
    const matched = orders?.find(o => o.orderNumber === urlOrderId);
    if (matched) {
      setFullOrderData({
        orderNumber: matched.orderNumber,
        status: matched.status,
        shipping: matched.shipping || {
          fullName: matched.addressLabel || "Lysandra Elvoria",
          emailAddress: "lysandra@ebooklet-reader.net",
          street: "77 Whispering Willow Grove",
          city: "Mosswood District",
          zipCode: "ZIP 892040",
          deliveryMethod: "owl",
        },
        payment: matched.payment || {
          selectedMethod: "card",
          cardNumberMasked: "•••• •••• •••• 9012"
        },
        timeOfOrder: matched.timeOfOrder || "04:30 PM",
        totals: {
          subtotal: matched.total * 0.9,
          shippingFee: (matched.items || []).some(i => i.format === 'physical') ? 0 : 0,
          tax: matched.total * 0.08,
          grandTotal: matched.total
        },
        items: (matched.items || []).map(item => ({
          book: {
            id: item.bookId,
            title: item.title,
            author: item.author,
            coverImage: item.coverImage,
            price: item.price,
            bookType: item.format === 'physical' ? 'physical' : 'epub'
          },
          quantity: item.quantity,
          format: item.format
        }))
      });

      setOrderedItems((matched.items || []).map(item => ({
        book: {
          id: item.bookId,
          title: item.title,
          author: item.author,
          coverImage: item.coverImage,
          price: item.price,
          bookType: item.format === 'physical' ? 'physical' : 'epub'
        },
        quantity: item.quantity,
        format: item.format
      })));
    } else {
      const lastOrder = localStorage.getItem('ebooklet_last_order');
      if (lastOrder) {
        try {
          const parsed = JSON.parse(lastOrder);
          if (parsed && typeof parsed === 'object' && parsed.orderNumber === urlOrderId) {
            setFullOrderData(parsed);
            setOrderedItems(parsed.items || []);
          }
        } catch (e) {}
      }
    }
  }, [urlOrderId, orders]);

  if (!urlOrderId) {
    // Beautiful, premium List of ALL Orders (Order History)
    return (
      <main className="min-h-screen bg-parchment dark:bg-dark-bg text-earth-brown dark:text-dark-text pb-40 pt-4 transition-all duration-300 relative selection:bg-moss-green/20">
        {/* Background Spark Particles */}
        <div className="absolute inset-x-0 top-0 h-[400px] bg-gradient-to-b from-moss-green/5 via-terracotta/[0.01] to-transparent pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-1/4 w-3 h-3 bg-moss-green/10 rounded-full blur-xs" />
          <div className="absolute top-40 right-1/4 w-4 h-4 bg-amber-500/[0.08] rounded-full blur-sm animate-pulse" />
        </div>

        <div className="max-w-xl mx-auto px-4 relative space-y-6">
          {/* Header */}
          <header className="bg-white/80 dark:bg-dark-card/90 backdrop-blur-md border border-white/40 dark:border-white/10 p-4 rounded-[2rem] shadow-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/')}
                className="w-10 h-10 rounded-full bg-[#fdfaf2] dark:bg-dark-bg border border-earth-brown/10 dark:border-white/5 flex items-center justify-center hover:bg-moss-green hover:text-white dark:hover:bg-moss-green transition-all"
                title="Go Home"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-serif text-base font-bold text-earth-brown dark:text-dark-text leading-none uppercase">Order History</h1>
                <p className="text-[9px] text-earth-brown/50 dark:text-dark-muted mt-1 uppercase font-mono tracking-wider font-bold">Acquisitions &amp; Deliveries</p>
              </div>
            </div>

            {/* eBooklet Decorative Brand Info */}
            <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => navigate('/')}>
              <span className="text-xl">🦉</span>
              <span className="font-serif text-sm font-bold uppercase tracking-wider text-earth-brown dark:text-dark-text">eBooklet</span>
            </div>
          </header>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/80 dark:bg-dark-card/95 border border-earth-brown/10 rounded-3xl p-4 shadow-xs text-left">
              <span className="text-[9px] uppercase font-bold text-earth-brown/40 dark:text-dark-muted font-mono tracking-wider block">Total Acquisitions</span>
              <span className="text-2xl font-serif font-bold text-moss-green mt-1 block">{orders.length}</span>
            </div>
            <div className="bg-white/80 dark:bg-dark-card/95 border border-earth-brown/10 rounded-3xl p-4 shadow-xs text-left">
              <span className="text-[9px] uppercase font-bold text-earth-brown/40 dark:text-dark-muted font-mono tracking-wider block">Completed Readouts</span>
              <span className="text-2xl font-serif font-bold text-amber-600 mt-1 block">
                {orders.filter(o => o.status === 'Delivered').length}
              </span>
            </div>
          </div>

          {/* Order List */}
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white/60 dark:bg-dark-card/60 backdrop-blur-sm border border-dashed border-earth-brown/20 rounded-[2.5rem] p-12 text-center space-y-4">
                <span className="text-5xl block animate-bounce" style={{ animationDuration: '3s' }}>🏰</span>
                <div className="space-y-1">
                  <h3 className="font-serif text-base font-bold uppercase text-earth-brown dark:text-dark-text">No orders recorded</h3>
                  <p className="text-xs text-earth-brown/60 dark:text-dark-muted max-w-sm mx-auto leading-relaxed">
                    You haven't ordered any books yet. Visit our homepage to secure your first codex!
                  </p>
                </div>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-moss-green hover:bg-[#3d4826] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-moss-green/20 transition-all cursor-pointer"
                >
                  Browse E-Bookstore
                </button>
              </div>
            ) : (
              orders.map((ord, idx) => {
                const isDelivered = ord.status === 'Delivered';
                const isProcessing = ord.status === 'Processing';
                const isCancelled = ord.status === 'Cancelled';

                const badgeBg = isDelivered 
                  ? 'bg-green-500/10 text-[#2e7d32]' 
                  : isProcessing 
                    ? 'bg-amber-500/10 text-amber-700 font-bold' 
                    : isCancelled 
                      ? 'bg-red-500/10 text-red-600' 
                      : 'bg-indigo-500/10 text-indigo-700';

                return (
                  <motion.div
                    key={ord.id || ord.orderNumber || idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white/95 dark:bg-dark-card/95 border border-earth-brown/10 hover:border-moss-green/40 dark:border-white/5 dark:hover:border-moss-green/30 rounded-[2rem] p-5 shadow-xs hover:shadow-lg transition-all duration-300 text-left relative overflow-hidden"
                  >
                    {/* Header of card */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-earth-brown/5 pb-3">
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase tracking-widest text-[#d4a373] font-mono font-bold block">Transaction Reference</span>
                        <h3 className="font-mono text-xs font-bold tracking-tight text-earth-brown dark:text-dark-text leading-none">{ord.orderNumber}</h3>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-sans font-semibold text-earth-brown/50 dark:text-dark-muted">
                          {ord.date} {ord.timeOfOrder ? `• ${ord.timeOfOrder}` : `• 11:30 AM`}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider font-sans leading-none ${badgeBg}`}>
                          {ord.status}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Items List */}
                    <div className="py-4 space-y-3.5">
                      {ord.items.map((item, itemIdx) => {
                        const isPhysical = item.format === 'physical';
                        return (
                          <div key={itemIdx} className="flex gap-3">
                            <div className="w-12 h-16 bg-[#faf8f4] border border-earth-brown/5 rounded-lg overflow-hidden flex-shrink-0 shadow-xs">
                              {item.coverImage ? (
                                <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-lg">📖</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 pr-2">
                              <h4 className="font-serif text-sm font-bold text-earth-brown dark:text-dark-text truncate leading-tight">{item.title}</h4>
                              <p className="text-[10px] text-earth-brown/50 dark:text-dark-muted truncate font-sans">by {item.author}</p>
                              
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold font-sans ${isPhysical ? 'bg-[#f4ebe1] text-[#936d40]' : 'bg-cyan-500/10 text-cyan-600'}`}>
                                  {isPhysical ? 'Printed Book 📦' : 'E-Book 📖'}
                                </span>
                                <span className="text-[10px] font-mono text-earth-brown/60 dark:text-dark-muted font-semibold">
                                  Qty {item.quantity} • ${item.price.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom row */}
                    <div className="flex items-center justify-between border-t border-earth-brown/5 pt-3 mt-1">
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase font-bold text-earth-brown/40 dark:text-dark-muted font-sans">Grand Total settled</span>
                        <div className="font-mono font-bold text-base text-moss-green leading-none">${ord.total.toFixed(2)}</div>
                      </div>

                      <button
                        onClick={() => navigate(`/tracking?orderId=${ord.orderNumber}`)}
                        className="py-2.5 px-4 bg-moss-green hover:bg-[#3d4826] text-white text-[9.5px] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md shadow-moss-green/10 flex items-center gap-1.5"
                      >
                        <span>Details &amp; Track 🦉</span>
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-parchment dark:bg-dark-bg text-earth-brown dark:text-dark-text pb-36 pt-2 transition-all duration-300 relative selection:bg-moss-green/20">
      
      {/* Background Magic Dust Particles Sim */}
      <div className="absolute inset-x-0 top-0 h-[600px] bg-gradient-to-b from-moss-green/5 via-terracotta/[0.02] to-transparent pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-1/4 w-3 h-3 bg-moss-green/20 rounded-full blur-xs animate-pulse" />
        <div className="absolute top-28 right-1/3 w-2 h-2 bg-terracotta/30 rounded-full blur-[2px] animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute top-80 left-2/3 w-4 h-4 bg-amber-500/[0.15] rounded-full blur-sm" />
      </div>

      {/* Floating Spark Notif Alert banner */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-6 inset-x-4 max-w-md mx-auto z-[200] bg-white/95 dark:bg-dark-card/95 backdrop-blur-md border border-moss-green/30 px-4 py-3.5 rounded-3xl shadow-2xl flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-moss-green/10 flex items-center justify-center flex-shrink-0 animate-bounce">
              <Sparkles className="w-4 h-4 text-moss-green" />
            </div>
            <p className="text-xs font-serif font-bold text-earth-brown dark:text-dark-text leading-tight">{notifMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 md:px-6 relative space-y-8">
        
        {/* ========================================================= */}
        {/* 1. PREMIUM FLOATING NAVBAR */}
        {/* ========================================================= */}
        <header className="sticky top-2 z-[100] transition-all">
          <div className="bg-white/70 dark:bg-dark-card/85 backdrop-blur-md border border-white/50 dark:border-white/10 p-3.5 rounded-[2rem] shadow-xl flex items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/tracking')}
                className="w-10 h-10 rounded-full bg-[#fdfaf2] dark:bg-dark-bg border border-earth-brown/10 dark:border-white/5 flex items-center justify-center hover:bg-moss-green hover:text-white dark:hover:bg-moss-green transition-all"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="hidden sm:block">
                <span className="text-[9px] uppercase tracking-widest text-earth-brown/50 dark:text-dark-muted font-bold block">Sanctuary Orders</span>
                <span className="text-xs font-serif font-bold tracking-tight">System Node #{orderId.slice(4)}</span>
              </div>
            </div>

            {/* eBooklet Logo Centered */}
            <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => navigate('/')}>
              <span className="text-xl">🦉</span>
              <h1 className="font-serif text-lg font-bold uppercase tracking-wider text-earth-brown dark:text-dark-text">eBooklet</h1>
            </div>

            {/* Action Group */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  triggerNotification('⭐ System connected! Live tracking is active.');
                }}
                className="w-10 h-10 rounded-full bg-[#fdfaf2] dark:bg-dark-bg border border-earth-brown/10 dark:border-white/5 flex items-center justify-center text-earth-brown dark:text-dark-text hover:bg-moss-green hover:text-white dark:hover:bg-moss-green transition-all relative"
                title="Alerts"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-terracotta rounded-full ring-2 ring-white dark:ring-dark-card" />
              </button>

              <button 
                onClick={() => navigate('/profile')}
                className="w-10 h-10 rounded-full border border-earth-brown/10 overflow-hidden hover:ring-2 hover:ring-moss-green transition-all"
                title="Your Profile Picture"
              >
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              </button>
            </div>
          </div>
        </header>

        {/* ========================================================= */}
        {/* HYBRID ORDERS DUAL VIEW TAB SELECTOR - Appears if both exist */}
        {/* ========================================================= */}
        {hasPhysical && hasDigital && (
          <div className="flex justify-center">
            <div className="bg-white/80 dark:bg-dark-card/90 border border-earth-brown/15 p-1.5 rounded-[2rem] shadow-md flex items-center gap-2 w-max select-none">
              <button
                onClick={() => {
                  setActiveTab('digital');
                  triggerNotification('📖 Switched to your digital E-Book delivery vault.');
                }}
                className={`px-5 py-2.5 rounded-[1.5rem] text-xs font-serif font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'digital'
                    ? 'bg-moss-green text-white shadow-md'
                    : 'text-earth-brown/60 hover:text-earth-brown dark:text-dark-muted hover:bg-earth-brown/5'
                }`}
              >
                <span>📖 Digital E-Books</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('physical');
                  triggerNotification('🦉 Switched to your physical Owl delivery tracking.');
                }}
                className={`px-5 py-2.5 rounded-[1.5rem] text-xs font-serif font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'physical'
                    ? 'bg-moss-green text-white shadow-md'
                    : 'text-earth-brown/60 hover:text-earth-brown dark:text-dark-muted hover:bg-earth-brown/5'
                }`}
              >
                <span>🦉 Owl Package Track</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* RENDER VIEW ACCORDING TO SELECTED TAB STATE */}
        {/* ========================================================= */}
        {activeTab === 'digital' ? (
          
          /* ========================================================= */
          /* PURE DIGITAL E-BOOK ORDER TRACKING LAYOUT */
          /* ========================================================= */
          <div className="space-y-8 animate-fade-in">
            
            {/* HERO CARD - DIGITAL ONLY (No transport progress meters!) */}
            <section className="bg-gradient-to-br from-amber-500/10 via-white dark:via-dark-card border border-earth-brown/10 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden transition-all duration-300">
              <div className="absolute -right-4 -bottom-6 text-[10rem] opacity-5 select-none pointer-events-none transform rotate-12">📖</div>
              
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 pb-6 border-b border-earth-brown/10 dark:border-white/5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest px-3 py-1 rounded-full border text-amber-600 bg-amber-500/10 border-amber-500/20">
                      ✨ Digital Tomes Bound
                    </span>
                    
                    <button 
                      onClick={handleCopyOrderId}
                      className="text-[10px] bg-earth-brown/5 hover:bg-earth-brown/10 dark:bg-white/5 px-2.5 py-1 rounded-full font-mono text-earth-brown/60 dark:text-dark-text flex items-center gap-1.5 border border-earth-brown/10 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                      title="Click to copy Order ID"
                    >
                      <span>ORDER: {orderId}</span>
                      <Copy size={10} className={isCopied ? "text-green-500" : "opacity-60"} />
                    </button>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-earth-brown dark:text-dark-text mt-2">
                    Summoning Complete!
                  </h2>
                  <p className="text-xs text-earth-brown/60 dark:text-dark-muted font-sans font-medium">
                    Your electronic editions have been dynamically bound directly to your device bookshelf.
                  </p>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <span className="text-[10px] uppercase font-sans font-bold text-earth-brown/40 dark:text-dark-muted block">Delivery Format</span>
                  <span className="text-lg font-serif font-bold text-moss-green block uppercase tracking-wider">
                    Instant Download
                  </span>
                  <span className="text-[10px] font-mono text-earth-brown/50 dark:text-dark-muted block">
                    Zero transit wait time
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-left border-t border-earth-brown/10 dark:border-white/5 mt-6">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-[#d4a373] flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-moss-green" /> Order ID Number
                  </span>
                  <p className="text-xs font-mono font-bold text-moss-green select-all">{orderId}</p>
                  <p className="text-[9px] text-earth-brown/40 dark:text-dark-muted">Unique digital receipt code</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-[#d4a373] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-moss-green" /> Payment Method
                  </span>
                  <p className="text-xs font-semibold text-earth-brown dark:text-dark-text">{paymentMethodLabel}</p>
                  <p className="text-[9px] text-earth-brown/40 dark:text-dark-muted font-sans">Verified payment account</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-[#d4a373] flex items-center gap-1">
                    <Library className="w-3.5 h-3.5 text-moss-green" /> E-Library Check-In
                  </span>
                  <span className="text-[10px] font-bold text-moss-green bg-[#ecf3e9] dark:bg-moss-green/10 px-2 py-0.5 rounded border border-moss-green/25 inline-block animate-pulse">
                    Check in your E-Library
                  </span>
                  <p className="text-[9px] text-earth-brown/40 dark:text-dark-muted">Instant server-side download</p>
                </div>
              </div>
            </section>

            {/* HIGHLY INTERACTIVE E-LIBRARY PORTAL ONBOARDING CTA BANNER */}
            <section className="bg-white/90 dark:bg-dark-card border border-earth-brown/10 p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden space-y-5 text-center">
              <div className="absolute top-2 right-2 text-5xl opacity-10 animate-pulse">📚</div>
              
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto shadow-sm">
                  <Sparkles className="w-6 h-6 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                
                <h3 className="font-serif font-bold text-lg text-earth-brown dark:text-dark-text uppercase tracking-normal">
                  "Your story has been safely woven! ✨"
                </h3>
                
                <p className="text-xs text-earth-brown/60 dark:text-dark-muted leading-relaxed">
                  Go directly into your **E-Library Sanctuary** to initialize your reading experience. You do not need to wait for courier owls or packages — simply click below to enter.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3 max-w-sm mx-auto">
                <button
                  onClick={() => navigate('/library')}
                  className="px-6 py-3.5 bg-earth-brown hover:bg-earth-brown/90 dark:bg-moss-green dark:hover:bg-moss-green/95 text-white font-serif font-bold text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Library className="w-4 h-4" />
                  <span>Go to My E-Library</span>
                </button>
                
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3.5 bg-[#fdfbf7] dark:bg-dark-bg/60 border border-earth-brown/15 hover:border-earth-brown/30 text-earth-brown dark:text-dark-text text-xs uppercase font-bold tracking-widest rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Explore Tavern</span>
                </button>
              </div>
            </section>

          </div>
          
        ) : isCancelled ? (
          
          /* ========================================================= */
          /* CANCELLED PHYSICAL ORDER TRACKING LAYOUT */
          /* ========================================================= */
          <div className="space-y-8 animate-fade-in">
            
            {/* CANCELLED STATE HEROCARD */}
            <section className="bg-red-500/5 dark:bg-red-950/20 border border-red-500/20 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden transition-all duration-300">
              <div className="absolute -right-4 -bottom-6 text-[10rem] opacity-5 select-none pointer-events-none transform rotate-12">🚫</div>
              
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 pb-6 border-b border-red-500/25 dark:border-red-500/15">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest px-3 py-1 rounded-full border text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/25">
                      ❌ Order Cancelled
                    </span>
                    <span className="text-[10px] font-mono text-earth-brown/60 dark:text-dark-text bg-earth-brown/5 px-2.5 py-1 rounded-full border border-earth-brown/10">
                      ORDER: {orderId}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-red-800 dark:text-red-400 mt-2">
                    Shipment Recalled
                  </h2>
                  <p className="text-xs text-earth-brown/70 dark:text-dark-muted font-sans font-medium">
                    This order has been cancelled. No delivery owl dispatches are in motion.
                  </p>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <span className="text-[10px] uppercase font-sans font-bold text-red-500/60 dark:text-red-400 block">Status</span>
                  <span className="text-lg font-serif font-bold text-red-600 dark:text-red-400 block uppercase tracking-wider">
                    Cancelled
                  </span>
                  <span className="text-[10px] font-mono text-earth-brown/50 dark:text-[#a89d87] block">
                    Voided Gateway Track
                  </span>
                </div>
              </div>

              <div className="pt-6 text-left">
                <p className="text-xs text-earth-brown/80 dark:text-[#eedcc9]/80 font-serif leading-relaxed">
                  The printed physical volume of <b>&ldquo;{currentTrackingBook.title}&rdquo;</b> and contents for this package are not in transit because the order was cancelled. Your coins have been returned to your account balance successfully.
                </p>
              </div>
            </section>
          </div>
        ) : (
          
          /* ========================================================= */
          /* PURE PHYSICAL COURIER OWL TRACKING LAYOUT */
          /* ========================================================= */
          <div className="space-y-8 animate-fade-in font-sans">
            
            {/* HERO CARD - PHYSICAL SHIPPING */}
            <section className={`bg-gradient-to-br ${currentMeta.bgGlow} via-white dark:via-dark-card border border-earth-brown/10 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden transition-all duration-500`}>
              <div className="absolute -right-4 -bottom-6 text-[10rem] opacity-5 select-none pointer-events-none transform rotate-12">🦉</div>
              
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 pb-6 border-b border-earth-brown/10 dark:border-white/5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-sans font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${currentMeta.color} transition-all duration-300`}>
                      {currentMeta.label}
                    </span>
                    
                    <button 
                      onClick={handleCopyOrderId}
                      className="text-[10px] bg-earth-brown/5 hover:bg-earth-brown/10 dark:bg-white/5 px-2.5 py-1 rounded-full font-mono text-earth-brown/60 dark:text-dark-text flex items-center gap-1.5 border border-earth-brown/10 cursor-pointer"
                      title="Copy ID"
                    >
                      <span>ORDER: {orderId}</span>
                      <Copy size={10} className={isCopied ? "text-green-500" : "opacity-60"} />
                    </button>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-earth-brown dark:text-dark-text mt-1">
                    {currentStep === milestones.length - 1 
                      ? `"${currentTrackingBook.title}" Arrived Safely! 📦` 
                      : `Tracking Flight: "${currentTrackingBook.title}" 🦉`}
                  </h2>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <span className="text-[10px] uppercase font-sans font-bold text-earth-brown/40 dark:text-dark-muted block">Estimated Arrival</span>
                  <span className="text-xl font-serif font-bold text-moss-green block">
                    {currentStep === milestones.length - 1 
                      ? 'At your Door Today' 
                      : etaTimeStr}
                  </span>
                  <span className="text-[10px] font-mono text-earth-brown/50 dark:text-dark-muted block">
                    {currentStep === milestones.length - 1 
                      ? 'Delivered at ' + milestones[milestones.length - 1].time
                      : etaRemainingText}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 text-left">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-earth-brown/40 dark:text-dark-muted flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#d4a373]" /> Current Coordinates
                  </span>
                  <p className="text-xs font-semibold leading-snug">
                    {milestones[currentStep].location}
                  </p>
                  <p className="text-[10px] text-earth-brown/50 dark:text-dark-muted leading-relaxed">
                    {milestones[currentStep].desc.replace("your books", `"${currentTrackingBook.title}"`)}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-[#d4a373] flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-moss-green" /> Shipping Method
                  </span>
                  <p className="text-xs font-semibold">Standard Courier Owl</p>
                  <p className="text-[10px] text-earth-brown/50 dark:text-dark-muted leading-relaxed">
                    Printed volumes of &ldquo;{currentTrackingBook.title}&rdquo; sealed in eco-kraft card boxes to prevent humidity exposure.
                  </p>
                </div>
              </div>
            </section>

            {/* INTERACTIVE CONTROLLER BAR */}
            <section className="bg-gradient-to-r from-moss-green/10 to-terracotta/5 border border-earth-brown/15 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm relative overflow-hidden">
              <div className="absolute right-2 top-2 text-4xl opacity-10 select-none">🧙‍♂️</div>
              <div className="space-y-1">
                <h4 className="font-serif text-sm font-bold text-earth-brown dark:text-dark-text flex items-center gap-1.5 uppercase tracking-wide">
                  <span>Interactive Delivery Simulator</span>
                  <span className="inline-block py-0.5 px-2 bg-moss-green/10 rounded-full text-[10px] text-moss-green font-mono">Sim Active</span>
                </h4>
                <p className="text-[11px] text-earth-brown/60 dark:text-dark-muted max-w-md leading-relaxed">
                  Staging nodes can be checked step-by-step from central sorting until standard doorstep handover!
                </p>
              </div>
              
              <div className="flex items-center gap-2.5">
                <div className="flex bg-white/40 dark:bg-dark-card/20 border border-earth-brown/10 rounded-2xl p-0.5">
                  {[1500, 3000].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setSimulationSpeed(speed)}
                      className={`px-3 py-1 text-[10px] uppercase font-bold rounded-xl transition-all cursor-pointer ${
                        simulationSpeed === speed 
                          ? 'bg-moss-green text-white shadow-xs' 
                          : 'text-earth-brown/50 hover:text-earth-brown dark:text-dark-muted'
                      }`}
                    >
                      {speed === 1500 ? 'Fast' : 'Normal'}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleSimulateToggle}
                  className={`px-4 py-2.5 rounded-2xl flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-all select-none shadow-md cursor-pointer ${
                    isSimulating 
                      ? 'bg-terracotta text-white hover:bg-terracotta/90 ring-4 ring-terracotta/10' 
                      : 'bg-moss-green text-white hover:bg-moss-green/95'
                  }`}
                >
                  {currentStep === milestones.length - 1 ? (
                    <>
                      <RotateCcw className="w-4 h-4 text-white" />
                      <span>Restart Trip</span>
                    </>
                  ) : isSimulating ? (
                    <>
                      <span className="inline-block w-2.5 h-2.5 bg-white rounded-full animate-ping" />
                      <span>Travelling</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Fly Owl</span>
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* TIMELINE LOGGER NODES */}
            <section className="bg-white/80 dark:bg-dark-card/90 border border-earth-brown/5 rounded-[2.5rem] p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-earth-brown/5 dark:border-white/5 pb-3">
                <div>
                  <h3 className="font-serif font-bold text-base text-earth-brown dark:text-dark-text uppercase tracking-wide flex items-center gap-2">
                    <span>Delivery Milestone Logs</span>
                    {isSimulating && <span className="inline-block w-2.5 h-2.5 bg-moss-green rounded-full animate-ping" />}
                  </h3>
                  <p className="text-[10px] text-earth-brown/40 dark:text-dark-muted mt-0.5">Click any active milestone step below to view coordinates.</p>
                </div>
                
                <span className="text-xs font-mono text-earth-brown/50 dark:text-dark-muted font-bold">
                  Stage {currentStep+1}/8
                </span>
              </div>

              <div className="relative mt-8 select-none">
                <div className="absolute top-[18px] left-[18px] right-[18px] h-1 bg-earth-brown/10 dark:bg-white/5 -z-10 rounded-full" />
                <motion.div 
                  layout 
                  className="absolute top-[18px] left-[18px] h-1 bg-gradient-to-r from-moss-green via-[#a2b595] to-moss-green -z-10 rounded-full" 
                  style={{ width: `${(currentStep / (milestones.length - 1)) * 96}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />

                <div className="flex justify-between items-center relative">
                  {milestones.map((step, i) => {
                    const isCompleted = i <= currentStep;
                    const isActive = i === currentStep;

                    return (
                      <div key={i} className="flex flex-col items-center relative group min-w-0">
                        <button
                          onClick={() => handleStepClick(i)}
                          disabled={i > currentStep}
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs transition-all relative cursor-pointer ${
                            isActive
                              ? 'bg-moss-green text-white ring-4 ring-moss-green/20 scale-110 shadow-lg'
                              : isCompleted
                                ? 'bg-[#ecf3e9] dark:bg-dark-bg text-moss-green border-2 border-moss-green/45 hover:bg-moss-green/10'
                                : 'bg-white dark:bg-dark-bg/60 text-earth-brown/20 dark:text-white/10 border border-earth-brown/15'
                          }`}
                        >
                          <span className="transform group-active:scale-90 transition-transform select-none font-bold">
                            {isCompleted ? '✓' : i + 1}
                          </span>

                          {isActive && (
                            <span className="absolute inset-0 rounded-full border-2 border-white animate-ping opacity-60" style={{ animationDuration: '2s' }} />
                          )}
                        </button>

                        <span className={`text-[9px] mt-2 font-serif font-bold text-center select-none truncate w-[68px] hidden md:block transition-all ${
                          isActive 
                            ? 'text-earth-brown dark:text-dark-text scale-105' 
                            : isCompleted 
                              ? 'text-earth-brown/70 dark:text-dark-muted' 
                              : 'text-earth-brown/25'
                        }`}>
                          {step.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step Expanded Details */}
              <AnimatePresence mode="wait">
                {selectedLogIndex !== null && (
                  <motion.div
                    key={selectedLogIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-[#faf7f0]/70 dark:bg-dark-bg/40 p-4 border border-earth-brown/10 rounded-2xl flex items-start gap-4 mt-4 text-left"
                  >
                    <div className="text-3xl p-2 bg-[#f9f5eb] dark:bg-dark-card rounded-2xl flex-shrink-0 border border-earth-brown/5 shadow-xs">
                      {milestones[selectedLogIndex].icon}
                    </div>
                    
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h4 className="text-xs font-serif font-bold text-earth-brown dark:text-dark-text uppercase tracking-wide">
                          {milestones[selectedLogIndex].title}
                        </h4>
                        
                        <span className="text-[10px] bg-white/70 dark:bg-dark-card px-2 py-0.5 rounded-full font-mono text-earth-brown/50 dark:text-dark-muted font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-moss-green" /> {milestones[selectedLogIndex].time}
                        </span>
                      </div>

                      <p className="text-[11px] text-earth-brown/70 dark:text-dark-muted italic font-serif leading-relaxed">
                        &ldquo;{milestones[selectedLogIndex].desc}&rdquo;
                      </p>
                      
                      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-[#4f5e41] dark:text-moss-green font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-moss-green" />
                        <span>Registered Coordinates: {milestones[selectedLogIndex].location}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* COURIER & LIVE VECTOR COORDINATE ANIMATED MAP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              
              {/* Courier Profile */}
              <section className="bg-white/80 dark:bg-dark-card/90 border border-earth-brown/5 rounded-[2.5rem] p-5 shadow-sm flex flex-col justify-between space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-earth-brown/5 dark:border-white/5 pb-2">
                  <span className="text-[10px] font-sans font-bold text-earth-brown/50 dark:text-dark-muted uppercase tracking-wider">Assigned Flying Courier</span>
                  <span className="text-[9px] bg-moss-green/10 text-moss-green font-bold uppercase tracking-widest px-2 py-0.5 rounded">Active Team</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-[#eee4cf] dark:bg-dark-bg border border-earth-brown/10 p-1 overflow-hidden shadow-md flex items-center justify-center text-4xl select-none">
                      🦉
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-moss-green text-white px-1.5 py-0.5 rounded-full text-[8px] font-bold shadow-xs">
                      {courierInfo.speedRating}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-serif font-bold text-sm text-earth-brown dark:text-dark-text leading-tight uppercase">
                      {courierInfo.name}
                    </h3>
                    <p className="text-[10px] text-[#8b5a2b] font-mono leading-none">{courierInfo.type}</p>
                    
                    <div className="flex items-center gap-1.5 text-[10px] text-earth-brown/70 dark:text-dark-text mt-1 font-sans">
                      <Truck className="w-3.5 h-3.5 text-moss-green" />
                      <span>Operated by {courierInfo.vehicle}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-parchment/60 dark:bg-dark-bg/50 rounded-2xl text-left border border-earth-brown/5 space-y-2 font-sans">
                  <div className="flex justify-between text-[11px] text-earth-brown/60 dark:text-dark-muted">
                    <span>Handoff Verification OTP</span>
                    <span className="font-mono font-bold text-moss-green uppercase tracking-widest">{courierInfo.otp}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-earth-brown/60 dark:text-dark-muted">
                    <span>Estimated Flight Time</span>
                    <span className="font-semibold">{currentStep === milestones.length - 1 ? 'Arrived at your Door' : courierInfo.eta}</span>
                  </div>
                  <div className="text-[10px] text-earth-brown/50 dark:text-dark-muted leading-relaxed pt-1.5 border-t border-earth-brown/5">
                    <span className="font-bold uppercase text-[9px] block text-moss-green mb-0.5">Physical Nest Drop Instructions</span>
                    {courierInfo.deliveryInstructions}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => triggerNotification(`📞 Direct wire connection initiated with owl depot support...`)}
                    className="p-2.5 bg-parchment hover:bg-[#ebe3cf] dark:bg-dark-bg dark:hover:bg-dark-bg/80 border border-earth-brown/10 text-xs font-bold uppercase rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-earth-brown dark:text-dark-text transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-moss-green" />
                    <span>Call Depot</span>
                  </button>
                  <button
                    onClick={() => triggerNotification(`💬 Connected! Routing support chat request through dispatcher.`)}
                    className="p-2.5 bg-parchment hover:bg-[#ebe3cf] dark:bg-dark-bg dark:hover:bg-dark-bg/80 border border-earth-brown/10 text-xs font-bold uppercase rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-earth-brown dark:text-dark-text transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-moss-green" />
                    <span>Message Owl</span>
                  </button>
                </div>
              </section>

              {/* Vector Flight Terrain Map */}
              <section className="bg-white/80 dark:bg-dark-card/90 border border-earth-brown/5 rounded-[2.5rem] p-5 shadow-sm flex flex-col justify-between text-left">
                <div className="flex items-center justify-between border-b border-earth-brown/5 dark:border-white/5 pb-2">
                  <span className="text-[10px] font-sans font-bold text-earth-brown/50 dark:text-dark-muted uppercase tracking-wider">Airspace Courier Flying Radar</span>
                  <span className="text-[10px] font-mono text-moss-green font-bold uppercase flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-moss-green" /> Interactive Map
                  </span>
                </div>

                {/* Subtitle lore instructions */}
                <div className="text-[10px] text-earth-brown/60 dark:text-dark-muted mt-1 leading-normal">
                  💡 <span className="font-semibold text-moss-green">Interactive features:</span> Hover over checkpoint dots to view flight telemetry, or click any checkpoint directly on the map to jump or review delivery stages.
                </div>

                {/* Map Stage */}
                <div 
                  ref={mapContainerRef} 
                  className="h-64 bg-[#fbf5e6] dark:bg-[#181512] border border-[#eee4cf] dark:border-white/5 rounded-2xl relative overflow-hidden my-3 shadow-inner select-none transition-colors duration-300"
                >
                  <svg className="absolute inset-0 w-full h-full text-earth-brown/10 dark:text-white/5" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      </pattern>
                      <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#d4a373" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#606c38" stopOpacity="0.9" />
                      </linearGradient>
                      <filter id="shadowGlow" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#606c38" floodOpacity="0.4"/>
                      </filter>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    
                    {/* Winding Blue River - Background Landscape Art */}
                    <path 
                      d={`M -20 ${mapHeight * 0.75} Q ${mapWidth * 0.25} ${mapHeight * 0.95}, ${mapWidth * 0.5} ${mapHeight * 0.65} T ${mapWidth + 20} ${mapHeight * 0.8}`} 
                      fill="none" 
                      stroke="#8ecae6" 
                      strokeWidth="6" 
                      className="opacity-20 dark:opacity-10 stroke-round" 
                    />
                    <path 
                      d={`M -20 ${mapHeight * 0.75} Q ${mapWidth * 0.25} ${mapHeight * 0.95}, ${mapWidth * 0.5} ${mapHeight * 0.65} T ${mapWidth + 20} ${mapHeight * 0.8}`} 
                      fill="none" 
                      stroke="#457b9d" 
                      strokeWidth="1.5" 
                      className="opacity-15 dark:opacity-5 stroke-round" 
                      strokeDasharray="4 4"
                    />

                    {/* Mountain Ridge Decorative Lines */}
                    <path 
                      d={`M ${mapWidth * 0.15} ${mapHeight * 0.4} L ${mapWidth * 0.20} ${mapHeight * 0.25} L ${mapWidth * 0.25} ${mapHeight * 0.45}`} 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      className="opacity-20"
                    />
                    <path 
                      d={`M ${mapWidth * 0.65} ${mapHeight * 0.85} L ${mapWidth * 0.70} ${mapHeight * 0.70} L ${mapWidth * 0.75} ${mapHeight * 0.88}`} 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      className="opacity-20"
                    />

                    {/* Dynamic Flight Math Setup */}
                    {(() => {
                      const xStart = 50;
                      const yStart = mapHeight * 0.70;
                      const xEnd = mapWidth - 50;
                      const yEnd = mapHeight * 0.45;
                      const cpX = mapWidth / 2;
                      const cpY = 25; // arch curvature

                      const mainPathStr = `M ${xStart} ${yStart} Q ${cpX} ${cpY}, ${xEnd} ${yEnd}`;
                      const approxLength = mapWidth * 1.35;

                      return (
                        <>
                          {/* Base Flight Route dashed path */}
                          <path 
                            d={mainPathStr} 
                            fill="none" 
                            stroke="#d4a373" 
                            strokeWidth="2" 
                            strokeDasharray="6 6" 
                            className="opacity-40" 
                          />

                          {/* Traversing Glowing Courier Path */}
                          <path 
                            d={mainPathStr} 
                            fill="none" 
                            stroke="url(#pathGradient)" 
                            strokeWidth="3.5" 
                            strokeLinecap="round"
                            strokeDasharray={`${approxLength}`}
                            strokeDashoffset={`${approxLength * (1 - owlProgress)}`}
                            className="transition-all duration-700 ease-out"
                            style={{ filter: 'url(#shadowGlow)' }}
                          />
                        </>
                      );
                    })()}
                  </svg>

                  {/* Landscape Trees and Mountain Symbols */}
                  <div 
                    style={{ left: `${mapWidth * 0.22}px`, top: `${mapHeight * 0.42}px` }} 
                    className="absolute text-xs opacity-45 cursor-default select-none pointer-events-none"
                    title="Whispering Woodlands"
                  >
                    🌲🌲
                  </div>
                  <div 
                    style={{ left: `${mapWidth * 0.68}px`, top: `${mapHeight * 0.72}px` }} 
                    className="absolute text-xs opacity-45 cursor-default select-none pointer-events-none"
                    title="Misty Hills"
                  >
                    ⛰️
                  </div>
                  <div 
                    style={{ left: `${mapWidth * 0.45}px`, top: `${mapHeight * 0.80}px` }} 
                    className="absolute text-xs opacity-35 cursor-default select-none pointer-events-none"
                  >
                    🌸
                  </div>

                  {/* LANDMARKS / DELIVERIES STAGES WAYPOINTS */}
                  {(() => {
                    const xStart = 50;
                    const yStart = mapHeight * 0.70;
                    const xEnd = mapWidth - 50;
                    const yEnd = mapHeight * 0.45;
                    const cpX = mapWidth / 2;
                    const cpY = 25;

                    return milestones.map((step, idx) => {
                      // Calculate coordinate of waypoint at t = idx/7
                      const t = idx / (milestones.length - 1);
                      const wpX = (1 - t) * (1 - t) * xStart + 2 * (1 - t) * t * cpX + t * t * xEnd;
                      const wpY = (1 - t) * (1 - t) * yStart + 2 * (1 - t) * t * cpY + t * t * yEnd;

                      const isPassed = idx <= currentStep;
                      const isActive = idx === currentStep;

                      return (
                        <div
                          key={idx}
                          style={{ left: `${wpX - 10}px`, top: `${wpY - 10}px` }}
                          className="absolute z-20 group/wp"
                          onMouseEnter={() => setHoveredWaypoint(idx)}
                          onMouseLeave={() => setHoveredWaypoint(null)}
                          onClick={() => {
                            setCurrentStep(idx);
                            setSelectedLogIndex(idx);
                            setOwlProgress(t);
                            triggerNotification(`📍 Map Navigation: Displaying milestone ${idx+1} [${step.title}]`);
                          }}
                        >
                          {/* Inner glowing node */}
                          <div 
                            className={`w-5.5 h-5.5 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 border shadow-xs ${
                              isActive
                                ? 'bg-moss-green text-white scale-125 ring-4 ring-moss-green/30 font-bold border-white'
                                : isPassed
                                  ? 'bg-[#ecf3e9] dark:bg-moss-green/10 text-moss-green border-moss-green/45 hover:bg-moss-green/20 scale-105'
                                  : 'bg-white dark:bg-[#1e1a17] text-earth-brown/40 dark:text-dark-muted border-earth-brown/15 hover:border-earth-brown/40 scale-95'
                            }`}
                          >
                            <span className="text-[8px] font-sans font-bold leading-none select-none">
                              {step.icon}
                            </span>

                            {isActive && (
                              <span className="absolute inset-0 rounded-full border-2 border-moss-green animate-ping opacity-60 pointer-events-none" style={{ animationDuration: '1.8s' }} />
                            )}
                          </div>

                          {/* Quick visual dot tag for high readability */}
                          <span className={`absolute top-6 left-1/2 transform -translate-x-1/2 text-[8px] font-sans font-bold whitespace-nowrap bg-[#faf7f0]/95 dark:bg-[#1f1a17]/95 px-1 rounded border border-earth-brown/10 shadow-xs pointer-events-none opacity-0 group-hover/wp:opacity-100 transition-opacity whitespace-nowrap z-50`}>
                            {step.title}
                          </span>
                        </div>
                      );
                    });
                  })()}

                  {/* FLYING OWL REPRESENTATIVE ON PATH */}
                  {(() => {
                    const xStart = 50;
                    const yStart = mapHeight * 0.70;
                    const xEnd = mapWidth - 50;
                    const yEnd = mapHeight * 0.45;
                    const cpX = mapWidth / 2;
                    const cpY = 25;

                    const t = owlProgress;
                    const oX = (1 - t) * (1 - t) * xStart + 2 * (1 - t) * t * cpX + t * t * xEnd;
                    const oY = (1 - t) * (1 - t) * yStart + 2 * (1 - t) * t * cpY + t * t * yEnd;

                    return (
                      <motion.div 
                        key="flying-owl-courier"
                        layout
                        style={{ left: `${oX - 18}px`, top: `${oY - 18}px` }} 
                        className="absolute w-9 h-9 rounded-full bg-white dark:bg-[#1a1714] border-2 border-[#606c38] flex items-center justify-center text-xl shadow-xl z-30 cursor-help"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                        onMouseEnter={() => setHoveredWaypoint(-99)} // Use special id for owl
                        onMouseLeave={() => setHoveredWaypoint(null)}
                      >
                        🦉
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f28482] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#f28482]"></span>
                        </span>
                      </motion.div>
                    );
                  })()}

                  {/* FLOAT RECURRENT CLOUDS EFFECT */}
                  <div className="absolute top-4 left-6 text-xl opacity-20 pointer-events-none animate-pulse">☁️</div>
                  <div className="absolute top-12 right-24 text-2xl opacity-15 pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}>☁️</div>

                  {/* FULL FLOATING TOOLTIP BOARD */}
                  {hoveredWaypoint !== null && (() => {
                    const isOwl = hoveredWaypoint === -99;
                    const step = isOwl ? milestones[currentStep] : milestones[hoveredWaypoint];
                    const isWpPassed = isOwl ? true : hoveredWaypoint <= currentStep;
                    const isWpActive = isOwl ? true : hoveredWaypoint === currentStep;

                    return (
                      <div 
                        className="absolute bottom-2 right-2 left-2 sm:left-auto sm:right-2 sm:max-w-xs bg-white/95 dark:bg-dark-card/95 backdrop-blur-xs p-3 rounded-xl border border-[#d4a373]/30 shadow-lg z-40 text-left pointer-events-none transition-all duration-300"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{isOwl ? '🦉' : step.icon}</span>
                          <div className="min-w-0 flex-1">
                            <h5 className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#d4a373] leading-none">
                              {isOwl ? 'Tracking Carrier' : `Waypoint #${hoveredWaypoint + 1}`}
                            </h5>
                            <h4 className="text-xs font-serif font-bold text-earth-brown dark:text-dark-text leading-tight truncate">
                              {isOwl ? `Snowy carrying "${currentTrackingBook.title}"` : step.title}
                            </h4>
                          </div>
                        </div>

                        <p className="text-[9px] text-earth-brown/70 dark:text-dark-muted mt-1.5 leading-relaxed font-sans">
                          {isOwl ? `Currently traversing winds: ${(owlProgress*100).toFixed(0)}% home. Bound target is "${currentTrackingBook.title}".` : step.desc}
                        </p>

                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-earth-brown/5 text-[8px] font-mono">
                          <span className="text-earth-brown/50 dark:text-dark-muted">Location: {step.location}</span>
                          <span className={`px-1.5 py-0.5 rounded-sm uppercase font-bold leading-none ${
                            isWpActive 
                              ? 'bg-[#d4a373]/10 text-[#d4a373]' 
                              : isWpPassed 
                                ? 'bg-moss-green/10 text-moss-green' 
                                : 'bg-earth-brown/10 text-earth-brown/50'
                          }`}>
                            {isWpActive ? 'Active' : isWpPassed ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="absolute bottom-2 left-2 bg-[#fdfaf2]/90 dark:bg-[#1f1a17]/90 px-2 py-0.5 rounded-md border border-earth-brown/10 text-[8px] font-mono select-none flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-moss-green rounded-full animate-ping" />
                    <span>Physical Windway Trackers Enabled</span>
                  </div>
                </div>

                {/* Map Legend Row */}
                <div className="grid grid-cols-4 gap-1 p-2 bg-[#faf6eb]/50 dark:bg-dark-bg/40 border border-earth-brown/5 rounded-xl text-[8px] font-mono text-center mb-1 text-earth-brown/70 dark:text-dark-muted">
                  <div className="flex items-center justify-center gap-1">
                    <span>🏰</span> <span className="truncate">Citadel Sorting Depot</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-moss-green" /> <span className="truncate">Completed Check</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-moss-green animate-ping" /> <span className="truncate">Active Drone owl</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span>🏠</span> <span className="truncate">Home Nest Entry</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs mt-1.5 select-none pt-1">
                  <span className="text-earth-brown/60 dark:text-dark-muted font-medium flex items-center gap-1">
                    Flight routing index status: 
                    <span className="font-mono font-bold bg-[#ecf3e9] dark:bg-moss-green/10 text-moss-green px-1.5 py-0.5 rounded">
                      Step {currentStep + 1} of {milestones.length}
                    </span>
                  </span>
                  <span className="font-mono font-bold text-moss-green flex items-center gap-1">
                    <span className="text-[10px]">🦅</span> {(owlProgress * 100).toFixed(0)}% traversed
                  </span>
                </div>
              </section>

            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* 6. ORDERED BOOKS LISTING - Renders books depending on Tab */}
        {/* ========================================================= */}
        <section className="bg-white/80 dark:bg-dark-card/90 border border-earth-brown/5 rounded-[2.5rem] p-6 shadow-sm space-y-6 text-left">
          <div className="flex items-center justify-between border-b border-earth-brown/5 dark:border-white/5 pb-3">
            <div>
              <h3 className="font-serif font-bold text-base text-earth-brown dark:text-dark-text uppercase tracking-wide">
                {activeTab === 'digital' ? 'Purchased Digital Volumes' : 'Physical Volumes In Box'}
              </h3>
              <p className="text-[10px] text-earth-brown/40 dark:text-dark-muted mt-0.5">
                {activeTab === 'digital' ? 'Instantly available inside your e-library bookshelf.' : 'Hand-bound physical products protected inside this shipping box.'}
              </p>
            </div>
            <span className="text-xs bg-[#e2ecc5] dark:bg-moss-green/10 text-moss-green font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-center select-none font-mono">
              {orderedItems
                .filter(item => activeTab === 'digital' ? item.format !== 'physical' : item.format === 'physical')
                .reduce((acc, item) => acc + item.quantity, 0)} Items
            </span>
          </div>

          <div className="space-y-4">
            {orderedItems
              .filter(item => activeTab === 'digital' ? item.format !== 'physical' : item.format === 'physical')
              .map((item, idx) => {
                const bookPrice = item.book?.discountPrice || item.book?.price || 12.99;
                const formatLabel = item.format === 'physical' ? 'Paperback / Hardcover' : `Digital Scroll (${item.format?.toUpperCase()})`;
                const isDuplicating = reorderedItems[item.book?.id] || false;

                return (
                  <div 
                    key={idx}
                    onClick={() => {
                      if (item.format === 'physical') {
                        setSelectedTrackingBookId(item.book?.id);
                        triggerNotification(`📡 Displaying delivery status and flight route for: ${item.book?.title}`);
                      }
                    }}
                    className={`p-3.5 border rounded-[2rem] flex flex-col sm:flex-row gap-4 justify-between items-center transition-all ${
                      item.format === 'physical'
                        ? selectedTrackingBookId === item.book?.id
                          ? 'border-2 border-moss-green bg-moss-green/[0.04] dark:bg-moss-green/10 shadow-md cursor-pointer scale-[1.01]'
                          : 'bg-parchment/40 dark:bg-dark-bg/25 border-earth-brown/15 hover:border-moss-green/30 cursor-pointer shadow-sm hover:scale-[1.005]'
                        : 'bg-parchment/40 dark:bg-dark-bg/25 border-earth-brown/5'
                    }`}
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-16 h-22 rounded-xl overflow-hidden border border-earth-brown/10 shadow-md flex-shrink-0">
                        <img src={item.book?.coverImage} alt={item.book?.title} className="w-full h-full object-cover" />
                      </div>

                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[8px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 rounded leading-none ${
                            item.format === 'physical' 
                              ? 'bg-[#8b5a2b]/10 text-[#8b5a2b] border border-[#8b5a2b]/20' 
                              : 'bg-moss-green/10 text-moss-green border border-moss-green/20'
                          }`}>
                            {formatLabel}
                          </span>
                          
                          {item.format !== 'physical' && (
                            <span className="text-[8px] font-bold text-terracotta bg-terracotta/5 px-2 py-0.5 rounded border border-terracotta/10 leading-none">Activated</span>
                          )}

                          {item.format === 'physical' && (
                            selectedTrackingBookId === item.book?.id ? (
                              <span className="text-[8px] font-bold text-white bg-[#556943] px-2 py-0.5 rounded border border-[#556943] leading-none flex items-center gap-1">
                                <span className="w-1 h-1 bg-white rounded-full animate-ping" />
                                Reviewing Status Now
                              </span>
                            ) : (
                              <span className="text-[8px] font-bold text-earth-brown/50 dark:text-dark-muted bg-earth-brown/10 dark:bg-white/5 px-2 py-0.5 rounded border border-earth-brown/10 leading-none">
                                Click to Review Status
                              </span>
                            )
                          )}
                        </div>

                        <h4 className="font-serif text-sm font-bold mt-1 text-earth-brown dark:text-dark-text truncate leading-snug">
                          {item.book?.title || 'eBooklet Tome'}
                        </h4>
                        <p className="text-[10px] text-earth-brown/50 dark:text-dark-muted font-sans font-medium truncate mt-0.5">by {item.book?.author || 'Book Author'}</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-mono text-earth-brown/40 dark:text-dark-muted">Quantity: {item.quantity}</span>
                          <span className="text-[10px] text-earth-brown/30 dark:text-dark-muted">|</span>
                          <span className="text-[10px] font-mono font-bold text-moss-green">${bookPrice.toFixed(2)} each</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-earth-brown/5">
                      <div className="text-left sm:text-right hidden sm:block">
                        <p className="text-[10px] text-earth-brown/40 dark:text-dark-muted uppercase font-bold tracking-wider leading-none">Total</p>
                        <p className="text-sm font-mono font-bold text-earth-brown dark:text-dark-text mt-1">
                          ${(bookPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.format !== 'physical' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                navigate('/library');
                                triggerNotification('📖 Entering your private bookshelves...');
                              }}
                              className="bg-earth-brown/10 dark:bg-[#1e1a17] hover:bg-earth-brown/15 text-earth-brown dark:text-dark-text p-2 px-3 rounded-xl text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <span>Read Now</span>
                            </button>
                            
                            <motion.button
                              whileTap={isOrderDelivered ? { scale: 0.95 } : {}}
                              disabled={!isOrderDelivered || downloadingItemId === item.book?.id}
                              onClick={() => handleDownloadEbook(item.book, item.format || 'pdf')}
                              className={`p-2 px-3 rounded-xl text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-1 select-none ${
                                downloadingItemId === item.book?.id
                                  ? 'bg-moss-green/80 text-white cursor-wait'
                                  : isOrderDelivered
                                    ? 'bg-moss-green hover:bg-moss-green/95 text-white cursor-pointer shadow-md shadow-moss-green/10'
                                    : 'bg-earth-brown/5 dark:bg-white/5 text-earth-brown/30 dark:text-dark-muted border border-earth-brown/10 dark:border-white/5 cursor-not-allowed'
                              }`}
                              title={
                                isOrderDelivered 
                                  ? `Download your ${item.format?.toUpperCase() || 'E-book'}` 
                                  : "Download unlocks once physical order is fully delivered"
                              }
                            >
                              {downloadingItemId === item.book?.id ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Download className="w-3.5 h-3.5" />
                              )}
                              <span>
                                {downloadingItemId === item.book?.id 
                                  ? 'Downloading...' 
                                  : isOrderDelivered 
                                    ? `Download .${item.format?.toUpperCase() || 'PDF'}` 
                                    : 'Locked'}
                              </span>
                            </motion.button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleReorder(item.book?.id)}
                            className={`p-2 px-3 rounded-xl border text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                              isDuplicating 
                                ? 'bg-moss-green border-moss-green text-white scale-95' 
                                : 'bg-white hover:bg-parchment dark:bg-dark-bg/40 text-earth-brown dark:text-dark-text border-earth-brown/15'
                            }`}
                          >
                            {isDuplicating ? 'Added' : 'Buy Again'}
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setActiveReviewBook(item.book);
                          }}
                          className={`p-2 px-3 rounded-xl text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                            reviewedItems[item.book?.id] 
                              ? 'bg-[#ecf3e9] text-moss-green border border-moss-green/10' 
                              : 'bg-moss-green hover:bg-[#435235] text-white'
                          }`}
                        >
                          {reviewedItems[item.book?.id] ? 'Reviewed' : 'Review'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Active Review Modal */}
          <AnimatePresence>
            {activeReviewBook && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#352512]/60 backdrop-blur-xs z-[250] flex items-center justify-center p-4"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 15 }}
                  className="bg-white dark:bg-dark-card border border-earth-brown/15 p-6 rounded-[2.5rem] shadow-2xl max-w-sm w-full space-y-4 text-center select-none relative"
                >
                  <button 
                    onClick={() => setActiveReviewBook(null)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-earth-brown/10 text-earth-brown/50 flex items-center justify-center text-sm font-bold cursor-pointer border-none"
                  >
                    ✕
                  </button>
                  
                  <div className="w-16 h-22 rounded-xl mx-auto overflow-hidden border border-earth-brown/10 shadow-md">
                    <img src={activeReviewBook.coverImage} alt={activeReviewBook.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-widest text-[#d4a373] font-bold block">Sanctuary Reviews</span>
                    <h3 className="font-serif font-bold text-sm text-earth-brown dark:text-dark-text leading-tight">{activeReviewBook.title}</h3>
                  </div>

                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} 
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 cursor-pointer transition-transform duration-200 active:scale-125 text-amber-500 border-none bg-transparent"
                      >
                        <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-amber-500' : 'text-earth-brown/20 dark:text-white/10'}`} />
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <textarea 
                      placeholder="Share your thoughts with fellow spell-readers..."
                      rows={3}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      required
                      className="w-full bg-[#fdfaf2] dark:bg-dark-bg/65 border border-earth-brown/10 rounded-2xl p-3 text-xs focus:ring-1 focus:ring-moss-green focus:outline-none placeholder:text-earth-brown/30 dark:text-dark-text"
                    />
                    
                    <button 
                      type="submit"
                      className="w-full py-3 bg-moss-green hover:bg-[#435235] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-md cursor-pointer"
                    >
                      Submit Review &rarr;
                    </button>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FINANCIAL SUMMARY BREAKDOWN */}
          <div className="border-t border-earth-brown/5 dark:border-white/5 pt-4 space-y-2.5">
            <div className="flex justify-between items-center text-xs text-earth-brown/60 dark:text-dark-muted">
              <span>Items Subtotal</span>
              <span className="font-mono">${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center text-xs text-earth-brown/60 dark:text-dark-muted">
              <span>Delivery Cost</span>
              <span className="font-mono text-moss-green uppercase tracking-widest font-bold">
                {shippingFee === 0 ? 'Free Delivery' : `$${shippingFee.toFixed(2)}`}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs text-earth-brown/60 dark:text-dark-muted">
              <span>Magic Enclave Levy / Tax (8%)</span>
              <span className="font-mono">${rawTax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-xs text-earth-brown dark:text-dark-text pt-2 border-t border-dashed border-earth-brown/5">
              <span className="font-serif font-bold uppercase tracking-wider">Grand Total Settled</span>
              <span className="font-mono font-bold text-base text-moss-green">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
          
        </section>

        {/* ========================================================= */}
        {/* 7. DELIVERY DETAILS ADDRESS & ACCOUNT */}
        {/* ========================================================= */}
        <section className="bg-[#fcfbf7] dark:bg-dark-card border border-earth-brown/10 p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden space-y-4 text-left">
          <div className="border-b border-earth-brown/10 pb-3">
             <h3 className="font-serif text-sm font-bold text-earth-brown dark:text-dark-text uppercase tracking-wide">Receipt Verification Details</h3>
             <p className="text-[10px] text-earth-brown/50 dark:text-dark-muted mt-0.5 font-sans">Formal electronic records mapping the final account stop.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 text-left text-earth-brown dark:text-dark-text">
              <span className="text-[9px] uppercase font-bold text-earth-brown/50 dark:text-dark-muted block leading-none">Recipient Name</span>
              <p className="text-xs font-serif font-bold">{recipientName}</p>

              {fullOrderData?.timeOfOrder && (
                <>
                  <span className="text-[9px] uppercase font-bold text-earth-brown/50 dark:text-dark-muted block pt-1.5 leading-none">Time of Purchase</span>
                  <p className="text-xs font-mono font-semibold text-moss-green">{fullOrderData.timeOfOrder}</p>
                </>
              )}
              
              {activeTab === 'physical' && (
                <>
                  <span className="text-[9px] uppercase font-bold text-earth-brown/50 dark:text-dark-muted block pt-1.5 leading-none">Shipping Address</span>
                  <p className="text-xs leading-relaxed font-sans font-medium text-earth-brown/70 dark:text-dark-muted">
                    {shippingStreet},<br />
                    {shippingCity}, {shippingZip}
                  </p>
                </>
              )}
            </div>

            <div className="space-y-1.5 text-left md:border-l md:border-earth-brown/10 md:pl-4 text-earth-brown dark:text-dark-text">
              <span className="text-[9px] uppercase font-bold text-earth-brown/50 dark:text-dark-muted block leading-none">Account Email</span>
              <p className="text-xs font-mono font-bold text-moss-green break-all">
                {recipientEmail}
              </p>
              
              <span className="text-[9px] uppercase font-bold text-[#8b5a2b]/60 dark:text-dark-muted block pt-1.5 font-sans leading-none">Payment Protocol</span>
              <div className="flex items-center gap-1.5 text-xs font-serif font-semibold">
                <span>{paymentMethodLabel}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 8. MASTER SUPPORT CHANNELS */}
        {/* ========================================================= */}
        <section className="bg-white/80 dark:bg-dark-card/90 border border-earth-brown/5 rounded-[2.5rem] p-6 shadow-sm space-y-4 text-left">
          <h3 className="font-serif font-bold text-sm text-earth-brown dark:text-dark-text uppercase tracking-wide leading-none border-b border-earth-brown/5 pb-3">
             Need Help With Your Purchases?
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Frequently Asked Questions', desc: 'Read delivery options', action: () => triggerNotification('📖 Opening help information page...') },
              { label: 'Chat With Us', desc: 'Available 24 hours a day', action: () => triggerNotification('💬 Connected to our support agent.') },
              { label: 'Return Order', desc: 'Easily return your items', action: () => triggerNotification('↩ Return request is saved in our system.') },
              { label: 'Delivery Guarantee', desc: 'Read our safe shipping terms', action: () => triggerNotification('🗺 Registering package protection metrics.') }
            ].map((btn, idx) => (
              <button
                key={idx}
                onClick={btn.action}
                className="p-3 bg-[#fdfdfc] hover:bg-parchment dark:bg-dark-bg/35 dark:hover:bg-dark-bg/75 border border-earth-brown/10 rounded-2xl text-left select-none transition-all hover:scale-[1.01] cursor-pointer"
              >
                <h4 className="text-xs font-serif font-bold text-earth-brown dark:text-dark-text leading-tight uppercase">{btn.label}</h4>
                <p className="text-[9px] text-earth-brown/50 dark:text-dark-muted mt-0.5 leading-tight">{btn.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 10. REWARDING SUCCESS PHYSICS CELEBRATION (ONLY FOR PHYSICAL FLOWS) */}
        {/* ========================================================= */}
        <AnimatePresence>
          {showCelebration && activeTab === 'physical' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#352512]/80 backdrop-blur-md z-[300] flex items-center justify-center p-4 animate-fade-in"
            >
              <motion.div 
                initial={{ scale: 0.85, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.85, y: 20 }}
                className="bg-[#fcfaf4] dark:bg-dark-card border-2 border-moss-green p-8 rounded-[3rem] shadow-2xl max-w-md w-full text-center space-y-6 relative overflow-hidden select-none"
              >
                <div className="absolute top-4 left-6 text-2xl animate-bounce">✨</div>
                <div className="absolute bottom-6 right-6 text-2xl animate-bounce" style={{ animationDelay: '0.4s' }}>✨</div>
                <button 
                  onClick={() => setShowCelebration(false)}
                  className="absolute top-4 right-4 text-xs font-bold uppercase tracking-widest bg-earth-brown/5 text-earth-brown/40 p-2 rounded-full cursor-pointer hover:bg-earth-brown/10 border-none"
                >
                  Close
                </button>

                <div className="w-20 h-20 bg-[#ecf3e9] dark:bg-dark-bg/60 rounded-full flex items-center justify-center mx-auto shadow-2xl relative border-2 border-moss-green animate-pulse">
                  <CheckCircle2 className="w-12 h-12 text-moss-green" />
                  <span className="absolute inset-x-0 bottom-0 text-[10px] text-moss-green bg-white rounded-full font-sans font-bold py-0.5 border border-moss-green/10">ARRIVED</span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono tracking-widest text-[#d4a373] font-bold uppercase block">Delivery Finished</span>
                  <h2 className="text-3xl font-serif font-bold text-earth-brown dark:text-dark-text leading-tight uppercase">&ldquo;{currentTrackingBook.title}&rdquo; Has Arrived! ✨</h2>
                  <p className="text-xs text-earth-brown/60 dark:text-dark-muted max-w-xs mx-auto leading-relaxed">
                    Our helper owl Snowy has placed your package enclosing &ldquo;{currentTrackingBook.title}&rdquo; safely at your front doorstep. We hope you enjoy reading your printed book!
                  </p>
                </div>

                <div className="p-4 bg-parchment/60 dark:bg-dark-bg/50 rounded-2xl border border-dashed border-earth-brown/15 text-left space-y-1.5 relative font-sans">
                  <span className="text-[9px] uppercase tracking-widest text-moss-green font-bold block">Delivery Nest Receipt</span>
                  <div className="flex justify-between text-xs text-earth-brown/80 dark:text-dark-muted">
                    <span>Order Serial</span>
                    <span className="font-mono font-bold leading-none">{orderId}</span>
                  </div>
                  <div className="flex justify-between text-xs text-earth-brown/80 dark:text-dark-muted">
                    <span>Delivery Location</span>
                    <span className="font-semibold">{shippingStreet}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      setShowCelebration(false);
                      navigate('/');
                    }}
                    className="flex-1 py-3.5 bg-earth-brown hover:bg-[#3d2c14] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    Return Home
                  </button>
                  <button
                    onClick={() => {
                      setShowCelebration(false);
                      triggerNotification('⭐ Thank you for scoring Snowy!');
                    }}
                    className="flex-1 py-3.5 bg-moss-green hover:bg-[#435235] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    Rate Delivery
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
};
