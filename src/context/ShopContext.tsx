import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book } from '../types';
import { BOOKS } from '../constants';
import { useAuth } from './AuthContext';

interface User {
  name: string;
  email: string;
  avatar: string;
  joinedDate: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
  format: string;
}

interface ShopContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  cartCount: number;
  cart: CartItem[];
  addToCart: (book?: Book, quantity?: number, format?: string) => void;
  removeFromCart: (bookId: string, format?: string) => void;
  updateCartQuantity: (bookId: string, format: string, quantity: number) => void;
  clearCart: () => void;
  wishlist: Book[];
  addToWishlist: (book: Book) => void;
  removeFromWishlist: (bookId: string) => void;
  isInWishlist: (bookId: string) => boolean;
  isMenuOpen: boolean;
  toggleMenu: () => void;
  user: User;
  isShopLoading: boolean;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('booklet_jwt_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user: authUser } = useAuth();
  const currentEmail = authUser?.email || 'elara@woodland.com';
  const isElara = currentEmail.toLowerCase() === 'elara@woodland.com';

  const [wishlist, setWishlist] = useState<Book[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isShopLoading, setIsShopLoading] = useState(false);

  // Guard to prevent saving previous user's cart/wishlist under new user's email during session loading
  const loadedEmailRef = React.useRef<string | null>(null);

  useEffect(() => {
    // Clear and reset state on user transition before fetch to avoid ghosts or bleeding content
    setCart([]);
    setWishlist([]);
    loadedEmailRef.current = null;
    setIsShopLoading(!isElara);

    const loadUserData = async () => {
      if (isElara) {
        // Load Elara's cart from standard namespace booklet_cart
        const savedCart = localStorage.getItem('booklet_cart');
        if (savedCart) {
          try {
            const parsed = JSON.parse(savedCart);
            const items = parsed && Array.isArray(parsed.items) 
              ? parsed.items 
              : (Array.isArray(parsed) ? parsed : []);
            setCart(items);
          } catch (e) {
            setCart([]);
          }
        } else {
          // Default initial cart: ID '1' and '2' (count: 3 items)
          const book1 = BOOKS.find(b => b.id === '1') || BOOKS[0];
          const book2 = BOOKS.find(b => b.id === '2') || BOOKS[1];
          const initialItems: CartItem[] = [];
          if (book1) initialItems.push({ book: book1, quantity: 1, format: 'Ebook' });
          if (book2) initialItems.push({ book: book2, quantity: 2, format: 'Ebook' });
          setCart(initialItems);
        }

        // Load Elara's wishlist from booklet_wishlist
        const savedWishlist = localStorage.getItem('booklet_wishlist');
        if (savedWishlist) {
          try {
            const parsed = JSON.parse(savedWishlist);
            const items = parsed && Array.isArray(parsed.wishlist) 
              ? parsed.wishlist 
              : (Array.isArray(parsed) ? parsed : []);
            setWishlist(items);
          } catch(e) {
            setWishlist([]);
          }
        } else {
          setWishlist([]);
        }
        setIsShopLoading(false);
      } else {
        setIsShopLoading(true);
        try {
          // Call GET /api/cart
          const cartRes = await fetch('/api/cart', { headers: getAuthHeaders() });
          if (cartRes.ok) {
            const serverCart = await cartRes.json();
            const items = serverCart && Array.isArray(serverCart.items) 
              ? serverCart.items 
              : (Array.isArray(serverCart) ? serverCart : []);
            setCart(items);
            localStorage.setItem(`booklet_cart_${currentEmail}`, JSON.stringify(items));
          } else {
            throw new Error();
          }
        } catch (err) {
          // Fallback to user-specific localStorage backup
          const savedLocal = localStorage.getItem(`booklet_cart_${currentEmail}`);
          if (savedLocal) {
            try {
              const parsed = JSON.parse(savedLocal);
              const items = parsed && Array.isArray(parsed.items) 
                ? parsed.items 
                : (Array.isArray(parsed) ? parsed : []);
              setCart(items);
            } catch (e) {
              setCart([]);
            }
          } else {
            setCart([]);
          }
        }

        try {
          // Call GET /api/wishlist
          const wishlistRes = await fetch('/api/wishlist', { headers: getAuthHeaders() });
          if (wishlistRes.ok) {
            const serverWish = await wishlistRes.json();
            const items = serverWish && Array.isArray(serverWish.wishlist) 
              ? serverWish.wishlist 
              : (Array.isArray(serverWish) ? serverWish : []);
            setWishlist(items);
            localStorage.setItem(`booklet_wishlist_${currentEmail}`, JSON.stringify(items));
          } else {
            throw new Error();
          }
        } catch (err) {
          // Fallback to user-specific localStorage backup
          const savedLocal = localStorage.getItem(`booklet_wishlist_${currentEmail}`);
          if (savedLocal) {
            try {
              const parsed = JSON.parse(savedLocal);
              const items = parsed && Array.isArray(parsed.wishlist) 
                ? parsed.wishlist 
                : (Array.isArray(parsed) ? parsed : []);
              setWishlist(items);
            } catch (e) {
              setWishlist([]);
            }
          } else {
            setWishlist([]);
          }
        } finally {
          setIsShopLoading(false);
        }
      }
    };

    loadUserData().then(() => {
      loadedEmailRef.current = currentEmail;
    });
  }, [currentEmail, isElara]);

  // Sync state modifications to storage caches
  useEffect(() => {
    if (loadedEmailRef.current !== currentEmail) return;
    const activeCart = Array.isArray(cart) ? cart : [];
    if (activeCart.length > 0 || !isElara) {
      const storageKey = isElara ? 'booklet_cart' : `booklet_cart_${currentEmail}`;
      localStorage.setItem(storageKey, JSON.stringify(activeCart));
    }
  }, [cart, currentEmail, isElara]);

  useEffect(() => {
    if (loadedEmailRef.current !== currentEmail) return;
    const activeWish = Array.isArray(wishlist) ? wishlist : [];
    if (activeWish.length > 0 || !isElara) {
      const storageKey = isElara ? 'booklet_wishlist' : `booklet_wishlist_${currentEmail}`;
      localStorage.setItem(storageKey, JSON.stringify(activeWish));
    }
  }, [wishlist, currentEmail, isElara]);

  // Derived count
  const cartCount = (Array.isArray(cart) ? cart : []).reduce((total, item) => total + item.quantity, 0);

  // Expose User Details matching session state
  const user: User = {
    name: authUser?.name || 'Elara Moonwhisper',
    email: authUser?.email || 'elara@woodland.com',
    avatar: authUser?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    joinedDate: authUser?.joinedDate || 'May 2024'
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Safe Cart Addition with auto-persistence and Database APIs triggers
  const addToCart = async (book?: Book, quantity: number = 1, format?: string) => {
    const targetBook = book || BOOKS[0];
    if (!targetBook) return;
    let finalFormat = format || (targetBook.bookType === 'ebook' ? 'Ebook' : 'physical');
    if (finalFormat === 'Printed Book' || finalFormat === 'Printed Codex') {
      finalFormat = 'physical';
    }

    let updatedCart: CartItem[] = [];

    setCart(prevCart => {
      const safeCart = Array.isArray(prevCart) ? prevCart : [];
      const existingIdx = safeCart.findIndex(item => item && item.book && item.book.id === targetBook.id && item.format === finalFormat);
      if (existingIdx > -1) {
        const nextCart = [...safeCart];
        const nextItem = {
          ...nextCart[existingIdx],
          quantity: (nextCart[existingIdx]?.quantity || 0) + quantity
        };
        nextCart[existingIdx] = nextItem;
        updatedCart = nextCart;
        return nextCart;
      } else {
        const newItem = { book: targetBook, quantity, format: finalFormat };
        updatedCart = [...safeCart, newItem];
        return updatedCart;
      }
    });

    // Send Database creation requests if not default Elara Moonwhisper
    if (!isElara) {
      const itemToSync = updatedCart.find(i => i.book.id === targetBook.id && i.format === finalFormat) || {
        book: targetBook,
        quantity,
        format: finalFormat
      };
      try {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify(itemToSync)
        });
      } catch (err) {
        console.warn("REST API Cartesian sync failed. Cached locally.", err);
      }
    } else {
      // Direct local clickstream activity logging
      try {
        await fetch('/api/activities', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({
            actionType: 'add_cart',
            bookId: targetBook.id,
            bookTitle: targetBook.title,
            metadata: { quantity, format: finalFormat }
          })
        });
      } catch (e) {}
    }
  };

  // Cart Dismissive Removal with Database sync calls
  const removeFromCart = async (bookId: string, format?: string) => {
    let finalFormat = format;
    if (finalFormat === 'Printed Book' || finalFormat === 'Printed Codex') {
      finalFormat = 'physical';
    }

    setCart(prevCart => (Array.isArray(prevCart) ? prevCart : []).filter(item => {
      if (!item || !item.book) return false;
      if (finalFormat) {
        return !(item.book.id === bookId && item.format === finalFormat);
      }
      return item.book.id !== bookId;
    }));

    if (!isElara && finalFormat) {
      try {
        await fetch(`/api/cart/${bookId}/${finalFormat}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
      } catch (err) {
        console.warn("REST API cart deletion failure. Preserved inside cache.", err);
      }
    } else {
      try {
        await fetch('/api/activities', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({
            actionType: 'remove_cart',
            bookId: bookId,
            bookTitle: null,
            metadata: { format: finalFormat }
          })
        });
      } catch (e) {}
    }
  };

  // Inline Quantity updates using API
  const updateCartQuantity = async (bookId: string, format: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(bookId, format);
      return;
    }

    let finalFormat = format;
    if (finalFormat === 'Printed Book' || finalFormat === 'Printed Codex') {
      finalFormat = 'physical';
    }

    let updatedItem: CartItem | undefined;

    setCart(prevCart => (Array.isArray(prevCart) ? prevCart : []).map(item => {
      if (!item || !item.book) return item;
      if (item.book.id === bookId && item.format === finalFormat) {
        const nextItem = { ...item, quantity };
        updatedItem = nextItem;
        return nextItem;
      }
      return item;
    }));

    if (!isElara && updatedItem) {
      try {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify(updatedItem)
        });
      } catch (err) {
        console.warn("REST API cart update quantity failure.", err);
      }
    }
  };

  // Cart evacuation
  const clearCart = async () => {
    setCart([]);
    if (!isElara) {
      try {
        await fetch('/api/cart', {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
      } catch (err) {
        console.warn("REST API cart purge failure.", err);
      }
    }
  };

  // Wishlisting triggers
  const addToWishlist = async (book: Book) => {
    setWishlist(prev => {
      const activePrev = Array.isArray(prev) ? prev : [];
      if (activePrev.some(item => item.id === book.id)) return activePrev;
      return [...activePrev, book];
    });

    if (!isElara) {
      try {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify(book)
        });
      } catch (err) {
        console.warn("REST API wishlist addition fault.", err);
      }
    } else {
      try {
        await fetch('/api/activities', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({
            actionType: 'add_wishlist',
            bookId: book.id,
            bookTitle: book.title
          })
        });
      } catch (e) {}
    }
  };

  // Wishlisting removal
  const removeFromWishlist = async (bookId: string) => {
    setWishlist(prev => (Array.isArray(prev) ? prev : []).filter(item => item.id !== bookId));

    if (!isElara) {
      try {
        await fetch(`/api/wishlist/${bookId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
      } catch (err) {
        console.warn("REST API wishlist remove failure.", err);
      }
    } else {
      try {
        await fetch('/api/activities', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({
            actionType: 'remove_wishlist',
            bookId: bookId,
            bookTitle: null
          })
        });
      } catch (e) {}
    }
  };

  const isInWishlist = (bookId: string) => {
    return (Array.isArray(wishlist) ? wishlist : []).some(item => item.id === bookId);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Hook general click tracking to pages using express API
  // Tracks anytime a book or content details is viewed
  useEffect(() => {
    const handleUrlCstreamTracking = async () => {
      const match = window.location.pathname.match(/\/book\/(\d+)/);
      if (match && match[1]) {
        try {
          await fetch('/api/activities', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              ...getAuthHeaders()
            },
            body: JSON.stringify({
              actionType: 'click_book',
              bookId: match[1],
              bookTitle: null,
            })
          });
        } catch (e) {}
      }
    };
    handleUrlCstreamTracking();
  }, [window.location.pathname]);

  return (
    <ShopContext.Provider value={{ 
      isDarkMode, 
      toggleDarkMode, 
      cartCount, 
      cart,
      addToCart, 
      removeFromCart,
      updateCartQuantity,
      clearCart,
      wishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      isMenuOpen, 
      toggleMenu, 
      user,
      isShopLoading
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
