import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = ['Tech', 'Arts', 'Tutoring', 'Food', 'Other']

const statusColors = {
  pending: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  confirmed: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  completed: 'text-green-400 bg-green-500/10 border-green-500/20',
  cancelled: 'text-red-400 bg-red-500/10 border-red-500/20',
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
  title: '', description: '', price: '', category: 'Tech', itemType: 'physical'
})
const [imageFile, setImageFile] = useState(null)

  useEffect(() => {
    if (!user || user.role !== 'seller') { navigate('/'); return }
    fetchMyProducts()
    fetchMyOrders()
  }, [user])

  const fetchMyProducts = async () => {
    try {
      const { data } = await axios.get('/products')
      const mine = data.filter(p => p.seller?._id === user._id || p.seller === user._id)
      setProducts(mine)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyOrders = async () => {
    try {
      const { data } = await axios.get('/orders/seller', {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      setOrders(data)
    } catch (err) {
      console.log(err)
    } finally {
      setOrdersLoading(false)
    }
  }

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
  e.preventDefault()
  setCreating(true)
  setError('')
  setSuccess('')
  try {
    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('description', form.description)
    formData.append('price', form.price)
    formData.append('category', form.category)
    formData.append('itemType', form.itemType)
    if (imageFile) formData.append('image', imageFile)

    await axios.post('/products', formData, {
      headers: {
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'multipart/form-data'
      }
    })
    setSuccess('Product created successfully!')
    setForm({ title: '', description: '', price: '', category: 'Tech', itemType: 'physical' })
    setImageFile(null)
    setShowForm(false)
    fetchMyProducts()
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to create product')
  } finally {
    setCreating(false)
  }
} 

  const updateStatus = async (orderId, status) => {
  try {
    await axios.put(`/orders/${orderId}/status`, { status }, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
    fetchMyOrders()
  } catch (err) {
    console.log(err)
  }
}

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black">My Dashboard</h1>
            <p className="text-zinc-500 mt-1">
              {user?.storeName ? `🏪 ${user.storeName}` : 'Manage your store'}
            </p>
          </div>
          {activeTab === 'products' && (
            <button
              onClick={() => { setShowForm(!showForm); setError(''); setSuccess('') }}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-5 py-2.5 rounded-xl transition-all text-sm"
            >
              {showForm ? 'Cancel' : '+ New Product'}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/5 pb-0">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2.5 text-sm font-medium rounded-t-xl transition-all border-b-2 ${
              activeTab === 'products'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-zinc-500 border-transparent hover:text-white'
            }`}
          >
            My Products
            <span className="ml-2 text-xs bg-white/5 px-2 py-0.5 rounded-full">{products.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 text-sm font-medium rounded-t-xl transition-all border-b-2 ${
              activeTab === 'orders'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-zinc-500 border-transparent hover:text-white'
            }`}
          >
            Incoming Orders
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${orders.length > 0 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5'}`}>
              {orders.length}
            </span>
          </button>
        </div>

        {/* Success message */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-xl px-4 py-3 mb-6">
            ✅ {success}
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <>
            {/* Create Product Form */}
            {showForm && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                <h2 className="text-lg font-bold mb-5 text-white">Create New Product</h2>
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-5">
                    {error}
                  </div>
                )}
                <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-400 text-xs uppercase tracking-widest mb-2 block">Title</label>
                    <input
                      name="title"
                      value={form.title}
                      onChange={handle}
                      required
                      placeholder="Product name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 text-xs uppercase tracking-widest mb-2 block">Price (Rs)</label>
                    <input
                      name="price"
                      type="number"
                      value={form.price}
                      onChange={handle}
                      required
                      placeholder="500"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-zinc-400 text-xs uppercase tracking-widest mb-2 block">Description</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handle}
                      required
                      placeholder="Describe your product or service..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-all text-sm resize-none"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="text-zinc-400 text-xs uppercase tracking-widest mb-2 block">Product Image</label>
                    <div className="border border-dashed border-white/10 rounded-xl p-4 hover:border-white/20 transition-all">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => setImageFile(e.target.files[0])}
                        className="hidden"
                        id="imageUpload"
                      />
                      <label htmlFor="imageUpload" className="cursor-pointer flex flex-col items-center gap-2">
                        {imageFile ? (
                          <div className="text-center">
                            <p className="text-cyan-400 text-sm font-medium">✅ {imageFile.name}</p>
                            <p className="text-zinc-600 text-xs mt-1">Click to change</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <p className="text-3xl mb-2">🖼️</p>
                            <p className="text-zinc-500 text-sm">Click to upload image</p>
                            <p className="text-zinc-700 text-xs mt-1">JPG, PNG, WEBP</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-zinc-400 text-xs uppercase tracking-widest mb-2 block">Category</label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handle}
                      className="w-full bg-[#080810] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-zinc-400 text-xs uppercase tracking-widest mb-2 block">Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, itemType: 'physical' })}
                        className={`py-3 rounded-xl text-sm font-medium border transition-all ${
                          form.itemType === 'physical'
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                            : 'bg-white/5 border-white/10 text-zinc-500 hover:border-white/20'
                        }`}
                      >
                        📦 Physical
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, itemType: 'service' })}
                        className={`py-3 rounded-xl text-sm font-medium border transition-all ${
                          form.itemType === 'service'
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                            : 'bg-white/5 border-white/10 text-zinc-500 hover:border-white/20'
                        }`}
                      >
                        ⚡ Service
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={creating}
                      className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-50 text-sm"
                    >
                      {creating ? 'Creating...' : 'Create Product'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="text-zinc-600 text-center py-20">Loading...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 border border-white/5 rounded-2xl">
                <p className="text-zinc-600 mb-3">No products yet</p>
                <button onClick={() => setShowForm(true)} className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
                  Create your first product →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.map(product => (
                  <div key={product._id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all">
                    <div className="h-36 bg-white/5 flex items-center justify-center text-4xl opacity-30">
                      {product.category === 'Tech' ? '💻' :
                       product.category === 'Arts' ? '🎨' :
                       product.category === 'Tutoring' ? '📚' :
                       product.category === 'Food' ? '🍕' : '📦'}
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold text-sm truncate">{product.title}</h3>
                      <p className="text-zinc-600 text-xs mt-1 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-cyan-400 font-bold">Rs {product.price}</span>
                        <span className={`text-xs px-2 py-1 rounded-lg border ${
                          product.inStock
                            ? 'text-green-400 bg-green-500/10 border-green-500/20'
                            : 'text-red-400 bg-red-500/10 border-red-500/20'
                        }`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div>
            {ordersLoading ? (
              <div className="text-zinc-600 text-center py-20">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 border border-white/5 rounded-2xl">
                <p className="text-4xl mb-4">📦</p>
                <p className="text-zinc-600">No orders yet</p>
                <p className="text-zinc-700 text-sm mt-1">Orders will appear here when buyers purchase your products</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
  <div key={order._id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl flex-shrink-0">
          {order.product?.category === 'Tech' ? '💻' :
           order.product?.category === 'Arts' ? '🎨' :
           order.product?.category === 'Tutoring' ? '📚' :
           order.product?.category === 'Food' ? '🍕' : '📦'}
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">{order.product?.title || 'Product'}</h3>
          <p className="text-zinc-500 text-xs mt-0.5">
            Ordered by <span className="text-white">{order.buyer?.name}</span>
          </p>
          <p className="text-zinc-600 text-xs mt-0.5">{order.buyer?.department}</p>
          <p className="text-zinc-700 text-xs mt-1">
            Qty: {order.quantity} · {new Date(order.createdAt).toLocaleDateString('en-PK', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </p>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-cyan-400 font-bold text-lg">Rs {order.totalPrice}</p>
        <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full border font-medium capitalize ${statusColors[order.status]}`}>
          {order.status}
        </span>
      </div>
    </div>

    {order.note && (
      <div className="mt-4 pt-4 border-t border-white/5">
        <p className="text-zinc-600 text-xs">📝 {order.note}</p>
      </div>
    )}

    {/* Action buttons */}
    {order.status === 'pending' && (
      <div className="mt-4 pt-4 border-t border-white/5 flex gap-3">
        <button
          onClick={() => updateStatus(order._id, 'confirmed')}
          className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-400 text-xs font-bold px-4 py-2 rounded-xl transition-all"
        >
          ✅ Accept
        </button>
        <button
          onClick={() => updateStatus(order._id, 'cancelled')}
          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold px-4 py-2 rounded-xl transition-all"
        >
          ❌ Reject
        </button>
      </div>
    )}

    {order.status === 'confirmed' && (
      <div className="mt-4 pt-4 border-t border-white/5">
        <button
          onClick={() => updateStatus(order._id, 'completed')}
          className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 text-xs font-bold px-4 py-2 rounded-xl transition-all"
        >
          🏁 Mark as Completed
        </button>
      </div>
    )}
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