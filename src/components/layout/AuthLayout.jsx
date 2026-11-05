import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import PageLoader from '../ui/PageLoader'

/**
 * Protects routes that require authentication.
 * Props:
 *   roles?: string[] — if provided, user.role must be in this list
 *   redirectTo?: string — where to send unauthenticated users (default /login)
 */
export default function AuthLayout({ roles, redirectTo = '/login' }) {
  const { user, loading } = useAuth()

  if (loading) return <PageLoader />
  if (!user) return <Navigate to={redirectTo} replace />
  if (roles && !roles.includes(user.role)) {
    // Authenticated but wrong role — redirect to their home
    const roleHome = { customer: '/', seller: '/seller/products', admin: '/admin/analytics' }
    return <Navigate to={roleHome[user.role] || '/'} replace />
  }

  return <Outlet />
}
