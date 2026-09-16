import { Routes, Route } from 'react-router'
import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Wishlist from './pages/Wishlist'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import NotFound from './pages/NotFound'
import About from './pages/About'
import Contact from './pages/Contact'
import Legal from './pages/Legal'
import Blogs from './pages/Blogs'
import AdminDashboard from './pages/Dashboard/AdminDashboard'
import ProductsManager from './pages/Dashboard/ProductsManager'
import OrdersManager from './pages/Dashboard/OrdersManager'
import UsersManager from './pages/Dashboard/UsersManager'
import Analytics from './pages/Dashboard/Analytics'
import CouponsManager from './pages/Dashboard/CouponsManager'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/google/callback" element={<AuthCallback />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/legal/:section?" element={<Legal />} />
      </Route>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/dashboard/products" element={<ProductsManager />} />
        <Route path="/dashboard/orders" element={<OrdersManager />} />
        <Route path="/dashboard/users" element={<UsersManager />} />
        <Route path="/dashboard/analytics" element={<Analytics />} />
        <Route path="/dashboard/coupons" element={<CouponsManager />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}