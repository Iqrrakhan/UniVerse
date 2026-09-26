import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  ArrowRight, 
  ShoppingBag, 
  Store, 
  Lock, 
  Mail, 
  User, 
  ArrowLeft, 
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import PageTransition from '../components/PageTransition'

const ROLES = [
  {
    id: 'BUYER',
    label: 'Marketplace Shopper',
    icon: ShoppingBag,
    badge: 'Discover & Shop',
    description: 'Explore independent local brands, order handcrafted goods, and connect directly with creators.',
  },
  {
    id: 'VENDOR',
    label: 'Independent Creator / Merchant',
    icon: Store,
    badge: 'Sell & Grow',
    description: 'Launch your branded digital storefront, list products/services, and manage customer orders.',
  },
]

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'BUYER' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const selectRole = (role) => {
    setForm({ ...form, role })
    setStep(2)
  }

  const validate = () => {
    const errs = {}
    if (!form.name || form.name.trim().length < 2) errs.name = 'Full name must be at least 2 characters'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email is required'
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      login(data.user, data.accessToken, data.refreshToken)
      if (data.user.role === 'VENDOR') {
        navigate('/setup-store')
      } else {
        navigate('/')
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
      const apiErrors = err.response?.data?.errors || []
      const mapped = {}
      apiErrors.forEach((e) => { mapped[e.field] = e.message })
      setErrors({ ...mapped, _global: Object.keys(mapped).length ? '' : msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition className="min-h-screen bg-[#F8FAFC] dark:bg-[#070913] text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-250">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-orange-300/20 dark:bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-rose-300/20 dark:bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Back to Home Link */}
      <Link
        to="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Marketplace</span>
      </Link>

      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white dark:bg-slate-900/80 rounded-3xl p-8 sm:p-10 border border-slate-200/90 dark:border-white/10 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 dark:from-cyan-400 dark:to-indigo-600 mb-4 shadow-md shadow-orange-500/20 dark:shadow-cyan-500/20">
              <Sparkles className="w-6 h-6 text-white dark:text-slate-950" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {step === 1 ? 'Join UniVerse' : 'Create your account'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {step === 1
                ? 'Choose how you want to experience the platform'
                : `Signing up as a ${form.role === 'VENDOR' ? 'Merchant / Business Owner' : 'Marketplace Shopper'}`}
            </p>
          </div>

          {/* Step 1: Role Selector */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-4"
              >
                {ROLES.map((r) => {
                  const Icon = r.icon
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => selectRole(r.id)}
                      className="w-full p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200/90 dark:border-white/10 shadow-2xs text-left transition-all hover:scale-[1.01] hover:border-orange-400 dark:hover:border-cyan-400 group flex items-start gap-4 cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-white/5 border border-orange-200/80 dark:border-white/10 flex items-center justify-center text-orange-600 dark:text-cyan-400 shrink-0 group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 dark:text-white text-base group-hover:text-orange-600 dark:group-hover:text-cyan-300 transition-colors">
                            {r.label}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                            {r.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {r.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </motion.div>
            )}

            {/* Step 2: Account Details */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
              >
                {errors._global && (
                  <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors._global}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5" htmlFor="name">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="e.g. Sarah Khan"
                        value={form.name}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:outline-none ${
                          errors.name ? 'border-rose-500' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:border-orange-500 dark:focus:border-cyan-400'
                        }`}
                      />
                    </div>
                    {errors.name && <span className="text-rose-600 dark:text-rose-400 text-xs mt-1 block font-medium">{errors.name}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5" htmlFor="email">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="sarah@example.com"
                        value={form.email}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:outline-none ${
                          errors.email ? 'border-rose-500' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:border-orange-500 dark:focus:border-cyan-400'
                        }`}
                      />
                    </div>
                    {errors.email && <span className="text-rose-600 dark:text-rose-400 text-xs mt-1 block font-medium">{errors.email}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5" htmlFor="password">
                      Password (min 8 chars) *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:outline-none ${
                          errors.password ? 'border-rose-500' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:border-orange-500 dark:focus:border-cyan-400'
                        }`}
                      />
                    </div>
                    {errors.password && <span className="text-rose-600 dark:text-rose-400 text-xs mt-1 block font-medium">{errors.password}</span>}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 dark:from-cyan-400 dark:to-indigo-500 text-white dark:text-slate-950 font-bold text-sm shadow-md shadow-orange-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{loading ? 'Creating...' : 'Create Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-600 dark:text-cyan-400 font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </PageTransition>
  )
}