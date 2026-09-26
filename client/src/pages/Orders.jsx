import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingBag, 
  Store, 
  MessageSquare, 
  ArrowRight,
  Package,
  Zap,
  Layers,
  Star,
  X,
  CheckCircle2,
  MapPin,
  FileText
} from 'lucide-react'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import PageTransition from '../components/PageTransition'
import { useAuth } from '../context/AuthContext'

const LIFECYCLE_STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED']

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', stepIndex: 0, color: 'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/30' },
  CONFIRMED: { label: 'Confirmed', stepIndex: 1, color: 'text-cyan-800 bg-cyan-50 border-cyan-200 dark:text-cyan-400 dark:bg-cyan-500/10 dark:border-cyan-500/30' },
  PROCESSING: { label: 'Processing', stepIndex: 2, color: 'text-blue-800 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/30' },
  SHIPPED: { label: 'Shipped', stepIndex: 3, color: 'text-purple-800 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-500/10 dark:border-purple-500/30' },
  DELIVERED: { label: 'Delivered', stepIndex: 4, color: 'text-indigo-800 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-500/10 dark:border-indigo-500/30' },
  COMPLETED: { label: 'Completed', stepIndex: 5, color: 'text-emerald-800 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30' },
  CANCELLED: { label: 'Cancelled', stepIndex: -1, color: 'text-rose-800 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/30' },
  DISPUTED: { label: 'Disputed', stepIndex: -1, color: 'text-orange-800 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-500/10 dark:border-orange-500/30' },
}

const RATING_LABELS = {
  1: 'Needs Improvement',
  2: 'Fair',
  3: 'Good Quality',
  4: 'Very Satisfied',
  5: 'Exceptional Craftsmanship',
}

export default function Orders() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmingId, setConfirmingId] = useState(null)

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [activeOrderForReview, setActiveOrderForReview] = useState(null)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    api.get('/orders/my')
      .then(({ data }) => setOrders(data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const confirmReceipt = async (orderId) => {
    setConfirmingId(orderId)
    try {
      await api.put(`/orders/${orderId}/status`, { status: 'COMPLETED' })
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'COMPLETED' } : o))
      )
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm order receipt')
    } finally {
      setConfirmingId(null)
    }
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (!activeOrderForReview) return
    const productId = activeOrderForReview.items?.[0]?.productId
    if (!productId) return

    setSubmittingReview(true)
    setReviewError('')
    try {
      const { data } = await api.post('/reviews', {
        storefrontId: activeOrderForReview.storefrontId,
        productId,
        orderId: activeOrderForReview.id,
        rating,
        comment: comment.trim(),
      })
      setOrders((prev) =>
        prev.map((o) => (o.id === activeOrderForReview.id ? { ...o, review: data } : o))
      )
      setReviewModalOpen(false)
      setActiveOrderForReview(null)
      setComment('')
      setRating(5)
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const renderItemFallbackIcon = (order) => {
    const type = order.items?.[0]?.product?.itemType
    if (type === 'SERVICE') return <Zap className="w-6 h-6 text-purple-500" />
    if (type === 'DIGITAL') return <Layers className="w-6 h-6 text-indigo-500" />
    return <Package className="w-6 h-6 text-orange-500" />
  }

  return (
    <PageTransition className="min-h-screen bg-[#F8FAFC] dark:bg-[#070913] text-slate-900 dark:text-slate-100 transition-colors duration-250">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-bold text-orange-600 dark:text-cyan-400 uppercase tracking-wider">
            Customer Dashboard
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            My Purchases
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Track deliveries, order history, and connect with sellers
          </p>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-orange-500 dark:border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Loading your purchase history...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900/60 rounded-3xl p-8 max-w-md mx-auto border border-slate-200 dark:border-white/10 shadow-xs">
            <ShoppingBag className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-slate-900 dark:text-white font-bold text-base mb-1">No orders yet</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">
              You haven't bought anything from the marketplace yet.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 dark:from-cyan-400 dark:to-indigo-500 text-white dark:text-slate-950 font-bold text-xs shadow-xs"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = STATUS_CONFIG[order.status] || { label: order.status, stepIndex: 0, color: 'text-slate-500' }
              const isCancelled = order.status === 'CANCELLED'

              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-slate-900/60 rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-white/5 shadow-xs space-y-4"
                >
                  {/* Top Bar: Order ID, Date, Seller Link */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-slate-900 dark:text-white font-bold text-sm">#{order.orderNumber}</span>
                      <span className="text-slate-300 dark:text-slate-600 text-xs">·</span>
                      <span className="text-slate-500 dark:text-slate-400 text-xs">
                        {new Date(order.createdAt).toLocaleDateString('en-PK', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600 text-xs">·</span>
                      <Link
                        to={`/store/${order.storefront?.handle}`}
                        className="inline-flex items-center gap-1 text-orange-600 dark:text-cyan-400 hover:underline text-xs font-semibold"
                      >
                        <Store className="w-3 h-3" />
                        <span>{order.storefront?.displayName}</span>
                      </Link>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <button
                        onClick={() => navigate(`/chat/${order.storefront?.ownerId}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3 text-orange-500 dark:text-cyan-400" />
                        <span>Chat Seller</span>
                      </button>
                    </div>
                  </div>

                  {/* Order Items & Price */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                        {order.items?.[0]?.product?.images?.[0]?.url ? (
                          <img
                            src={order.items[0].product.images[0].url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          renderItemFallbackIcon(order)
                        )}
                      </div>

                      <div>
                        {order.items?.map((item) => (
                          <div key={item.id} className="text-xs">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</span>
                            <span className="text-slate-500 dark:text-slate-400 ml-2 font-medium">× {item.quantity}</span>
                          </div>
                        ))}
                        <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-1">
                          Delivery: {order.deliveryMethod?.replace('_', ' ')} · Payment: {order.paymentMethod}
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Total Amount</div>
                      <div className="text-xl font-black text-slate-900 dark:text-white">
                        Rs {Number(order.total).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address & Customer Note (if present) */}
                  {(order.deliveryAddress || order.buyerNote) && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-xs space-y-1.5">
                      {order.deliveryAddress && (
                        <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                          <span>
                            <strong>Shipping Destination:</strong>{' '}
                            {typeof order.deliveryAddress === 'string'
                              ? order.deliveryAddress
                              : `${order.deliveryAddress.address || ''}${order.deliveryAddress.city ? `, ${order.deliveryAddress.city}` : ''}${order.deliveryAddress.phone ? ` · Phone: ${order.deliveryAddress.phone}` : ''}`}
                          </span>
                        </div>
                      )}
                      {order.buyerNote && (
                        <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>Customer Instructions:</strong> "{order.buyerNote}"
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Order Progress Tracker (if not cancelled) */}
                  {!isCancelled && (
                    <div className="pt-2">
                      <div className="grid grid-cols-6 gap-1 sm:gap-2">
                        {LIFECYCLE_STEPS.map((step, idx) => {
                          const isPassed = statusInfo.stepIndex >= idx
                          const isCurrent = statusInfo.stepIndex === idx
                          return (
                            <div key={step} className="flex flex-col items-center text-center">
                              <div
                                className={`w-full h-1.5 rounded-full transition-all duration-500 mb-1.5 ${
                                  isPassed
                                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 dark:from-cyan-400 dark:to-indigo-500'
                                    : 'bg-slate-200 dark:bg-white/10'
                                }`}
                              />
                              <span
                                className={`text-[9px] uppercase font-bold truncate ${
                                  isCurrent
                                    ? 'text-orange-600 dark:text-cyan-400'
                                    : isPassed
                                    ? 'text-slate-700 dark:text-slate-300'
                                    : 'text-slate-400 dark:text-slate-600'
                                }`}
                              >
                                {step.toLowerCase()}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Confirm Receipt Action for Delivered Orders */}
                  {order.status === 'DELIVERED' && (
                    <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold">
                        Package delivered! Please confirm receipt to complete this order.
                      </p>
                      <button
                        onClick={() => confirmReceipt(order.id)}
                        disabled={confirmingId === order.id}
                        className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                      >
                        {confirmingId === order.id ? 'Confirming...' : 'Confirm Receipt'}
                      </button>
                    </div>
                  )}

                  {/* Completed Order Review Section */}
                  {order.status === 'COMPLETED' && (
                    <div className="pt-3 border-t border-slate-100 dark:border-white/5">
                      {order.review ? (
                        <div className="p-3.5 rounded-xl bg-orange-50/60 dark:bg-white/[0.02] border border-orange-200/60 dark:border-white/5 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Your Verified Review</span>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3.5 h-3.5 ${
                                      s <= order.review.rating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-slate-200 dark:text-slate-700'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {new Date(order.review.createdAt).toLocaleDateString('en-PK', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                            "{order.review.comment}"
                          </p>
                          {order.review.sellerReply && (
                            <div className="mt-2 pl-3 py-1.5 border-l-2 border-orange-500 dark:border-cyan-400 bg-white/80 dark:bg-white/5 rounded-r-lg text-xs">
                              <span className="font-bold text-orange-700 dark:text-cyan-300 text-[11px]">
                                Response from {order.storefront?.displayName}:
                              </span>
                              <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                                {order.review.sellerReply}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/20">
                          <div>
                            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                              Order Complete
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Share your feedback with {order.storefront?.displayName} to celebrate craftsmanship.
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setActiveOrderForReview(order)
                              setRating(5)
                              setComment('')
                              setReviewError('')
                              setReviewModalOpen(true)
                            }}
                            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>Leave Review</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* ═══ REVIEW MODAL ═══ */}
      <AnimatePresence>
        {reviewModalOpen && activeOrderForReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setReviewModalOpen(false)
                setActiveOrderForReview(null)
              }}
              className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Rate Your Experience
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Order #{activeOrderForReview.orderNumber} with{' '}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {activeOrderForReview.storefront?.displayName}
                    </strong>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setReviewModalOpen(false)
                    setActiveOrderForReview(null)
                  }}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {reviewError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold">
                  {reviewError}
                </div>
              )}

              <form onSubmit={submitReview} className="space-y-5">
                {/* Product Summary */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center shrink-0">
                    {activeOrderForReview.items?.[0]?.product?.images?.[0]?.url ? (
                      <img
                        src={activeOrderForReview.items[0].product.images[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {activeOrderForReview.items?.[0]?.title}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      Rs {Number(activeOrderForReview.total).toLocaleString()} · Verified Purchase
                    </p>
                  </div>
                </div>

                {/* Star Rating Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Overall Satisfaction Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((starVal) => {
                        const active = (hoverRating || rating) >= starVal
                        return (
                          <button
                            key={starVal}
                            type="button"
                            onMouseEnter={() => setHoverRating(starVal)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(starVal)}
                            className="p-1 rounded-lg transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                          >
                            <Star
                              className={`w-7 h-7 transition-colors ${
                                active ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                              }`}
                            />
                          </button>
                        )
                      })}
                    </div>
                    <span className="text-xs font-bold text-orange-600 dark:text-cyan-400 ml-2">
                      {RATING_LABELS[hoverRating || rating]}
                    </span>
                  </div>
                </div>

                {/* Comment Textarea */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Your Honest Feedback *
                  </label>
                  <textarea
                    required
                    rows={4}
                    minLength={5}
                    placeholder="Tell other shoppers what you loved about this craft, packaging, quality, or seller communication..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 resize-none leading-relaxed"
                  />
                </div>

                {/* Actions */}
                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setReviewModalOpen(false)
                      setActiveOrderForReview(null)
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview || !comment.trim()}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 dark:from-cyan-400 dark:to-indigo-500 text-white dark:text-slate-950 font-bold text-xs shadow-md shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {submittingReview ? 'Publishing...' : 'Submit Verified Review'}
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