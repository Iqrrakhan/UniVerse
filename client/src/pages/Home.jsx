import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = ['All', 'Tech', 'Arts', 'Tutoring', 'Food', 'Other']

const categoryColors = {
  Tech: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  Arts: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  Tutoring: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  Food: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  Other: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
}

export default function Home() {
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [storeRatings, setStoreRatings] = useState({})
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('/products').then(({ data }) => {
      setProducts(data)
      setFiltered(data)
      setLoading(false)
      // fetch ratings for each unique seller
      const sellerIds = [...new Set(data.map(p => p.seller?._id).filter(Boolean))]
      sellerIds.forEach(async (id) => {
        try {
          const { data: store } = await axios.get(`/store/${id}`)
          if (store.avgRating) {
            setStoreRatings(prev => ({ ...prev, [id]: store.avgRating }))
          }
        } catch (err) {}
      })
    })
  }, [])

  useEffect(() => {
    let result = products
    if (activeCategory !== 'All') result = result.filter(p => p.category === activeCategory)
    if (search) result = result.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    setFiltered(result)
  }, [activeCategory, search, products])

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      <Navbar />

      {/* Hero */}
      <div className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500 opacity-5 blur-[150px] rounded-full" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-block bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs tracking-widest uppercase px-4 py-2 rounded-full mb-6">
            Campus Marketplace
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-none">
            Buy & Sell on<br />
            <span className="text-cyan-400">Campus</span>
          </h1>
          <p className="text-zinc-500 text-lg max-w-xl mx-auto mb-8">
            Discover products and services from your fellow students. From tech gadgets to tutoring sessions.
          </p>
          {!user && (
            <div className="flex gap-3 justify-center">
              <Link to="/register" className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-3 rounded-xl transition-all">
                Get Started
              </Link>
              <Link to="/login" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl transition-all">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Search + Filter */}
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full md:w-80 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
          />
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  activeCategory === cat
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                    : 'bg-white/5 border-white/10 text-zinc-500 hover:border-white/20 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="text-center text-zinc-600 py-20">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-zinc-600 py-20">No products found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(product => (
              <div
                key={product._id}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 hover:bg-white/8 transition-all group flex flex-col"
              >
                {/* Image */}
                <div className="h-48 bg-white/5 flex items-center justify-center relative overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="text-5xl opacity-30">
                      {product.category === 'Tech' ? '💻' :
                       product.category === 'Arts' ? '🎨' :
                       product.category === 'Tutoring' ? '📚' :
                       product.category === 'Food' ? '🍕' : '📦'}
                    </div>
                  )}
                  {/* Category badge */}
                  <div className={`absolute top-3 left-3 text-xs px-2 py-1 rounded-lg border font-medium ${categoryColors[product.category]}`}>
                    {product.category}
                  </div>
                  {/* Rating badge */}
                  {storeRatings[product.seller?._id] && (
                    <div className="absolute top-3 right-3 text-xs px-2 py-1 rounded-lg border font-medium text-yellow-400 bg-yellow-500/10 border-yellow-500/20">
                      ★ {storeRatings[product.seller?._id]}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-white font-semibold text-sm mb-1 truncate">{product.title}</h3>
                  <p className="text-zinc-600 text-xs mb-3 line-clamp-2 flex-1">{product.description}</p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-cyan-400 font-bold text-lg">Rs {product.price}</span>
                    <span className="text-zinc-600 text-xs capitalize">{product.itemType}</span>
                  </div>

                  {/* Seller */}
                  {product.seller && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xs font-bold">
                        {product.seller.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-zinc-600 text-xs truncate">
                        {product.seller.storeName || product.seller.name}
                      </span>
                    </div>
                  )}

                  {/* Order Button */}
                  <button
                    onClick={() => navigate(`/store/${product.seller?._id}`)}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2.5 rounded-xl transition-all text-sm"
                  >
                    View Store & Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}