import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, 
  ShoppingBag, 
  Plus, 
  ExternalLink, 
  DollarSign, 
  Truck, 
  X, 
  UploadCloud, 
  MessageSquare,
  CheckCircle2,
  Settings,
  Star,
  Image as ImageIcon,
  Globe,
  Phone,
  Layers,
  Sparkles,
  Palette,
  Palmtree,
  Upload,
  BookOpen,
  Users,
  Edit2,
  Trash2,
  Calendar,
  Pin,
  PinOff,
  ShieldCheck,
  Award,
  FileText,
  Check,
  BadgeCheck,
} from 'lucide-react'
import { InstagramIcon, FacebookIcon, WhatsAppIcon } from '../components/SocialIcons'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import PageTransition from '../components/PageTransition'
import { useAuth } from '../context/AuthContext'

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20' },
  CONFIRMED: { label: 'Confirmed', color: 'text-cyan-700 bg-cyan-50 border-cyan-200 dark:text-cyan-400 dark:bg-cyan-500/10 dark:border-cyan-500/20' },
  PROCESSING: { label: 'Processing', color: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20' },
  SHIPPED: { label: 'Shipped', color: 'text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-500/10 dark:border-purple-500/20' },
  DELIVERED: { label: 'Delivered', color: 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-500/10 dark:border-indigo-500/20' },
  COMPLETED: { label: 'Completed', color: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20' },
  CANCELLED: { label: 'Cancelled', color: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20' },
}

const BANNER_PRESETS = [
  { label: 'Artisan Atelier', url: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1600&q=80' },
  { label: 'Ceramics & Clay', url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1600&q=80' },
  { label: 'Botanical Studio', url: 'https://images.unsplash.com/photo-1470058869958-2a77ade41c02?auto=format&fit=crop&w=1600&q=80' },
  { label: 'Handcrafted Goods', url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=80' },
]

const LOGO_PRESETS = [
  { label: 'Studio Minimal', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80' },
  { label: 'Clay & Kiln', url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80' },
  { label: 'Botanical Bloom', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
  { label: 'Textile Loom', url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=400&q=80' },
]

export default function Dashboard() {
  const { user, isVendor, hasStorefront, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingAsset, setUploadingAsset] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    basePrice: '',
    itemType: 'PHYSICAL',
    categoryId: '',
  })

  // Store customization form state
  const [settingsForm, setSettingsForm] = useState({
    displayName: '',
    tagline: '',
    description: '',
    logoUrl: '',
    bannerUrl: '',
    themeColor: '#f97316',
    accentColor: '#ec4899',
    vacationMode: false,
    instagram: '',
    facebook: '',
    whatsapp: '',
    website: '',
  })
  const [savingSettings, setSavingSettings] = useState(false)

  // Blog & Posts state
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [postForm, setPostForm] = useState({ title: '', content: '', postType: 'UPDATE', coverImage: '' })
  const [showPostModal, setShowPostModal] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [savingPost, setSavingPost] = useState(false)

  // About Us / Team state
  const [aboutForm, setAboutForm] = useState({ aboutContent: '', teamMembers: [] })
  const [savingAbout, setSavingAbout] = useState(false)
  const [newMember, setNewMember] = useState({ name: '', role: '', bio: '', avatarUrl: '' })

  // Trust & Verification state
  const [verifyingEmail, setVerifyingEmail] = useState(false)
  const [verifyingBusiness, setVerifyingBusiness] = useState(false)
  const [showBusinessModal, setShowBusinessModal] = useState(false)
  const [businessForm, setBusinessForm] = useState({
    businessName: '',
    registrationNumber: '',
    city: '',
    website: '',
    notes: '',
  })

  // Guard routing
  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (!isVendor) { navigate('/'); return }
    if (!hasStorefront) { navigate('/setup-store'); return }
  }, [user, isVendor, hasStorefront])

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => {
        setCategories(data || [])
        if (data.length > 0 && !form.categoryId) {
          setForm((f) => ({ ...f, categoryId: data[0].id }))
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!user?.storefront?.handle) return
    fetchMyStorefront()
    fetchMyOrders()
  }, [user?.storefront?.handle])

  const fetchMyStorefront = async () => {
    try {
      const handle = user?.storefront?.handle
      if (!handle) return
      const { data } = await api.get(`/storefronts/${handle}`)
      if (data) {
        setProducts(data.products || [])
        const social = data.socialLinks || {}
        setSettingsForm({
          displayName: data.displayName || '',
          tagline: data.tagline || '',
          description: data.description || '',
          logoUrl: data.logoUrl || '',
          bannerUrl: data.bannerUrl || '',
          themeColor: data.themeColor || '#f97316',
          accentColor: data.accentColor || '#ec4899',
          vacationMode: Boolean(data.vacationMode),
          instagram: social.instagram || '',
          facebook: social.facebook || '',
          whatsapp: social.whatsapp || '',
          website: social.website || '',
        })
      }
    } catch (err) {
      console.error('Failed to load storefront:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyOrders = async () => {
    try {
      const { data } = await api.get('/orders/storefront')
      setOrders(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setOrdersLoading(false)
    }
  }

  const fetchPosts = async () => {
    setPostsLoading(true)
    try {
      const { data } = await api.get('/posts/mine')
      setPosts(data || [])
    } catch (err) { console.error(err) }
    finally { setPostsLoading(false) }
  }

  const fetchAbout = async () => {
    try {
      const handle = user?.storefront?.handle
      if (!handle) return
      const { data } = await api.get(`/storefronts/${handle}`)
      if (data) {
        setAboutForm({
          aboutContent: data.aboutContent || '',
          teamMembers: data.teamMembers || [],
        })
      }
    } catch (err) { console.error(err) }
  }

  const savePost = async () => {
    if (!postForm.title.trim() || !postForm.content.trim()) {
      setError('Title and content are required.')
      return
    }
    setSavingPost(true)
    setError('')
    try {
      if (editingPost) {
        await api.put(`/posts/${editingPost.id}`, postForm)
      } else {
        await api.post('/posts', postForm)
      }
      setPostForm({ title: '', content: '', postType: 'UPDATE', coverImage: '' })
      setShowPostModal(false)
      setEditingPost(null)
      fetchPosts()
      setSuccess(editingPost ? 'Post updated!' : 'Post published!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save post.')
    } finally { setSavingPost(false) }
  }

  const deletePost = async (postId) => {
    if (!confirm('Delete this post?')) return
    try {
      await api.delete(`/posts/${postId}`)
      fetchPosts()
      setSuccess('Post deleted.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to delete post.')
    }
  }

  const togglePinPost = async (postId, isPinned) => {
    try {
      await api.put(`/posts/${postId}`, { isPinned: !isPinned })
      fetchPosts()
    } catch (err) { console.error(err) }
  }

  const saveAbout = async () => {
    setSavingAbout(true)
    setError('')
    try {
      await api.put('/storefronts/me', {
        aboutContent: aboutForm.aboutContent,
        teamMembers: aboutForm.teamMembers,
      })
      setSuccess('About Us page updated!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update About Us.')
    } finally { setSavingAbout(false) }
  }

  const addTeamMember = () => {
    if (!newMember.name.trim()) return
    setAboutForm(prev => ({ ...prev, teamMembers: [...prev.teamMembers, { ...newMember }] }))
    setNewMember({ name: '', role: '', bio: '', avatarUrl: '' })
  }

  const removeTeamMember = (idx) => {
    setAboutForm(prev => ({ ...prev, teamMembers: prev.teamMembers.filter((_, i) => i !== idx) }))
  }

  const handleVerifyEmail = async () => {
    setVerifyingEmail(true)
    setError('')
    try {
      await api.post('/auth/verify-email')
      await refreshUser()
      setSuccess('Email successfully verified! Tier 1 verification active.')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify email.')
    } finally {
      setVerifyingEmail(false)
    }
  }

  const handleVerifyBusiness = async (e) => {
    if (e) e.preventDefault()
    if (!businessForm.businessName.trim() || !businessForm.registrationNumber.trim()) {
      setError('Business name and registration number / NTN are required.')
      return
    }
    setVerifyingBusiness(true)
    setError('')
    try {
      await api.post('/auth/verify-business', {
        businessName: businessForm.businessName,
        registrationNumber: businessForm.registrationNumber,
        notes: `City: ${businessForm.city || 'N/A'}, Website: ${businessForm.website || 'N/A'}. ${businessForm.notes || ''}`,
      })
      await refreshUser()
      setShowBusinessModal(false)
      setSuccess('Brand verification approved! Your official "Verified Brand" badge is now active on your storefront.')
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit business verification.')
    } finally {
      setVerifyingBusiness(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleAssetUpload = async (e, type) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAsset(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type) // 'banner' or 'logo'
      const { data } = await api.post('/storefronts/me/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (type === 'banner') {
        setSettingsForm((prev) => ({ ...prev, bannerUrl: data.url }))
      } else {
        setSettingsForm((prev) => ({ ...prev, logoUrl: data.url }))
      }
      setSuccess(`${type === 'banner' ? 'Header cover banner' : 'Store profile picture'} uploaded! Click Save to apply.`)
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || `Failed to upload image`)
    } finally {
      setUploadingAsset(false)
    }
  }

  const submitProduct = async (e) => {
    e.preventDefault()
    setCreating(true)
    setError('')
    setSuccess('')
    try {
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('description', form.description)
      formData.append('basePrice', form.basePrice)
      formData.append('itemType', form.itemType)
      formData.append('categoryId', form.categoryId || user.storefront?.categoryId)
      if (imageFile) formData.append('image', imageFile)

      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setSuccess('Product published successfully!')
      setForm({ title: '', description: '', basePrice: '', itemType: 'PHYSICAL', categoryId: form.categoryId })
      setImageFile(null)
      setImagePreview(null)
      setShowModal(false)
      fetchMyStorefront()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product listing')
    } finally {
      setCreating(false)
    }
  }

  const toggleFeaturedProduct = async (productId, currentPinned) => {
    try {
      await api.patch(`/products/${productId}`, { isPinned: !currentPinned })
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, isPinned: !currentPinned } : p))
      )
      setSuccess(!currentPinned ? 'Product marked as featured!' : 'Product unmarked from featured')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product featured status')
      setTimeout(() => setError(''), 4000)
    }
  }

  const saveStoreSettings = async (e) => {
    e.preventDefault()
    setSavingSettings(true)
    setError('')
    setSuccess('')
    try {
      const { data: updatedStore } = await api.put('/storefronts/me', {
        displayName: settingsForm.displayName,
        tagline: settingsForm.tagline,
        description: settingsForm.description,
        logoUrl: settingsForm.logoUrl || null,
        bannerUrl: settingsForm.bannerUrl || null,
        themeColor: settingsForm.themeColor,
        accentColor: settingsForm.accentColor,
        vacationMode: Boolean(settingsForm.vacationMode),
        socialLinks: {
          instagram: settingsForm.instagram,
          facebook: settingsForm.facebook,
          whatsapp: settingsForm.whatsapp,
          website: settingsForm.website,
        },
      })

      // Immediate state reflection
      const social = updatedStore.socialLinks || {}
      setSettingsForm({
        displayName: updatedStore.displayName || '',
        tagline: updatedStore.tagline || '',
        description: updatedStore.description || '',
        logoUrl: updatedStore.logoUrl || '',
        bannerUrl: updatedStore.bannerUrl || '',
        themeColor: updatedStore.themeColor || '#f97316',
        accentColor: updatedStore.accentColor || '#ec4899',
        vacationMode: Boolean(updatedStore.vacationMode),
        instagram: social.instagram || '',
        facebook: social.facebook || '',
        whatsapp: social.whatsapp || '',
        website: social.website || '',
      })

      if (refreshUser) await refreshUser()
      setSuccess('Store profile and branding updated and applied immediately!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update store settings')
    } finally {
      setSavingSettings(false)
    }
  }

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status })
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      )
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status')
    }
  }

  const pendingOrders = orders.filter((o) => o.status === 'PENDING')
  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + Number(o.total || 0), 0)

  return (
    <PageTransition className="min-h-screen bg-[#F8FAFC] dark:bg-[#070913] text-slate-900 dark:text-slate-100 transition-colors duration-250">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        {/* COMMAND CENTER HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1 text-xs text-orange-600 dark:text-cyan-400 font-bold uppercase tracking-wider">
              <span>Vendor Command Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Store Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1 flex items-center gap-1.5 flex-wrap">
              <span>Managing</span>
              <strong className="text-slate-900 dark:text-white font-bold">{settingsForm.displayName || user?.storefront?.displayName}</strong>
              <span>(@{user?.storefront?.handle})</span>
              <Link
                to={`/store/${user?.storefront?.handle}`}
                target="_blank"
                className="text-orange-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1 ml-1 font-semibold"
              >
                <span>Live Storefront</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </p>

            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              {user?.verificationTier === 'BUSINESS_VERIFIED' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>Verified Brand Seal Active</span>
                </span>
              ) : user?.verificationTier === 'EMAIL_VERIFIED' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('verification')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-400 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Email Verified · Upgrade to Verified Brand</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab('verification')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 hover:border-amber-400 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Pending Verification · Verify Now</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('settings')}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-orange-50 text-orange-600 border-orange-300 dark:bg-slate-800 dark:border-white/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-white/10 hover:border-orange-500'
              }`}
            >
              <Settings className="w-4 h-4 text-orange-500" />
              <span>Customize Store</span>
            </button>
            <button
              onClick={() => {
                setShowModal(true)
                setError('')
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 dark:from-cyan-400 dark:to-indigo-500 text-white dark:text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 dark:shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create New Listing</span>
            </button>
          </div>
        </div>

        {/* Success alert */}
        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Error alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
            <X className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200/90 dark:border-white/5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
              <span className="font-bold uppercase tracking-wider">Active Listings</span>
              <Package className="w-4 h-4 text-orange-500 dark:text-cyan-400" />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{products.length}</p>
            <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-1">Available for marketplace shoppers</p>
          </div>

          <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200/90 dark:border-white/5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
              <span className="font-bold uppercase tracking-wider">Total Orders</span>
              <ShoppingBag className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black text-slate-900 dark:text-white">{orders.length}</p>
              {pendingOrders.length > 0 && (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/30">
                  {pendingOrders.length} New
                </span>
              )}
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-1">Customer purchases received</p>
          </div>

          <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200/90 dark:border-white/5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
              <span className="font-bold uppercase tracking-wider">Gross Volume</span>
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              Rs {totalRevenue.toLocaleString()}
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-1">Total completed and active order value</p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-white/10 mb-8 overflow-x-auto scrollbar-hide">
          {[
            { id: 'products', label: `My Listings (${products.length})` },
            { id: 'orders', label: `Incoming Orders (${orders.length})`, badge: pendingOrders.length },
            { id: 'blog', label: 'Blog & Posts', icon: BookOpen },
            { id: 'about', label: 'About Us', icon: Users },
            { id: 'settings', label: 'Storefront & Branding', icon: Palette },
            { id: 'verification', label: 'Trust & Verification', icon: ShieldCheck },
          ].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); if (tab.id === 'blog') fetchPosts(); if (tab.id === 'about') fetchAbout(); }}
              className={`relative px-5 py-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id ? 'text-orange-600 dark:text-cyan-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}>
              {activeTab === tab.id && (
                <motion.div layoutId="dashboardTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 dark:from-cyan-400 dark:to-indigo-500" transition={{ type:'spring', stiffness:400, damping:30 }} />
              )}
              {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              {tab.badge > 0 && <span className="px-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">{tab.badge}</span>}
            </button>
          ))}
        </div>

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div>
            {loading ? (
              <div className="py-20 text-center text-slate-500">
                <div className="w-8 h-8 border-2 border-orange-500 dark:border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs">Fetching your listings...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900/60 rounded-3xl p-8 max-w-md mx-auto border border-slate-200 dark:border-white/10 shadow-xs">
                <Package className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-slate-900 dark:text-white font-bold text-base mb-1">No products added yet</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">
                  Add your first physical product, custom service, or digital creation to start earning.
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  + Add First Listing
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tip: Click the star icon to mark a product as <strong>Featured</strong>. Our marketplace showcase highlights featured creations across brands.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((p) => (
                    <div key={p.id} className="bg-white dark:bg-slate-900/60 rounded-2xl overflow-hidden flex flex-col justify-between border border-slate-200/90 dark:border-white/10 shadow-xs hover:shadow-lg transition-all">
                      <div className="h-44 bg-slate-100 dark:bg-slate-950 overflow-hidden relative flex items-center justify-center">
                        {p.images?.[0]?.url ? (
                          <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                        )}
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-white/90 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                          {p.itemType}
                        </span>

                        {/* Feature Toggle Button */}
                        <button
                          type="button"
                          onClick={() => toggleFeaturedProduct(p.id, p.isPinned)}
                          title={p.isPinned ? "Featured by your store (Click to unfeature)" : "Mark as Featured"}
                          className={`absolute top-2.5 left-2.5 p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm backdrop-blur-md ${
                            p.isPinned 
                              ? 'bg-amber-400 text-slate-950 border-amber-300' 
                              : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:text-amber-500'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${p.isPinned ? 'fill-slate-950' : ''}`} />
                          <span className="text-[10px]">{p.isPinned ? 'Featured' : 'Feature'}</span>
                        </button>
                      </div>

                      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{p.title}</h4>
                          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 line-clamp-2">{p.description}</p>
                        </div>

                        <div className="pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            Rs {Number(p.basePrice).toLocaleString()}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            p.inStock 
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30'
                              : 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/30'
                          }`}>
                            {p.inStock ? 'In Stock' : 'Out'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div>
            {ordersLoading ? (
              <div className="py-20 text-center text-slate-500">
                <div className="w-8 h-8 border-2 border-orange-500 dark:border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900/60 rounded-3xl p-8 max-w-md mx-auto border border-slate-200 dark:border-white/10 shadow-xs">
                <ShoppingBag className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-slate-900 dark:text-white font-bold text-base mb-1">No orders yet</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  When shoppers place orders from your store, they will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const statusInfo = STATUS_CONFIG[order.status] || { label: order.status, color: 'text-slate-500' }
                  return (
                    <div key={order.id} className="bg-white dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200/90 dark:border-white/5 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-slate-900 dark:text-white font-bold text-sm">#{order.orderNumber}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>

                          <div className="space-y-0.5 text-xs text-slate-700 dark:text-slate-300 mt-2">
                            {order.items?.map((item) => (
                              <div key={item.id} className="flex items-center gap-2">
                                <span className="text-orange-600 dark:text-cyan-400 font-bold">{item.quantity}×</span>
                                <span>{item.title}</span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <span>Customer: <strong className="text-slate-900 dark:text-white">{order.buyer?.name}</strong></span>
                            <span>·</span>
                            <span>{new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</span>
                          </div>

                          {order.buyerNote && (
                            <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-2 rounded-lg">
                              Note: "{order.buyerNote}"
                            </p>
                          )}
                        </div>

                        <div className="sm:text-right shrink-0">
                          <p className="text-xl font-black text-slate-900 dark:text-white">
                            Rs {Number(order.total).toLocaleString()}
                          </p>
                          <button
                            onClick={() => navigate(`/chat/${order.buyer?.id}`)}
                            className="inline-flex items-center gap-1.5 text-xs text-orange-600 dark:text-cyan-400 hover:underline font-bold mt-1 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Chat with Buyer</span>
                          </button>
                        </div>
                      </div>

                      {/* Status Action Buttons */}
                      <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex flex-wrap gap-2">
                        {order.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                              className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                            >
                              Accept Order
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                              className="px-4 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20 text-xs font-bold transition-all cursor-pointer"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {order.status === 'CONFIRMED' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'PROCESSING')}
                            className="px-4 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 text-xs font-bold transition-all cursor-pointer"
                          >
                            Mark Processing
                          </button>
                        )}
                        {order.status === 'PROCESSING' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'SHIPPED')}
                            className="px-4 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Mark Shipped</span>
                          </button>
                        )}
                        {order.status === 'SHIPPED' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                            className="px-4 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-xs font-bold transition-all cursor-pointer"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* BLOG & POSTS TAB */}
        {activeTab === 'blog' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 rounded-3xl p-6 border border-slate-200/90 dark:border-white/10 shadow-xs">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-orange-500 dark:text-cyan-400" />
                  <span>Brand Stories & Updates</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Publish updates, artisan stories, milestone drops, and behind-the-scenes moments to engage your storefront shoppers.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingPost(null)
                  setPostForm({ title: '', content: '', postType: 'UPDATE', coverImage: '' })
                  setShowPostModal(true)
                  setError('')
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>New Story / Post</span>
              </button>
            </div>

            {postsLoading ? (
              <div className="py-20 text-center text-slate-500">
                <div className="w-8 h-8 border-2 border-orange-500 dark:border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs">Loading your posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900/60 rounded-3xl p-8 max-w-md mx-auto border border-slate-200 dark:border-white/10 shadow-xs">
                <BookOpen className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-slate-900 dark:text-white font-bold text-base mb-1">No stories shared yet</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">
                  Share your studio story, new arrivals, or workshop craft to connect with conscious shoppers.
                </p>
                <button
                  onClick={() => {
                    setEditingPost(null)
                    setPostForm({ title: '', content: '', postType: 'UPDATE', coverImage: '' })
                    setShowPostModal(true)
                  }}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  + Write First Post
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {post.coverImage && (
                        <div className="h-44 w-full bg-slate-100 dark:bg-slate-950 overflow-hidden relative">
                          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-50 dark:bg-cyan-500/10 text-orange-600 dark:text-cyan-400 border border-orange-200 dark:border-cyan-500/20">
                            {post.postType}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                          {post.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                          {post.content}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 py-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => togglePinPost(post.id, post.isPinned)}
                          title={post.isPinned ? "Unpin from top" : "Pin to top of storefront"}
                          className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            post.isPinned 
                              ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300' 
                              : 'bg-white text-slate-500 border-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:border-white/10'
                          }`}
                        >
                          {post.isPinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
                          <span className="text-[11px]">{post.isPinned ? 'Pinned' : 'Pin'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingPost(post)
                            setPostForm({
                              title: post.title,
                              content: post.content,
                              postType: post.postType || 'UPDATE',
                              coverImage: post.coverImage || '',
                            })
                            setShowPostModal(true)
                          }}
                          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => deletePost(post.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABOUT US TAB */}
        {activeTab === 'about' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-white/10 shadow-xs">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-500 dark:text-cyan-400" />
                  <span>About Us & Team Profile</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Share the authentic human story behind your creations, workshop philosophy, and introduce the makers on your team.
                </p>
              </div>

              {/* Story / About Content */}
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Brand & Studio Story
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Tell your story: How did you start? What materials and sustainable processes do you use? What inspires your work?..."
                    value={aboutForm.aboutContent}
                    onChange={(e) => setAboutForm({ ...aboutForm, aboutContent: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                    This appears prominently on your storefront's dedicated "About Us" tab and home summary.
                  </p>
                </div>
              </div>

              {/* Team Members */}
              <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center justify-between">
                  <span>Makers & Team Members ({aboutForm.teamMembers?.length || 0})</span>
                </h4>

                {/* Team List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {aboutForm.teamMembers?.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-cyan-500/20 text-orange-700 dark:text-cyan-300 flex items-center justify-center font-bold text-base shrink-0 overflow-hidden">
                          {m.avatarUrl ? (
                            <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" />
                          ) : (
                            m.name?.[0] || 'M'
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{m.name}</p>
                          <p className="text-xs text-orange-600 dark:text-cyan-400 font-semibold">{m.role || 'Team Member'}</p>
                          {m.bio && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{m.bio}</p>}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTeamMember(idx)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Team Member Box */}
                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-dashed border-slate-300 dark:border-white/15 space-y-3">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Add Team Member or Founder</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      placeholder="Full Name *"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                    />
                    <input
                      placeholder="Role (e.g. Master Potter, Head Designer)"
                      value={newMember.role}
                      onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      placeholder="Avatar Image URL (optional)"
                      value={newMember.avatarUrl}
                      onChange={(e) => setNewMember({ ...newMember, avatarUrl: e.target.value })}
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                    />
                    <input
                      placeholder="Short Bio / Specialty"
                      value={newMember.bio}
                      onChange={(e) => setNewMember({ ...newMember, bio: e.target.value })}
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={addTeamMember}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs transition-all cursor-pointer"
                    >
                      + Add to Team
                    </button>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-6 mt-6 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={saveAbout}
                  disabled={savingAbout}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingAbout ? 'Saving About Us...' : 'Save About Us & Team'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STOREFRONT CUSTOMIZATION AND BRANDING TAB */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* LIVE PREVIEW OF STOREFRONT HEADER */}
            <div className="bg-white dark:bg-slate-900/60 rounded-3xl p-6 border border-slate-200/90 dark:border-white/10 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-cyan-400">
                  Live Storefront Header Preview
                </span>
                <Link
                  to={`/store/${user?.storefront?.handle}`}
                  target="_blank"
                  className="text-xs font-semibold text-slate-500 hover:text-orange-600 flex items-center gap-1"
                >
                  <span>Open live link</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {/* Header Box Preview */}
              <div className="rounded-2xl overflow-hidden border border-slate-200/90 dark:border-white/10 shadow-xs">
                <div
                  className="h-36 sm:h-44 relative bg-cover bg-center transition-all duration-300"
                  style={{
                    backgroundImage: settingsForm.bannerUrl ? `url("${settingsForm.bannerUrl}")` : 'none',
                    backgroundColor: !settingsForm.bannerUrl ? '#fff7ed' : 'transparent',
                  }}
                >
                  {!settingsForm.bannerUrl && (
                    <div className="w-full h-full bg-gradient-to-r from-orange-50 via-amber-50 to-orange-100 dark:from-slate-800 dark:to-slate-900" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-md">
                        {settingsForm.logoUrl ? (
                          <img src={settingsForm.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-black text-white">
                            {settingsForm.displayName?.[0] || 'S'}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-black leading-tight drop-shadow-sm">
                          {settingsForm.displayName || 'Your Store Name'}
                        </h4>
                        <p className="text-xs text-slate-200 drop-shadow-xs line-clamp-1">
                          {settingsForm.tagline || 'Your store tagline and brand craft'}
                        </p>
                      </div>
                    </div>

                    {settingsForm.vacationMode && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs">
                        <Palmtree className="w-3 h-3" />
                        <span>Vacation Mode Active</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* FORM CONTROLS */}
            <div className="bg-white dark:bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-white/10 shadow-xs">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Storefront Customization and Branding</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Changes save and apply immediately to your live store link and marketplace search listing.
                </p>
              </div>

              <form onSubmit={saveStoreSettings} className="space-y-6">
                {/* 1. Header Banner Controls */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Header Cover Banner
                    </label>
                    <label className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer">
                      <Upload className="w-3 h-3 text-orange-500" />
                      <span>{uploadingAsset ? 'Uploading...' : 'Upload Image File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleAssetUpload(e, 'banner')}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <input
                    type="text"
                    placeholder="Paste image URL (https://images.unsplash.com/...)"
                    value={settingsForm.bannerUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bannerUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />

                  {/* Banner Presets */}
                  <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-medium">Quick Presets:</span>
                    {BANNER_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, bannerUrl: preset.url })}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-600 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                    {settingsForm.bannerUrl && (
                      <button
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, bannerUrl: '' })}
                        className="text-[11px] px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold cursor-pointer"
                      >
                        Clear Banner
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Profile Picture / Logo */}
                <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Store Profile Picture / Logo
                    </label>
                    <label className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer">
                      <Upload className="w-3 h-3 text-orange-500" />
                      <span>{uploadingAsset ? 'Uploading...' : 'Upload Logo File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleAssetUpload(e, 'logo')}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      {settingsForm.logoUrl ? (
                        <img src={settingsForm.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-black text-orange-600">
                          {settingsForm.displayName?.[0] || 'S'}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Paste image URL (https://.../logo.jpg)"
                      value={settingsForm.logoUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {/* Logo Presets */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-medium">Avatar Presets:</span>
                    {LOGO_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, logoUrl: preset.url })}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-600 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                    {settingsForm.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, logoUrl: '' })}
                        className="text-[11px] px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold cursor-pointer"
                      >
                        Reset to Initials
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. Display Name & Tagline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-100 dark:border-white/5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Store Display Name *
                    </label>
                    <input
                      required
                      value={settingsForm.displayName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, displayName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Short Tagline
                    </label>
                    <input
                      placeholder="e.g. Handcrafted porcelain pottery and home accents"
                      value={settingsForm.tagline}
                      onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* 4. Story & Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Store Story and Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell customers what makes your independent brand special..."
                    value={settingsForm.description}
                    onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 resize-none"
                  />
                </div>

                {/* 5. Vacation Mode Toggle */}
                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Palmtree className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        Store Vacation Mode
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Temporarily pause incoming orders while keeping your storefront visible
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSettingsForm({ ...settingsForm, vacationMode: !settingsForm.vacationMode })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settingsForm.vacationMode ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        settingsForm.vacationMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 6. Social Channels */}
                <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                    Connect Social Accounts
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        <InstagramIcon className="w-3.5 h-3.5 text-pink-500" />
                        <span>Instagram Handle or URL</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. brandname or https://instagram.com/brand"
                        value={settingsForm.instagram}
                        onChange={(e) => setSettingsForm({ ...settingsForm, instagram: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        <FacebookIcon className="w-3.5 h-3.5 text-blue-600" />
                        <span>Facebook Page URL</span>
                      </label>
                      <input
                        type="text"
                        placeholder="https://facebook.com/brandname"
                        value={settingsForm.facebook}
                        onChange={(e) => setSettingsForm({ ...settingsForm, facebook: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-500" />
                        <span>WhatsApp Number</span>
                      </label>
                      <input
                        type="text"
                        placeholder="+923001234567"
                        value={settingsForm.whatsapp}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        <Globe className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Website or Portfolio</span>
                      </label>
                      <input
                        type="text"
                        placeholder="https://mybrand.com"
                        value={settingsForm.website}
                        onChange={(e) => setSettingsForm({ ...settingsForm, website: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-white/5">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {savingSettings ? 'Saving Changes...' : 'Save and Apply Immediately'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TRUST & VERIFICATION TAB */}
        {activeTab === 'verification' && (
          <div className="space-y-6">
            {/* Header banner */}
            <div className="bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent dark:from-cyan-500/15 dark:via-indigo-500/10 dark:to-transparent rounded-3xl p-6 sm:p-8 border border-orange-200/80 dark:border-white/10 shadow-xs relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 dark:from-cyan-500 dark:to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-md">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      Brand Trust & Verification Hub
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      Verification gives your storefront credibility with customers across Pakistan. Verified brands receive priority display in search, higher buyer conversion, and an official verified badge on their storefront.
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  {user?.verificationTier === 'BUSINESS_VERIFIED' ? (
                    <div className="px-4 py-2 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 font-bold text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span>Verified Brand Active</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setBusinessForm(prev => ({
                          ...prev,
                          businessName: settingsForm.displayName || user?.storefront?.displayName || user?.name || '',
                        }))
                        setShowBusinessModal(true)
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 dark:from-cyan-400 dark:to-indigo-500 text-white dark:text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Award className="w-4 h-4" />
                      <span>Apply for Brand Badge</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Verification Tiers Roadmap */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Tier 1 */}
              <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200/90 dark:border-white/5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                      Tier 1 Verification
                    </span>
                    {user?.emailVerified || user?.verificationTier !== 'EMAIL_PENDING' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30">
                        <Check className="w-3 h-3 stroke-[3]" /> Verified
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/30">
                        Pending
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1.5 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Email Confirmation</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Confirms your email address (<strong className="text-slate-700 dark:text-slate-200 font-semibold">{user?.email}</strong>) for instant purchase alerts, invoice delivery, and seller communications.
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/5">
                  {user?.emailVerified || user?.verificationTier !== 'EMAIL_PENDING' ? (
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Email address confirmed</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleVerifyEmail}
                      disabled={verifyingEmail}
                      className="w-full py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {verifyingEmail ? 'Verifying...' : 'Confirm Email Address'}
                    </button>
                  )}
                </div>
              </div>

              {/* Tier 2 */}
              <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200/90 dark:border-white/5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                      Tier 2 Standing
                    </span>
                    {products.length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30">
                        <Check className="w-3 h-3 stroke-[3]" /> Active
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-white/5 px-2.5 py-0.5 rounded-full">
                        Needs Listing
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1.5 flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-500" />
                    <span>Catalog Standing</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Maintains active catalog availability so customers can purchase items immediately through the interactive checkout.
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/5">
                  <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold flex items-center justify-between">
                    <span>Active Listings</span>
                    <strong className="text-slate-900 dark:text-white">{products.length} Items</strong>
                  </div>
                </div>
              </div>

              {/* Tier 3 */}
              <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200/90 dark:border-white/5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                      Tier 3 Verification
                    </span>
                    {user?.verificationTier === 'BUSINESS_VERIFIED' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-500/15 px-2.5 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-500/30">
                        <BadgeCheck className="w-3 h-3 stroke-[3]" /> Verified Brand
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/15 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/30">
                        Eligible
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1.5 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-500" />
                    <span>Verified Brand Seal</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Grants your storefront the official "Verified Brand" badge, elevating customer trust and giving your products featured placement.
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/5">
                  {user?.verificationTier === 'BUSINESS_VERIFIED' ? (
                    <Link
                      to={`/store/${user?.storefront?.handle}`}
                      target="_blank"
                      className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-bold inline-flex items-center gap-1"
                    >
                      <span>View Live Badge on Storefront</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setBusinessForm(prev => ({
                          ...prev,
                          businessName: settingsForm.displayName || user?.storefront?.displayName || user?.name || '',
                        }))
                        setShowBusinessModal(true)
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 dark:from-cyan-400 dark:to-indigo-500 text-white dark:text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-xs"
                    >
                      Apply for Badge
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Verified Badge Preview & Perks Card */}
            <div className="bg-white dark:bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-white/5 shadow-xs">
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                What Verified Brand Status Provides
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Shoppers value authenticity. Stores with verified status experience higher repeat purchases and customer retention.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-2.5 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs mb-1">Official Trust Badge</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Displayed prominently on your storefront header, product cards, and search filters.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-2.5 font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs mb-1">Marketplace Spotlight</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Eligible for top rotation in "Featured Creators" and category discovery carousels.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2.5 font-bold">
                    <Star className="w-4 h-4" />
                  </div>
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs mb-1">Verified Reviews</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Customer feedback displays the "Verified Buyer" seal, reinforcing organic trust.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CREATE PRODUCT MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create New Listing</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Publish a creation or custom service to your storefront</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={submitProduct} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Listing Title *
                    </label>
                    <input
                      required
                      placeholder="e.g. Handcrafted Ceramic Mug"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 dark:focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Base Price (Rs) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 2500"
                      value={form.basePrice}
                      onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 dark:focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    minLength={10}
                    placeholder="Describe your item, materials, dimensions, or service timeline..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 dark:focus:border-cyan-400 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Item Format
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'PHYSICAL', label: 'Physical Product' },
                      { id: 'SERVICE', label: 'Custom Service' },
                      { id: 'DIGITAL', label: 'Digital Creation' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setForm({ ...form, itemType: t.id })}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          form.itemType === t.id
                            ? 'bg-orange-500 text-white border-orange-500 shadow-2xs dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-white/5 dark:text-slate-400 dark:border-white/10'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Product Image
                  </label>
                  <div className="border border-dashed border-slate-300 dark:border-white/20 rounded-2xl p-5 hover:border-orange-500 dark:hover:border-cyan-400 transition-all text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="productImageInput"
                    />
                    <label htmlFor="productImageInput" className="cursor-pointer block">
                      {imagePreview ? (
                        <div className="relative w-36 h-36 mx-auto rounded-xl overflow-hidden border border-slate-200 dark:border-white/20 shadow-sm">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="py-2">
                          <UploadCloud className="w-8 h-8 text-orange-500 dark:text-cyan-400 mx-auto mb-2" />
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-300">Click to upload photo</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">JPG, PNG, WEBP (Max 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 dark:from-cyan-400 dark:to-indigo-500 text-white dark:text-slate-950 font-bold text-xs shadow-md shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {creating ? 'Publishing...' : 'Publish Listing'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POST CREATE / EDIT MODAL */}
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowPostModal(false); setEditingPost(null); }}
              className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {editingPost ? 'Edit Story / Post' : 'Create New Brand Story'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Share updates with customers on your storefront Blog & Posts tab
                  </p>
                </div>
                <button
                  onClick={() => { setShowPostModal(false); setEditingPost(null); }}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Story / Post Title *
                  </label>
                  <input
                    required
                    placeholder="e.g. Behind the scenes of our new hand-carved collection"
                    value={postForm.title}
                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Post Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'UPDATE', label: 'Studio Update' },
                      { id: 'BEHIND_THE_SCENES', label: 'Behind the Scenes' },
                      { id: 'FOUNDING_STORY', label: 'Founding Story' },
                      { id: 'MILESTONE', label: 'Milestone Drop' },
                      { id: 'ANNOUNCEMENT', label: 'Announcement' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setPostForm({ ...postForm, postType: t.id })}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          postForm.postType === t.id
                            ? 'bg-orange-500 text-white border-orange-500 shadow-2xs dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-white/5 dark:text-slate-400 dark:border-white/10'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Cover Image URL (optional)
                  </label>
                  <input
                    placeholder="https://images.unsplash.com/..."
                    value={postForm.coverImage}
                    onChange={(e) => setPostForm({ ...postForm, coverImage: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                  />
                  {postForm.coverImage && (
                    <div className="mt-2 h-36 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                      <img src={postForm.coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Content / Story Body *
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Share what you made, how you made it, who helped, or what's coming next..."
                    value={postForm.content}
                    onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 resize-none leading-relaxed"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => { setShowPostModal(false); setEditingPost(null); }}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={savePost}
                    disabled={savingPost}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 dark:from-cyan-400 dark:to-indigo-500 text-white dark:text-slate-950 font-bold text-xs shadow-md shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {savingPost ? 'Saving...' : editingPost ? 'Update Story' : 'Publish Story'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BUSINESS VERIFICATION MODAL */}
      <AnimatePresence>
        {showBusinessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBusinessModal(false)}
              className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Apply for Verified Brand
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Activate the official trust badge on your storefront
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBusinessModal(false)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyBusiness} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Registered Brand or Business Name *
                  </label>
                  <input
                    required
                    placeholder="e.g. Paint Shaint Studio"
                    value={businessForm.businessName}
                    onChange={(e) => setBusinessForm({ ...businessForm, businessName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Registration Number / NTN / CNIC or Student ID *
                  </label>
                  <input
                    required
                    placeholder="e.g. NTN-9281741-2 or 35202-xxxxxxx-x"
                    value={businessForm.registrationNumber}
                    onChange={(e) => setBusinessForm({ ...businessForm, registrationNumber: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Operating City
                    </label>
                    <input
                      placeholder="e.g. Lahore, Karachi, Islamabad"
                      value={businessForm.city}
                      onChange={(e) => setBusinessForm({ ...businessForm, city: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Website or Social Link
                    </label>
                    <input
                      placeholder="https://instagram.com/brand"
                      value={businessForm.website}
                      onChange={(e) => setBusinessForm({ ...businessForm, website: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Additional Verification Notes (optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide any details about your brand, store age, or business permit..."
                    value={businessForm.notes}
                    onChange={(e) => setBusinessForm({ ...businessForm, notes: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 resize-none"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowBusinessModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={verifyingBusiness}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{verifyingBusiness ? 'Verifying...' : 'Activate Brand Badge'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}