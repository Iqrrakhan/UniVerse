import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, Star, MessageSquare, Settings, ShoppingBag, ArrowLeft,
  Share2, Package, Users, Palmtree, Check, Globe, Zap, FileCode,
  Search, Heart, Calendar, Clock, Phone, Pin, BookOpen,
  Grid3X3, List, ExternalLink, TrendingUp, Award, Sparkles,
  X, Truck, MapPin, CreditCard,
} from 'lucide-react'
import { InstagramIcon, FacebookIcon, WhatsAppIcon } from '../components/SocialIcons'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import PageTransition from '../components/PageTransition'
import { useAuth } from '../context/AuthContext'

const StarRating = ({ rating, size = 'sm' }) => {
  const sz = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((star) => (
        <Star key={star} className={`${sz} ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
      ))}
    </div>
  )
}

const POST_TYPE_LABELS = {
  FOUNDING_STORY: 'Founding Story', UPDATE: 'Update', MILESTONE: 'Milestone',
  BEHIND_THE_SCENES: 'Behind the Scenes', ANNOUNCEMENT: 'Announcement',
}
const POST_TYPE_COLORS = {
  FOUNDING_STORY: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  UPDATE: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30',
  MILESTONE: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30',
  BEHIND_THE_SCENES: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30',
  ANNOUNCEMENT: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30',
}

function ProductCard({ product, onOrder, isOwner, vacationMode }) {
  const [liked, setLiked] = useState(false)
  return (
    <motion.div layout initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
      className="group relative flex flex-col rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 shadow-sm hover:shadow-xl hover:border-orange-300/60 dark:hover:border-cyan-500/40 transition-all duration-300 overflow-hidden">
      <div className="relative h-56 w-full bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center">
        {product.images?.[0]?.url
          ? <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="text-slate-300 dark:text-slate-700 flex flex-col items-center gap-1">
              {product.itemType==='SERVICE' ? <Zap className="w-10 h-10" /> : product.itemType==='DIGITAL' ? <FileCode className="w-10 h-10" /> : <Package className="w-10 h-10" />}
              <span className="text-[10px] uppercase font-bold tracking-wider">{product.itemType}</span>
            </div>}
        {product.isPinned && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/90 text-white backdrop-blur-sm flex items-center gap-1">
            <Pin className="w-3 h-3" /> Featured
          </span>
        )}
        <span className="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 dark:bg-slate-950/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 backdrop-blur-sm">
          {product.itemType}
        </span>
        <button onClick={() => setLiked(l => !l)} className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 backdrop-blur-sm flex items-center justify-center shadow-sm transition-all hover:scale-110 cursor-pointer">
          <Heart className={`w-4 h-4 transition-colors ${liked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
        </button>
      </div>
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{product.title}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">{product.description}</p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-3 pt-2.5 border-t border-slate-100 dark:border-white/5">
            <span className="text-lg font-black text-slate-900 dark:text-white">Rs {Number(product.basePrice).toLocaleString()}</span>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${product.inStock ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30'}`}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          <button onClick={() => onOrder(product)} disabled={!product.inStock || isOwner || vacationMode}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 dark:from-cyan-400 dark:to-indigo-500 text-white dark:text-slate-950 text-xs font-bold shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]">
            <ShoppingBag className="w-4 h-4" />
            {!product.inStock ? 'Out of Stock' : isOwner ? 'Your Product' : vacationMode ? 'Store Paused' : 'Order Now'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function PostCard({ post }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = post.content?.length > 280
  const preview = isLong && !expanded ? post.content.slice(0, 280) + '...' : post.content
  return (
    <motion.article initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
      className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
      {post.coverImage && (
        <div className="relative w-full h-72 bg-slate-100 dark:bg-slate-950 overflow-hidden">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          {post.isPinned && <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/90 text-white backdrop-blur-sm flex items-center gap-1"><Pin className="w-3 h-3" /> Pinned</span>}
        </div>
      )}
      {!post.coverImage && post.mediaUrls?.length > 0 && (
        <div className={`grid gap-0.5 ${post.mediaUrls.length === 1 ? 'grid-cols-1' : post.mediaUrls.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {post.mediaUrls.slice(0, 6).map((url, i) => (
            <div key={i} className="relative aspect-square bg-slate-100 dark:bg-slate-950 overflow-hidden">
              <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              {i === 5 && post.mediaUrls.length > 6 && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-black text-xl">+{post.mediaUrls.length - 6}</div>}
            </div>
          ))}
        </div>
      )}
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${POST_TYPE_COLORS[post.postType] || POST_TYPE_COLORS.UPDATE}`}>{POST_TYPE_LABELS[post.postType] || post.postType}</span>
          <span className="text-slate-400 text-xs flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-PK', { day:'numeric', month:'short', year:'numeric' })}</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 leading-snug">{post.title}</h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">{preview}</p>
        {isLong && <button onClick={() => setExpanded(e => !e)} className="mt-3 text-orange-600 dark:text-cyan-400 text-xs font-bold hover:underline cursor-pointer">{expanded ? 'Show less' : 'Read more'}</button>}
      </div>
    </motion.article>
  )
}

export default function Store() {
  const { handle } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('home')
  const [copied, setCopied] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  const [productView, setProductView] = useState('grid')
  const [productFilter, setProductFilter] = useState('all')

  // Checkout modal states
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
  const [checkoutProduct, setCheckoutProduct] = useState(null)
  const [checkoutQuantity, setCheckoutQuantity] = useState(1)
  const [checkoutAddress, setCheckoutAddress] = useState('')
  const [checkoutCity, setCheckoutCity] = useState('')
  const [checkoutPhone, setCheckoutPhone] = useState('')
  const [checkoutNote, setCheckoutNote] = useState('')
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState('COD')
  const [submittingOrder, setSubmittingOrder] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [placedOrder, setPlacedOrder] = useState(null)

  useEffect(() => { fetchStore() }, [handle])

  const fetchStore = async () => {
    setLoading(true); setError('')
    try {
      const { data } = await api.get(`/storefronts/${handle}`)
      setStore(data)
    } catch (err) {
      if (err.response?.status === 404) setError('This storefront could not be found.')
      else if (err.response?.status === 403) setError('This storefront has been suspended.')
      else setError('Failed to load storefront details.')
    } finally { setLoading(false) }
  }

  const handleShare = () => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const placeOrder = (product) => {
    if (!user) { navigate('/login'); return }
    if (store?.ownerId === user.id) return
    setCheckoutProduct(product)
    setCheckoutQuantity(1)
    setCheckoutAddress('')
    setCheckoutCity('')
    setCheckoutPhone(user?.phone || '')
    setCheckoutNote('')
    setCheckoutPaymentMethod('COD')
    setPlacedOrder(null)
    setCheckoutError('')
    setCheckoutModalOpen(true)
  }

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault()
    if (!checkoutProduct) return
    if (checkoutProduct.itemType === 'PHYSICAL' && (!checkoutAddress.trim() || !checkoutCity.trim())) {
      setCheckoutError('Please provide delivery address and city.')
      return
    }
    setSubmittingOrder(true)
    setCheckoutError('')
    try {
      const { data } = await api.post('/orders', {
        storefrontId: store.id,
        items: [{ productId: checkoutProduct.id, quantity: checkoutQuantity }],
        paymentMethod: checkoutPaymentMethod,
        deliveryMethod: checkoutProduct.itemType === 'DIGITAL' ? 'DIGITAL_DELIVERY' : 'DELIVERY',
        deliveryAddress: {
          address: checkoutAddress.trim(),
          city: checkoutCity.trim(),
          phone: checkoutPhone.trim(),
        },
        buyerNote: checkoutNote.trim(),
      })
      setPlacedOrder(data)
    } catch (err) {
      setCheckoutError(err.response?.data?.message || 'Failed to place order.')
    } finally {
      setSubmittingOrder(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070913] flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-2 border-orange-500 dark:border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Entering storefront...</p>
      </div>
    </div>
  )

  if (error || !store) return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070913] flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm"><Package className="w-8 h-8 text-orange-500" /></div>
        <div className="text-center"><h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Storefront Unavailable</h2><p className="text-sm text-slate-500">{error}</p></div>
        <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white text-xs font-semibold transition-all cursor-pointer"><ArrowLeft className="w-4 h-4" /> Back to Marketplace</button>
      </div>
    </div>
  )

  const isOwner = user && store?.ownerId === user.id
  const hasBanner = !!store.bannerUrl
  const social = store.socialLinks || {}
  const teamMembers = store.teamMembers || []
  const avgRating = store.avgRating
  const filteredProducts = (store.products || []).filter(p => {
    const matchSearch = !productSearch || p.title.toLowerCase().includes(productSearch.toLowerCase()) || p.description?.toLowerCase().includes(productSearch.toLowerCase())
    const matchFilter = productFilter === 'all' || p.itemType === productFilter
    return matchSearch && matchFilter
  })
  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'products', label: `Products (${store.products?.length || 0})` },
    { id: 'blog', label: `Blogs & Posts${store.posts?.length ? ` (${store.posts.length})` : ''}` },
    { id: 'about', label: 'About Us' },
    { id: 'reviews', label: `Reviews (${store._count?.reviews || 0})` },
  ]

  return (
    <PageTransition className="min-h-screen bg-[#F8FAFC] dark:bg-[#070913] text-slate-900 dark:text-slate-100 transition-colors duration-250">
      <Navbar />
      <div className="relative pt-16 sm:pt-20 overflow-hidden">
        <div className={`relative min-h-[280px] md:min-h-[340px] w-full flex items-end overflow-hidden ${hasBanner ? 'bg-cover bg-center' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-white dark:from-slate-900 dark:via-cyan-950/40 dark:to-purple-950/40 border-b border-orange-100 dark:border-white/5'}`}
          style={hasBanner ? { backgroundImage: `url(${store.bannerUrl})` } : {}}>
          {hasBanner
            ? <div className="absolute inset-0 bg-gradient-to-t from-white via-white/65 to-transparent dark:from-[#070913] dark:via-[#070913]/55 dark:to-transparent" />
            : <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC]/95 via-transparent dark:from-[#070913]/90 dark:via-transparent" />}
          {!hasBanner && <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 0)', backgroundSize: '24px 24px' }} />}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
              <div className="flex items-end gap-5">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-4 border-white dark:border-[#070913] shadow-xl flex items-center justify-center font-black text-3xl sm:text-4xl text-white shrink-0 overflow-hidden bg-gradient-to-tr from-orange-500 to-amber-500 dark:from-cyan-500 dark:to-indigo-500">
                  {store.logoUrl ? <img src={store.logoUrl} alt={store.displayName} className="w-full h-full object-cover" /> : store.displayName?.charAt(0).toUpperCase()}
                </div>
                <div className="mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">{store.displayName}</h1>
                    {store.owner?.verificationTier === 'BUSINESS_VERIFIED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30"><CheckCircle2 className="w-3.5 h-3.5" /> Verified Brand</span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-orange-600 dark:text-cyan-400 font-bold mt-0.5">@{store.handle}{store.category && <span className="text-slate-500 dark:text-slate-400 font-normal"> - {store.category.name}</span>}</p>
                  {store.tagline && <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1.5 italic max-w-xl font-medium">"{store.tagline}"</p>}
                  {(social.instagram || social.facebook || social.whatsapp || social.website) && (
                    <div className="flex items-center gap-2 mt-2.5">
                      {social.instagram && <a href={social.instagram.startsWith('http') ? social.instagram : `https://instagram.com/${social.instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-white/80 dark:bg-white/10 hover:bg-orange-50 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-orange-600 transition-colors"><InstagramIcon className="w-3.5 h-3.5" /></a>}
                      {social.facebook && <a href={social.facebook.startsWith('http') ? social.facebook : `https://facebook.com/${social.facebook}`} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-white/80 dark:bg-white/10 hover:bg-blue-50 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"><FacebookIcon className="w-3.5 h-3.5" /></a>}
                      {social.whatsapp && <a href={`https://wa.me/${social.whatsapp.replace(/[^0-9]/g,'')}`} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-white/80 dark:bg-white/10 hover:bg-emerald-50 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors"><WhatsAppIcon className="w-3.5 h-3.5" /></a>}
                      {social.website && <a href={social.website.startsWith('http') ? social.website : `https://${social.website}`} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-white/80 dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"><Globe className="w-3.5 h-3.5" /></a>}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
                <button onClick={handleShare} className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-slate-200 dark:border-white/15 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer">
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />} {copied ? 'Copied!' : 'Share'}
                </button>
                {!isOwner && user && <button onClick={() => navigate(`/chat/${store.owner?.id}`)} className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"><MessageSquare className="w-4 h-4" /> Message Seller</button>}
                {!isOwner && !user && <button onClick={() => navigate('/login')} className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"><ShoppingBag className="w-4 h-4" /> Shop Now</button>}
                {isOwner && <Link to="/dashboard" className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"><Settings className="w-4 h-4" /> Manage Store</Link>}
              </div>
            </div>
          </div>
        </div>

        {store.vacationMode && (
          <div className="bg-amber-50 dark:bg-amber-500/15 border-y border-amber-200 dark:border-amber-500/30 px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300 font-bold"><Palmtree className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" /> This store is on vacation mode. Ordering is temporarily paused.</div>
          </div>
        )}

        <div className="border-b border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.015]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center gap-6 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-1.5"><Package className="w-4 h-4 text-orange-500 dark:text-cyan-400" /><span><strong className="text-slate-900 dark:text-white font-bold">{store._count?.products || 0}</strong> Products</span></div>
            <div className="flex items-center gap-1.5"><Users className="w-4 h-4 text-purple-600 dark:text-purple-400" /><span><strong className="text-slate-900 dark:text-white font-bold">{store._count?.followers || 0}</strong> Followers</span></div>
            {avgRating && <div className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /><span><strong className="text-slate-900 dark:text-white font-bold">{avgRating}</strong> ({store._count?.reviews || 0} reviews)</span></div>}
            {store.posts?.length > 0 && <div className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-indigo-500" /><span><strong className="text-slate-900 dark:text-white font-bold">{store.posts.length}</strong> Posts</span></div>}
          </div>
        </div>

        <div className="bg-white dark:bg-[#070913] border-b border-slate-200 dark:border-white/10 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center overflow-x-auto scrollbar-hide">
              {tabs.map(tab => (
                <button key={tab.id} id={`store-tab-${tab.id}`} onClick={() => setActiveTab(tab.id)}
                  className={`relative shrink-0 px-5 py-4 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id ? 'text-orange-600 dark:text-cyan-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}>
                  {activeTab === tab.id && <motion.div layoutId="storeActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 dark:from-cyan-400 dark:to-indigo-500" transition={{ type:'spring', stiffness:400, damping:30 }} />}
                  {tab.label}
                </button>
              ))}
              <div className="ml-auto shrink-0 py-2 hidden sm:flex items-center gap-2">
                <select
                  value={productFilter}
                  onChange={(e) => {
                    setProductFilter(e.target.value)
                    setActiveTab('products')
                  }}
                  className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/40 cursor-pointer"
                >
                  <option value="all">All Items</option>
                  <option value="PHYSICAL">Physical Goods</option>
                  <option value="SERVICE">Custom Services</option>
                  <option value="DIGITAL">Digital Creations</option>
                </select>
                <div className="relative flex items-center">
                  <Search className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value)
                      setActiveTab('products')
                    }}
                    placeholder="Search in store..."
                    className="pl-8 pr-4 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 dark:focus:ring-cyan-500/40 w-44 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div key="home" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.2 }} className="space-y-10">
                {(store.description || store.aboutContent) && (
                  <div className="bg-white dark:bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-orange-500 dark:text-cyan-400" /> About {store.displayName}</h2>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{store.aboutContent || store.description}</p>
                    {store.aboutContent && store.description && <button onClick={() => setActiveTab('about')} className="mt-4 text-orange-600 dark:text-cyan-400 text-xs font-bold hover:underline cursor-pointer">Read full story</button>}
                  </div>
                )}
                {store.products?.some(p => p.isPinned) && (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2"><Award className="w-5 h-5 text-amber-500" /> Featured Products</h2>
                      <button onClick={() => setActiveTab('products')} className="text-xs font-bold text-orange-600 dark:text-cyan-400 hover:underline cursor-pointer flex items-center gap-1">View all <ExternalLink className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {store.products.filter(p => p.isPinned).map(p => <ProductCard key={p.id} product={p} onOrder={placeOrder} isOwner={isOwner} vacationMode={store.vacationMode} />)}
                    </div>
                  </div>
                )}
                {store.products?.filter(p => !p.isPinned).length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2"><TrendingUp className="w-5 h-5 text-orange-500 dark:text-cyan-400" /> Latest Products</h2>
                      <button onClick={() => setActiveTab('products')} className="text-xs font-bold text-orange-600 dark:text-cyan-400 hover:underline cursor-pointer flex items-center gap-1">View all <ExternalLink className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {store.products.filter(p => !p.isPinned).slice(0,4).map(p => <ProductCard key={p.id} product={p} onOrder={placeOrder} isOwner={isOwner} vacationMode={store.vacationMode} />)}
                    </div>
                  </div>
                )}
                {store.products?.length === 0 && (
                  <div className="text-center py-20 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-white/10">
                    <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <h3 className="text-slate-900 dark:text-white font-bold mb-1">No products listed yet</h3>
                    <p className="text-slate-500 text-xs">This seller has not published any products yet.</p>
                  </div>
                )}
                {store.posts?.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-500" /> Latest from the Blog</h2>
                      <button onClick={() => setActiveTab('blog')} className="text-xs font-bold text-orange-600 dark:text-cyan-400 hover:underline cursor-pointer flex items-center gap-1">All posts <ExternalLink className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {store.posts.slice(0,2).map(post => <PostCard key={post.id} post={post} />)}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'products' && (
              <motion.div key="products" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.2 }}>
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <div className="relative flex items-center sm:hidden w-full"><Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" /><input type="text" value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Search products..." className="pl-9 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 w-full focus:outline-none" /></div>
                  <div className="flex items-center gap-2">
                    {['all','PHYSICAL','SERVICE','DIGITAL'].map(f => (
                      <button key={f} onClick={() => setProductFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer capitalize ${productFilter===f ? 'bg-orange-500 text-white border-orange-500 dark:bg-cyan-500 dark:border-cyan-500 dark:text-slate-950' : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-orange-400'}`}>
                        {f==='all' ? 'All Items' : f.charAt(0)+f.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <button onClick={() => setProductView('grid')} className={`p-2 rounded-lg border transition-all cursor-pointer ${productView==='grid' ? 'bg-orange-500 text-white border-orange-500 dark:bg-cyan-500 dark:border-cyan-500' : 'bg-white dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10'}`}><Grid3X3 className="w-4 h-4" /></button>
                    <button onClick={() => setProductView('list')} className={`p-2 rounded-lg border transition-all cursor-pointer ${productView==='list' ? 'bg-orange-500 text-white border-orange-500 dark:bg-cyan-500 dark:border-cyan-500' : 'bg-white dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10'}`}><List className="w-4 h-4" /></button>
                  </div>
                </div>
                {filteredProducts.length === 0
                  ? <div className="text-center py-20 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-white/10"><Package className="w-12 h-12 text-slate-300 mx-auto mb-3" /><h3 className="font-bold text-slate-900 dark:text-white mb-1">No products found</h3><p className="text-slate-500 text-xs">Try adjusting your search or filter.</p></div>
                  : productView === 'grid'
                    ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{filteredProducts.map(p => <ProductCard key={p.id} product={p} onOrder={placeOrder} isOwner={isOwner} vacationMode={store.vacationMode} />)}</div>
                    : <div className="space-y-3">{filteredProducts.map(p => (
                        <div key={p.id} className="flex items-center gap-4 bg-white dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200 dark:border-white/10 shadow-xs hover:shadow-md transition-shadow">
                          <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center shrink-0">{p.images?.[0]?.url ? <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" /> : <Package className="w-8 h-8 text-slate-300 dark:text-slate-700" />}</div>
                          <div className="flex-1 min-w-0"><h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{p.title}</h3><p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{p.description}</p><p className="text-base font-black text-slate-900 dark:text-white mt-1">Rs {Number(p.basePrice).toLocaleString()}</p></div>
                          <button onClick={() => placeOrder(p)} disabled={!p.inStock || isOwner || store.vacationMode} className="shrink-0 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">Order Now</button>
                        </div>
                      ))}</div>}
              </motion.div>
            )}

            {activeTab === 'blog' && (
              <motion.div key="blog" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.2 }} className="max-w-2xl space-y-6">
                {!store.posts?.length
                  ? <div className="text-center py-20 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-white/10"><BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" /><h3 className="font-bold text-slate-900 dark:text-white mb-1">No posts yet</h3><p className="text-slate-500 text-xs">This brand has not shared any stories yet.</p></div>
                  : store.posts.map(post => <PostCard key={post.id} post={post} />)}
              </motion.div>
            )}

            {activeTab === 'about' && (
              <motion.div key="about" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.2 }} className="max-w-3xl space-y-8">
                <div className="bg-white dark:bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-5 flex items-center gap-2"><Sparkles className="w-6 h-6 text-orange-500 dark:text-cyan-400" /> Our Story</h2>
                  {store.aboutContent || store.description
                    ? <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">{store.aboutContent || store.description}</p>
                    : <p className="text-slate-400 text-sm italic">This brand has not shared their story yet.</p>}
                </div>
                {store.operatingHours && Object.keys(store.operatingHours).length > 0 && (
                  <div className="bg-white dark:bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2"><Clock className="w-5 h-5 text-orange-500 dark:text-cyan-400" /> Operating Hours</h3>
                    <div className="space-y-2">{Object.entries(store.operatingHours).map(([day, hours]) => <div key={day} className="flex items-center justify-between text-sm py-2 border-b border-slate-100 dark:border-white/5 last:border-0"><span className="font-bold text-slate-700 dark:text-slate-300 capitalize">{day}</span><span className="text-slate-500 dark:text-slate-400">{hours}</span></div>)}</div>
                  </div>
                )}
                {(social.whatsapp || social.website || social.instagram) && (
                  <div className="bg-white dark:bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2"><Phone className="w-5 h-5 text-orange-500 dark:text-cyan-400" /> Get in Touch</h3>
                    <div className="space-y-3">
                      {social.whatsapp && <a href={`https://wa.me/${social.whatsapp.replace(/[^0-9]/g,'')}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:shadow-md transition-all text-sm font-semibold cursor-pointer"><WhatsAppIcon className="w-5 h-5" />{social.whatsapp}</a>}
                      {social.website && <a href={social.website.startsWith('http') ? social.website : `https://${social.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 hover:shadow-md transition-all text-sm font-semibold cursor-pointer"><Globe className="w-5 h-5" />{social.website}</a>}
                      {social.instagram && <a href={social.instagram.startsWith('http') ? social.instagram : `https://instagram.com/${social.instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-pink-50 dark:bg-pink-500/10 border border-pink-200 dark:border-pink-500/30 text-pink-700 dark:text-pink-400 hover:shadow-md transition-all text-sm font-semibold cursor-pointer"><InstagramIcon className="w-5 h-5" />{social.instagram}</a>}
                    </div>
                  </div>
                )}
                {teamMembers.length > 0 && (
                  <div className="bg-white dark:bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Users className="w-5 h-5 text-orange-500 dark:text-cyan-400" /> Meet the Team</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {teamMembers.map((member, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 dark:from-cyan-500 dark:to-indigo-500 flex items-center justify-center text-white font-black text-lg shrink-0 overflow-hidden">{member.avatarUrl ? <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" /> : member.name?.charAt(0).toUpperCase()}</div>
                          <div><p className="font-bold text-slate-900 dark:text-white text-sm">{member.name}</p><p className="text-orange-600 dark:text-cyan-400 text-xs font-semibold">{member.role}</p>{member.bio && <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">{member.bio}</p>}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!store.aboutContent && !store.description && teamMembers.length === 0 && !store.operatingHours && (
                  <div className="text-center py-20 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-white/10"><Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" /><h3 className="text-slate-900 dark:text-white font-bold mb-1">About page coming soon</h3><p className="text-slate-500 text-xs">This brand has not set up their About Us page yet.</p></div>
                )}
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div key="reviews" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.2 }} className="max-w-3xl">
                {avgRating && (
                  <div className="bg-white dark:bg-slate-900/60 rounded-3xl p-6 sm:p-8 mb-8 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col sm:flex-row items-center gap-8">
                    <div className="text-center sm:text-left shrink-0">
                      <p className="text-7xl font-black text-amber-500 dark:text-amber-400 tracking-tight leading-none mb-2">{avgRating}</p>
                      <StarRating rating={Math.round(Number(avgRating))} size="lg" />
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 font-medium">Based on {store.reviews?.length || 0} reviews</p>
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      {[5,4,3,2,1].map(star => {
                        const count = store.reviews?.filter(r => r.rating === star).length || 0
                        const pct = store.reviews?.length ? (count / store.reviews.length) * 100 : 0
                        return (
                          <div key={star} className="flex items-center gap-3 text-xs">
                            <span className="w-5 text-slate-500 dark:text-slate-400 text-right font-bold">{star}</span>
                            <div className="flex-1 h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                              <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.8, delay:(5-star)*0.05 }} className="h-full bg-amber-400 rounded-full" />
                            </div>
                            <span className="w-6 text-slate-500 text-right">{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                {!store.reviews?.length
                  ? <div className="text-center py-16 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-white/10"><Star className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" /><h3 className="text-slate-900 dark:text-white font-bold mb-1">No reviews yet</h3><p className="text-slate-500 text-xs">Be the first customer to purchase and share feedback.</p></div>
                  : <div className="space-y-4">{store.reviews.map(review => (
                      <motion.div key={review.id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} className="bg-white dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200/90 dark:border-white/5 shadow-xs">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 dark:from-cyan-500 dark:to-indigo-500 flex items-center justify-center font-bold text-sm text-white dark:text-slate-950 shadow-sm shrink-0 overflow-hidden">{review.author?.avatarUrl ? <img src={review.author.avatarUrl} alt={review.author.name} className="w-full h-full object-cover" /> : review.author?.name?.charAt(0).toUpperCase()}</div>
                            <div><p className="text-sm font-bold text-slate-900 dark:text-white">{review.author?.name}</p><p className="text-[11px] text-slate-400">{new Date(review.createdAt).toLocaleDateString('en-PK', { day:'numeric', month:'short', year:'numeric' })}</p></div>
                          </div>
                          <StarRating rating={review.rating} />
                        </div>
                        {review.product && <p className="text-orange-600 dark:text-cyan-400 text-xs mb-2 font-semibold">Product: {review.product?.title}</p>}
                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{review.comment}</p>
                        {review.sellerReply && (
                          <div className="mt-4 pl-4 py-3 border-l-2 border-orange-500 dark:border-cyan-500 bg-orange-50/60 dark:bg-white/[0.02] rounded-r-xl">
                            <p className="text-orange-700 dark:text-cyan-400 text-xs font-bold mb-1">Reply from {store.displayName}:</p>
                            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">{review.sellerReply}</p>
                          </div>
                        )}
                      </motion.div>
                    ))}</div>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══ CHECKOUT & ORDER CONFIRMATION MODAL ═══ */}
      <AnimatePresence>
        {checkoutModalOpen && checkoutProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!submittingOrder) {
                  setCheckoutModalOpen(false)
                  setPlacedOrder(null)
                }
              }}
              className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {placedOrder ? (
                /* Order Confirmed Success Screen */
                <div className="text-center py-4 space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                      Order Placed Successfully!
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Order <strong className="text-slate-900 dark:text-white">#{placedOrder.orderNumber}</strong> has been transmitted directly to{' '}
                      <strong className="text-orange-600 dark:text-cyan-400">{store.displayName}</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 text-left text-xs space-y-2">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span>Total Amount:</span>
                      <strong className="text-sm font-black text-slate-900 dark:text-white">
                        Rs {Number(placedOrder.total).toLocaleString()}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span>Payment Method:</span>
                      <span className="font-semibold uppercase">{placedOrder.paymentMethod}</span>
                    </div>
                    {placedOrder.deliveryAddress && (
                      <div className="pt-2 border-t border-slate-200 dark:border-white/5 text-slate-500">
                        <span>Delivering to: </span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {typeof placedOrder.deliveryAddress === 'string'
                            ? placedOrder.deliveryAddress
                            : `${placedOrder.deliveryAddress.address || ''}${placedOrder.deliveryAddress.city ? `, ${placedOrder.deliveryAddress.city}` : ''}`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => navigate('/orders')}
                      className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Track in My Purchases</span>
                    </button>
                    {store.owner?.id && (
                      <button
                        onClick={() => navigate(`/chat/${store.owner.id}`)}
                        className="flex-1 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white font-bold text-xs sm:text-sm border border-slate-200 dark:border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 text-orange-500" />
                        <span>Message Creator</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setCheckoutModalOpen(false)
                      setPlacedOrder(null)
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium cursor-pointer"
                  >
                    Continue browsing store
                  </button>
                </div>
              ) : (
                /* Checkout Form */
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        Checkout & Place Order
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Purchasing from <strong className="text-slate-800 dark:text-slate-200">{store.displayName}</strong>
                      </p>
                    </div>
                    <button
                      onClick={() => setCheckoutModalOpen(false)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {checkoutError && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold">
                      {checkoutError}
                    </div>
                  )}

                  <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                    {/* Item Card */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center shrink-0">
                          {checkoutProduct.images?.[0]?.url ? (
                            <img src={checkoutProduct.images[0].url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                            {checkoutProduct.title}
                          </p>
                          <p className="text-xs text-orange-600 dark:text-cyan-400 font-bold">
                            Rs {Number(checkoutProduct.basePrice).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 border border-slate-200 dark:border-white/10 rounded-xl px-2 py-1 bg-white dark:bg-slate-900">
                        <button
                          type="button"
                          onClick={() => setCheckoutQuantity(q => Math.max(1, q - 1))}
                          className="w-6 h-6 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 font-black text-sm flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-slate-900 dark:text-white w-4 text-center">
                          {checkoutQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCheckoutQuantity(q => q + 1)}
                          className="w-6 h-6 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 font-black text-sm flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Delivery Fields (for Physical Goods) */}
                    {checkoutProduct.itemType === 'PHYSICAL' && (
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-orange-500" />
                          <span>Delivery Destination</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            required
                            placeholder="City / Area *"
                            value={checkoutCity}
                            onChange={(e) => setCheckoutCity(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                          />
                          <input
                            required
                            type="tel"
                            placeholder="Contact Phone Number *"
                            value={checkoutPhone}
                            onChange={(e) => setCheckoutPhone(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                          />
                        </div>

                        <input
                          required
                          placeholder="Street Address, House / Flat number, Landmark *"
                          value={checkoutAddress}
                          onChange={(e) => setCheckoutAddress(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    )}

                    {/* Special Note / Customization instructions */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Instructions / Customization Note (Optional)
                      </label>
                      <input
                        placeholder="e.g. Please wrap as gift, size preference, or color request"
                        value={checkoutNote}
                        onChange={(e) => setCheckoutNote(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Payment Method
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'COD', label: 'Cash on Delivery (COD)' },
                          { id: 'DIRECT_TRANSFER', label: 'Bank / Wallet Transfer' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setCheckoutPaymentMethod(m.id)}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              checkoutPaymentMethod === m.id
                                ? 'bg-orange-500 text-white border-orange-500 shadow-2xs'
                                : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Subtotal & Actions */}
                    <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Total Due</span>
                        <p className="text-xl font-black text-slate-900 dark:text-white">
                          Rs {(Number(checkoutProduct.basePrice) * checkoutQuantity).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCheckoutModalOpen(false)}
                          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submittingOrder}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {submittingOrder ? 'Placing Order...' : 'Confirm Order'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
