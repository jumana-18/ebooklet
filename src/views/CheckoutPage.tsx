import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Truck,
  ShoppingBag,
  Check,
  ShieldCheck,
  Calendar,
  Sparkles,
  CheckCircle,
  TrendingUp,
  Award,
  Globe2,
} from "lucide-react";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart: rawCart, clearCart } = useShop();
  const { addOrder, user, savedAddresses: rawSavedAddresses } = useAuth();

  const cart = Array.isArray(rawCart) ? rawCart : [];
  const savedAddresses = Array.isArray(rawSavedAddresses) ? rawSavedAddresses : [];

  // Determine if there are physical printed books
  const hasPhysicalBooks = cart.some(
    (item) => item.format === "physical" || item.format === "Printed Book" || item.format === "Printed Codex",
  );

  // Retrieve calculated totals or default
  const grandTotal =
    location.state?.grandTotal ||
    cart.reduce(
      (tot, item) =>
        tot + (item.book.discountPrice || item.book.price) * item.quantity,
      0,
    ) + (hasPhysicalBooks ? 1.25 : 0);

  const [shippingForm, setShippingForm] = useState(() => {
    const defaultAddress = savedAddresses?.find(addr => addr.isDefault) || savedAddresses?.[0];
    return {
      fullName: user?.name || "Sarah Miller",
      emailAddress: user?.email || "sarah@ebooklet.com",
      street: defaultAddress?.street || "123 Sunshine Lane",
      city: defaultAddress?.city || "Springfield Garden",
      zipCode: defaultAddress?.zipCode || "12345",
      deliveryMethod: "owl", // 'owl' | 'courier' | 'wind'
    };
  });

  const [paymentForm, setPaymentForm] = useState(() => {
    return {
      cardName: (user?.name || "Sarah Miller").toUpperCase(),
      cardNumber: "5249 9811 3400 9012",
      expiry: "09/31",
      cvv: "777",
      selectedMethod: "card", // 'card' | 'spell' | 'paypal' | 'apple'
    };
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [successStep, setSuccessStep] = useState(0); // For staggered success states
  const [purchasedHasPhysical, setPurchasedHasPhysical] = useState(false);
  const [purchasedHasDigital, setPurchasedHasDigital] = useState(false);
  const [lastPlacedOrderNum, setLastPlacedOrderNum] = useState("");

  // Validate form fields
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!shippingForm.fullName.trim())
      errors.fullName = "Please enter your name.";

    if (!shippingForm.emailAddress.trim()) {
      errors.emailAddress = "Please enter your email address.";
    } else if (!shippingForm.emailAddress.includes("@")) {
      errors.emailAddress = "Please enter a valid email address.";
    }

    // Only validate shipping fields if print books are in the cart
    if (hasPhysicalBooks) {
      if (!shippingForm.street.trim())
        errors.street = "Please enter your street address.";
      if (!shippingForm.city.trim())
        errors.city = "Please enter your city and state/province.";
      if (!shippingForm.zipCode.trim())
        errors.zipCode = "Please enter your postal/zip code.";
    }

    if (paymentForm.selectedMethod === "card") {
      if (!paymentForm.cardName.trim())
        errors.cardName = "Please enter the cardholder name.";
      if (paymentForm.cardNumber.replace(/\s/g, "").length < 16)
        errors.cardNumber = "Please enter a valid 16-digit card number.";
      if (!paymentForm.expiry.includes("/"))
        errors.expiry = "Use standard MM/YY format.";
      if (paymentForm.cvv.length < 3)
        errors.cvv = "Enter secure 3 or 4-digit CVV.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // scroll to warning
      window.scrollTo({ top: 120, behavior: "smooth" });
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);
    
    // Capture states before cart is cleared inside setTimeout
    const hasPhys = cart.some(item => item.format === "physical" || item.format === "Printed Book" || item.format === "Printed Codex");
    const hasDig = cart.some(item => item.format !== "physical" && item.format !== "Printed Book" && item.format !== "Printed Codex");
    setPurchasedHasPhysical(hasPhys);
    setPurchasedHasDigital(hasDig);

    // Staggered cinematic loading events
    setTimeout(() => {
      setIsSubmitting(false);
      setOrderComplete(true);
      
      // Persist the complete order details so the tracking page has access to all exact checkout data
      const deliveryCost = hasPhysicalBooks 
        ? (shippingForm.deliveryMethod === "courier" ? 4.99 : shippingForm.deliveryMethod === "wind" ? 14.99 : 0)
        : 0;
      const sub = cart.reduce((tot, item) => tot + (item.book.discountPrice || item.book.price) * item.quantity, 0);
      const taxAmount = sub * 0.08;
      const finalTotal = sub + deliveryCost + taxAmount;

      const charsForId = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let rSuffix = '';
      for (let i = 0; i < 5; i++) {
        rSuffix += charsForId.charAt(Math.floor(Math.random() * charsForId.length));
      }
      const generatedOrderNum = `BKL-${Math.floor(10000 + Math.random() * 90000)}-${rSuffix}`;
      setLastPlacedOrderNum(generatedOrderNum);

      // Format current time and date
      const currentTimeString = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      const currentDateString = new Date().toISOString().split('T')[0];

      const fullOrderData = {
        orderNumber: generatedOrderNum,
        items: cart,
        shipping: {
          fullName: shippingForm.fullName,
          emailAddress: shippingForm.emailAddress,
          street: shippingForm.street,
          city: shippingForm.city,
          zipCode: shippingForm.zipCode,
          deliveryMethod: shippingForm.deliveryMethod,
        },
        payment: {
          selectedMethod: paymentForm.selectedMethod,
          cardName: paymentForm.cardName,
          cardNumberMasked: paymentForm.selectedMethod === 'card' 
            ? `•••• •••• •••• ${paymentForm.cardNumber.replace(/\s/g, '').slice(-4)}`
            : '',
        },
        totals: {
          subtotal: sub,
          shippingFee: deliveryCost,
          tax: taxAmount,
          grandTotal: finalTotal,
        }
      };
      localStorage.setItem('ebooklet_last_order', JSON.stringify(fullOrderData));

      // Add to Order History
      const newHistoryOrder = {
        id: `ord-${Date.now()}`,
        orderNumber: generatedOrderNum,
        date: currentDateString,
        total: finalTotal,
        status: 'Processing' as const,
        addressLabel: shippingForm.street,
        shipping: {
          fullName: shippingForm.fullName,
          emailAddress: shippingForm.emailAddress,
          street: shippingForm.street,
          city: shippingForm.city,
          zipCode: shippingForm.zipCode,
          deliveryMethod: shippingForm.deliveryMethod,
        },
        payment: {
          selectedMethod: paymentForm.selectedMethod,
          cardNumberMasked: paymentForm.selectedMethod === 'card' 
            ? `•••• •••• •••• ${paymentForm.cardNumber.replace(/\s/g, '').slice(-4)}`
            : 'Eco Pay Wallet'
        },
        timeOfOrder: currentTimeString,
        items: cart.map(item => ({
          bookId: item.book.id,
          title: item.book.title,
          author: item.book.author,
          coverImage: item.book.coverImage || '',
          price: item.book.discountPrice || item.book.price,
          quantity: item.quantity,
          format: (item.format === 'physical' || item.format === 'Printed Book' || item.format === 'Printed Codex') ? ('physical' as const) : ('ebook' as const)
        }))
      };
      addOrder(newHistoryOrder);

      // Extract newly purchased digital books and save them to E-Library
      try {
        const digitalItems = cart
          .filter(item => item.format !== 'physical' && item.format !== 'Printed Book' && item.format !== 'Printed Codex')
          .map(item => ({
            ...item.book,
            format: item.format,
            dateAdded: new Date().toISOString(),
            progress: 0, // Starts at 0 progress
          }));

        if (digitalItems.length > 0) {
          const librarySaved = localStorage.getItem('ebooklet_purchased_library');
          let existingLibrary = [];
          if (librarySaved) {
            existingLibrary = JSON.parse(librarySaved);
          }
          // Avoid duplicates by checking book ID
          digitalItems.forEach(newBook => {
            if (!existingLibrary.some((eb: any) => eb.id === newBook.id)) {
              existingLibrary.push(newBook);
            }
          });
          localStorage.setItem('ebooklet_purchased_library', JSON.stringify(existingLibrary));
        }
      } catch (err) {
        console.error("Error updating library additions", err);
      }

      clearCart(); // clear context cart!

      // Increment success animations
      setTimeout(() => setSuccessStep(1), 500);
      setTimeout(() => setSuccessStep(2), 1500);
      setTimeout(() => setSuccessStep(3), 2800);
    }, 3200);
  };

  const deliveryOptionsLabels = {
    owl: {
      title: "Standard Home Delivery (Free)",
      desc: "Carefully packed and shipped. Delivery in 2-4 business days.",
    },
    courier: {
      title: "Express Ground Courier ($4.99)",
      desc: "Dispatched with priority tracking. Delivery in 1-2 business days.",
    },
    wind: {
      title: "Overnight Instant Priority ($14.99)",
      desc: "Guaranteed delivery of your order by tomorrow morning.",
    },
  };

  if (orderComplete) {
    return (
      <main className="min-h-screen bg-[#faf8f5] dark:bg-dark-bg py-16 px-6 flex items-center justify-center relative overflow-hidden select-none transition-all duration-300">
        {/* Particles background */}
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none select-none">
          <div className="absolute top-10 left-1/4 text-2xl animate-pulse">
            ✨
          </div>
          <div className="absolute bottom-20 left-10 text-xl animate-bounce">
            🍂
          </div>
          <div className="absolute top-40 right-20 text-3xl animate-ping">
            🌟
          </div>
          <div className="absolute bottom-1/3 right-1/4 text-2xl animate-pulse">
            🍄
          </div>
        </div>

        <motion.div
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-xl w-full bg-white dark:bg-dark-card border border-moss-green/15 rounded-[3rem] p-8 md:p-10 shadow-2xl relative text-center z-10 space-y-6"
        >
          {/* Animated stardust crown */}
          <div className="flex justify-center">
            <motion.div
              initial={{ rotate: -45, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 120 }}
              className="w-18 h-18 bg-[#4f5e41] dark:bg-moss-green rounded-full shadow-lg flex items-center justify-center text-white text-3xl"
            >
              <Check className="w-8 h-8 stroke-[3]" />
            </motion.div>
          </div>

          <div className="space-y-2">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] font-mono tracking-widest text-[#d4a373] font-bold uppercase"
            >
              Order Confirmed
            </motion.span>
            <h1 className="text-3xl font-serif font-bold text-earth-brown dark:text-dark-text leading-tight uppercase">
              {purchasedHasPhysical
                ? "Your book has been successfully purchased!"
                : "Your e-book has been successfully purchased!"}
            </h1>
            <p className="text-xs text-earth-brown/60 dark:text-dark-muted leading-relaxed max-w-sm mx-auto">
              {purchasedHasPhysical
                ? "Your book (not ebook) has been successfully purchased! Track your order below to monitor its flight to your library."
                : "Your e-book has been successfully purchased! You can view your order details below and check in your E-Library."}
            </p>
          </div>

          {/* Simulated progress milestones */}
          <div className="p-5 bg-parchment/60 dark:bg-dark-bg/50 rounded-2xl border border-earth-brown/10 dark:border-white/5 space-y-4 text-left">
            <div className="flex justify-between text-[10px] uppercase font-bold text-earth-brown/40 dark:text-dark-muted">
              <span>Order ID Number</span>
              <span className="font-mono text-earth-brown dark:text-dark-text select-all">
                BKT-{Math.floor(100000 + Math.random() * 900000)}-M
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs text-white ${successStep >= 1 ? "bg-[#4f5e41]" : "bg-earth-brown/10"}`}
                >
                  {successStep >= 1 ? <Check size={10} /> : "1"}
                </div>
                <span
                  className={`text-xs font-semibold ${successStep >= 1 ? "text-earth-brown dark:text-dark-text" : "text-earth-brown/40 dark:text-dark-muted"}`}
                >
                  Order received and payment approved
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs text-white ${successStep >= 2 ? "bg-[#4f5e41]" : "bg-earth-brown/10"}`}
                >
                  {successStep >= 2 ? <Check size={10} /> : "2"}
                </div>
                <span
                  className={`text-xs font-semibold ${successStep >= 2 ? "text-earth-brown dark:text-dark-text" : "text-earth-brown/40 dark:text-dark-muted"}`}
                >
                  {purchasedHasPhysical
                    ? "Email receipt generated and parcel package preparing"
                    : "Email receipt and digital download ready"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs text-white ${successStep >= 3 ? "bg-[#4f5e41]" : "bg-earth-brown/10"}`}
                >
                  {successStep >= 3 ? <Check size={10} /> : "3"}
                </div>
                <span
                  className={`text-xs font-semibold ${successStep >= 3 ? "text-earth-brown dark:text-dark-text" : "text-earth-brown/40 dark:text-dark-muted"}`}
                >
                  {purchasedHasPhysical
                    ? "Package wrapped and handed to Standard Courier Owl"
                    : "E-books delivered instantly to your e-reading library"}
                </span>
              </div>
            </div>
          </div>

          {/* Date card estimate */}
          <div className="flex items-center gap-3 justify-center text-[#2e7d32] dark:text-moss-green bg-[#ecf3e9] dark:bg-dark-bg border border-green-500/10 rounded-xl p-3 text-xs font-bold uppercase tracking-wider">
            <Calendar size={15} />
            <span>
              {purchasedHasPhysical
                ? "Estimated Delivery: 2-4 business days"
                : "E-books available instantly on your digital devices"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => navigate(`/tracking?orderId=${lastPlacedOrderNum}`)}
              className="flex-1 py-4 bg-moss-green hover:bg-moss-green/90 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-moss-green/20 hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 animate-bounce text-white" />
              <span>Track Your Order 🦉</span>
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 py-4 bg-earth-brown hover:bg-[#32230e] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.01]"
            >
              Continue Exploring
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-parchment dark:bg-dark-bg pb-28 pt-4 px-4 md:px-6 transition-colors duration-300 select-none">
      {/* Loading Overlay */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#352512]/90 backdrop-blur-md z-[1000] flex flex-col items-center justify-center text-white space-y-6"
          >
            {/* Elegant loading spinner */}
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-moss-green animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-white/5 border-b-[#d4a373] animate-pulse" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">
                ⏳
              </span>
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif text-lg font-bold tracking-widest uppercase">
                Sending your order
              </h3>
              <p className="text-[10px] text-white/60 font-mono tracking-widest uppercase animate-pulse">
                Please wait a few seconds. We are verifying details...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form
        onSubmit={handleCheckoutSubmit}
        className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        {/* Left Side: Delivery parameters & Payment Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header segment */}
          <div className="space-y-2 border-b border-earth-brown/10 dark:border-white/5 pb-4">
            <button
              type="button"
              onClick={() => navigate("/cart")}
              className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-earth-brown/60 dark:text-dark-muted hover:text-earth-brown"
            >
              <ArrowLeft size={12} className="text-moss-green" /> Back to Cart
            </button>
            <h1 className="text-3xl font-serif font-bold text-earth-brown dark:text-dark-text uppercase">
              Complete Your Order
            </h1>
            <p className="text-xs text-earth-brown/50 dark:text-dark-muted font-sans font-medium">
              Please review your details and choose your payment method below.
            </p>
          </div>

          {/* Section 1: Customer Contact & Delivery Addresses */}
          <div className="bg-white/90 dark:bg-dark-card/90 border border-earth-brown/5 rounded-[2rem] p-5 space-y-5">
            <div className="flex items-center gap-2 border-b border-earth-brown/5 dark:border-white/5 pb-3">
              <MapPin className="w-4 h-4 text-moss-green" />
              <h2 className="text-xs font-bold text-earth-brown dark:text-dark-text uppercase tracking-widest font-sans">
                {hasPhysicalBooks ? "Delivery & Contact Details" : "Contact Details"}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-earth-brown/50 dark:text-dark-muted uppercase font-sans">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={shippingForm.fullName}
                  onChange={(e) =>
                    setShippingForm({
                      ...shippingForm,
                      fullName: e.target.value,
                    })
                  }
                  className="w-full bg-[#fdfdfc] dark:bg-dark-bg border border-earth-brown/10 rounded-xl px-3 py-3 text-xs focus:ring-1 focus:ring-moss-green focus:outline-none dark:text-dark-text"
                  placeholder="e.g. Sarah Miller"
                />
                {formErrors.fullName && (
                  <p className="text-[9px] text-[#cd4e4e] font-sans font-bold uppercase">
                    {formErrors.fullName}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-earth-brown/50 dark:text-dark-muted uppercase font-sans">
                  Email Address (for Receipt & E-books)
                </label>
                <input
                  type="email"
                  value={shippingForm.emailAddress}
                  onChange={(e) =>
                    setShippingForm({
                      ...shippingForm,
                      emailAddress: e.target.value,
                    })
                  }
                  className="w-full bg-[#fdfdfc] dark:bg-dark-bg border border-earth-brown/10 rounded-xl px-3 py-3 text-xs focus:ring-1 focus:ring-moss-green focus:outline-none dark:text-dark-text"
                  placeholder="e.g. sarah@ebooklet.com"
                />
                {formErrors.emailAddress && (
                  <p className="text-[9px] text-[#cd4e4e] font-sans font-bold uppercase">
                    {formErrors.emailAddress}
                  </p>
                )}
              </div>

              {hasPhysicalBooks && (
                <>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-earth-brown/50 dark:text-dark-muted uppercase font-sans">
                      Street Address & Apartment/Suite
                    </label>
                    <input
                      type="text"
                      value={shippingForm.street}
                      onChange={(e) =>
                        setShippingForm({ ...shippingForm, street: e.target.value })
                      }
                      className="w-full bg-[#fdfdfc] dark:bg-dark-bg border border-earth-brown/10 rounded-xl px-3 py-3 text-xs focus:ring-1 focus:ring-moss-green focus:outline-none dark:text-dark-text"
                      placeholder="e.g. 123 Sunshine Lane"
                    />
                    {formErrors.street && (
                      <p className="text-[9px] text-[#cd4e4e] font-sans font-bold uppercase">
                        {formErrors.street}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-earth-brown/50 dark:text-dark-muted uppercase font-sans">
                      City, State / Province
                    </label>
                    <input
                      type="text"
                      value={shippingForm.city}
                      onChange={(e) =>
                        setShippingForm({ ...shippingForm, city: e.target.value })
                      }
                      className="w-full bg-[#fdfdfc] dark:bg-dark-bg border border-earth-brown/10 rounded-xl px-3 py-3 text-xs focus:ring-1 focus:ring-moss-green focus:outline-none dark:text-dark-text"
                      placeholder="e.g. Springfield Garden"
                    />
                    {formErrors.city && (
                      <p className="text-[9px] text-[#cd4e4e] font-sans font-bold uppercase">
                        {formErrors.city}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-earth-brown/50 dark:text-dark-muted uppercase font-sans">
                      Postal / Zip Code
                    </label>
                    <input
                      type="text"
                      value={shippingForm.zipCode}
                      onChange={(e) =>
                        setShippingForm({ ...shippingForm, zipCode: e.target.value })
                      }
                      className="w-full bg-[#fdfdfc] dark:bg-dark-bg border border-earth-brown/10 rounded-xl px-3 py-3 text-xs focus:ring-1 focus:ring-moss-green focus:outline-none dark:text-dark-text"
                      placeholder="e.g. 12345"
                    />
                    {formErrors.zipCode && (
                      <p className="text-[9px] text-[#cd4e4e] font-sans font-bold uppercase">
                        {formErrors.zipCode}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Delivery Method Selection */}
            {hasPhysicalBooks && (
              <div className="space-y-2 pt-3 border-t border-[#f1efe6] dark:border-white/5">
                <label className="text-[10px] font-bold text-earth-brown/50 dark:text-dark-muted uppercase font-sans flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> Select Delivery Option
                </label>

                <div className="grid grid-cols-1 gap-2.5">
                  {Object.entries(deliveryOptionsLabels).map(
                    ([method, details]) => (
                      <div
                        key={method}
                        onClick={() =>
                          setShippingForm({
                            ...shippingForm,
                            deliveryMethod: method,
                          })
                        }
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 items-center ${
                          shippingForm.deliveryMethod === method
                            ? "bg-[#ecf2ea] dark:bg-dark-bg border-[#ccdccc] dark:border-moss-green/45"
                            : "bg-none border-earth-brown/5 dark:border-white/5 hover:bg-[#faf9f3] dark:hover:bg-dark-card/50"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${shippingForm.deliveryMethod === method ? "border-moss-green bg-moss-green" : "border-earth-brown/25"}`}
                        >
                          {shippingForm.deliveryMethod === method && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-serif font-bold text-earth-brown dark:text-dark-text">
                            {details.title}
                          </h4>
                          <p className="text-[10px] text-earth-brown/65 dark:text-dark-muted leading-relaxed mt-0.5">
                            {details.desc}
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Secure Payment Options */}
          <div className="bg-white/90 dark:bg-dark-card/90 border border-earth-brown/5 rounded-[2rem] p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-earth-brown/5 dark:border-white/5 pb-3">
              <CreditCard className="w-4 h-4 text-moss-green" />
              <h2 className="text-xs font-bold text-earth-brown dark:text-dark-text uppercase tracking-widest font-sans">
                Payment Method
              </h2>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#ede8dc] dark:bg-dark-bg rounded-xl">
              {[
                { id: "card", name: "Card" },
                { id: "spell", name: "Eco Pay" },
                { id: "paypal", name: "PayPal" },
                { id: "apple", name: "Apple Pay" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setPaymentForm({ ...paymentForm, selectedMethod: tab.id })
                  }
                  className={`py-2 text-[10px] font-sans font-bold uppercase rounded-lg tracking-wide transition-all cursor-pointer ${
                    paymentForm.selectedMethod === tab.id
                      ? "bg-white dark:bg-dark-card text-earth-brown dark:text-dark-text shadow-sm"
                      : "text-earth-brown/40 dark:text-dark-muted hover:text-earth-brown"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {paymentForm.selectedMethod === "card" ? (
              <div className="space-y-4 pt-2">
                {/* Visual mockup of the credit card */}
                <div className="relative w-full aspect-[16/10] max-w-sm mx-auto bg-gradient-to-tr from-[#312519] via-[#4d3a27] to-[#252f20] dark:from-[#1b2513] dark:via-[#131b1c] dark:to-[#221c17] text-white rounded-2xl p-5 shadow-2xl flex flex-col justify-between overflow-hidden border border-white/5">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-moss-green/15 rounded-full filter blur-xl select-none" />
                  <div className="absolute left-0 bottom-0 w-32 h-32 bg-[#cd5a11]/10 rounded-full filter blur-2xl select-none" />

                  <div className="flex justify-between items-start">
                    <span className="font-serif italic text-xs tracking-widest uppercase text-[#efe5d5]/85">
                      ⚜ SECURE PAYMENT CARD
                    </span>
                    <span className="text-[8px] font-bold tracking-widest text-[#d4bd98]/70 border border-[#d4bd98]/20 rounded px-1 py-0.5 uppercase">
                      {user?.membership || "Gold Member"}
                    </span>
                  </div>

                  <div className="font-mono text-base tracking-widest text-center select-all my-2 font-semibold">
                    {paymentForm.cardNumber || "•••• •••• •••• ••••"}
                  </div>

                  <div className="flex justify-between items-end border-t border-white/10 pt-3">
                    <div>
                      <span className="text-[7px] text-white/40 block uppercase tracking-widest font-sans">
                        Cardholder Name
                      </span>
                      <span className="text-[10px] tracking-wide truncate max-w-[170px] uppercase font-serif block">
                        {paymentForm.cardName || (user?.name || "SARAH MILLER").toUpperCase()}
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <span className="text-[7px] text-white/40 block uppercase tracking-widest font-sans">
                          Expiry
                        </span>
                        <span className="text-[10px] font-mono tracking-widest block">
                          {paymentForm.expiry || "MM/YY"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[7px] text-white/40 block uppercase tracking-widest font-sans">
                          CVV
                        </span>
                        <span className="text-[10px] font-mono block">
                          {paymentForm.cvv || "•••"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-earth-brown/50 dark:text-dark-muted uppercase font-sans">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Miller"
                      value={paymentForm.cardName}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          cardName: e.target.value,
                        })
                      }
                      className="w-full bg-[#fdfdfc] dark:bg-dark-bg border border-earth-brown/10 rounded-xl px-3 py-3 text-xs focus:ring-1 focus:ring-moss-green focus:outline-none dark:text-dark-text"
                    />
                    {formErrors.cardName && (
                      <p className="text-[9px] text-[#cd4e4e] font-sans font-bold uppercase">
                        {formErrors.cardName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-earth-brown/50 dark:text-dark-muted uppercase font-sans">
                      Credit Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 5249 9811 3400 9012"
                      value={paymentForm.cardNumber}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          cardNumber: e.target.value,
                        })
                      }
                      className="w-full bg-[#fdfdfc] dark:bg-dark-bg border border-earth-brown/10 rounded-xl px-3 py-3 text-xs focus:ring-1 focus:ring-moss-green focus:outline-none dark:text-dark-text font-mono"
                    />
                    {formErrors.cardNumber && (
                      <p className="text-[9px] text-[#cd4e4e] font-sans font-bold uppercase">
                        {formErrors.cardNumber}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-earth-brown/50 dark:text-dark-muted uppercase font-sans">
                      Expiry Date (MM/YY)
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={paymentForm.expiry}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          expiry: e.target.value,
                        })
                      }
                      className="w-full bg-[#fdfdfc] dark:bg-dark-bg border border-earth-brown/10 rounded-xl px-3 py-3 text-xs focus:ring-1 focus:ring-moss-green focus:outline-none dark:text-dark-text font-mono"
                    />
                    {formErrors.expiry && (
                      <p className="text-[9px] text-[#cd4e4e] font-sans font-bold uppercase">
                        {formErrors.expiry}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-earth-brown/50 dark:text-dark-muted uppercase font-sans">
                      Security Code (CVV)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 777"
                      maxLength={4}
                      value={paymentForm.cvv}
                      onChange={(e) =>
                        setPaymentForm({ ...paymentForm, cvv: e.target.value })
                      }
                      className="w-full bg-[#fdfdfc] dark:bg-dark-bg border border-earth-brown/10 rounded-xl px-3 py-3 text-xs focus:ring-1 focus:ring-moss-green focus:outline-none dark:text-dark-text font-mono"
                    />
                    {formErrors.cvv && (
                      <p className="text-[9px] text-[#cd4e4e] font-sans font-bold uppercase">
                        {formErrors.cvv}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-3 bg-[#faf9f5] dark:bg-dark-bg rounded-2xl border border-dashed border-earth-brown/10">
                <div className="text-3xl animate-bounce">💳</div>
                <div>
                  <h4 className="text-xs font-serif font-bold text-earth-brown dark:text-dark-text uppercase">
                    Easy Digital Payment
                  </h4>
                  <p className="text-[10px] text-earth-brown/60 dark:text-dark-muted max-w-xs mx-auto leading-relaxed mt-1">
                    You will be redirected to complete your payment with{" "}
                    {paymentForm.selectedMethod === "spell"
                      ? "Eco Pay Service"
                      : paymentForm.selectedMethod === "paypal"
                        ? "PayPal Secure Checkout"
                        : "Apple Pay Wallet"}{" "}
                    when you press place order.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Ledger Ordered scrolls checklist */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#fcfbf9] dark:bg-dark-card border border-earth-brown/10 rounded-[2.5rem] p-6 shadow-xl space-y-6">
            <h3 className="font-serif text-lg font-bold text-earth-brown dark:text-dark-text uppercase tracking-wide border-b border-earth-brown/10 dark:border-white/5 pb-3">
              Your Books
            </h3>

            <div className="space-y-4 max-h-[290px] overflow-y-auto pr-1">
              {cart.map((item, idx) => (
                <div
                  key={`${item.book.id}-${item.format}-${idx}`}
                  className="flex gap-3 items-center"
                >
                  <img
                    src={item.book.coverImage}
                    alt={item.book.title}
                    className="w-10 h-14 rounded-lg object-cover shadow-md flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-serif font-bold text-earth-brown dark:text-dark-text truncate leading-relaxed">
                      {item.book.title}
                    </h4>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-sans font-bold bg-[#ebe3d3] dark:bg-dark-bg text-earth-brown/70 dark:text-dark-text select-none uppercase tracking-widest font-mono">
                      {item.format}
                    </span>
                    <span className="text-[10px] text-earth-brown/40 dark:text-dark-muted ml-2">
                      Qty: {item.quantity}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-earth-brown dark:text-dark-text flex-shrink-0">
                    $
                    {(
                      (item.book.discountPrice || item.book.price) *
                      item.quantity
                    ).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-earth-brown/10 dark:border-white/5 pt-4 space-y-2.5">
              <div className="flex justify-between items-center text-xs text-earth-brown/80 dark:text-dark-muted">
                <span>Subtotal</span>
                <span className="font-mono font-bold">
                  $
                  {cart
                    .reduce(
                      (tot, item) =>
                        tot +
                        (item.book.discountPrice || item.book.price) *
                          item.quantity,
                      0
                    )
                    .toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-earth-brown/80 dark:text-dark-muted">
                <span>Shipping Fee</span>
                <span className="text-[10px] font-bold text-moss-green uppercase">
                  {hasPhysicalBooks
                    ? shippingForm.deliveryMethod === "courier"
                      ? "$4.99"
                      : shippingForm.deliveryMethod === "wind"
                        ? "$14.99"
                        : "Free Delivery"
                    : "Free Digital Delivery"}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-earth-brown/80 dark:text-dark-muted">
                <span>Estimated Taxes (8%)</span>
                <span className="font-mono font-bold">
                  $
                  {(
                    cart.reduce(
                      (tot, item) =>
                        tot +
                        (item.book.discountPrice || item.book.price) *
                          item.quantity,
                      0
                    ) * 0.08
                  ).toFixed(2)}
                </span>
              </div>

              <div className="border-t border-[#ede8db] dark:border-white/5 pt-4 flex justify-between items-center">
                <span className="font-serif text-sm font-bold text-earth-brown dark:text-dark-text">
                  Grand Total
                </span>
                <div className="text-right">
                  <span className="font-mono text-xl font-bold text-earth-brown dark:text-dark-text">
                    $
                    {(
                      cart.reduce(
                        (tot, item) =>
                          tot +
                          (item.book.discountPrice || item.book.price) *
                            item.quantity,
                        0
                      ) *
                        1.08 +
                      (hasPhysicalBooks
                        ? shippingForm.deliveryMethod === "courier"
                          ? 4.99
                          : shippingForm.deliveryMethod === "wind"
                            ? 14.99
                            : 0
                        : 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-moss-green hover:bg-[#34442a] text-white text-xs font-serif font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-moss-green/15 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Place Order Now <ShieldCheck size={14} />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[9px] text-earth-brown/40 dark:text-dark-muted uppercase font-bold tracking-widest">
              <Globe2 size={11} className="text-moss-green" /> 100% Secure Checkout Guaranteed by SSL
            </div>
          </div>
        </div>
      </form>
    </main>
  );
};
