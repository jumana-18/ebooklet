import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Settings, CreditCard, Bell, Shield, LogOut, ArrowLeft, BookOpen, Clock, Heart, 
  ShoppingBag, Mail, Lock, Eye, EyeOff, KeyRound, Sparkles, CheckCircle2, ChevronRight, 
  Bookmark, Coins, Compass, Library, Globe, Plus, Trash2, Edit2, Check, HelpCircle, 
  FileText, ArrowUpRight, Award, Flame, Milestone, Send, EyeIcon, BookMarked, Phone, RefreshCw, Upload, X, Image
} from 'lucide-react';
import { useAuth, Address, SanctuaryOrder } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { BOOKS } from '../constants';
import { api } from '../services/api';

export const ProfileView = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    savedAddresses: rawSavedAddresses,
    orders: rawOrders,
    login,
    signup,
    logout,
    requestOTP,
    validateOTP,
    resetPassword,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    reorderItems
  } = useAuth();

  const { addToCart, wishlist: rawWishlist } = useShop();

  const savedAddresses = Array.isArray(rawSavedAddresses) ? rawSavedAddresses : [];
  const orders = Array.isArray(rawOrders) ? rawOrders : [];
  const wishlist = Array.isArray(rawWishlist) ? rawWishlist : [];

  const navigate = useNavigate();
  const location = useLocation();

  // Authentication Flow states: 'login' | 'signup' | 'otp' | 'forgot' | 'reset-confirmed'
  const [authView, setAuthView] = useState<'login' | 'signup' | 'otp' | 'forgot'>('login');

  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [authError, setAuthError] = useState('');

  // Sign up step-by-step states
  const [signupStep, setSignupStep] = useState(1); // 1: Bio data, 2: Avatar & genres, 3: Goals setting
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAvatar, setRegAvatar] = useState('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [dailyGoal, setDailyGoal] = useState(30);
  const [signupIsDragging, setSignupIsDragging] = useState(false);

  const handleAvatarFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      triggerLocalNotification('Please select a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setRegAvatar(e.target.result as string);
        triggerLocalNotification('Custom profile picture loaded!');
      }
    };
    reader.readAsDataURL(file);
  };

  // OTP and Verification States
  const [otpCode, setOtpCode] = useState(['', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(59);
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  // Recovery views
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  // Dashboard layout tabs: 'desk' | 'orders' | 'addresses' | 'settings' | 'collections'
  const [activeTab, setActiveTab] = useState<'desk' | 'orders' | 'addresses' | 'settings' | 'collections'>('desk');

  // Interactive local modifiers (address dialog / wizard, etc.)
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addrLabel, setAddrLabel] = useState('Home');
  const [addrRecipient, setAddrRecipient] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrProvince, setAddrProvince] = useState('');
  const [addrZip, setAddrZip] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  // Staggered notification overlay triggers
  const [notifText, setNotifText] = useState<string | null>(null);

  const triggerLocalNotification = (text: string) => {
    setNotifText(text);
    setTimeout(() => {
      setNotifText(null);
    }, 3000);
  };

  // Preset customizable fantasy avatars for onboard selection
  const AVATAR_PRESETS = [
    { title: 'Elven Druid', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
    { title: 'Mage Scholar', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
    { title: 'Ranger Scout', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200' },
    { title: 'Royal Archivist', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' },
    { title: 'Forest Warden', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200' },
    { title: 'Starry Seeker', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' }
  ];

  const GENRE_PRESETS = [
    'Fantasy', 'Mythology', 'Folklore', 'Ancient History', 'Nature & Poetry', 'Alchemical Science', 'Medieval Lore', 'Cosmic Mystery'
  ];

  // OTP countdown logic
  useEffect(() => {
    let interval: any;
    if (authView === 'otp' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authView, otpTimer]);

  // Auth Handling Form Submissions
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!loginEmail || !loginPassword) {
      setAuthError('Please enter both your email and password.');
      return;
    }
    try {
      const success = await login(loginEmail, loginPassword);
      if (success) {
        triggerLocalNotification('Welcome back! Logging you in...');
        navigate('/profile');
      }
    } catch (e: any) {
      setAuthError('Incorrect email or password. Please try again.');
    }
  };

  const handleSignupSubmit = async () => {
    setAuthError('');
    if (regPassword !== regConfirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }
    
    if (regEmail) {
      try {
        await signup({
          name: regName,
          email: regEmail,
          password: regPassword,
          phone: regPhone,
          avatar: regAvatar,
          favoriteGenres: selectedGenres,
          readingGoalMinutes: dailyGoal
        });
        triggerLocalNotification('Account created successfully! Welcome!');
        setAuthView('login');
        setSignupStep(1);
        navigate('/');
      } catch (err: any) {
        setAuthError(err?.message || 'Failed to create account.');
      }
    } else {
      setAuthError('Email is required.');
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const joined = otpCode.join('');
    if (joined.length < 4) {
      setAuthError('Code is incomplete.');
      return;
    }

    const isValid = await validateOTP(joined);
    if (isValid) {
      // Complete signing up or simulated sign-in
      if (regEmail) {
        await signup({
          name: regName,
          email: regEmail,
          phone: regPhone,
          avatar: regAvatar,
          favoriteGenres: selectedGenres,
          readingGoalMinutes: dailyGoal
        });
        triggerLocalNotification('Account created successfully! Welcome!');
        setAuthView('login');
        setSignupStep(1);
        navigate('/');
      } else {
        // Safe standard login
        await login('elara@woodland.com', 'pwd');
        triggerLocalNotification('Logged in successfully!');
        navigate('/');
      }
    } else {
      setAuthError('Incorrect code. Try "1234" to bypass.');
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) return;
    const success = await resetPassword(recoveryEmail);
    if (success) {
      setRecoverySent(true);
      triggerLocalNotification('An email has been sent to recover your password.');
    }
  };

  const resendOTP = async () => {
    setOtpTimer(59);
    setOtpCode(['', '', '', '']);
    await requestOTP(regEmail || 'seeker@sanctuary.com');
    triggerLocalNotification('Verification code resent successfully.');
  };

  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    if (!clean) return;

    const nextCode = [...otpCode];
    nextCode[index] = clean.slice(-1);
    setOtpCode(nextCode);

    // Auto-focus next input
    if (index < 3 && clean) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  // Address Dialog operations
  const openNewAddressModal = () => {
    setEditingAddress(null);
    setAddrLabel('Home');
    setAddrRecipient(user?.name || '');
    setAddrStreet('');
    setAddrCity('');
    setAddrProvince('');
    setAddrZip('');
    setAddrPhone(user?.phone || '');
    setAddrIsDefault(savedAddresses.length === 0);
    setShowAddressModal(true);
  };

  const openEditAddressModal = (addr: Address) => {
    setEditingAddress(addr);
    setAddrLabel(addr.label);
    setAddrRecipient(addr.recipientName);
    setAddrStreet(addr.street);
    setAddrCity(addr.city);
    setAddrProvince(addr.province);
    setAddrZip(addr.zipCode);
    setAddrPhone(addr.phone);
    setAddrIsDefault(addr.isDefault);
    setShowAddressModal(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrStreet || !addrCity || !addrRecipient) {
      triggerLocalNotification('Please enter a recipient name and street address.');
      return;
    }

    const payload = {
      label: addrLabel,
      recipientName: addrRecipient,
      street: addrStreet,
      city: addrCity,
      province: addrProvince,
      zipCode: addrZip,
      phone: addrPhone,
      isDefault: addrIsDefault
    };

    if (editingAddress) {
      updateAddress({ ...payload, id: editingAddress.id });
      triggerLocalNotification('Address updated successfully!');
    } else {
      addAddress(payload);
      triggerLocalNotification('Address added successfully!');
    }
    setShowAddressModal(false);
  };

  const handleReorderPress = (order: SanctuaryOrder) => {
    reorderItems(order);
    triggerLocalNotification('Items have been added to your cart. You can now proceed to checkout.');
  };

  const handleDownloadInvoice = (order: SanctuaryOrder) => {
    try {
      const textContent = `
============================================================
              BOOKLET OFFICIAL PURCHASE INVOICE
============================================================
Order Reference: ${order.orderNumber}
Date:            ${order.date}
Customer Name:   ${user?.name || 'Booklet Reader'}
Registered Email:${user?.email || 'unverified@booklet.com'}

Shipping Address Details:
  ${order.addressLabel || 'Digital Delivery'}

------------------------------------------------------------
               P U R C H A S E D   I T E M S
------------------------------------------------------------
${order.items.map((it, idx) => `[${idx+1}] ${it.title} x${it.quantity} (${it.format.toUpperCase()}) --- $${it.price.toFixed(2)}`).join('\n')}

============================================================
Subtotal:                                     $${(order.total * 0.9).toFixed(2)}
Taxes (8%):                                   $${(order.total * 0.08).toFixed(2)}
Handling Fee:                                 $${(order.total * 0.02).toFixed(2)}
------------------------------------------------------------
TOTAL PAID:                                   $${order.total.toFixed(2)}
============================================================
Transaction reference token: INVOICE_${order.id}_VERIFIED
Authorized by Booklet Inc. Standard Checkout Order Verification.
      `;
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${order.orderNumber}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerLocalNotification('Invoice downloaded successfully.');
    } catch(e) {
      console.error(e);
    }
  };

  // Local setting modifier States
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || '');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(user?.readingGoalMinutes || 30);
  const [profileGenres, setProfileGenres] = useState<string[]>(user?.favoriteGenres || []);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [magicGlow, setMagicGlow] = useState(true);

  // States and Ref for Profile Image Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose a valid image file like PNG, JPG or JPEG.');
      triggerLocalNotification('Please select an image file only.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('The image is too large. Choose an image under 5MB.');
      triggerLocalNotification('Image is larger than 5MB.');
      return;
    }

    setUploadError('');
    triggerLocalNotification('Uploading photo to server, please wait...');

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await api.post('/uploads/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.avatarUrl) {
        setProfileAvatar(response.data.avatarUrl);
        triggerLocalNotification('Avatar uploaded and applied! Click Save below to persist.');
      } else {
        setUploadError('Upload succeeded but server did not return the image path.');
      }
    } catch (err: any) {
      console.error('Error during avatar upload:', err);
      const errMsg = err.response?.data?.message || 'Server connection failed while uploading image.';
      setUploadError(errMsg);
      triggerLocalNotification('Upload failed.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
      setProfileAvatar(user.avatar || '');
      setDailyGoalMinutes(user.readingGoalMinutes || 30);
      setProfileGenres(Array.isArray(user.favoriteGenres) ? user.favoriteGenres : []);
    }
  }, [user]);

  const handleProfileSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName) return;
    await updateProfile({
      name: profileName,
      phone: profilePhone,
      avatar: profileAvatar,
      readingGoalMinutes: dailyGoalMinutes,
      favoriteGenres: profileGenres
    });
    triggerLocalNotification('Profile updated successfully!');
  };

  // Loading safety fallback for active authentication synchronization window
  if (isLoading || (isAuthenticated && !user)) {
    return (
      <div className="min-h-screen bg-parchment dark:bg-dark-bg flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-moss-green border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-serif text-earth-brown dark:text-dark-muted">Entering the Woodland Library...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-parchment dark:bg-dark-bg pb-28 selection:bg-moss-green/20 selection:text-[#325a32] relative transition-colors duration-300">
      
      {/* Absolute Staggered Notification Banner */}
      <AnimatePresence>
        {notifText && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 select-none"
          >
            <div className="bg-moss-green/95 dark:bg-dark-card border border-green-500/20 backdrop-blur-xl rounded-2xl p-4 shadow-2xl flex items-start gap-3 justify-center text-center">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse flex-shrink-0" />
              <p className="text-xs text-white dark:text-dark-text font-serif leading-relaxed">
                {notifText}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          /* ========================================================================= */
          /* 1. CINEMATIC AUTHENTICATION SYSTEM (LOGIN, SIGNUP, OTP, FORGOT PWD)        */
          /* ========================================================================= */
          <motion.div
            key="auth-portal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid lg:grid-cols-12 min-h-[calc(100vh-80px)]"
          >
            {/* Left: Atmospheric fantasy Hero Welcome Canvas (visible on lg+) */}
            <div className="lg:col-span-5 bg-[#192219] text-white p-12 overflow-hidden relative flex flex-col justify-between min-h-[400px] lg:min-h-0 border-r border-[#eee5d3]/10">
              
              {/* Forest mist particles atmosphere */}
              <div className="absolute inset-0 bg-radial-gradient from-emerald-900/10 via-black/40 to-black z-0 pointer-events-none opacity-80" />
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-moss-green/20 rounded-full blur-3xl" />
              <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-orange-950/20 rounded-full blur-3xl animate-pulse" />

              {/* Top info */}
              <div className="relative z-10 flex items-center gap-2">
                <Library className="w-6 h-6 text-[#d4a373] animate-pulse" />
                <span className="font-serif text-[10px] uppercase tracking-widest text-[#d4a373]">Booklet Account Portal</span>
              </div>

              {/* Emotional quotes center */}
              <div className="relative z-10 my-auto py-12 space-y-5">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <span className="px-3.5 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold uppercase tracking-wider text-[#d4a373]/90 inline-block">
                    Booklet Verified Member
                  </span>
                  
                  <h2 className="text-4xl lg:text-5xl font-serif font-bold tracking-tight uppercase leading-none">
                    Every story <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e3b88b] to-[#aedcae]">
                      begins with <br/>a single page.
                    </span>
                  </h2>
                </motion.div>

                <p className="text-xs text-[#eedcc9]/70 font-sans max-w-sm leading-relaxed">
                  Join Booklet to save your physical book bookmarks and synchronize your digital reading list inside one unified app.
                </p>

                {/* Micro statistics */}
                <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/5 max-w-xs">
                  <div>
                    <div className="text-lg font-serif font-bold text-[#e3b88b]">24,800+</div>
                    <div className="text-[8px] uppercase tracking-widest text-[#eedcc9]/40 font-bold">Available Books</div>
                  </div>
                  <div>
                    <div className="text-lg font-serif font-bold text-[#e3b88b]">4.9 / 5</div>
                    <div className="text-[8px] uppercase tracking-widest text-[#eedcc9]/40 font-bold">Reader Ratings</div>
                  </div>
                </div>
              </div>

              {/* Bottom guidelines */}
              <div className="relative z-10 text-[9px] text-[#eedcc9]/30 uppercase font-bold tracking-widest flex items-center justify-between">
                <span>© 2026 BOOKLET INC.</span>
                <span>SECURED CONNECTION</span>
              </div>
            </div>

            {/* Right: Interactive state-machine forms */}
            <div className="lg:col-span-7 flex items-center justify-center p-6 md:p-12 relative">
              <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
              
              <div className="w-full max-w-md bg-white/40 dark:bg-dark-card/40 backdrop-blur-xl border border-[#eee5d3] dark:border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl relative">
                
                {/* Visual back buttons if nested */}
                {authView !== 'login' && (
                  <button
                    onClick={() => {
                      setAuthView('login');
                      setAuthError('');
                    }}
                    className="absolute top-6 left-6 text-xs text-earth-brown/50 hover:text-earth-brown dark:text-dark-muted dark:hover:text-dark-text flex items-center gap-1 uppercase tracking-widest font-bold cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                )}

                {/* Authenticator header indicator */}
                <div className="text-center mb-8 space-y-1 select-none">
                  <div className="w-12 h-12 bg-moss-green/10 dark:bg-moss-green/20 rounded-2xl flex items-center justify-center text-moss-green dark:text-emerald-400 mx-auto mb-3">
                    {authView === 'login' && <Lock className="w-5 h-5" />}
                    {authView === 'signup' && <Sparkles className="w-5 h-5 animate-pulse" />}
                    {authView === 'otp' && <Shield className="w-5 h-5" />}
                    {authView === 'forgot' && <KeyRound className="w-5 h-5" />}
                  </div>
                  
                  <h3 className="text-2xl font-serif font-bold text-earth-brown dark:text-dark-text uppercase tracking-tight">
                    {authView === 'login' && "Account Login"}
                    {authView === 'signup' && "Create Account"}
                    {authView === 'otp' && "Verification"}
                    {authView === 'forgot' && "Reset Password"}
                  </h3>
                  <p className="text-xs text-earth-brown/50 dark:text-dark-muted font-sans font-medium">
                    {authView === 'login' && "Access your reading desk and digital books"}
                    {authView === 'signup' && "Begin your reading journey"}
                    {authView === 'otp' && "Authenticating your identity"}
                    {authView === 'forgot' && "We sent a password reset link to your email"}
                  </p>
                </div>

                {/* Form Errors displays if any */}
                {authError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-5 p-3.5 bg-red-400/10 border border-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-center text-xs font-serif leading-snug"
                  >
                    {authError}
                  </motion.div>
                )}

                {/* ACTIVE ANCIENT AUTH SCENARIOS */}
                <AnimatePresence mode="wait">
                  
                  {/* SCENARIO A: LOGIN FORM */}
                  {authView === 'login' && (
                    <motion.form
                      key="login-form-sub"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      onSubmit={handleLoginSubmit}
                      className="space-y-4"
                    >
                      {/* Email input code */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#a89d87] dark:text-dark-muted block">
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            required
                            placeholder="e.g. elara@woodland.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="w-full bg-[#fdfaf2] dark:bg-dark-bg border border-[#e8dfcf] dark:border-white/5 rounded-2xl py-3 pl-10 pr-4 text-xs dark:text-dark-text shadow-xs focus:ring-1 focus:ring-moss-green"
                          />
                          <Mail className="w-4 h-4 text-earth-brown/30 dark:text-dark-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      {/* Password input code */}
                      <div className="space-y-1.5 text-left">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-[#a89d87] dark:text-dark-muted">
                            Password
                          </label>
                          <button
                            type="button"
                            onClick={() => setAuthView('forgot')}
                            className="text-[9px] font-bold uppercase tracking-widest text-[#d4a373] hover:underline cursor-pointer"
                          >
                            Forgot Password?
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Enter password..."
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full bg-[#fdfaf2] dark:bg-dark-bg border border-[#e8dfcf] dark:border-white/5 rounded-2xl py-3 pl-10 pr-10 text-xs dark:text-dark-text shadow-xs focus:ring-1 focus:ring-moss-green"
                          />
                          <Lock className="w-4 h-4 text-earth-brown/30 dark:text-dark-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-earth-brown/40 dark:text-dark-muted hover:text-earth-brown absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Remember & Trust indicators */}
                      <div className="flex items-center justify-between py-1 select-none">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={() => setRememberMe(!rememberMe)}
                            className="rounded border-[#e8dfcf] dark:border-white/5 text-moss-green focus:ring-moss-green w-3.5 h-3.5 bg-white text-xs"
                          />
                          <span className="text-[10px] text-earth-brown/60 dark:text-dark-muted font-medium">Remember me</span>
                        </label>
                        
                        <div className="flex items-center gap-1 font-mono text-[8px] tracking-wider text-[#a89d87] dark:text-dark-muted font-bold uppercase">
                          <Shield size={10} className="text-[#a89d87]" /> Secure Connection
                        </div>
                      </div>

                      {/* Login primary button */}
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoading}
                        type="submit"
                        className={`w-full py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest font-sans transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                          isLoading
                            ? 'bg-moss-green/45 text-white/50 cursor-wait'
                            : 'bg-moss-green hover:bg-[#3d5e3d] text-white shadow-moss-green/15 hover:shadow-xl'
                        }`}
                      >
                        {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        <span>Log In</span>
                      </motion.button>

                      {/* Social loggers */}
                      <div className="relative py-4 select-none">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-[#eee5d3] dark:border-white/5" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="bg-white/80 dark:bg-[#1a201c] px-3.5 py-0.5 text-[8px] font-bold uppercase tracking-widest text-earth-brown/40 dark:text-dark-muted rounded-full border border-earth-brown/5 dark:border-white/5">
                            Quick Log In
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setLoginEmail('elara@woodland.com');
                            setLoginPassword('password');
                            setRegName('Elara Moonwhisper');
                            triggerLocalNotification('Preset Elara credentials loaded.');
                          }}
                          className="w-full py-3 px-4 bg-[#f9f5eb] dark:bg-white/5 hover:bg-[#f3edd9] dark:hover:bg-white/10 text-earth-brown dark:text-dark-text text-xs font-bold uppercase tracking-widest rounded-xl transition-all border border-earth-brown/5 dark:border-none cursor-pointer flex items-center gap-2 justify-center shadow-xs"
                        >
                          <User size={14} className="text-[#d4a373]" /> Elara Preset
                        </button>
                      </div>

                      {/* Not a member */}
                      <div className="pt-6 font-sans text-center text-xs text-earth-brown/60 dark:text-dark-muted">
                        No account yet?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setAuthView('signup');
                            setSignupStep(1);
                            setAuthError('');
                          }}
                          className="font-bold text-moss-green hover:underline cursor-pointer"
                        >
                          Register Now
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {/* SCENARIO B: SIGN UP WIZARD PAGE */}
                  {authView === 'signup' && (
                    <motion.div
                      key="signup-flow-sub"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="space-y-6"
                    >
                      {/* Interactive Onboarding Step indicator */}
                      <div className="flex items-center justify-between pb-3 border-b border-earth-brown/10 dark:border-white/5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#a89d87] dark:text-dark-muted block">
                          Step {signupStep} of 3 — {signupStep === 1 ? "Account Details" : signupStep === 2 ? "Avatar & Interests" : "Reading Goal"}
                        </span>
                        <div className="flex gap-1">
                          {[1, 2, 3].map((stepNumber) => (
                            <div
                              key={stepNumber}
                              className={`h-1.5 rounded-full transition-all duration-300 ${signupStep === stepNumber ? 'w-6 bg-moss-green' : 'w-2 bg-earth-brown/10 dark:bg-white/5'}`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* MULTI STEP INLINE BRANCHES */}
                      {signupStep === 1 && (
                        <div className="space-y-4 text-left">
                          
                          {/* Name Input */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-earth-brown/40 dark:text-dark-muted block">Full Name</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Jane Doe"
                              value={regName}
                              onChange={(e) => setRegName(e.target.value)}
                              className="w-full bg-[#fdfaf2] dark:bg-dark-bg border border-[#e8dfcf] dark:border-white/5 rounded-2xl py-3 px-4 text-xs dark:text-dark-text focus:ring-1 focus:ring-moss-green"
                            />
                          </div>

                          {/* Email Input */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-earth-brown/40 dark:text-dark-muted block">Email Address</label>
                            <input
                              type="email"
                              required
                              placeholder="e.g. user@example.com"
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              className="w-full bg-[#fdfaf2] dark:bg-dark-bg border border-[#e8dfcf] dark:border-white/5 rounded-2xl py-3 px-4 text-xs dark:text-dark-text focus:ring-1 focus:ring-moss-green"
                            />
                          </div>

                          {/* Phone input */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-earth-brown/40 dark:text-dark-muted block">Phone Number</label>
                            <input
                              type="tel"
                              placeholder="+1 (555) 754-0012"
                              value={regPhone}
                              onChange={(e) => setRegPhone(e.target.value)}
                              className="w-full bg-[#fdfaf2] dark:bg-dark-bg border border-[#e8dfcf] dark:border-white/5 rounded-2xl py-3 px-4 text-xs dark:text-dark-text focus:ring-1 focus:ring-moss-green"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3 pb-2">
                            {/* Password input */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-earth-brown/40 dark:text-dark-muted block">Password</label>
                              <input
                                type="password"
                                required
                                placeholder="Create password..."
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                                className="w-full bg-[#fdfaf2] dark:bg-dark-bg border border-[#e8dfcf] dark:border-white/5 rounded-2xl py-3 px-4 text-xs dark:text-dark-text focus:ring-1 focus:ring-moss-green"
                              />
                            </div>
                            
                            {/* Confirm Password input */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-earth-brown/40 dark:text-dark-muted block">Confirm Password</label>
                              <input
                                type="password"
                                required
                                placeholder="Repeat password..."
                                value={regConfirmPassword}
                                onChange={(e) => setRegConfirmPassword(e.target.value)}
                                className="w-full bg-[#fdfaf2] dark:bg-dark-bg border border-[#e8dfcf] dark:border-white/5 rounded-2xl py-3 px-4 text-xs dark:text-dark-text focus:ring-1 focus:ring-moss-green"
                              />
                            </div>
                          </div>

                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              if (!regName || !regEmail || !regPassword) {
                                setAuthError('Please fill in your basic details first.');
                                return;
                              }
                              setAuthError('');
                              setSignupStep(2);
                            }}
                            className="w-full py-3.5 bg-moss-green hover:bg-[#345334] text-white rounded-2xl text-xs font-bold uppercase tracking-widest cursor-pointer shadow-lg shadow-moss-green/10 flex items-center justify-center gap-1.5"
                          >
                            <span>Next: Choose Profile Avatar</span> <ChevronRight size={14} />
                          </motion.button>
                        </div>
                      )}

                      {signupStep === 2 && (
                        <div className="space-y-5 text-left">
                          
                          {/* Choose Preset Character Avatar */}
                          <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-earth-brown/40 dark:text-dark-muted block">
                              Choose a Profile Avatar
                            </label>
                            
                            <div className="grid grid-cols-3 gap-3.5">
                              {AVATAR_PRESETS.map((preset, i) => {
                                const isSel = regAvatar === preset.url;
                                return (
                                  <div
                                    key={i}
                                    onClick={() => setRegAvatar(preset.url)}
                                    className={`p-2 rounded-2xl border text-center cursor-pointer transition-all ${isSel ? 'bg-moss-green/15 border-moss-green scale-105' : 'bg-[#faf7ee] dark:bg-dark-bg hover:bg-[#efead9] border-earth-brown/10 dark:border-white/5'}`}
                                  >
                                    <div className="w-12 h-12 rounded-xl overflow-hidden mx-auto mb-1.5 shadow-md relative border border-white">
                                      <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                                      {isSel && (
                                        <div className="absolute inset-0 bg-moss-green/20 flex items-center justify-center text-white">
                                          <CheckCircle2 size={16} />
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-[8px] font-bold uppercase text-earth-brown truncate dark:text-dark-text">{preset.title}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Custom Drag & Drop / Click Avatar File Uploader */}
                          <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-earth-brown/40 dark:text-dark-muted block">
                              Or Upload a Custom Profile Picture
                            </label>
                            
                            <div
                              onDragOver={(e) => {
                                e.preventDefault();
                                setSignupIsDragging(true);
                              }}
                              onDragLeave={() => setSignupIsDragging(false)}
                              onDrop={(e) => {
                                e.preventDefault();
                                setSignupIsDragging(false);
                                if (e.dataTransfer.files?.length) {
                                  handleAvatarFile(e.dataTransfer.files[0]);
                                }
                              }}
                              onClick={() => document.getElementById('avatar-file-input')?.click()}
                              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                                signupIsDragging 
                                  ? 'border-moss-green bg-moss-green/10' 
                                  : 'border-[#e8dfcf] dark:border-white/10 bg-[#faf7ee]/50 dark:bg-dark-bg/50 hover:bg-[#efead9]/50 hover:border-moss-green/50'
                              }`}
                            >
                              <input
                                id="avatar-file-input"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files?.length) {
                                    handleAvatarFile(e.target.files[0]);
                                  }
                                }}
                              />
                              
                              {regAvatar.startsWith('data:') || !AVATAR_PRESETS.some(preset => preset.url === regAvatar) ? (
                                <div className="relative w-14 h-14 rounded-full overflow-hidden shadow-md border-2 border-moss-green">
                                  <img src={regAvatar} alt="Custom uploaded avatar" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[9px] font-bold uppercase opacity-0 hover:opacity-100 transition-opacity">
                                    Change
                                  </div>
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-earth-brown/5 dark:bg-white/5 flex items-center justify-center text-earth-brown/60 dark:text-dark-text/60">
                                  <Upload size={18} />
                                </div>
                              )}
                              
                              <p className="text-[10px] font-bold text-earth-brown dark:text-dark-text">
                                {regAvatar.startsWith('data:') || !AVATAR_PRESETS.some(preset => preset.url === regAvatar) 
                                  ? 'Custom Profile Picture Loaded ✨' 
                                  : 'Drag & drop image, or click to browse'}
                              </p>
                              <p className="text-[8px] text-earth-brown/40 dark:text-dark-muted">
                                Supports PNG, JPG (Max 5MB)
                              </p>
                            </div>
                          </div>

                          {/* Choose genres */}
                          <div className="space-y-2 select-none">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-earth-brown/40 dark:text-dark-muted block">
                              Select Your Preferred Genres
                            </label>
                            <div className="flex flex-wrap gap-1.5 h-28 overflow-y-auto border border-earth-brown/10 dark:border-white/5 rounded-2xl p-2 bg-[#fdfaf2] dark:bg-dark-bg">
                              {GENRE_PRESETS.map((gen, idx) => {
                                const isSelected = selectedGenres.includes(gen);
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) {
                                        setSelectedGenres(selectedGenres.filter(g => g !== gen));
                                      } else {
                                        setSelectedGenres([...selectedGenres, gen]);
                                      }
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase transition-all border ${
                                      isSelected
                                        ? 'bg-moss-green text-white border-moss-green'
                                        : 'bg-white dark:bg-[#1f1e1d] border-[#e8dfcf] dark:border-white/5 text-earth-brown dark:text-dark-text hover:bg-earth-brown/5'
                                    }`}
                                  >
                                    {gen}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => setSignupStep(1)}
                              className="px-4 py-3.5 bg-earth-brown/10 dark:bg-white/5 rounded-2xl text-xs font-bold uppercase text-earth-brown dark:text-dark-text hover:bg-earth-brown/20 cursor-pointer"
                            >
                              Back
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => setSignupStep(3)}
                              className="flex-1 py-3.5 bg-moss-green hover:bg-[#325232] text-white rounded-2xl text-xs font-bold uppercase tracking-widest cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <span>Next: Reading Goal</span> <ChevronRight size={14} />
                            </button>
                          </div>

                        </div>
                      )}

                      {signupStep === 3 && (
                        <div className="space-y-6 text-left">
                          
                          {/* Reading Goal settings slider */}
                          <div className="space-y-4">
                            <div className="text-center select-none">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-earth-brown/40 dark:text-dark-muted block">Daily Reading Goal</span>
                              <div className="text-4xl font-serif font-bold text-earth-brown dark:text-dark-text mt-1">{dailyGoal}</div>
                              <span className="text-[10px] text-moss-green font-bold uppercase tracking-wider block">Minutes per day</span>
                            </div>

                            <input
                              type="range"
                              min="10"
                              max="180"
                              step="5"
                              value={dailyGoal}
                              onChange={(e) => setDailyGoal(parseInt(e.target.value))}
                              className="w-full accent-moss-green cursor-pointer"
                            />

                            <div className="flex justify-between text-[8px] font-bold uppercase text-[#a89d87] select-none">
                              <span>10 minutes (Casual)</span>
                              <span>180 minutes (Avid Reader)</span>
                            </div>
                          </div>

                          {/* Recommendation preference message */}
                          <div className="bg-[#f0ece1]/50 dark:bg-[#1a231d] border border-earth-brown/5 rounded-2xl p-4 flex items-start gap-3">
                            <Sparkles className="w-4 h-4 text-moss-green flex-shrink-0 mt-0.5" />
                            <p className="text-[10px] text-earth-brown/60 dark:text-dark-muted font-sans leading-relaxed">
                              By setting a daily reading goal, Booklet will customize your dashboard to fit your reading preferences and target speed.
                            </p>
                          </div>

                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => setSignupStep(2)}
                              className="px-4 py-3.5 bg-earth-brown/10 dark:bg-white/5 rounded-2xl text-xs font-bold uppercase text-earth-brown dark:text-dark-text hover:bg-earth-brown/20 cursor-pointer"
                            >
                              Back
                            </button>
                            
                            <button
                              type="button"
                              onClick={handleSignupSubmit}
                              className="flex-1 py-3.5 bg-moss-green hover:bg-[#325232] text-white rounded-2xl text-xs font-bold uppercase tracking-widest cursor-pointer shadow-lg shadow-moss-green/10 flex items-center justify-center gap-1.5"
                            >
                              <Shield size={14} /> <span>Create Account</span>
                            </button>
                          </div>

                        </div>
                      )}

                    </motion.div>
                  )}

                  {/* SCENARIO C: OTP FINTECH PIN-INPUT VERIFICATION */}
                  {authView === 'otp' && (
                    <form key="otp-verification-sub" onSubmit={handleOTPSubmit} className="space-y-6">
                      
                      <div className="space-y-4">
                        <div className="flex justify-center gap-4">
                          {otpCode.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={otpRefs[idx]}
                              type="text"
                              maxLength={1}
                              pattern="[0-9]*"
                              inputMode="numeric"
                              required
                              value={digit}
                              onChange={(e) => handleOtpChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              className="w-14 h-16 bg-[#fdfaf2] dark:bg-dark-bg border-2 border-earth-brown/10 focus:border-moss-green dark:border-white/5 dark:focus:border-moss-green rounded-2xl text-center text-2xl font-mono font-bold text-earth-brown dark:text-dark-text shadow-sm"
                            />
                          ))}
                        </div>

                        <div className="text-center">
                          {otpTimer > 0 ? (
                            <div className="text-xs text-earth-brown/40 dark:text-dark-muted font-medium flex items-center gap-1.5 justify-center">
                              <Clock size={11} /> <span>Code resets in <b>{otpTimer}s</b></span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={resendOTP}
                              className="text-xs text-moss-green font-bold uppercase tracking-wider hover:underline cursor-pointer"
                            >
                              Resend Code
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="bg-earth-brown/5 dark:bg-white/5 border border-earth-brown/10 dark:border-white/5 rounded-xl p-3 text-center text-[10px] text-earth-brown/60 dark:text-dark-muted font-mono leading-relaxed">
                        ⚠️ Simulated sandbox verification alert: Enter any digits (or use <b>1 2 3 4</b>) to authenticate.
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setAuthView('signup')}
                          className="px-4 py-3.5 bg-earth-brown/10 dark:bg-white/5 rounded-2xl text-xs font-bold uppercase text-earth-brown dark:text-dark-text hover:bg-earth-brown/20 cursor-pointer"
                        >
                          Cancel
                        </button>
                        
                        <button
                          type="submit"
                          className="flex-1 py-3.5 bg-moss-green hover:bg-[#325232] text-white rounded-2xl text-xs font-bold uppercase tracking-widest cursor-pointer shadow-lg shadow-moss-green/10 flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 size={14} /> <span>Verify Code</span>
                        </button>
                      </div>

                    </form>
                  )}

                  {/* SCENARIO D: FORGOT PASSWORD RECOVERY PAGE */}
                  {authView === 'forgot' && (
                    <form key="forgot-password-sub" onSubmit={handleForgotPasswordSubmit} className="space-y-5">
                      
                      {!recoverySent ? (
                        <>
                          <div className="space-y-2 text-left">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-earth-brown/40 dark:text-dark-muted block">
                              Email Address
                            </label>
                            <input
                              type="email"
                              required
                              placeholder="e.g. user@example.com"
                              value={recoveryEmail}
                              onChange={(e) => setRecoveryEmail(e.target.value)}
                              className="w-full bg-[#fdfaf2] dark:bg-dark-bg border border-[#e8dfcf] dark:border-white/5 rounded-2xl py-3.5 px-4 text-xs dark:text-dark-text focus:ring-1 focus:ring-moss-green"
                            />
                          </div>

                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full py-3.5 bg-moss-green hover:bg-[#325232] text-white rounded-2xl text-xs font-bold uppercase tracking-widest cursor-pointer shadow-lg shadow-moss-green/10 flex items-center justify-center"
                          >
                            <span>Send Password Reset Link</span>
                          </motion.button>
                        </>
                      ) : (
                        <div className="text-center space-y-4 py-4 select-none">
                          <CheckCircle2 className="w-12 h-12 text-moss-green mx-auto" />
                          <h4 className="font-serif text-lg font-bold text-[#325a32]">Email Dispatched</h4>
                          <p className="text-xs text-earth-brown/60 dark:text-dark-muted font-sans leading-relaxed max-w-xs mx-auto">
                            A reset password recovery link has been successfully sent to <b>{recoveryEmail}</b>. Please check your inbox to proceed.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setAuthView('login');
                              setRecoverySent(false);
                            }}
                            className="text-xs text-moss-green font-bold uppercase tracking-widest hover:underline cursor-pointer"
                          >
                            Return to Login
                          </button>
                        </div>
                      )}

                    </form>
                  )}

                </AnimatePresence>

              </div>
            </div>
          </motion.div>
        ) : (
          
          /* ========================================================================= */
          /* 2. PREMIUM IMMERSIVE USER PROFILE DASHBOARD                                */
          /* ========================================================================= */
          <motion.div
            key="profile-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl mx-auto px-4 py-8 select-none"
          >
            {/* Unified User Header layout */}
            <div className="grid lg:grid-cols-12 gap-8 mb-10 items-stretch">
              
              {/* Profile Card details left */}
              <div className="lg:col-span-8 bg-white/60 dark:bg-dark-card/60 backdrop-blur-xl border border-[#eee5d3] dark:border-white/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 bottom-0 text-[180px] leading-none text-[#526f52]/5 pointer-events-none select-none font-serif font-black">
                  DESK
                </div>

                {/* Avatar with dynamic local preview */}
                <div className="relative group">
                  <div className="w-28 h-28 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-[#2f2b27] bg-[#fdfcf7]">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      // Swap to Settings tab
                      setActiveTab('settings');
                      triggerLocalNotification('Change your avatar in the settings section below.');
                    }}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-moss-green rounded-full flex items-center justify-center text-white border-2 border-white dark:border-dark-bg shadow-md cursor-pointer transition-transform"
                    title="Change Avatar archetype preset"
                  >
                    <Edit2 size={12} />
                  </motion.div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-2 relative">
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <h2 className="text-2xl font-serif font-bold text-earth-brown dark:text-dark-text">{user.name}</h2>
                    <span className="self-center px-3 py-1 bg-moss-green/10 text-[#325a32] dark:bg-moss-green/20 dark:text-emerald-400 rounded-full text-[9px] font-bold uppercase tracking-widest border border-green-500/10">
                      {user.membership}
                    </span>
                  </div>
                  
                  <p className="text-xs text-earth-brown/60 dark:text-dark-muted font-sans font-medium">{user.email} &bull; Joined {user.joinedDate}</p>

                  {/* Loyalty progress points bar */}
                  <div className="pt-2 max-w-sm space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase">
                      <span className="text-[#a89d87] dark:text-dark-muted flex items-center gap-1">
                        <Coins size={11} className="text-[#d4a373] animate-spin-slow" /> Loyalty Points
                      </span>
                      <span className="text-earth-brown dark:text-dark-text">{user.poeticPoints} Points / 500 max</span>
                    </div>
                    <div className="w-full h-1.5 bg-earth-brown/10 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#d4a373] rounded-full" style={{ width: `${(user.poeticPoints / 500) * 100}%` }} />
                    </div>
                    <span className="text-[8px] text-earth-brown/40 dark:text-dark-muted block italic">
                      Collect {500 - user.poeticPoints} more loyalty points for a free printed book reward.
                    </span>
                  </div>
                </div>

                {/* Quick actions info in right corner */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button
                    onClick={logout}
                    className="p-2.5 bg-red-500/5 hover:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl transition-all cursor-pointer border border-red-500/5"
                    title="Logout companion session"
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              </div>

              {/* Quick Reading Streak Achievements Right */}
              <div className="lg:col-span-4 bg-gradient-to-br from-[#192219] to-[#0d140d] border border-[#eee5d3]/10 dark:border-white/5 text-white rounded-[2.5rem] p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-radial-gradient from-moss-green/25 to-transparent pointer-events-none opacity-50" />
                
                <div className="flex justify-between items-start relative z-10 select-none">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#d4a373]">Daily Reading Streak</span>
                    <h3 className="text-3xl font-serif font-black text-white flex items-center gap-1 leading-none">
                      {user.streak} <Flame className="w-6 h-6 text-orange-500 animate-bounce" />
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-yellow-500">
                    <Award className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-3 relative z-10">
                  <p className="text-xs text-[#eedcc9]/80 font-serif leading-relaxed">
                    You have maintained your active daily reading goal for <b>{user.streak} consecutive days</b>. Keep up the amazing progress!
                  </p>

                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-2.5">
                    <Milestone size={14} className="text-emerald-400" />
                    <div className="flex-1 text-[9px] leading-tight text-[#eedcc9]/60 uppercase font-bold tracking-wider">
                      Next milestone: 20-Day Reading Medal
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* TAB SELECTOR DOCK BAR */}
            <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar bg-white/40 dark:bg-[#1a201c] border border-earth-brown/10 dark:border-white/5 p-1.5 rounded-2xl mb-8 select-none">
              {[
                { id: 'desk', label: 'My Bookshelf', icon: BookOpen },
                { id: 'orders', label: 'Order History', icon: FileText, badge: orders.length },
                { id: 'addresses', label: 'Saved Addresses', icon: Globe },
                { id: 'collections', label: 'My Wishlist', icon: Bookmark, badge: wishlist.length },
                { id: 'settings', label: 'Account Settings', icon: Settings }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all flex-shrink-0 ${
                      isActive
                        ? 'bg-moss-green text-white shadow-lg shadow-moss-green/10'
                        : 'text-earth-brown dark:text-dark-muted hover:bg-earth-brown/5 hover:text-earth-brown dark:hover:text-dark-text'
                    }`}
                  >
                    <tab.icon size={14} />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white text-moss-green' : 'bg-[#e8dfcf] dark:bg-white/5 text-earth-brown dark:text-dark-text'}`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ANNOTATED ACTIVE TAB VIEWPORT WITH INTERACTIVE MOTIONS */}
            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                
                {/* TAB 1: SACRED DESK */}
                {activeTab === 'desk' && (
                  <motion.div
                    key="tab-desk"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="grid md:grid-cols-12 gap-8 text-left"
                  >
                    {/* Left details grid: streak analysis */}
                    <div className="md:col-span-8 space-y-8">
                      
                      {/* Genres overview */}
                      <div className="bg-[#fcfaf4] dark:bg-dark-card border border-[#eee5d3] dark:border-white/5 rounded-3xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif text-lg font-bold text-earth-brown dark:text-dark-text flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-moss-green" /> Your Declared Fantasy Interests
                          </h4>
                          <button
                            onClick={() => setActiveTab('settings')}
                            className="text-[10px] font-bold text-moss-green hover:underline uppercase tracking-wider"
                          >
                            Update Interests
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {user.favoriteGenres.map((gen, i) => (
                            <span
                              key={i}
                              className="px-4 py-2 bg-moss-green/5 dark:bg-white/5 border border-moss-green/10 text-moss-green dark:text-[#a6cca6] rounded-xl text-xs font-bold uppercase tracking-wide"
                            >
                              ✨ {gen}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Achievements cards list */}
                      <div className="space-y-4">
                        <h4 className="font-serif text-lg font-bold text-earth-brown dark:text-dark-text">Inscribed Academic Medals</h4>
                        <div className="grid sm:grid-cols-3 gap-4 font-sans text-left">
                          {[
                            { title: 'The Ink Scholar', desc: 'Read more than three dynamic fantasy codices this month.', status: true, pts: '+50 Pinecones' },
                            { title: 'Vault Companion', desc: 'Maintained a five day study reading flame cycle successfully.', status: true, pts: '+100 Pinecones' },
                            { title: 'Physical Alchemist', desc: 'Purchased a verified printed paperbound manuscript.', status: true, pts: '+200 Pinecones' }
                          ].map((medal, i) => (
                            <div key={i} className="bg-white dark:bg-[#1a201c] border border-earth-brown/10 dark:border-white/5 p-4 rounded-2xl flex flex-col justify-between shadow-xs">
                              <div className="space-y-1">
                                <div className="flex items-start justify-between">
                                  <h5 className="font-serif text-xs font-bold text-earth-brown dark:text-dark-text leading-tight">{medal.title}</h5>
                                  <div className="w-6 h-6 rounded-full bg-green-500/15 flex items-center justify-center text-green-600 dark:text-green-400">
                                    <Check className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                                <p className="text-[10px] text-earth-brown/60 dark:text-dark-muted leading-relaxed">{medal.desc}</p>
                              </div>
                              <span className="text-[9px] font-mono text-[#d4a373] font-bold tracking-wider mt-4 block">{medal.pts} Obtained</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Right Info panels: study parameters */}
                    <div className="md:col-span-4 space-y-6">
                      
                      {/* Daily goal circular review info */}
                      <div className="bg-white/80 dark:bg-dark-card border border-earth-brown/10 dark:border-white/5 p-6 rounded-3xl text-center select-none space-y-4">
                        <h4 className="font-serif text-sm font-bold uppercase tracking-widest text-[#a89d87]">Daily Magic Target</h4>
                        
                        {/* Circular ring view */}
                        <div className="w-32 h-32 rounded-full border-8 border-moss-green/15 flex items-center justify-center mx-auto relative">
                          <div className="absolute inset-0 rounded-full border-8 border-moss-green border-t-transparent animate-spin-slow pointer-events-none" />
                          <div className="space-y-0.5">
                            <span className="text-2xl font-serif font-black text-earth-brown dark:text-dark-text">{user.readingGoalMinutes}</span>
                            <span className="text-[8px] text-earth-brown/40 dark:text-dark-muted font-bold block uppercase tracking-wide">Minutes</span>
                          </div>
                        </div>

                        <p className="text-xs text-earth-brown/60 dark:text-dark-muted leading-relaxed">
                          Your current daily reading goal is set to <b>{user.readingGoalMinutes} minutes</b>. Customize this under reading goals.
                        </p>
                      </div>

                      {/* Discover recommendation anchor */}
                      <div className="bg-gradient-to-br from-[#1c2c20] to-[#0d1610] text-white p-6 rounded-3xl space-y-4 shadow-xl relative overflow-hidden">
                        <div className="absolute right-2 bottom-2 text-6xl opacity-15">📚</div>
                        <h4 className="font-serif text-sm font-bold text-[#e1c59e] uppercase tracking-wider">Get Recommendations</h4>
                        <p className="text-[11px] text-[#eee5d3]/70 leading-relaxed font-sans">
                          Get custom reading recommendations tailored to your interests and preferred genres.
                        </p>
                        <button
                          onClick={() => navigate('/discover')}
                          className="w-full py-2 bg-moss-green hover:bg-[#3d5e3d] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer shadow-md flex items-center justify-center gap-1"
                        >
                          <Compass size={11} className="animate-spin-slow" /> Browse New Releases
                        </button>
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* TAB 2: ORDER HISTORIES */}
                {activeTab === 'orders' && (
                  <motion.div
                    key="tab-orders"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between text-left">
                      <h4 className="font-serif text-lg font-bold text-earth-brown dark:text-dark-text uppercase tracking-tight">Your Purchased Books</h4>
                      <span className="text-xs font-semibold text-earth-brown/50 dark:text-dark-muted">Total items: {orders.length}</span>
                    </div>

                    {orders.length === 0 ? (
                      <div className="py-20 text-center space-y-4">
                        <div className="text-6xl animate-bounce mb-3">📚</div>
                        <h4 className="font-serif text-xl font-bold text-earth-brown/50">You haven't purchased any books yet</h4>
                        <p className="text-xs text-earth-brown/40 max-w-sm mx-auto leading-relaxed">
                          "Your digital bookshelf is empty. Browse our collection to select your next read."
                        </p>
                        <button
                          onClick={() => navigate('/')}
                          className="px-6 py-3 bg-moss-green text-white font-bold rounded-2xl text-xs uppercase tracking-widest cursor-pointer hover:bg-moss-green/90"
                        >
                          Browse Books
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div
                            key={order.id}
                            className="bg-white dark:bg-dark-card border border-earth-brown/10 dark:border-white/5 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all text-left"
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-earth-brown/5 dark:border-white/5 select-none">
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#a89d87] block">Order reference</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-bold text-earth-brown dark:text-dark-text">{order.orderNumber}</span>
                                  <span className="text-[10px] text-earth-brown/40 dark:text-dark-muted">on {order.date}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap text-left">
                                <span className="text-[10px] text-earth-brown/40 dark:text-dark-muted font-bold block uppercase pr-2">Total coins paid: <b>${order.total.toFixed(2)}</b></span>
                                
                                <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg border ${
                                  order.status === 'Delivered'
                                    ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/10'
                                    : order.status === 'Processing'
                                      ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/10'
                                      : order.status === 'Cancelled'
                                        ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/10'
                                        : 'bg-amber-500/10 text-amber-700 border-amber-500/10'
                                }`}>
                                  ● {order.status}
                                </span>
                              </div>
                            </div>

                            {/* Books ordered */}
                            <div className="py-4 space-y-3">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-4 p-2.5 rounded-2xl bg-[#faf8f2] dark:bg-dark-bg/50 border border-earth-brown/5 dark:border-white/5">
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-16 rounded-md overflow-hidden shadow-xs border border-earth-brown/5 flex-shrink-0">
                                      <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-left font-sans space-y-1">
                                      <h5 className="font-serif text-xs font-bold text-earth-brown dark:text-dark-text leading-tight">{item.title}</h5>
                                      <p className="text-[10px] text-earth-brown/60 dark:text-dark-muted truncate">by {item.author}</p>
                                      
                                      <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded-md ${item.format === 'physical' ? 'bg-[#e3b88b]/15 text-orange-800 dark:text-orange-400' : 'bg-moss-green/10 text-[#325a32]'}`}>
                                          {item.format === 'physical' ? 'Printed Codex' : 'Digital Ebook'}
                                        </span>
                                        <span className="text-[10px] text-earth-brown/40 dark:text-dark-muted font-bold">Qty: {item.quantity}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <span className="font-mono text-xs font-bold text-moss-green">${item.price}</span>
                                </div>
                              ))}
                            </div>

                            {/* Order history actionable controls */}
                            <div className="pt-4 border-t border-earth-brown/5 dark:border-white/5 flex items-center gap-2.5 flex-wrap justify-end">
                              <button
                                onClick={() => handleDownloadInvoice(order)}
                                className="px-4 py-2 hover:bg-[#faf7ee] border border-earth-brown/10 dark:border-white/5 text-earth-brown dark:text-dark-text rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all"
                              >
                                Download Invoice
                              </button>

                              <button
                                onClick={() => handleReorderPress(order)}
                                className="px-4 py-2 bg-earth-brown/10 hover:bg-earth-brown/15 dark:bg-white/5 dark:hover:bg-white/10 text-earth-brown dark:text-dark-text rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all border border-[#eee5d3]/5"
                              >
                                Re-purchase
                              </button>

                              {/* Physical elements get tracking, digital files get view keys */}
                              {order.status === 'Cancelled' ? (
                                <button
                                  disabled
                                  className="px-4 py-2 bg-red-500/10 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-not-allowed border border-red-500/10 dark:border-red-500/5 opacity-70"
                                >
                                  Cancelled
                                </button>
                              ) : order.items.some(it => it.format === 'physical') ? (
                                <button
                                  onClick={() => navigate(`/tracking?orderId=${order.orderNumber}`)}
                                  className="px-4 py-2 bg-moss-green hover:bg-[#345034] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all shadow-md shadow-moss-green/10 flex items-center gap-1.5"
                                >
                                  <span>Track Package</span> <ArrowUpRight size={12} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => navigate('/library')}
                                  className="px-4 py-2 bg-moss-green hover:bg-[#325032] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all shadow-md shadow-moss-green/10 flex items-center gap-1"
                                >
                                  <Library size={11} /> <span>Open Library</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* TAB 3: COORDINATES (ADDRESSES MANAGEMENT) */}
                {activeTab === 'addresses' && (
                  <motion.div
                    key="tab-addr"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between text-left">
                      <div className="space-y-1">
                        <h4 className="font-serif text-lg font-bold text-earth-brown dark:text-dark-text uppercase tracking-tight">Shipping Addresses</h4>
                        <p className="text-xs text-earth-brown/50 dark:text-dark-muted">Manage your shipping addresses to speed up checkout</p>
                      </div>
                      
                      <button
                        onClick={openNewAddressModal}
                        className="px-4 py-3 bg-moss-green hover:bg-moss-green/90 text-white rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer flex items-center gap-1"
                      >
                        <Plus size={14} /> Add Address
                      </button>
                    </div>

                    {/* Addresses grid list */}
                    {savedAddresses.length === 0 ? (
                      <div className="py-20 text-center border-2 border-dashed border-earth-brown/15 rounded-3xl p-8">
                        <Globe className="w-12 h-12 text-[#d4a373] mx-auto animate-spin-slow" />
                        <h5 className="font-serif text-lg font-bold text-earth-brown/50 mt-4">Saved addresses list is empty</h5>
                        <p className="text-xs text-earth-brown/40 max-w-sm mx-auto mt-2">
                          Enter your home shipping address so our delivery partners can deliver your physical book orders.
                        </p>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-5 text-left">
                        {savedAddresses.map((addr) => (
                          <div
                            key={addr.id}
                            className={`bg-white/80 dark:bg-dark-card/80 backdrop-blur-md rounded-3xl p-6 border transition-all flex flex-col justify-between shadow-xs ${
                              addr.isDefault
                                ? 'border-moss-green bg-gradient-to-br from-moss-green/5 to-transparent'
                                : 'border-[#eee5d3] dark:border-white/5 hover:border-earth-brown/20'
                            }`}
                          >
                            <div className="space-y-4">
                              <div className="flex justify-between items-start">
                                <span className="px-3 py-1 bg-[#fbf9f4] dark:bg-white/5 border border-[#eee5d3] dark:border-white/5 text-[9px] font-serif font-black uppercase text-earth-brown dark:text-dark-text rounded-lg">
                                  {addr.label}
                                </span>
                                {addr.isDefault && (
                                  <span className="text-[9px] text-moss-green font-black uppercase tracking-widest flex items-center gap-1 select-none">
                                    <CheckCircle2 size={12} /> DEFAULT MAP
                                  </span>
                                )}
                              </div>

                              <div className="font-sans space-y-2">
                                <h5 className="text-sm font-bold text-earth-brown dark:text-dark-text">{addr.recipientName}</h5>
                                <p className="text-xs text-earth-brown/70 dark:text-dark-muted leading-relaxed">
                                  {addr.street} <br/>
                                  {addr.city}, {addr.province} &bull; {addr.zipCode}
                                </p>
                                <div className="text-[10px] text-[#a89d87] dark:text-dark-muted flex items-center gap-1 pr-4">
                                  <Phone size={10} /> <b>Owl carrier: </b> {addr.phone}
                                </div>
                              </div>
                            </div>

                            <div className="pt-4 border-t border-earth-brown/5 dark:border-white/5 mt-6 flex items-center gap-2 justify-end">
                              {!addr.isDefault && (
                                <button
                                  onClick={() => {
                                    setDefaultAddress(addr.id);
                                    triggerLocalNotification(`Address "${addr.label}" is set as default.`);
                                  }}
                                  className="text-[10px] font-bold text-earth-brown/50 hover:text-earth-brown dark:text-dark-muted dark:hover:text-dark-text uppercase tracking-widest mr-auto"
                                >
                                  Mark core Maps
                                </button>
                              )}

                              <button
                                onClick={() => openEditAddressModal(addr)}
                                className="p-2 bg-earth-brown/5 hover:bg-earth-brown/10 dark:bg-white/5 text-earth-brown dark:text-dark-text rounded-lg transition-colors cursor-pointer"
                                title="Edit coordinates directions"
                              >
                                <Edit2 size={12} />
                              </button>

                              <button
                                onClick={() => {
                                  deleteAddress(addr.id);
                                  triggerLocalNotification('Address deleted successfully.');
                                }}
                                className="p-2 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors cursor-pointer"
                                title="Discard shipping address record"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ADDRESS MODAL DIALOG POPUP */}
                    {showAddressModal && (
                      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-white dark:bg-dark-card rounded-3xl w-full max-w-lg p-6 md:p-8 space-y-5 shadow-2xl relative border border-[#eee5d3] dark:border-white/5"
                        >
                          <h4 className="font-serif text-lg font-bold text-earth-brown dark:text-dark-text uppercase text-left">
                            {editingAddress ? "Inscribe Edited Directions" : "Inscribe New Address Coordinates"}
                          </h4>

                          <form onSubmit={handleSaveAddress} className="space-y-4 text-left">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-earth-brown/40 dark:text-dark-muted block">Address Label</label>
                                <select
                                  value={addrLabel}
                                  onChange={(e) => setAddrLabel(e.target.value)}
                                  className="w-full bg-[#fdfaf2] dark:bg-dark-bg border border-[#e8dfcf] dark:border-white/5 rounded-2xl py-2 px-3 text-xs dark:text-dark-text"
                                >
                                  <option value="Home">Home Address</option>
                                  <option value="Office">Office Address</option>
                                  <option value="Cabin">Rural / Other Address</option>
                                  <option value="Other">Other Address</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-earth-brown/40 dark:text-dark-muted block">Recipient Citizen Full name</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. Master Archimedes"
                                  value={addrRecipient}
                                  onChange={(e) => setAddrRecipient(e.target.value)}
                                  className="w-full bg-[#fdfaf2] dark:bg-dark-bg border border-[#e8dfcf] dark:border-white/5 rounded-2xl py-2 px-3 text-xs dark:text-dark-text focus:ring-1 focus:ring-moss-green"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-earth-brown/40 dark:text-dark-muted block">Hollow & Street directions</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. 14 Whisperwood Hollow, Canopy Crests"
                                value={addrStreet}
                                onChange={(e) => setAddrStreet(e.target.value)}
                                className="w-full bg-[#fdfaf2] dark:bg-dark-bg border border-[#e8dfcf] dark:border-white/5 rounded-2xl py-2.5 px-3 text-xs dark:text-dark-text focus:ring-1 focus:ring-moss-green"
                              />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-earth-brown/40 block">Realm City</label>
                                <input
                                  type="text"
                                  required
                                  value={addrCity}
                                  onChange={(e) => setAddrCity(e.target.value)}
                                  className="w-full bg-[#fdfaf2] dark:bg-dark-bg border border-earth-brown/10 dark:border-white/5 rounded-2xl py-2 px-3 text-xs dark:text-dark-text"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-earth-brown/40 block">State / Province</label>
                                <input
                                  type="text"
                                  required
                                  value={addrProvince}
                                  onChange={(e) => setAddrProvince(e.target.value)}
                                  className="w-full bg-[#fdfaf2] dark:bg-dark-bg border border-earth-brown/10 dark:border-white/5 rounded-2xl py-2 px-3 text-xs dark:text-dark-text"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-earth-brown/40 block">Postal Code / ZIP</label>
                                <input
                                  type="text"
                                  required
                                  value={addrZip}
                                  onChange={(e) => setAddrZip(e.target.value)}
                                  className="w-full bg-[#fdfaf2] dark:bg-dark-bg border border-earth-brown/10 dark:border-white/5 rounded-2xl py-2 px-3 text-xs dark:text-dark-text"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pb-2">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-earth-brown/40 block">Phone Number</label>
                                <input
                                  type="tel"
                                  required
                                  value={addrPhone}
                                  onChange={(e) => setAddrPhone(e.target.value)}
                                  className="w-full bg-[#fdfaf2] dark:bg-dark-bg border border-earth-brown/10 dark:border-white/5 rounded-2xl py-2 px-3 text-xs dark:text-dark-text"
                                />
                              </div>

                              <div className="flex items-center gap-2 pt-5 pl-2">
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={addrIsDefault}
                                    onChange={() => setAddrIsDefault(!addrIsDefault)}
                                    className="rounded border-[#e8dfcf] text-moss-green focus:ring-moss-green w-3.5 h-3.5"
                                  />
                                  <span className="text-[10px] text-earth-brown/60 dark:text-dark-muted font-bold uppercase">Default maps classification?</span>
                                </label>
                              </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                              <button
                                type="button"
                                onClick={() => setShowAddressModal(false)}
                                className="px-4 py-3 border border-earth-brown/10 text-earth-brown dark:text-dark-muted rounded-2xl text-xs uppercase font-bold cursor-pointer hover:bg-earth-brown/5"
                              >
                                Dismiss
                              </button>
                              
                              <button
                                type="submit"
                                className="px-5 py-3 bg-moss-green text-white rounded-2xl text-xs uppercase font-bold cursor-pointer hover:bg-moss-green/90 shadow-md flex items-center gap-1"
                              >
                                <Check size={14} /> Save Directions
                              </button>
                            </div>
                          </form>
                        </motion.div>
                      </div>
                    )}

                  </motion.div>
                )}

                {/* TAB 4: FANTASY WISHLIST & COLLECTIONS */}
                {activeTab === 'collections' && (
                  <motion.div
                    key="tab-collections"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between text-left select-none">
                      <div className="space-y-1">
                        <h4 className="font-serif text-lg font-bold text-earth-brown dark:text-dark-text uppercase tracking-tight">Your Saved Wishlist</h4>
                        <p className="text-xs text-earth-brown/50 dark:text-dark-muted">Your wishlist items saved to your account</p>
                      </div>
                    </div>

                    {wishlist.length === 0 ? (
                      <div className="py-24 text-center space-y-4">
                        <div className="text-6xl animate-pulse">🌸</div>
                        <h4 className="font-serif text-xl font-bold text-earth-brown/40">Your wishlist is empty</h4>
                        <p className="text-xs text-earth-brown/40 dark:text-dark-muted max-w-sm mx-auto leading-relaxed">
                          "Browse books and click the heart icon to save items to your wishlist."
                        </p>
                        <button
                          onClick={() => navigate('/')}
                          className="px-6 py-3.5 bg-moss-green hover:bg-[#325232] text-white rounded-2xl text-xs font-bold uppercase tracking-widest cursor-pointer shadow-lg transition-transform"
                        >
                          Browse Books
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 text-left">
                        {wishlist.map((book) => (
                          <div
                            key={book.id}
                            className="bg-white/90 dark:bg-[#1c221e] border border-earth-brown/10 dark:border-white/5 rounded-3xl p-3 flex flex-col justify-between group shadow-xs hover:shadow-md transition-all relative overflow-hidden"
                          >
                            <div>
                              {/* Covered images */}
                              <div className="aspect-[3/4.2] rounded-2xl overflow-hidden relative shadow-md border border-earth-brown/5 bg-[#eeeae0] dark:bg-dark-bg cursor-pointer" onClick={() => navigate(`/book/${book.id}`)}>
                                <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                <div className="absolute top-2 right-2 flex items-center justify-center bg-white/85 p-2 rounded-xl text-red-500 shadow-md border border-earth-brown/5">
                                  <Heart size={14} fill="currentColor" />
                                </div>
                              </div>
                              
                              <div className="mt-3.5 space-y-1">
                                <h5 className="font-serif text-xs font-bold text-earth-brown dark:text-dark-text leading-tight truncate group-hover:text-moss-green transition-colors cursor-pointer" onClick={() => navigate(`/book/${book.id}`)}>
                                  {book.title}
                                </h5>
                                <p className="text-[10px] text-earth-brown/50 dark:text-dark-muted truncate">by {book.author}</p>
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-earth-brown/5 dark:border-white/5 flex items-center justify-between gap-1 select-none">
                              <span className="font-mono text-xs font-bold text-moss-green">${book.price}</span>
                              <button
                                onClick={() => {
                                  addToCart(book, 1);
                                  triggerLocalNotification(`Added "${book.title}" to your cart!`);
                                }}
                                className="px-2.5 py-1.5 bg-moss-green hover:bg-moss-green/90 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                              >
                                <span>Add Cart</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* TAB 5: ACCOUNT SACRED SETTINGS */}
                {activeTab === 'settings' && (
                  <motion.div
                    key="tab-settings"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="grid md:grid-cols-12 gap-8 text-left"
                  >
                    
                    {/* Left pane details: credentials change form */}
                    <div className="md:col-span-8 bg-[#faf9f4] dark:bg-dark-card/60 p-6 md:p-8 border border-[#eee5d3] dark:border-white/5 rounded-[2rem] space-y-6">
                      <h4 className="font-serif text-lg font-bold text-earth-brown dark:text-dark-text border-b border-earth-brown/15 pb-2">Account Details</h4>

                      <form onSubmit={handleProfileSettingsSave} className="space-y-4 font-sans">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-earth-brown/40 block">Display Name</label>
                            <input
                              type="text"
                              required
                              value={profileName}
                              onChange={(e) => setProfileName(e.target.value)}
                              className="w-full bg-[#fdfaf2] dark:bg-dark-bg border border-[#e8dfcf] dark:border-[#2f2b27] rounded-all py-2.5 px-3 text-xs dark:text-dark-text focus:ring-1 focus:ring-moss-green"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-[#a89d87] block">Phone Number</label>
                            <input
                              type="text"
                              required
                              value={profilePhone}
                              onChange={(e) => setProfilePhone(e.target.value)}
                              className="w-full bg-[#fdfaf2] dark:bg-dark-bg border border-[#e8dfcf] dark:border-[#2f2b27] rounded-all py-2.5 px-3 text-xs dark:text-dark-text focus:ring-1 focus:ring-moss-green"
                            />
                          </div>
                        </div>

                        {/* Custom Profile Image Upload */}
                        <div className="space-y-2 pt-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-[#a89d87] block">Profile Photo Upload</label>
                          
                          <div className="flex flex-col sm:flex-row gap-4 items-center">
                            {/* Image Preview Window */}
                            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-earth-brown/10 bg-white dark:bg-dark-bg flex items-center justify-center group flex-shrink-0 shadow-sm">
                              {profileAvatar ? (
                                <img src={profileAvatar} alt="Profile preview" className="w-full h-full object-cover" />
                              ) : (
                                <User size={24} className="text-earth-brown/30" />
                              )}
                              
                              {profileAvatar && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (user) {
                                      setProfileAvatar(user.avatar);
                                      triggerLocalNotification('Reverted to current profile photo.');
                                    }
                                  }}
                                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                                  title="Reset to current photo"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>

                            {/* Drop & Select Zone */}
                            <div
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              onClick={() => fileInputRef.current?.click()}
                              className={`flex-1 w-full border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                                isDragging 
                                  ? 'border-moss-green bg-moss-green/5' 
                                  : 'border-earth-brown/15 hover:border-moss-green dark:border-white/10 dark:hover:border-moss-green bg-white dark:bg-dark-bg'
                              }`}
                            >
                              <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                accept="image/*" 
                                className="hidden" 
                              />
                              <Upload size={16} className="text-moss-green" />
                              <div>
                                <p className="text-xs font-bold text-earth-brown dark:text-dark-text">
                                  Drag your photo here, or <span className="text-moss-green underline">click to upload</span>
                                </p>
                                <p className="text-[9px] text-earth-brown/50 dark:text-dark-muted mt-0.5">
                                  PNG, JPG, or JPEG up to 5MB
                                </p>
                              </div>
                            </div>
                          </div>

                          {uploadError && (
                            <p className="text-xs text-red-500 font-medium text-left">{uploadError}</p>
                          )}
                        </div>

                        {/* Presets avatars inside details settings */}
                        <div className="space-y-3.5 pt-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-earth-brown/40 block">Or Choose an Avatar Preset</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {AVATAR_PRESETS.map((preset, idx) => {
                              const isSel = profileAvatar === preset.url;
                              return (
                                <div
                                  key={idx}
                                  onClick={() => setProfileAvatar(preset.url)}
                                  className={`p-1.5 rounded-xl border text-center cursor-pointer transition-all ${isSel ? 'bg-moss-green/10 border-moss-green ring-1 ring-moss-green' : 'bg-white dark:bg-dark-bg border-earth-brown/10 dark:border-white/5 hover:bg-[#faf7ee]'}`}
                                >
                                  <div className="w-10 h-10 rounded-lg overflow-hidden mx-auto mb-1">
                                    <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                                  </div>
                                  <span className="text-[8px] font-bold uppercase text-earth-brown dark:text-dark-text block truncate">{preset.title}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Declare interests / Favourite Genres */}
                        <div className="space-y-3 pt-4 border-t border-earth-brown/5 dark:border-[#2f2b27] text-left">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-earth-brown/40 block">
                            Update Preferred Genres & Interests
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {GENRE_PRESETS.map((gen, idx) => {
                              const isSelected = profileGenres.includes(gen);
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    if (isSelected) {
                                      setProfileGenres(profileGenres.filter(g => g !== gen));
                                    } else {
                                      setProfileGenres([...profileGenres, gen]);
                                    }
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all duration-200 border cursor-pointer ${
                                    isSelected
                                      ? 'bg-moss-green text-white border-moss-green shadow-xs'
                                      : 'bg-white dark:bg-[#1a201c] border-earth-brown/10 dark:border-white/5 text-earth-brown dark:text-dark-text hover:bg-[#faf7ee] dark:hover:bg-[#252525]'
                                  }`}
                                >
                                  {isSelected ? `✨ ${gen}` : gen}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Adjust studies minutes goals */}
                        <div className="space-y-2 pt-4 border-t border-earth-brown/5 dark:border-[#2f2b27]">
                          <div className="flex justify-between text-[10px] font-bold uppercase text-[#a89d87]">
                            <span>Daily studying target minutes</span>
                            <span className="text-moss-green font-bold text-xs">{dailyGoalMinutes} Minutes / Day</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="180"
                            step="5"
                            value={dailyGoalMinutes}
                            onChange={(e) => setDailyGoalMinutes(parseInt(e.target.value))}
                            className="w-full accent-moss-green cursor-pointer"
                          />
                        </div>

                        <div className="pt-4 flex justify-end">
                          <button
                            type="submit"
                            className="px-6 py-3 bg-moss-green hover:bg-[#325232] text-white rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer shadow-md flex items-center gap-1"
                          >
                            <CheckCircle2 size={13} /> Save Account Changes
                          </button>
                        </div>
                      </form>

                      {/* Password reset trigger inside panel */}
                      <div className="pt-6 border-t border-earth-brown/10 dark:border-[#2f2b27] space-y-4">
                        <h5 className="font-serif text-sm font-bold uppercase tracking-wider text-[#a89d87]">Credentials & Security</h5>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                          <div className="space-y-1 text-left">
                            <h6 className="text-xs font-bold text-[#c28442]">Reset Password</h6>
                            <p className="text-[10px] text-earth-brown/60 dark:text-dark-muted font-sans leading-relaxed">
                              Send a password reset link to securely update your account password.
                            </p>
                          </div>
                          <button
                            onClick={async () => {
                              await resetPassword(user.email);
                              triggerLocalNotification(`Password reset email has been sent to ${user.email}.`);
                            }}
                            className="px-4 py-2 hover:bg-amber-500/10 border border-[#b27838] text-[#936029] dark:text-[#f8cc9b] rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                          >
                            Send Reset Email
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Right preferences cards toggles */}
                    <div className="md:col-span-4 space-y-6 select-none font-sans text-left">
                      
                      {/* Sub toggles alerts */}
                      <div className="bg-white dark:bg-[#1a201c] border border-earth-brown/10 dark:border-white/5 p-6 rounded-3xl space-y-5 shadow-xs">
                        <h4 className="font-serif text-sm font-bold uppercase tracking-widest text-[#a89d87] border-b border-earth-brown/5 pb-2">Preferences</h4>

                        <div className="space-y-4">
                          {[
                            { title: 'Email Notifications', desc: 'Receive email receipts and account updates.', val: emailAlerts, set: setEmailAlerts },
                            { title: 'Interactive Glow Effects', desc: 'Enables subtle ambient glow effects around selected items.', val: magicGlow, set: setMagicGlow }
                          ].map((tog, idx) => (
                            <div key={idx} className="flex items-start justify-between gap-4">
                              <div className="space-y-0.5">
                                <h5 className="text-[11px] font-bold text-earth-brown dark:text-dark-text uppercase font-sans tracking-wide leading-tight">{tog.title}</h5>
                                <p className="text-[9px] text-earth-brown/50 dark:text-dark-muted leading-tight">{tog.desc}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  tog.set(!tog.val);
                                  triggerLocalNotification(`Feature toggled to: ${!tog.val ? 'On' : 'Off'}`);
                                }}
                                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${tog.val ? 'bg-moss-green' : 'bg-earth-brown/15 dark:bg-white/5'}`}
                              >
                                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${tog.val ? 'translate-x-4' : 'translate-x-0'}`} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Security details Stripe Badge Trust */}
                      <div className="bg-[#f0ece2]/40 dark:bg-dark-card/30 border border-slate-500/10 p-5 rounded-3xl space-y-3.5 text-center">
                        <Shield className="w-6 h-6 text-moss-green mx-auto" />
                        <h5 className="font-serif text-xs font-black uppercase tracking-wider text-earth-brown dark:text-dark-text">Booklet Security Shield</h5>
                        <p className="text-[10px] text-earth-brown/60 dark:text-dark-muted font-sans leading-relaxed">
                          Your address details, contact information, and credential keys are safeguarded using industry-standard secure hashing and encryption guidelines.
                        </p>
                        <div className="flex justify-center gap-1.5 opacity-65">
                          <span className="text-[8px] font-serif font-black bg-white dark:bg-[#201e1c] px-2 py-0.5 border border-[#eee5d3] text-earth-brown rounded shadow-xs">Stripe Vault</span>
                          <span className="text-[8px] font-serif font-black bg-white dark:bg-[#201e1c] px-2 py-0.5 border border-[#eee5d3] text-earth-brown rounded shadow-xs">Apple ID Safe</span>
                        </div>
                      </div>

                    </div>

                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      
      {/* Dynamic Immersive Global Footer */}
      <footer className="mt-24 border-t border-earth-brown/15 dark:border-white/5 py-12 px-6 bg-[#faf8f3] dark:bg-dark-card/40 relative z-10 transition-colors">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 text-left select-none">
          <div className="space-y-4">
            <h5 className="font-serif text-xl font-bold uppercase text-earth-brown dark:text-dark-text tracking-tight">BOOKLET APPS</h5>
            <p className="text-xs text-earth-brown/60 dark:text-dark-muted font-sans leading-relaxed">
              Curating beautifully designed printed editions and digital books for modern readers.
            </p>
            <div className="flex gap-2">
              <span className="text-xl hover:scale-110 cursor-pointer">📚</span>
              <span className="text-xl hover:scale-110 cursor-pointer">✍️</span>
              <span className="text-xl hover:scale-110 cursor-pointer">☕</span>
              <span className="text-xl hover:scale-110 cursor-pointer">🌲</span>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-[#a89d87] dark:text-dark-muted">Book Categories</h5>
            <ul className="text-xs text-earth-brown/70 dark:text-dark-muted space-y-1.5 font-bold font-sans">
              <li className="hover:text-moss-green cursor-pointer" onClick={() => navigate('/category/fantasy')}>🏰 Epic Fantasy</li>
              <li className="hover:text-moss-green cursor-pointer" onClick={() => navigate('/category/horror')}>🕯️ Gothic Horror</li>
              <li className="hover:text-moss-green cursor-pointer" onClick={() => navigate('/category/poetry')}>📜 Poetry & Art</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-[#a89d87] dark:text-dark-muted">Customer Support</h5>
            <ul className="text-xs text-earth-brown/70 dark:text-dark-muted space-y-1.5 font-bold font-sans">
              <li className="hover:text-moss-green cursor-pointer">Support FAQ</li>
              <li className="hover:text-moss-green cursor-pointer">Return & Shipping Policies</li>
              <li className="hover:text-moss-green cursor-pointer">Privacy Policy & Terms</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h5 className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-[#a89d87] dark:text-dark-muted font-bold">Download Booklet App</h5>
            <p className="text-[10px] text-earth-brown/60 dark:text-dark-muted">
              Download our reading companion app for iOS and Android devices.
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => triggerLocalNotification('App Store link clicked!')}
                className="px-3.5 py-2 bg-earth-brown hover:bg-earth-brown/95 text-white dark:bg-[#1a231d] dark:hover:bg-moss-green text-[9px] font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                App Store iOS
              </button>
              <button
                type="button"
                onClick={() => triggerLocalNotification('Google Play store link clicked!')}
                className="px-3.5 py-2 bg-earth-brown hover:bg-earth-brown/95 text-white dark:bg-[#1a231d] dark:hover:bg-moss-green text-[9px] font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Android Play
              </button>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-earth-brown/10 dark:border-white/5 mt-8 flex flex-col sm:flex-row items-center justify-between text-[10px] text-earth-brown/40 dark:text-dark-muted select-none">
          <span>© 2026 BOOKLET FANTASY INC. ALL INTEGRITY SEALS AFFIXED.</span>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <span className="hover:underline cursor-pointer">privacy covenant</span>
            <span className="hover:underline cursor-pointer">imperial terms of ink</span>
          </div>
        </div>
      </footer>

    </main>
  );
};
