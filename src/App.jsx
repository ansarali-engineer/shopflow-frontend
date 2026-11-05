import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Providers
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'

// Layouts
import PublicLayout from './components/layout/PublicLayout'
import AuthLayout from './components/layout/AuthLayout'
import DashboardLayout from './components/layout/DashboardLayout'

// Public pages
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ProductList from './pages/products/ProductList'
import ProductDetail from './pages/products/ProductDetail'
import NotFound from './pages/NotFound'

// Customer-only pages
import Cart from './pages/cart/Cart'
import Checkout from './pages/checkout/Checkout'
import OrderList from './pages/orders/OrderList'
import OrderDetail from './pages/orders/OrderDetail'
import Profile from './pages/profile/Profile'

// Seller dashboard pages
import SellerProducts from './pages/seller/SellerProducts'
import SellerInventory from './pages/seller/SellerInventory'
import SellerAnalytics from './pages/seller/SellerAnalytics'
import SellerOrders from './pages/seller/SellerOrders'

// Admin dashboard pages
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminOrders from './pages/admin/AdminOrders'
import AdminUsers from './pages/admin/AdminUsers'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <Routes>

              {/* ── Public routes (Navbar + Footer) ─────────── */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/:slug" element={<ProductDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Customer-protected routes */}
                <Route element={<AuthLayout roles={['customer']} />}>
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<OrderList />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Order detail — accessible to all authenticated roles */}
                <Route element={<AuthLayout />}>
                  <Route path="/orders/:id" element={<OrderDetail />} />
                </Route>
              </Route>

              {/* ── Seller dashboard (sidebar layout) ────────── */}
              <Route element={<AuthLayout roles={['seller', 'admin']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/seller/products"  element={<SellerProducts />} />
                  <Route path="/seller/inventory" element={<SellerInventory />} />
                  <Route path="/seller/analytics" element={<SellerAnalytics />} />
                  <Route path="/seller/orders"    element={<SellerOrders />} />
                </Route>
              </Route>

              {/* ── Admin dashboard (sidebar layout) ─────────── */}
              <Route element={<AuthLayout roles={['admin']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                </Route>
              </Route>

              {/* ── Fallbacks ─────────────────────────────────── */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
