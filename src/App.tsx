/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './views/HomeView';
import { CategoryView } from './views/CategoryView';
import { DiscoverView } from './views/DiscoverView';
import { LibraryView } from './views/LibraryView';
import { ProfileView } from './views/ProfileView';
import { SaleView } from './views/SaleView';
import { ProductDetailPage } from './views/ProductDetailPage';
import { CartPage } from './views/CartPage';
import { CheckoutPage } from './views/CheckoutPage';
import { WishlistPage } from './views/WishlistPage';
import { OrderTrackingPage } from './views/OrderTrackingPage';
import { ShopProvider, useShop } from './context/ShopContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ScrollToTop } from './components/ScrollToTop';
import { MenuDrawer } from './components/MenuDrawer';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ShopProvider>
          <ScrollToTop />
          <MenuDrawer />
          <AppContent />
        </ShopProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}


// Simple component to handle redirect/routing logic if needed, or just use CategoryView directly
function RouteHandler() {
  return <CategoryView />;
}

function AppContent() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { isShopLoading } = useShop();

  if (isAuthLoading || isShopLoading) {
    return (
      <div className="min-h-screen bg-parchment dark:bg-dark-bg flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-moss-green border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-serif text-earth-brown dark:text-dark-muted animate-pulse">Entering the Woodland Library...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment dark:bg-dark-bg selection:bg-moss-green/30 selection:text-forest-green relative transition-colors duration-300">
      <Navbar />
      
      <Routes>
        <Route path="/" element={isAuthenticated ? <HomeView /> : <ProfileView />} />
        <Route path="/category/:categoryId" element={isAuthenticated ? <RouteHandler /> : <ProfileView />} />
        <Route path="/book/:bookId" element={isAuthenticated ? <ProductDetailPage /> : <ProfileView />} />
        <Route path="/discover" element={isAuthenticated ? <DiscoverView /> : <ProfileView />} />
        <Route path="/library" element={isAuthenticated ? <LibraryView /> : <ProfileView />} />
        <Route path="/profile" element={<ProfileView />} />
        <Route path="/sale" element={isAuthenticated ? <SaleView /> : <ProfileView />} />
        <Route path="/cart" element={isAuthenticated ? <CartPage /> : <ProfileView />} />
        <Route path="/checkout" element={isAuthenticated ? <CheckoutPage /> : <ProfileView />} />
        <Route path="/tracking" element={isAuthenticated ? <OrderTrackingPage /> : <ProfileView />} />
        <Route path="/wishlist" element={isAuthenticated ? <WishlistPage /> : <ProfileView />} />
      </Routes>

      <Footer />
      <BottomNav />
    </div>
  );
}

