import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

const StarRating = ({ rating, onRate, interactive = false }) => {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onRate(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`text-xl transition-all ${interactive ? 'cursor-pointer' : 'cursor-default'} ${
            star <= (hover || rating) ? 'text-yellow-400' : 'text-zinc-700'
          }`}
        >
          ★
        </button>
        

      ))}
    </div>
  )
}

export default function Store() {
  const { sellerId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState(null)
  const [orderSuccess, setOrderSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('products')
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '', product: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')

  useEffect(() => {
    fetchStore()
  }, [sellerId])

  const fetchStore = async () => {
    const { data } = await axios.get(`/store/${sellerId}`)
    setStore(data)
    setLoading(false)
  }

  const placeOrder = async (product) => {
    if (!user) return alert('Please login to place an order')
    setOrdering(product._id)
    try {
      await axios.post('/orders', { productId: product._id, quantity: 1 }, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      setOrderSuccess(product._id)
      setTimeout(() => setOrderSuccess(''), 3000)
    } catch (err) {
      alert(err.response?.data?.message || 'Order failed')
    } finally {
      setOrdering(null)
    }
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (!reviewForm.rating) return setReviewError('Please select a rating')
    if (!reviewForm.product) return setReviewError('Please select a product')
    setSubmittingReview(true)
    setReviewError('')
    try {
      await axios.post('/reviews', {
        seller: sellerId,
        product: reviewForm.product,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      setReviewSuccess('Review submitted!')
      setReviewForm({ rating: 0, comment: '', product: '' })
      fetchStore()
      setTimeout(() => setReviewSuccess(''), 3000)
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center text-zinc-600">
      <Navbar />
      Loading store...
    </div>
  )

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      <Navbar />

      {/* Store Header */}
      <div className="relative pt-28 pb-16 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-500 opacity-5 blur-[120px] rounded-full" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/30 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 text-4xl font-black">
              {store?.seller?.storeName?.charAt(0).toUpperCase() || store?.seller?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl font-black">
                {store?.seller?.storeName || store?.seller?.name + "'s Store"}
              </h1>
              <p className="text-zinc-500 mt-1">by {store?.seller?.name} · {store?.seller?.department}</p>
             <div className="flex items-center gap-3 mt-3 flex-wrap">
  <span className="text-xs text-zinc-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
    {store?.products?.length} products
  </span>
  <span className="text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
    ✓ Verified Student
  </span>
  {store?.avgRating && (
    <span className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full flex items-center gap-1">
      ★ {store.avgRating} · {store.reviews?.length} reviews
    </span>
  )}
</div>
{user && user._id !== sellerId && (
  <button
    onClick={() => navigate(`/chat/${sellerId}`)}
    className="mt-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 font-bold px-5 py-2.5 rounded-xl transition-all text-sm"
  >
    💬 Message Seller
  </button>
)}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="flex gap-2 border-b border-white/5 mb-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2.5 text-sm font-medium transition-all border-b-2 ${
              activeTab === 'products'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-zinc-500 border-transparent hover:text-white'
            }`}
          >
            Products & Services
            <span className="ml-2 text-xs bg-white/5 px-2 py-0.5 rounded-full">{store?.products?.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-5 py-2.5 text-sm font-medium transition-all border-b-2 ${
              activeTab === 'reviews'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-zinc-500 border-transparent hover:text-white'
            }`}
          >
            Reviews
            <span className="ml-2 text-xs bg-white/5 px-2 py-0.5 rounded-full">{store?.reviews?.length}</span>
          </button>
        </div>

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="pb-20">
            {store?.products?.length === 0 ? (
              <div className="text-center py-20 text-zinc-600">No products yet</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {store?.products?.map(product => (
                  <div key={product._id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all group">
                    <div className="h-48 bg-white/5 flex items-center justify-center text-5xl opacity-30">
                      {product.category === 'Tech' ? '💻' :
                       product.category === 'Arts' ? '🎨' :
                       product.category === 'Tutoring' ? '📚' :
                       product.category === 'Food' ? '🍕' : '📦'}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-white font-semibold text-sm truncate">{product.title}</h3>
                        <span className="text-xs text-zinc-600 capitalize ml-2 flex-shrink-0">{product.itemType}</span>
                      </div>
                      <p className="text-zinc-600 text-xs mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-cyan-400 font-bold text-lg">Rs {product.price}</span>
                        <span className={`text-xs px-2 py-1 rounded-lg border ${
                          product.inStock
                            ? 'text-green-400 bg-green-500/10 border-green-500/20'
                            : 'text-red-400 bg-red-500/10 border-red-500/20'
                        }`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>

                      {orderSuccess === product._id ? (
                        <div className="w-full text-center bg-green-500/10 border border-green-500/30 text-green-400 text-sm py-2 rounded-xl">
                          ✅ Order Placed!
                        </div>
                      ) : (
                        <button
                          onClick={() => placeOrder(product)}
                          disabled={ordering === product._id || !product.inStock || user?._id === sellerId}
                          className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2.5 rounded-xl transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {ordering === product._id ? 'Ordering...' :
                           !product.inStock ? 'Out of Stock' :
                           user?._id === sellerId ? 'Your Product' : 'Order Now'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div className="pb-20 max-w-3xl">

            {/* Overall Rating */}
            {store?.avgRating && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 flex items-center gap-6">
                <div className="text-center">
                  <p className="text-6xl font-black text-yellow-400">{store.avgRating}</p>
                  <StarRating rating={Math.round(store.avgRating)} />
                  <p className="text-zinc-600 text-xs mt-1">{store.reviews?.length} reviews</p>
                </div>
                <div className="flex-1">
                  {[5,4,3,2,1].map(star => {
                    const count = store.reviews?.filter(r => r.rating === star).length || 0
                    const pct = store.reviews?.length ? (count / store.reviews.length) * 100 : 0
                    return (
                      <div key={star} className="flex items-center gap-3 mb-1">
                        <span className="text-xs text-zinc-500 w-4">{star}</span>
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-zinc-600 w-4">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Write Review Form */}
            {user && user._id !== sellerId && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                <h3 className="text-white font-bold mb-4">Write a Review</h3>

                {reviewSuccess && (
                  <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-xl px-4 py-3 mb-4">
                    ✅ {reviewSuccess}
                  </div>
                )}
                {reviewError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
                    {reviewError}
                  </div>
                )}

                <form onSubmit={submitReview} className="space-y-4">
                  <div>
                    <label className="text-zinc-400 text-xs uppercase tracking-widest mb-2 block">Select Product</label>
                    <select
                      value={reviewForm.product}
                      onChange={e => setReviewForm({ ...reviewForm, product: e.target.value })}
                      className="w-full bg-[#080810] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                    >
                      <option value="">Choose a product...</option>
                      {store?.products?.map(p => (
                        <option key={p._id} value={p._id}>{p.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-400 text-xs uppercase tracking-widest mb-2 block">Rating</label>
                    <StarRating
                      rating={reviewForm.rating}
                      onRate={r => setReviewForm({ ...reviewForm, rating: r })}
                      interactive={true}
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 text-xs uppercase tracking-widest mb-2 block">Comment</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      required
                      placeholder="Share your experience..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-all text-sm resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-3 rounded-xl transition-all text-sm disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}

            {/* Reviews List */}
            {store?.reviews?.length === 0 ? (
              <div className="text-center py-12 text-zinc-600">No reviews yet — be the first!</div>
            ) : (
              <div className="space-y-4">
                {store?.reviews?.map(review => (
                  <div key={review._id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-sm font-bold">
                          {review.reviewer?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{review.reviewer?.name}</p>
                          <p className="text-zinc-600 text-xs">{review.reviewer?.department}</p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    {review.product && (
                      <p className="text-zinc-600 text-xs mb-2">Re: {review.product?.title}</p>
                    )}
                    <p className="text-zinc-400 text-sm">{review.comment}</p>
                    <p className="text-zinc-700 text-xs mt-3">
                      {new Date(review.createdAt).toLocaleDateString('en-PK', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}