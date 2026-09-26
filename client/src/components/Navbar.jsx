import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { 
  Store, 
  ShoppingBag, 
  MessageSquare, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X, 
  Sparkles, 
  Sun, 
  Moon, 
  ChevronDown,
  Search,
  ArrowRight,
  TrendingUp,
  Tag,
  Gift,
  Heart,
  Compass
} from 'lucide-react'
import api from '../api/axios'

const POPULAR_CATEGORIES = [
  { name: 'Food & Drink', slug: 'food-beverage', desc: 'Artisan bakeries, specialty coffee, organic treats' },
  { name: 'Jewelry & Accessories', slug: 'jewelry-accessories', desc: 'Handcrafted rings, gemstones, custom pieces' },
  { name: 'Home & Living', slug: 'home-living', desc: 'Hand-poured candles, ceramics, wall decor' },
  { name: 'Beauty & Wellness', slug: 'beauty-personal-care', desc: 'Botanical skincare, organic balms, scents' },
  { name: 'Art & Handmade', slug: 'art-collectibles', desc: 'Original paintings, pottery, bespoke craft' },
  { name: 'Fashion & Boutique', slug: 'clothing-apparel', desc: 'Independent apparel, linen wear, boutique designs' },
  { name: 'Paper & Stationery', slug: 'stationery-craft-supplies', desc: 'Journals, planners, illustrated prints' },
  { name: 'Kids & Baby', slug: 'baby-kids', desc: 'Handmade toys, nursery decor, organic wear' },
  { name: 'Books & Prints', slug: 'books-magazines', desc: 'Independent publications, zines, photo books' },
]

const CURATED_COLLECTIONS = [
  { name: 'Trending Collections', icon: TrendingUp },
  { name: 'New Independent Brands', icon: Store },
  { name: 'Bestselling Handcrafted Items', icon: Sparkles },
  { name: 'Gift Guides & Bundles', icon: Gift },
  { name: 'Eco-Friendly & Sustainable', icon: Heart },
]

export default function Navbar() {
  const { user, logout, isVendor } = useAuth()
  const { theme, toggleTheme, isDark } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [navSearch, setNavSearch] = useState('')
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setCategories(data || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (user) {
      api.get('/messages/unread-count')
        .then(({ data }) => setUnreadCount(data.unreadCount || 0))
        .catch(() => {})
    }
  }, [user, location.pathname])

  const handleLogout = async () => {
    setUserDropdownOpen(false)
    await logout()
    navigate('/login')
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (!navSearch.trim()) return
    navigate(`/?search=${encodeURIComponent(navSearch.trim())}`)
  }

  const handleCategoryClick = (slug) => {
    setCategoryDrawerOpen(false)
    navigate(`/?category=${slug}`)
  }

  const navLinks = [
    { name: 'Marketplace', path: '/', icon: ShoppingBag },
    ...(isVendor ? [{ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }] : []),
    ...(user ? [{ name: 'Orders', path: '/orders', icon: ShoppingBag }] : []),
    ...(user ? [{ 
      name: 'Messages', 
      path: '/chat', 
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : null 
    }] : []),
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 dark:bg-[#070913]/95 backdrop-blur-xl border-b border-slate-200/90 dark:border-white/10 shadow-xs dark:shadow-2xl py-2.5'
            : 'bg-white/90 dark:bg-[#070913]/85 backdrop-blur-md border-b border-slate-200/70 dark:border-white/5 py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            
            {/* Left: Brand Logo & All Categories Toggle Button */}
            <div className="flex items-center gap-3 shrink-0">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 dark:from-cyan-500 dark:to-indigo-500 p-[1px] shadow-sm shadow-orange-500/20 group-hover:shadow-orange-500/30 transition-shadow">
                  <div className="w-full h-full bg-white dark:bg-[#070913] rounded-[11px] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-orange-500 dark:text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                </div>
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Uni<span className="gradient-text font-black">Verse</span>
                </span>
              </Link>

              {/* Three-Bar "All Categories" Button (Faire Style) */}
              <button
                type="button"
                onClick={() => setCategoryDrawerOpen(!categoryDrawerOpen)}
                className={`hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  categoryDrawerOpen
                    ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/70 text-slate-800 border-slate-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-300 dark:border-white/10'
                }`}
                title="Browse Categories"
              >
                <Menu className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>All Categories</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${categoryDrawerOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Center: Search Bar in Navbar (Faire / Etsy Reference) */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg hidden md:block">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search products, brands, or categories..."
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full text-xs sm:text-sm bg-slate-100/90 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:border-orange-500 dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all shadow-2xs"
                />
              </div>
            </form>

            {/* Right: Nav Links, Store Link, Theme Switcher & Auth */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* Desktop Nav Links */}
              <div className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => {
                  const active = isActive(link.path)
                  const Icon = link.icon
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`relative px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                        active
                          ? 'text-orange-600 dark:text-cyan-400 bg-orange-50 dark:bg-white/10'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{link.name}</span>
                      {link.badge && (
                        <span className="px-1.5 py-0.2 bg-orange-500 dark:bg-cyan-500 text-white dark:text-slate-950 text-[10px] font-bold rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}

                {/* Direct Storefront Link for Vendors */}
                {isVendor && user?.storefront && (
                  <Link
                    to={`/store/${user.storefront.handle}`}
                    className="px-3 py-1.5 rounded-full text-xs font-bold bg-orange-500/10 dark:bg-cyan-500/15 border border-orange-500/30 dark:border-cyan-500/30 text-orange-600 dark:text-cyan-300 hover:bg-orange-500/20 transition-all flex items-center gap-1.5"
                  >
                    <Store className="w-3.5 h-3.5 text-orange-500 dark:text-cyan-400" />
                    <span>@{user.storefront.handle}</span>
                  </Link>
                )}
              </div>

              {/* Theme Toggle Button */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={toggleTheme}
                className="p-2 rounded-xl border transition-all duration-200 bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-amber-600 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:text-cyan-300 flex items-center justify-center cursor-pointer shadow-2xs"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isDark ? (
                    <motion.div
                      key="moon"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="sun"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* User Profile / Auth */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 dark:from-cyan-500 dark:to-indigo-500 flex items-center justify-center text-xs font-bold text-white dark:text-slate-950">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-xs font-bold text-slate-800 dark:text-white max-w-[90px] truncate">{user.name}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-slate-900 p-2 shadow-xl border border-slate-200 dark:border-white/15 z-50"
                      >
                        {isVendor && user?.storefront && (
                          <Link
                            to={`/store/${user.storefront.handle}`}
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors"
                          >
                            <Store className="w-4 h-4 text-orange-500 dark:text-cyan-400" />
                            <span>View Public Store</span>
                          </Link>
                        )}
                        {isVendor && (
                          <Link
                            to="/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                            <span>Vendor Dashboard</span>
                          </Link>
                        )}
                        {isVendor && !user?.storefront && (
                          <Link
                            to="/setup-store"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-orange-600 dark:text-cyan-300 hover:bg-orange-50 dark:hover:bg-cyan-500/10 rounded-xl transition-colors"
                          >
                            <Sparkles className="w-4 h-4 text-orange-500 dark:text-cyan-400" />
                            <span>Set Up Storefront</span>
                          </Link>
                        )}
                        <Link
                          to="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4 text-purple-500" />
                          <span>My Purchases</span>
                        </Link>
                        <div className="h-[1px] bg-slate-100 dark:bg-white/10 my-1" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 dark:from-cyan-400 dark:to-indigo-500 dark:text-slate-950 shadow-xs hover:shadow-orange-500/20 transition-all"
                  >
                    Join Free
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar on Smaller Screens */}
          <form onSubmit={handleSearchSubmit} className="mt-2.5 md:hidden">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products, brands, or categories..."
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
              />
            </div>
          </form>
        </div>
      </nav>

      {/* ═══ FAIRE-STYLE MEGA CATEGORY DRAWER / MODAL ═══ */}
      <AnimatePresence>
        {categoryDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-start pt-16 sm:pt-20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCategoryDrawerOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-5xl mx-auto px-4 z-10"
            >
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/15 p-6 sm:p-8 overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10 mb-6">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-orange-500 dark:text-cyan-400" />
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Explore Categories &amp; Collections</h3>
                  </div>
                  <button
                    onClick={() => setCategoryDrawerOpen(false)}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Column 1 & 2: Popular Categories with descriptions */}
                  <div className="md:col-span-2 space-y-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Product Categories
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {POPULAR_CATEGORIES.map((cat) => (
                        <button
                          key={cat.slug}
                          onClick={() => handleCategoryClick(cat.slug)}
                          className="p-3 rounded-2xl bg-slate-50 hover:bg-orange-50 dark:bg-white/[0.03] dark:hover:bg-white/[0.08] border border-slate-200/80 hover:border-orange-300 dark:border-white/5 text-left transition-all group cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-orange-600 dark:group-hover:text-cyan-300 transition-colors">
                              {cat.name}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-orange-600 transition-all" />
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                            {cat.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Column 3: Curated Collections (Faire Style) */}
                  <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-100 dark:border-white/10 md:pl-6 pt-4 md:pt-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Curated Highlights
                    </p>
                    <div className="space-y-2">
                      {CURATED_COLLECTIONS.map((col, idx) => {
                        const Icon = col.icon
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setCategoryDrawerOpen(false)
                              navigate('/#marketplace-feed')
                            }}
                            className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-left flex items-center gap-3 transition-colors text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-cyan-300 cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-cyan-500/10 text-orange-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span>{col.name}</span>
                          </button>
                        )
                      })}
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-white/10">
                      <Link
                        to={user?.storefront ? `/store/${user.storefront.handle}` : (user ? '/setup-store' : '/register')}
                        onClick={() => setCategoryDrawerOpen(false)}
                        className="block p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-white/5 dark:to-white/10 border border-orange-200/80 dark:border-white/10 text-left"
                      >
                        <p className="text-xs font-bold text-orange-900 dark:text-white">Are you an independent brand?</p>
                        <p className="text-[11px] text-orange-700 dark:text-slate-400 mt-0.5">
                          Set up your digital storefront free for 2 years.
                        </p>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 dark:text-cyan-400 mt-2">
                          <span>Get Started</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden fixed top-16 left-0 right-0 z-30 border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#070913]/95 backdrop-blur-2xl px-4 py-5 shadow-xl"
          >
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setCategoryDrawerOpen(true)
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-orange-50 dark:bg-white/5 text-sm font-bold text-orange-700 dark:text-cyan-300"
              >
                <div className="flex items-center gap-3">
                  <Menu className="w-4 h-4" />
                  <span>Browse All Categories</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>

              {navLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 text-sm font-bold text-slate-800 dark:text-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-orange-500 dark:text-cyan-400" />
                      <span>{link.name}</span>
                    </div>
                    {link.badge && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500 dark:bg-cyan-500 text-white dark:text-slate-950">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                )
              })}

              {isVendor && user?.storefront && (
                <Link
                  to={`/store/${user.storefront.handle}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-50 border border-orange-200 dark:bg-cyan-500/10 text-sm font-bold text-orange-600 dark:text-cyan-300"
                >
                  <Store className="w-4 h-4 text-orange-500 dark:text-cyan-400" />
                  <span>Public Store (@{user.storefront.handle})</span>
                </Link>
              )}

              {user ? (
                <div className="pt-3 border-t border-slate-200 dark:border-white/10">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleLogout()
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 text-sm font-bold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-200 dark:border-white/10 grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center py-2.5 rounded-xl bg-slate-100 text-sm font-bold text-slate-800"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-sm font-bold text-white"
                  >
                    Join Free
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}