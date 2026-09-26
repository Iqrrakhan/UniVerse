import { useEffect, useState, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Search, 
  Sparkles, 
  Store, 
  ShoppingBag, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Layers, 
  MessageSquareHeart,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle2,
  Package,
  Heart,
  Compass,
  ArrowUpRight,
  BookOpen,
  Award,
  Truck
} from 'lucide-react'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import StorefrontCard from '../components/StorefrontCard'
import CategoryGrid from '../components/CategoryGrid'
import PageTransition from '../components/PageTransition'
import { useAuth } from '../context/AuthContext'

// Curated visual interests for "Jump into featured interests"
const FEATURED_INTERESTS = [
  {
    title: 'Handmade Ceramics and Pottery',
    query: 'ceramics',
    count: '34 Makers',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'Fine Jewelry and Keepsakes',
    query: 'jewelry',
    count: '52 Artisans',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'Organic Skincare and Botanicals',
    query: 'skincare',
    count: '28 Brands',
    image: 'https://images.unsplash.com/photo-1608248597359-5616f7ecfb4b?auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'Gourmet Pantry and Sweet Bakes',
    query: 'bakes',
    count: '41 Kitchens',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'Minimalist Home Accents',
    query: 'home',
    count: '39 Studios',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'Boutique Apparel and Leather',
    query: 'fashion',
    count: '46 Labels',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80'
  }
]

// Educational resource cards inspired by Faire's "Grow your retail business"
const BUSINESS_GUIDE_CARDS = [
  {
    id: 1,
    title: 'How to launch an independent brand: A simple six-step guide',
    category: 'Foundations',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    title: 'Pricing for profit: What wholesale and direct margins really mean',
    category: 'Financial Strategy',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    title: 'Curating your first catalog: Data-backed essentials for your launch',
    category: 'Merchandising',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 4,
    title: 'Scaling sustainable production: Guard your creative capacity and craft',
    category: 'Operations',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?auto=format&fit=crop&w=800&q=80'
  }
]

export default function Home() {
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [categories, setCategories] = useState([])
  const [featuredStorefronts, setFeaturedStorefronts] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('ALL')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()
  const rowScrollRef = useRef(null)

  // Current month & year string (e.g. "September 2026")
  const currentMonthYear = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date())
  }, [])

  useEffect(() => {
    Promise.all([
      api.get('/categories'),
      api.get('/products?limit=50'),
      api.get('/storefronts?limit=4'),
    ])
      .then(([catRes, prodRes, storeRes]) => {
        setCategories(catRes.data || [])
        const prods = prodRes.data.products || []
        setProducts(prods)
        setFiltered(prods)
        setFeaturedStorefronts(storeRes.data || [])
      })
      .catch((err) => {
        console.error('Home data load error:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  // Filter products when category, type, or search changes
  useEffect(() => {
    let result = products
    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category?.slug === activeCategory)
    }
    if (selectedType !== 'ALL') {
      result = result.filter((p) => p.itemType === selectedType)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.storefront?.displayName?.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [activeCategory, selectedType, search, products])

  // AI-curated "Discover our best of [current month]" algorithm:
  // Group products by storefront. If a brand has an isPinned item, prioritize that.
  // Take 1 item per brand in round-robin fashion so all brands are showcased fairly (up to 10 products).
  const curatedBestProducts = useMemo(() => {
    if (!products.length) return []
    const byBrand = new Map()

    products.forEach((p) => {
      const brandKey = p.storefront?.id || p.storefrontId || 'unknown'
      if (!byBrand.has(brandKey)) {
        byBrand.set(brandKey, [])
      }
      byBrand.get(brandKey).push(p)
    })

    const selected = []
    const brandLists = Array.from(byBrand.values()).map((list) => {
      // Sort pinned/featured to front
      return [...list].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
    })

    let round = 0
    while (selected.length < 10 && brandLists.some((list) => list.length > round)) {
      for (const list of brandLists) {
        if (selected.length >= 10) break
        if (list[round]) {
          selected.push(list[round])
        }
      }
      round++
    }

    return selected
  }, [products])

  const scrollCarousel = (direction) => {
    if (!rowScrollRef.current) return
    const offset = direction === 'left' ? -380 : 380
    rowScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
  }

  return (
    <PageTransition className="min-h-screen bg-[#F8FAFC] dark:bg-[#070913] text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors duration-250">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-5%] left-[20%] w-[550px] h-[550px] bg-orange-300/25 dark:bg-cyan-600/10 rounded-full blur-[140px] animate-pulse-glow" />
        <div className="absolute top-[25%] right-[-5%] w-[500px] h-[500px] bg-amber-300/20 dark:bg-indigo-600/10 rounded-full blur-[150px] animate-pulse-glow" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-[-5%] left-[-5%] w-[600px] h-[600px] bg-rose-300/20 dark:bg-purple-600/10 rounded-full blur-[160px] animate-pulse-glow" style={{ animationDelay: '6s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <Navbar />

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="pt-32 sm:pt-36 pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            {/* Shimmer Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-orange-50 dark:bg-white/5 border border-orange-200/80 dark:border-white/10 text-orange-600 dark:text-cyan-300 backdrop-blur-md mb-6 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-500 dark:text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Next-Gen Commerce for Independent Creators and Local Brands</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] mb-6 text-slate-900 dark:text-white"
            >
              Discover and Support <br />
              <span className="gradient-text">Exceptional Local</span> Brands
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
            >
              Explore independent artisans, handcrafted ceramics, bespoke apparel, boutique homeware, and gourmet makers. 
              Direct communication with merchants, authentic verified reviews, and zero commission fees.
            </motion.p>

            {/* Hero CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3.5"
            >
              <a
                href="#marketplace-feed"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 dark:from-cyan-400 dark:via-sky-300 dark:to-indigo-400 text-white dark:text-slate-950 font-bold text-sm shadow-lg shadow-orange-500/25 dark:shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Explore Marketplace</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              {!user?.storefront && (
                <Link
                  to={user ? '/setup-store' : '/register'}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-800 dark:text-white border border-slate-200 dark:border-white/15 font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <Store className="w-4 h-4 text-orange-500 dark:text-cyan-400" />
                  <span>{user ? 'Launch Your Storefront' : 'Open Storefront Free'}</span>
                </Link>
              )}
            </motion.div>

            {/* Feature Highlights Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="mt-14 pt-8 border-t border-slate-200 dark:border-white/5 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-left"
            >
              {[
                { icon: Zap, title: 'Instant Storefront', desc: 'Ready in 2 minutes free' },
                { icon: MessageSquareHeart, title: 'Direct Chat', desc: 'Direct buyer-seller messaging' },
                { icon: ShieldCheck, title: 'Verified Makers', desc: 'Authentic local reviews' },
                { icon: Layers, title: 'Multi-Format', desc: 'Physical, bespoke and digital' },
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04] shadow-2xs">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-cyan-500/10 border border-orange-200/60 dark:border-cyan-500/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-orange-500 dark:text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-200">{item.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                )
              })}
            </motion.div>
          </div>
        </section>

        {/* SECTION: JUMP INTO FEATURED INTERESTS */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-orange-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Compass className="w-3.5 h-3.5" />
                <span>Curated Collections</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Jump into featured interests
              </h2>
            </div>
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
              Handcrafted specialties from independent makers
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {FEATURED_INTERESTS.map((interest, idx) => (
              <motion.div
                key={interest.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                onClick={() => {
                  setSearch(interest.query)
                  const el = document.getElementById('marketplace-feed')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer aspect-4/5 bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-xs hover:shadow-xl hover:border-orange-400 dark:hover:border-cyan-400 transition-all duration-300"
              >
                <img
                  src={interest.image}
                  alt={interest.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex flex-col justify-end p-3.5" />
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-300">
                    {interest.count}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-white leading-tight mt-0.5 group-hover:text-orange-200 transition-colors">
                    {interest.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION: DISCOVER OUR BEST OF [CURRENT MONTH] 2026 */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-orange-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Merchandising Engine</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Discover our best of {currentMonthYear}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                A non-random, fair showcase selecting top featured items across brands one by one.
              </p>
            </div>

            {/* Scroll navigation arrows */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => scrollCarousel('left')}
                aria-label="Scroll left"
                className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-orange-500 transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollCarousel('right')}
                aria-label="Scroll right"
                className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-orange-500 transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 10 Moving Products Row */}
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Curating top brand pieces...
            </div>
          ) : curatedBestProducts.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-white/5">
              Check back soon as merchants feature their creations.
            </div>
          ) : (
            <div
              ref={rowScrollRef}
              className="flex items-stretch gap-5 overflow-x-auto no-scrollbar py-2 scroll-smooth"
            >
              {curatedBestProducts.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => p.storefront?.handle && navigate(`/store/${p.storefront.handle}`)}
                  className="w-72 sm:w-80 shrink-0 bg-white dark:bg-slate-900/70 rounded-2xl overflow-hidden border border-slate-200/90 dark:border-white/10 shadow-xs hover:shadow-xl hover:border-orange-400 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
                >
                  <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center">
                    {p.images?.[0]?.url ? (
                      <img
                        src={p.images[0].url}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Package className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                    )}

                    {/* Badge: Brand rotation index */}
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 dark:bg-slate-900/90 text-orange-600 dark:text-cyan-400 border border-orange-200/80 dark:border-cyan-500/30 flex items-center gap-1 shadow-2xs">
                      <Star className="w-2.5 h-2.5 fill-orange-500 text-orange-500" />
                      <span>Best of {p.storefront?.displayName || 'Brand'}</span>
                    </div>

                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-white/90 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                      #{idx + 1}
                    </span>
                  </div>

                  <div className="p-4 flex flex-col flex-1 justify-between gap-2.5">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {p.storefront?.displayName}
                        </span>
                        <span>·</span>
                        <span className="text-[11px]">{p.category?.name}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 group-hover:text-orange-600 transition-colors">
                        {p.title}
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 line-clamp-2">
                        {p.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                      <span className="font-black text-slate-900 dark:text-white text-sm">
                        Rs {Number(p.basePrice).toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-0.5">
                        <span>Visit Store</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* FEATURED STOREFRONTS SECTION */}
        {featuredStorefronts.length > 0 && (
          <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 text-orange-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Handpicked Creators</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Featured Storefronts</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredStorefronts.map((store, idx) => (
                <StorefrontCard key={store.id} storefront={store} index={idx} />
              ))}
            </div>
          </section>
        )}

        {/* MARKETPLACE FEED AND FILTERS */}
        <section id="marketplace-feed" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Header & Search Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Marketplace Catalog</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">Explore authentic creations and bespoke services</p>
            </div>

            {/* Search Input Box */}
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products, services, or brands..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:border-orange-500 dark:focus:border-cyan-400 focus:ring-1 focus:ring-orange-500/30 dark:focus:ring-cyan-400/40 focus:outline-none text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-2xs backdrop-blur-md transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Bar Component */}
          {categories.length > 0 && (
            <div className="mb-6">
              <CategoryGrid
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
              />
            </div>
          )}

          {/* Sub-Filters: Item Format */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-2">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Format:</span>
            </span>
            {[
              { id: 'ALL', label: 'All Items' },
              { id: 'PHYSICAL', label: 'Physical Goods' },
              { id: 'SERVICE', label: 'Custom Services' },
              { id: 'DIGITAL', label: 'Digital Assets' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedType === type.id
                    ? 'bg-orange-500 text-white shadow-2xs dark:bg-cyan-500/20 dark:text-cyan-300 dark:border dark:border-cyan-500/40'
                    : 'bg-white dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-white/[0.06]'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-9 h-9 border-2 border-orange-500 dark:border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Curating listings from local merchants...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center glass-panel rounded-3xl p-8 max-w-lg mx-auto border border-slate-200 dark:border-white/10">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No listings found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">
                Try searching for something else, or switch the selected category and filter.
              </p>
              <button
                onClick={() => {
                  setActiveCategory('all')
                  setSelectedType('ALL')
                  setSearch('')
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-white/10 transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          )}
        </section>

        {/* SECTION: GROW YOUR INDEPENDENT BRAND WITH UNIVERSE (Faire-inspired) */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-cyan-400 mb-1 block">
                Partner with UniVerse
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 dark:text-white font-normal">
                Grow your independent brand with UniVerse
              </h2>
            </div>
            <Link
              to="/founders-hub"
              className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-cyan-400 inline-flex items-center gap-1 group"
            >
              <span>Explore Founder Hub</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* 4 Photo Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {BUSINESS_GUIDE_CARDS.map((guide) => (
              <div
                key={guide.id}
                className="group flex flex-col cursor-pointer"
                onClick={() => navigate(`/founders-hub#guide-${guide.id}`)}
              >
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 border border-slate-200/80 dark:border-white/10 shadow-xs">
                  <img
                    src={guide.image}
                    alt={guide.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/95 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 shadow-xs">
                    {guide.category}
                  </span>
                </div>
                <h3 className="font-serif text-slate-900 dark:text-white text-base font-medium leading-snug group-hover:text-orange-600 transition-colors">
                  {guide.title}
                </h3>
                <span className="text-[11px] text-slate-400 mt-1">{guide.readTime}</span>
              </div>
            ))}
          </div>

          {/* 4 Step-by-Step Guidance Pillars */}
          <div className="bg-white dark:bg-slate-900/60 rounded-3xl p-8 sm:p-10 border border-slate-200/90 dark:border-white/10 shadow-xs">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              How we help nurture and scale your business
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mb-8 max-w-2xl">
              We provide the digital infrastructure so independent makers can focus on creating exceptional products while reaching genuine shoppers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5">
                <span className="text-xs font-black text-orange-600 dark:text-cyan-400 block mb-2">STEP 01</span>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">Claim Your Brand Flagship</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  Choose your unique @handle, upload custom cover photography, and link your Instagram, WhatsApp, and website.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5">
                <span className="text-xs font-black text-orange-600 dark:text-cyan-400 block mb-2">STEP 02</span>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">0% Fees for 2 Full Years</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  Keep 100% of your listed product prices with zero recurring subscription charges or hidden commissions.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5">
                <span className="text-xs font-black text-orange-600 dark:text-cyan-400 block mb-2">STEP 03</span>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">Direct Buyer Relationships</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  Talk directly with clients over built-in messaging, handle custom commission orders, and build lasting loyalty.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5">
                <span className="text-xs font-black text-orange-600 dark:text-cyan-400 block mb-2">STEP 04</span>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">AI Catalog Merchandising</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  Mark your favorite pieces as featured; our platform algorithm distributes them fairly across trending showcases.
                </p>
              </div>
            </div>

            {/* Extra 2 Guides / Support Pillars */}
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-cyan-500/10 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4 text-orange-500 dark:text-cyan-400" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs">Packaging and Logistics Support</h5>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Access our vetted supplier contacts for eco-friendly boxes, thermal labels, and discounted domestic shipping rates.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-cyan-500/10 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-orange-500 dark:text-cyan-400" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs">Verified Maker Badging</h5>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Fast-track your business verification to unlock trusted maker badges, prominent search ranking, and wholesale inquiries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-slate-200 dark:border-white/5 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-500 dark:from-cyan-500 dark:to-indigo-600 flex items-center justify-center text-white dark:text-slate-950 text-xs font-black shadow-2xs">
                U
              </div>
              <span className="font-black text-slate-900 dark:text-white tracking-tight">
                Uni<span className="text-orange-500 dark:text-cyan-400">Verse</span>
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">Marketplace-as-a-Service Platform</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} UniVerse Technologies. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </PageTransition>
  )
}