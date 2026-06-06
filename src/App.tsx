import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { RecentlyViewedProvider } from './contexts/RecentlyViewedContext';
import { AdminProvider } from './contexts/AdminContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { OrderHistoryProvider } from './contexts/OrderHistoryContext';
import HomePage from './pages/HomePage';
import CollectionPage from './pages/CollectionPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import WishlistPage from './pages/WishlistPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';

function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">{children}</main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <SettingsProvider>
          <CartProvider>
            <WishlistProvider>
              <RecentlyViewedProvider>
                <OrderHistoryProvider>
                  <Routes>
                    <Route path="/" element={<StoreLayout><HomePage /></StoreLayout>} />
                    <Route path="/collection" element={<StoreLayout><CollectionPage /></StoreLayout>} />
                    <Route path="/product/:slug" element={<StoreLayout><ProductPage /></StoreLayout>} />
                    <Route path="/cart" element={<StoreLayout><CartPage /></StoreLayout>} />
                    <Route path="/checkout" element={<StoreLayout><CheckoutPage /></StoreLayout>} />
                    <Route path="/order-success" element={<StoreLayout><OrderSuccessPage /></StoreLayout>} />
                    <Route path="/track-order" element={<StoreLayout><OrderTrackingPage /></StoreLayout>} />
                    <Route path="/wishlist" element={<StoreLayout><WishlistPage /></StoreLayout>} />
                    <Route path="/admin" element={<AdminLoginPage />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  </Routes>
                </OrderHistoryProvider>
              </RecentlyViewedProvider>
            </WishlistProvider>
          </CartProvider>
        </SettingsProvider>
      </AdminProvider>
    </BrowserRouter>
  );
}

export default App;
