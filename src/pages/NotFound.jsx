import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <p className="text-7xl font-bold text-primary-200">404</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-2 text-gray-500">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn btn-primary mt-6">Go back home</Link>
    </div>
  )
}
