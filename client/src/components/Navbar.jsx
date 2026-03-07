import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080810]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-black tracking-tight text-white">
          Uni<span className="text-cyan-400">Verse</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
  <Link to="/" className="text-zinc-400 hover:text-white text-sm transition-colors">Marketplace</Link>
  {user?.role === 'seller' && (
    <Link to="/dashboard" className="text-zinc-400 hover:text-white text-sm transition-colors">Dashboard</Link>
  )}
  {user && (
    <Link to="/orders" className="text-zinc-400 hover:text-white text-sm transition-colors">My Orders</Link>
  )}
  {user && (
    <Link to="/chat" className="text-zinc-400 hover:text-white text-sm transition-colors">Messages</Link>
  )}
</div>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-white text-sm font-medium">{user.name}</p>
                <p className="text-zinc-500 text-xs">{user.department}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-sm font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="text-zinc-500 hover:text-red-400 text-sm transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-zinc-400 hover:text-white text-sm transition-colors">Sign in</Link>
              <Link to="/register" className="bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold px-4 py-2 rounded-xl transition-all">
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}