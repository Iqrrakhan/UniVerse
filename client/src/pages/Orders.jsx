import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

const statusColors = {
  pending: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  confirmed: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  completed: 'text-green-400 bg-green-500/10 border-green-500/20',
  cancelled: 'text-red-400 bg-red-500/10 border-red-500/20',
}

export default function Orders() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    axios.get('/orders/my', {
      headers: { Authorization: `Bearer ${user.token}` }
    }).then(({ data }) => {
      setOrders(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user])

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-black">My Orders</h1>
          <p className="text-zinc-500 mt-1">Track everything you've ordered on campus</p>
        </div>

        {loading ? (
          <div className="text-center text-zinc-600 py-20">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 border border-white/5 rounded-2xl">
            <p className="text-4xl mb-4">🛒</p>
            <p className="text-zinc-500 mb-2">No orders yet</p>
            <button
              onClick={() => navigate('/')}
              className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
            >
              Browse the marketplace →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div
                key={order._id}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left - product info */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                      {order.product?.category === 'Tech' ? '💻' :
                       order.product?.category === 'Arts' ? '🎨' :
                       order.product?.category === 'Tutoring' ? '📚' :
                       order.product?.category === 'Food' ? '🍕' : '📦'}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">
                        {order.product?.title || 'Product'}
                      </h3>
                      <p className="text-zinc-600 text-xs mt-0.5">
                        From {order.seller?.name || 'Seller'}
                        {order.seller?.storeName ? ` · ${order.seller.storeName}` : ''}
                      </p>
                      <p className="text-zinc-700 text-xs mt-1">
                        Qty: {order.quantity} · Ordered {new Date(order.createdAt).toLocaleDateString('en-PK', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Right - price + status */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-cyan-400 font-bold text-lg">Rs {order.totalPrice}</p>
                    <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full border font-medium capitalize ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {order.note && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-zinc-600 text-xs">📝 Note: {order.note}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}