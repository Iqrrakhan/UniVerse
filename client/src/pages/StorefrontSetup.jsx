import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Store, 
  Palette, 
  Tag, 
  Rocket,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import PageTransition from '../components/PageTransition'

const STEPS = [
  { id: 'category', label: 'Category', icon: Tag },
  { id: 'identity', label: 'Identity', icon: Store },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'done', label: 'Launch', icon: Rocket },
]

const THEME_PRESETS = [
  { name: 'Warm Tangerine', primary: '#f97316', accent: '#ec4899' },
  { name: 'Artisan Coral', primary: '#ea580c', accent: '#f59e0b' },
  { name: 'Royal Indigo', primary: '#4f46e5', accent: '#06b6d4' },
  { name: 'Forest Emerald', primary: '#10b981', accent: '#0284c7' },
  { name: 'Cosmic Violet', primary: '#8b5cf6', accent: '#ec4899' },
  { name: 'Amber Gold', primary: '#eab308', accent: '#ea580c' },
]

export default function StorefrontSetup() {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const [step, setStep] = useState(0)
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    categoryId: '',
    handle: '',
    displayName: '',
    tagline: '',
    themeColor: '#f97316',
    accentColor: '#ec4899',
  })
  const [handleStatus, setHandleStatus] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Redirect if user already has a storefront
  useEffect(() => {
    if (user?.storefront) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  // Load categories
  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setCategories(data || []))
      .catch(() => {})
  }, [])

  // Handle availability check
  useEffect(() => {
    if (form.handle.length < 3) {
      setHandleStatus(null)
      return
    }
    setHandleStatus('checking')
    const timer = setTimeout(async () => {
      try {
        await api.get(`/storefronts/${form.handle}`)
        setHandleStatus('taken')
      } catch (err) {
        if (err.response?.status === 404) setHandleStatus('available')
        else setHandleStatus(null)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [form.handle])

  const selectedCategory = categories.find((c) => c.id === form.categoryId)

  const handleChange = (e) => {
    const { name, value } = e.target
    let val = value
    if (name === 'handle') val = value.toLowerCase().replace(/[^a-z0-9_-]/g, '').substring(0, 30)
    setForm((prev) => ({ ...prev, [name]: val }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const canNext = () => {
    if (step === 0) return !!form.categoryId
    if (step === 1) {
      return form.handle.length >= 3 && form.displayName.length >= 2 && handleStatus === 'available'
    }
    return true
  }

  const handleFinish = async () => {
    setSaving(true)
    try {
      await api.post('/storefronts', {
        handle: form.handle,
        displayName: form.displayName,
        tagline: form.tagline || undefined,
        categoryId: form.categoryId,
        themeColor: form.themeColor,
        accentColor: form.accentColor,
      })
      await refreshUser()
      setStep(3)
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong while launching'
      setErrors({ _global: msg })
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageTransition className="min-h-screen bg-[#F8FAFC] dark:bg-[#070913] text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-250">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-orange-300/20 dark:bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-amber-300/20 dark:bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 py-10">
        <div className="bg-white dark:bg-slate-900/80 rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-white/10 shadow-2xl">
          {/* ═══ PROGRESS HEADER ═══ */}
          <div className="mb-8">
            <div className="flex items-center justify-between relative mb-2">
              {STEPS.map((s, idx) => {
                const isPassed = step > idx
                const isCurrent = step === idx
                const Icon = s.icon
                return (
                  <div key={s.id} className="flex flex-col items-center flex-1 relative z-10">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                        isPassed
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : isCurrent
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 dark:from-cyan-400 dark:to-indigo-500 text-white dark:text-slate-950 shadow-md shadow-orange-500/20 scale-110'
                          : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {isPassed ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span
                      className={`text-[11px] font-bold mt-2 ${
                        isCurrent
                          ? 'text-orange-600 dark:text-cyan-300'
                          : isPassed
                          ? 'text-slate-800 dark:text-slate-300'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ═══ STEP 0: CATEGORY SELECTION ═══ */}
          {step === 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">What type of business are you?</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  This customizes your storefront terminology, badges, and search discovery
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const isSelected = form.categoryId === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, categoryId: cat.id }))}
                      className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-orange-50/90 dark:bg-gradient-to-br dark:from-cyan-500/20 dark:to-indigo-500/20 border-orange-500 dark:border-cyan-400 shadow-sm scale-[1.02]'
                          : 'bg-slate-50/60 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-orange-500/10 dark:bg-cyan-500/10 text-orange-600 dark:text-cyan-400 flex items-center justify-center mb-2">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{cat.name}</p>
                        <p className="text-[10px] text-orange-600 dark:text-cyan-400 font-semibold">{cat.storefrontLabel}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 1: IDENTITY (HANDLE & NAME) ═══ */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Name your {selectedCategory?.storefrontLabel || 'Storefront'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Choose a unique handle for your storefront URL and brand name
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Storefront URL Handle *
                </label>
                <div className="flex items-center rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 overflow-hidden focus-within:border-orange-500 dark:focus-within:border-cyan-400 transition-colors">
                  <span className="pl-4 pr-1 text-slate-400 text-xs sm:text-sm font-mono font-bold">
                    universe.pk/@
                  </span>
                  <input
                    name="handle"
                    value={form.handle}
                    onChange={handleChange}
                    placeholder="mybrand"
                    className="flex-1 py-3 pr-4 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
                    maxLength={30}
                  />
                  <div className="pr-3 text-xs">
                    {handleStatus === 'checking' && <span className="text-slate-400">Checking...</span>}
                    {handleStatus === 'available' && <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Available</span>}
                    {handleStatus === 'taken' && <span className="text-rose-600 dark:text-rose-400 font-bold">✗ Taken</span>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Display Name *
                </label>
                <input
                  name="displayName"
                  value={form.displayName}
                  onChange={handleChange}
                  placeholder={`e.g. Artisanal Bakehouse`}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:border-orange-500 dark:focus:border-cyan-400 focus:outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Brand Tagline (Optional)
                </label>
                <input
                  name="tagline"
                  value={form.tagline}
                  onChange={handleChange}
                  placeholder="One sentence that captures your brand's essence"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:border-orange-500 dark:focus:border-cyan-400 focus:outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                  maxLength={200}
                />
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 2: BRANDING (COLOR PALETTE) ═══ */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Select Brand Theme Colors</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Choose a vibrant palette for your storefront banner, badges, and accents
                </p>
              </div>

              {/* Theme presets */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {THEME_PRESETS.map((t) => {
                  const isSelected = form.themeColor === t.primary
                  return (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, themeColor: t.primary, accentColor: t.accent }))}
                      className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-orange-500 dark:border-cyan-400 bg-orange-50/50 dark:bg-white/10 scale-[1.02] shadow-xs'
                          : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03] hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full shadow-xs" style={{ background: t.primary }} />
                        <div className="w-5 h-5 rounded-full shadow-xs" style={{ background: t.accent }} />
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{t.name}</p>
                    </button>
                  )
                })}
              </div>

              {/* Live Preview Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-slate-900/60 shadow-md">
                <div
                  className="h-20 w-full p-4 flex items-end justify-between"
                  style={{
                    background: `linear-gradient(135deg, ${form.themeColor}, ${form.accentColor})`,
                  }}
                >
                  <span className="text-xs font-mono font-bold text-slate-900 bg-white/90 px-2 py-0.5 rounded-md shadow-2xs">
                    @{form.handle || 'yourhandle'}
                  </span>
                </div>
                <div className="p-4 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs text-base"
                    style={{ background: form.themeColor }}
                  >
                    {form.displayName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {form.displayName || 'Your Storefront Name'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {form.tagline || 'Your tagline will be displayed here'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 3: DONE / CELEBRATION ═══ */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Storefront Is Live!</h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto mt-2 leading-relaxed">
                Congratulations! <strong className="text-orange-600 dark:text-cyan-400">@{form.handle}</strong> is now accessible to buyers.
                Head over to your dashboard to post listings.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-8 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 dark:from-cyan-400 dark:to-indigo-500 text-white dark:text-slate-950 font-bold text-sm shadow-lg shadow-orange-500/25 hover:scale-105 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>Go to Vendor Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* ═══ BOTTOM NAVIGATION ROW ═══ */}
          {step < 3 && (
            <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-white/10">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {errors._global && (
                <span className="text-rose-600 dark:text-rose-400 text-xs font-semibold">{errors._global}</span>
              )}

              <button
                type="button"
                disabled={!canNext() || saving}
                onClick={step === 2 ? handleFinish : () => setStep((s) => s + 1)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 dark:from-cyan-400 dark:to-indigo-500 text-white dark:text-slate-950 font-bold text-xs shadow-md shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                <span>{saving ? 'Creating Storefront...' : step === 2 ? 'Launch Storefront' : 'Next Step'}</span>
                {step === 2 ? <Rocket className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
