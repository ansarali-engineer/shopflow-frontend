import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const sellerLinks = [
  { to: '/seller/products',  label: 'Products',  icon: '📦' },
  { to: '/seller/orders',    label: 'Orders',    icon: '🧾' },
  { to: '/seller/inventory', label: 'Inventory', icon: '🏭' },
  { to: '/seller/analytics', label: 'Analytics', icon: '📊' },
]

const adminLinks = [
  { to: '/admin/analytics', label: 'Analytics', icon: '📊' },
  { to: '/admin/orders', label: 'Orders', icon: '🛒' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const links = user?.role === 'admin' ? adminLinks : sellerLinks

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-100 shadow-sm flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100">
          <NavLink to="/" className="text-xl font-bold text-primary-600">ShopFlow</NavLink>
          <p className="text-xs text-gray-400 mt-0.5 capitalize">{user?.role} Panel</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition
                 ${isActive
                   ? 'bg-primary-50 text-primary-700'
                   : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
              }
            >
              <span>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            <div className="h-7 w-7 rounded-full bg-primary-100 flex items-center justify-center
                            text-primary-700 font-semibold text-xs">
              {user?.first_name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="w-full btn btn-secondary btn-sm"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
