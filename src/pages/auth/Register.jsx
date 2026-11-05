import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import Spinner from '../../components/ui/Spinner'

const ROLES = [
  { value: 'customer', label: 'Customer', desc: 'Shop products & track orders', icon: '🛍️' },
  { value: 'seller',   label: 'Seller',   desc: 'List products & grow a store',  icon: '🏪' },
]

export default function Register() {
  const { register: apiRegister } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [loading, setLoading]       = useState(false)
  const [role, setRole]             = useState('customer')
  const [showPwd, setShowPwd]       = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const user = await apiRegister({ ...data, role })
      toast.success(`Welcome to ShopFlow, ${user.first_name}!`)
      navigate(role === 'seller' ? '/seller/products' : '/', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-2/5 relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-800 to-primary-600 items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        <div className="relative text-white max-w-sm">
          <div className="h-12 w-12 rounded-2xl bg-white/15 flex items-center justify-center mb-8">
            <svg className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4">Join ShopFlow today</h2>
          <p className="text-primary-200 leading-relaxed mb-10">
            Create a free account and start shopping or selling in minutes.
          </p>
          <div className="space-y-4">
            {[
              { icon: '⚡', title: 'Quick setup',        desc: 'Get started in under 2 minutes' },
              { icon: '🔒', title: 'Secure & private',   desc: 'Your data is always protected'  },
              { icon: '💸', title: 'No hidden fees',     desc: 'Free to browse and buy'         },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3.5">
                <span className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-lg flex-shrink-0 mt-0.5">{icon}</span>
                <div>
                  <p className="font-semibold text-white text-sm">{title}</p>
                  <p className="text-primary-300 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-start justify-center px-4 py-10 bg-surface-muted overflow-y-auto">
        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="h-9 w-9 rounded-xl bg-primary-600 flex items-center justify-center">
              <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Shop<span className="text-primary-600">Flow</span></span>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="mt-1 text-gray-500 text-sm">Free forever. No credit card required.</p>
          </div>

          <div className="card p-8 shadow-card">
            {/* Role selector */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {ROLES.map((r) => (
                <button
                  key={r.value} type="button"
                  onClick={() => setRole(r.value)}
                  className={`relative rounded-xl border-2 p-4 text-left transition-all duration-150
                    ${role === r.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                >
                  {role === r.value && (
                    <span className="absolute top-2.5 right-2.5 h-4.5 w-4.5 rounded-full bg-primary-600 flex items-center justify-center">
                      <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                  )}
                  <span className="text-2xl mb-2 block">{r.icon}</span>
                  <p className={`text-sm font-semibold ${role === r.value ? 'text-primary-800' : 'text-gray-800'}`}>
                    {r.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">{r.desc}</p>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="first_name">First name</label>
                  <input
                    id="first_name" type="text" autoComplete="given-name"
                    className={`input ${errors.first_name ? 'input-error' : ''}`}
                    placeholder="Jane"
                    {...register('first_name', { required: 'Required' })}
                  />
                  {errors.first_name && <p className="field-error">{errors.first_name.message}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="last_name">Last name</label>
                  <input
                    id="last_name" type="text" autoComplete="family-name"
                    className={`input ${errors.last_name ? 'input-error' : ''}`}
                    placeholder="Doe"
                    {...register('last_name', { required: 'Required' })}
                  />
                  {errors.last_name && <p className="field-error">{errors.last_name.message}</p>}
                </div>
              </div>

              <div>
                <label className="label" htmlFor="email">Email address</label>
                <input
                  id="email" type="email" autoComplete="email"
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  placeholder="you@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                  })}
                />
                {errors.email && <p className="field-error">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label" htmlFor="phone">
                  Phone <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="phone" type="tel" autoComplete="tel"
                  className="input" placeholder="+1 555 000 0000"
                  {...register('phone')}
                />
              </div>

              <div>
                <label className="label" htmlFor="password">Password</label>
                <div className="relative">
                  <input
                    id="password" type={showPwd ? 'text' : 'password'} autoComplete="new-password"
                    className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                    placeholder="Min. 8 characters"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 8, message: 'At least 8 characters' },
                    })}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      {showPwd
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        : <><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>
                      }
                    </svg>
                  </button>
                </div>
                {errors.password && <p className="field-error">{errors.password.message}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary btn-lg w-full mt-2">
                {loading
                  ? <><Spinner size="sm" className="border-white/30 border-t-white" /> Creating account…</>
                  : `Create ${role === 'seller' ? 'seller' : ''} account`}
              </button>

              <p className="text-center text-xs text-gray-400 mt-2">
                By signing up you agree to our{' '}
                <a href="#" className="text-gray-500 hover:underline">Terms</a> and{' '}
                <a href="#" className="text-gray-500 hover:underline">Privacy Policy</a>.
              </p>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
