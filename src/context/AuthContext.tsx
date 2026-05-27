import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export interface Address {
  id: string;
  label: string; // "Home", "Office", "Cabin", etc.
  recipientName: string;
  street: string;
  city: string;
  province: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
}

export interface OrderItem {
  bookId: string;
  title: string;
  author: string;
  coverImage: string;
  price: number;
  quantity: number;
  format: 'ebook' | 'physical' | 'audio';
}

export interface SanctuaryOrder {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: 'Delivered' | 'Processing' | 'Cancelled' | 'Out for Delivery';
  items: OrderItem[];
  addressLabel?: string;
  shipping?: {
    fullName: string;
    emailAddress: string;
    street: string;
    city: string;
    zipCode: string;
    deliveryMethod: string;
  };
  payment?: {
    selectedMethod: string;
    cardNumberMasked: string;
  };
  timeOfOrder?: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  joinedDate: string;
  membership: string; // e.g. "Bronze Member"
  streak: number; 
  poeticPoints: number; 
  favoriteGenres: string[];
  readingGoalMinutes: number; 
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  savedAddresses: Address[];
  orders: SanctuaryOrder[];
  signUpStep: number;
  setSignUpStep: React.Dispatch<React.SetStateAction<number>>;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: Partial<UserProfile> & { password?: string }) => Promise<void>;
  logout: () => void;
  requestOTP: (email: string) => Promise<boolean>;
  validateOTP: (code: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (updated: Partial<UserProfile>) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (address: Address) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  reorderItems: (order: SanctuaryOrder) => void;
  addOrder: (order: SanctuaryOrder) => void;
  submitSupportTicket: (orderId: string, text: string) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to sanitize numeric values against database-specific nested objects
const sanitizeNumber = (val: any, fallback: number): number => {
  if (val && typeof val === 'object' && !Array.isArray(val)) {
    if ('increment' in val && typeof val.increment === 'number') {
      return val.increment;
    }
    if ('decrement' in val && typeof val.decrement === 'number') {
      return -val.decrement;
    }
    return fallback;
  }
  const parsed = Number(val);
  return isNaN(parsed) ? fallback : parsed;
};

// Helper to map backend user API schemas to client profile structures
const mapUserResponse = (apiUser: any): UserProfile => {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    phone: apiUser.phone || '',
    avatar: apiUser.avatarUrl || apiUser.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    joinedDate: apiUser.joinedDate || new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    membership: apiUser.membership || 'Bronze Member',
    streak: sanitizeNumber(apiUser.streak, 1),
    poeticPoints: sanitizeNumber(apiUser.poeticPoints, 10),
    favoriteGenres: Array.isArray(apiUser.favoriteGenres) ? apiUser.favoriteGenres : (apiUser.favoriteGenres ? [apiUser.favoriteGenres] : []),
    readingGoalMinutes: sanitizeNumber(apiUser.readingGoalMinutes, 30)
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem('booklet_user_session');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('booklet_jwt_token') ? true : false;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [signUpStep, setSignUpStep] = useState(1);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<SanctuaryOrder[]>([]);

  // Globally intercept expired authentication sessions
  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      setIsAuthenticated(false);
      setSavedAddresses([]);
      setOrders([]);
    };
    window.addEventListener('auth_expired', handleExpired);
    return () => {
      window.removeEventListener('auth_expired', handleExpired);
    };
  }, []);

  // -------------------------------------------------------------
  // INITIAL USER REFRESH
  // -------------------------------------------------------------
  useEffect(() => {
    const initData = async () => {
      const token = localStorage.getItem('booklet_jwt_token');
      if (!token) return;

      setIsLoading(true);
      try {
        const res = await api.get('/auth/profile');
        if (res.data && res.data.user) {
          const mapped = mapUserResponse(res.data.user);
          setUser(mapped);
          setIsAuthenticated(true);
          localStorage.setItem('booklet_user_session', JSON.stringify(mapped));
        }
      } catch (err) {
        console.warn("Failed to automatic log in session.", err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, [isAuthenticated]);

  // -------------------------------------------------------------
  // SYNC USER DATA (ADDRESSES & ORDERS) FROM DATABASE
  // -------------------------------------------------------------
  useEffect(() => {
    const syncUserData = async () => {
      if (!user) {
        setSavedAddresses([]);
        setOrders([]);
        return;
      }

      try {
        // Load Addresses
        const addrRes = await api.get('/addresses');
        const rawAddresses = addrRes.data;
        const addressesArray = Array.isArray(rawAddresses)
          ? rawAddresses
          : (rawAddresses && Array.isArray(rawAddresses.addresses) ? rawAddresses.addresses : []);
        setSavedAddresses(addressesArray);
      } catch (err) {
        console.warn('Could not synchronize addresses with database.', err);
      }

      try {
        // Load Orders
        const ordRes = await api.get('/orders');
        // Transform backend order items to frontend structure
        const rawOrders = ordRes.data;
        const ordersArray = Array.isArray(rawOrders)
          ? rawOrders
          : (rawOrders && Array.isArray(rawOrders.orders) ? rawOrders.orders : []);
        const mappedOrders = ordersArray.map((ord: any) => {
          let orderDate = '';
          if (ord.date) {
            if (typeof ord.date === 'string') {
              orderDate = ord.date.split('T')[0];
            } else if (ord.date instanceof Date) {
              orderDate = ord.date.toISOString().split('T')[0];
            } else if (typeof ord.date.toISOString === 'function') {
              orderDate = ord.date.toISOString().split('T')[0];
            } else {
              orderDate = String(ord.date).split('T')[0];
            }
          } else {
            orderDate = new Date().toISOString().split('T')[0];
          }
          return {
            id: ord.id,
            orderNumber: ord.orderNumber,
            date: orderDate,
            total: Number(ord.total),
            status: ord.status,
            addressLabel: ord.addressLabel || 'Shipping Address',
            items: (ord.items || []).map((it: any) => ({
              bookId: it.product?.id || it.productId,
              title: it.product?.title || 'Book',
              author: it.product?.author || '',
              coverImage: it.product?.coverImage || '',
              price: Number(it.price),
              quantity: it.quantity,
              format: it.format
            }))
          };
        });
        setOrders(mappedOrders);
      } catch (err) {
        console.warn('Could not synchronize orders with database.', err);
      }
    };

    syncUserData();
  }, [user]);

  const addOrder = async (order: SanctuaryOrder) => {
    try {
      const res = await api.post('/orders', order);
      if (res.data) {
        setOrders(prev => [order, ...prev]);
      }
    } catch (err) {
      console.warn("Could not sync order creation with database.", err);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.user) {
        const mapped = mapUserResponse(res.data.user);
        if (res.data.token) {
          localStorage.setItem('booklet_jwt_token', res.data.token);
        }
        setUser(mapped);
        setIsAuthenticated(true);
        localStorage.setItem('booklet_user_session', JSON.stringify(mapped));
        setIsLoading(false);
        return true;
      }
    } catch (err: any) {
      setIsLoading(false);
      throw new Error(err.response?.data?.message || 'Authentication failed. Incorrect email or password.');
    }
    setIsLoading(false);
    return false;
  };

  const signup = async (userData: Partial<UserProfile> & { password?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        avatarUrl: userData.avatar,
        favoriteGenres: userData.favoriteGenres,
        readingGoalMinutes: userData.readingGoalMinutes,
        dailyGoal: userData.readingGoalMinutes
      });
      if (res.data?.user) {
        const mapped = mapUserResponse(res.data.user);
        if (res.data.token) {
          localStorage.setItem('booklet_jwt_token', res.data.token);
        }
        setUser(mapped);
        setIsAuthenticated(true);
        localStorage.setItem('booklet_user_session', JSON.stringify(mapped));
        navigate('/');
      }
    } catch (err: any) {
      setIsLoading(false);
      throw new Error(err.response?.data?.message || 'Registration failed. Please check your credentials.');
    }
    setIsLoading(false);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn("Network error during logout session termination.", err);
    }
    setUser(null);
    setIsAuthenticated(false);
    setSavedAddresses([]);
    setOrders([]);
    localStorage.removeItem('booklet_user_session');
    localStorage.removeItem('booklet_jwt_token');
  };

  const requestOTP = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    setIsLoading(false);
    return true;
  };

  const validateOTP = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsLoading(false);
    return code === '1234' || code.length === 4;
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    setIsLoading(false);
    return true;
  };

  const updateProfile = async (updated: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const res = await api.patch('/auth/profile', updated);
      if (res.data?.user) {
        const mapped = mapUserResponse(res.data.user);
        setUser(mapped);
        localStorage.setItem('booklet_user_session', JSON.stringify(mapped));
      }
    } catch (err) {
      console.warn("Could not save profile properties.", err);
    }
  };

  // Address Actions
  const addAddress = async (addrInfo: Omit<Address, 'id'>) => {
    try {
      const res = await api.post('/addresses', addrInfo);
      if (res.data) {
        setSavedAddresses(prev => {
          const arr = Array.isArray(prev) ? prev : [];
          return [...arr, res.data];
        });
      }
    } catch (err) {
      console.warn("Could not append address record.", err);
    }
  };

  const updateAddress = async (updated: Address) => {
    try {
      const res = await api.put(`/addresses/${updated.id}`, updated);
      if (res.data) {
        setSavedAddresses(prev => {
          const arr = Array.isArray(prev) ? prev : [];
          return arr.map(a => a.id === updated.id ? res.data : a);
        });
      }
    } catch (err) {
      console.warn("Could not save address modifications.", err);
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      await api.delete(`/addresses/${id}`);
      setSavedAddresses(prev => {
        const arr = Array.isArray(prev) ? prev : [];
        return arr.filter(a => a.id !== id);
      });
    } catch (err) {
      console.warn("Could not remove address record.", err);
    }
  };

  const setDefaultAddress = async (id: string) => {
    try {
      await api.put(`/addresses/${id}`, { isDefault: true });
      setSavedAddresses(prev => {
        const arr = Array.isArray(prev) ? prev : [];
        return arr.map(a => ({ ...a, isDefault: a.id === id }));
      });
    } catch (err) {
      console.warn("Could not set default address.", err);
    }
  };

  // Order Reordering Flow
  const reorderItems = (order: SanctuaryOrder) => {
    try {
      const cartSaved = localStorage.getItem('booklet_cart');
      let currentCart: any[] = [];
      if (cartSaved) {
        try {
          const parsed = JSON.parse(cartSaved);
          currentCart = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          currentCart = [];
        }
      }
      const itemsToReorder = order && Array.isArray(order.items) ? order.items : [];
      itemsToReorder.forEach(item => {
        const targetFormat = item.format === 'physical' ? 'physical' : 'Ebook';
        const matchingBookIdx = currentCart.findIndex((x: any) => 
          x && x.book && x.book.id === item.bookId && 
          (x.format === targetFormat || 
            (targetFormat === 'physical' && (x.format === 'Printed Book' || x.format === 'Printed Codex')))
        );
        if (matchingBookIdx > -1) {
          currentCart[matchingBookIdx].quantity += item.quantity;
        } else {
          currentCart.push({
            book: {
              id: item.bookId,
              title: item.title,
              author: item.author,
              price: item.price,
              coverImage: item.coverImage,
              rating: 4.8,
              category: 'Fantasy',
              isBestSeller: true,
              isNew: false,
              reviews: [],
              synopsis: 'This book was added back to your cart.',
              bookType: item.format === 'physical' ? 'physical' : 'ebook'
            },
            quantity: item.quantity,
            format: targetFormat
          });
        }
      });
      localStorage.setItem('booklet_cart', JSON.stringify(currentCart));
      window.dispatchEvent(new Event('storage'));
    } catch(e) {
      console.error(e);
    }
  };

  const submitSupportTicket = async (orderId: string, text: string): Promise<string> => {
    const tempTicketId = `TKT-${Math.floor(Math.random() * 900000) + 100000}`;
    try {
      const res = await api.post('/tickets', { orderId, details: text });
      if (res.data?.ticketId) {
        return res.data.ticketId;
      }
    } catch (err) {
      console.warn("Could not launch support ticket.", err);
    }
    return tempTicketId;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      savedAddresses,
      orders,
      signUpStep,
      setSignUpStep,
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
      reorderItems,
      addOrder,
      submitSupportTicket
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
