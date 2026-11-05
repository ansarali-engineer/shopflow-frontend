import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { cart } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen]     = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled]     = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    setMenuOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const activeClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-150 ${
      isActive ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'
    }`

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-nav'
            : 'bg-white border-b border-gray-100'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center gap-6">

            {/* ── Logo ──────────────────────────────────── */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2.5" aria-label="ShopFlow home">
              <div className="h-8 w-8 rounded-xl bg-primary-600 flex items-center justify-center shadow-soft">
                <svg className="h-4.5 w-4.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">
                Shop<span className="text-primary-600">Flow</span>
              </span>
            </Link>

            {/* ── Desktop nav ───────────────────────────── */}
            <nav className="hidden md:flex items-center gap-1 flex-1">
              <NavLink to="/products" className={activeClass} style={({ isActive }) => isActive ? {} : {}}>
                {({ isActive }) => (
                  <span className={`px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                    Products
                  </span>
                )}
              </NavLink>
              {user?.role === 'seller' && (
                <>
                  <NavLink to="/seller/products" className={activeClass}>
                    {({ isActive }) => (
                      <span className={`px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                        My Products
                      </span>
                    )}
                  </NavLink>
                  <NavLink to="/seller/inventory" className={activeClass}>
                    {({ isActive }) => (
                      <span className={`px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                        Inventory
                      </span>
                    )}
                  </NavLink>
                  <NavLink to="/seller/orders" className={activeClass}>
                    {({ isActive }) => (
                      <span className={`px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                        Orders
                      </span>
                    )}
                  </NavLink>
                  <NavLink to="/seller/analytics" className={activeClass}>
                    {({ isActive }) => (
                      <span className={`px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                        Analytics
                      </span>
                    )}
                  </NavLink>
                </>
              )}
              {user?.role === 'admin' && (
                <>
                  <NavLink to="/admin/analytics" className={activeClass}>
                    {({ isActive }) => <span className={`px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>Analytics</span>}
                  </NavLink>
                  <NavLink to="/admin/orders" className={activeClass}>
                    {({ isActive }) => <span className={`px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>Orders</span>}
                  </NavLink>
                  <NavLink to="/admin/users" className={activeClass}>
                    {({ isActive }) => <span className={`px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>Users</span>}
                  </NavLink>
                </>
              )}
            </nav>

            {/* ── Right actions ─────────────────────────── */}
            <div className="flex items-center gap-2 ml-auto">

              {/* Cart */}
              {(!user || user.role === 'customer') && (
                <Link
                  to="/cart"
                  className="relative btn-icon text-gray-500 hover:text-primary-600 hover:bg-primary-50"
                  aria-label="Cart"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                  {cart.item_count > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-[18px] w-[18px] flex items-center
                                     justify-center rounded-full bg-primary-600 text-[10px] font-bold
                                     text-white leading-none shadow">
                      {cart.item_count > 9 ? '9+' : cart.item_count}
                    </span>
                  )}
                </Link>
              )}

              {user ? (
                /* Profile menu */
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2.5 rounded-xl pl-2 pr-3 py-1.5 hover:bg-gray-50 transition-colors"
                    aria-expanded={profileOpen}
                    aria-haspopup="true"
                  >
                    <Avatar name={user.first_name} size="sm" />
                    <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[96px] truncate">
                      {user.first_name}
                    </span>
                    <svg className={`hidden sm:block h-3.5 w-3.5 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl
                                    border border-gray-100 py-1.5 z-50 animate-slide-down">
                      {/* Header */}
                      <div className="px-4 py-2.5 border-b border-gray-50">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={user.first_name} size="md" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                          </div>
                        </div>
                        <span className="mt-2 inline-flex badge bg-primary-50 text-primary-700 capitalize">
                          {user.role}
                        </span>
                      </div>
                      {/* Links */}
                      <div className="py-1">
                        {user.role === 'customer' && (
                          <>
                            <DropLink to="/orders"  icon="🧾" label="My Orders" />
                            <DropLink to="/profile" icon="👤" label="Profile" />
                          </>
                        )}
                        {user.role === 'seller' && (
                          <DropLink to="/seller/products" icon="📦" label="Seller Dashboard" />
                        )}
                        {user.role === 'admin' && (
                          <DropLink to="/admin/analytics" icon="📊" label="Admin Dashboard" />
                        )}
                      </div>
                      <div className="border-t border-gray-50 pt-1 mt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600
                                     hover:bg-red-50 transition-colors rounded-lg mx-0"
                        >
                          <span className="text-base">↩</span> Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login"    className="btn-ghost btn-sm text-gray-600">Sign in</Link>
                  <Link to="/register" className="btn-primary btn-sm">Get started</Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                className="md:hidden btn-icon text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {menuOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-30 top-16" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <nav
            className="relative bg-white border-b border-gray-100 shadow-xl px-4 py-3 space-y-0.5 animate-slide-down"
            onClick={(e) => e.stopPropagation()}
          >
            <MobileNavLink to="/products"           label="Products"       icon="🛍️" />
            {!user && (
              <>
                <MobileNavLink to="/login"    label="Sign in"    icon="🔑" />
                <MobileNavLink to="/register" label="Get started" icon="✨" />
              </>
            )}
            {user?.role === 'customer' && (
              <>
                <MobileNavLink to="/cart"    label="Cart"      icon="🛒" badge={cart.item_count} />
                <MobileNavLink to="/orders"  label="My Orders" icon="🧾" />
                <MobileNavLink to="/profile" label="Profile"   icon="👤" />
              </>
            )}
            {user?.role === 'seller' && (
              <>
                <MobileNavLink to="/seller/products"  label="My Products" icon="📦" />
                <MobileNavLink to="/seller/orders"    label="Orders"      icon="🧾" />
                <MobileNavLink to="/seller/inventory" label="Inventory"   icon="🏭" />
                <MobileNavLink to="/seller/analytics" label="Analytics"   icon="📊" />
              </>
            )}
            {user?.role === 'admin' && (
              <>
                <MobileNavLink to="/admin/analytics" label="Analytics" icon="📊" />
                <MobileNavLink to="/admin/orders"    label="Orders"    icon="🛒" />
                <MobileNavLink to="/admin/users"     label="Users"     icon="👥" />
              </>
            )}
            {user && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-2 border-t border-gray-100 pt-3"
              >
                ↩ Sign out
              </button>
            )}
          </nav>
        </div>
      )}
    </>
  )
}

function Avatar({ name, size = 'md' }) {
  const sizes = { sm: 'h-7 w-7 text-xs', md: 'h-8 w-8 text-sm' }
  const colors = [
    'bg-violet-100 text-violet-700',
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
  ]
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length]
  return (
    <div className={`${sizes[size]} ${color} rounded-full flex items-center justify-center font-bold flex-shrink-0`}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}

function DropLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
    >
      <span className="text-base w-5 text-center">{icon}</span>
      {label}
    </Link>
  )
}

function MobileNavLink({ to, label, icon, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
         ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`
      }
    >
      <span className="flex items-center gap-3">
        <span className="text-base w-5 text-center">{icon}</span>
        {label}
      </span>
      {badge > 0 && (
        <span className="h-5 min-w-5 px-1 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
    </NavLink>
  )
}
