import { Link } from 'react-router-dom'

const links = {
  Shop:    [{ to: '/products', label: 'All Products' }, { to: '/products?sort=newest', label: 'New Arrivals' }, { to: '/products?sort=rating_desc', label: 'Top Rated' }, { to: '/products?in_stock=true', label: 'In Stock' }],
  Account: [{ to: '/login', label: 'Sign In' }, { to: '/register', label: 'Create Account' }, { to: '/orders', label: 'My Orders' }, { to: '/profile', label: 'Profile' }],
  Sellers: [{ to: '/register', label: 'Start Selling' }, { to: '/seller/products', label: 'My Products' }, { to: '/seller/inventory', label: 'Inventory' }],
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main grid */}
        <div className="py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="h-8 w-8 rounded-xl bg-primary-600 flex items-center justify-center">
                <svg className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-white">
                Shop<span className="text-primary-400">Flow</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500 max-w-xs">
              Modern e-commerce for buyers and sellers. Thousands of products, trusted payments, and easy returns.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[
                { label: 'Twitter',  icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                { label: 'GitHub',   icon: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z' },
              ].map(({ label, icon }) => (
                <a key={label} href="#" aria-label={label}
                  className="h-8 w-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d={icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-widest mb-4">{title}</h3>
              <ul className="space-y-2.5">
                {items.map(({ to, label }) => (
                  <li key={label}>
                    <Link to={to} className="text-sm text-gray-500 hover:text-gray-200 transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} ShopFlow, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-gray-600">
            <a href="#" className="hover:text-gray-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Cookies</a>
          </div>
          <div className="flex items-center gap-2">
            {['💳','🔒','🚀'].map((e, i) => (
              <span key={i} className="text-base">{e}</span>
            ))}
            <span className="text-xs text-gray-600">Secure checkout</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
