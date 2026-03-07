import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', department: '', role: 'buyer', storeName: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.post('/auth/register', form)
      login(data)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center px-4 relative overflow-hidden py-10">
      {/* Background glow effects */}
      <div className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] bg-purple-600 rounded-full opacity-10 blur-[120px]" />
      <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] bg-cyan-500 rounded-full opacity-10 blur-[120px]" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-tight text-white">
            Uni<span className="text-cyan-400">Verse</span>
          </h1>
          <p className="text-zinc-500 mt-2 text-sm tracking-widest uppercase">Campus Marketplace</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-1">Join UniVerse</h2>
          <p className="text-zinc-500 text-sm mb-6">Create your campus account</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-zinc-400 text-xs uppercase tracking-widest mb-2 block">Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handle}
                required
                placeholder="Your name"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
              />
            </div>

            <div>
              <label className="text-zinc-400 text-xs uppercase tracking-widest mb-2 block">University Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handle}
                required
                placeholder="you@university.edu"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
              />
            </div>

            <div>
              <label className="text-zinc-400 text-xs uppercase tracking-widest mb-2 block">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handle}
                required
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
              />
            </div>

            <div>
              <label className="text-zinc-400 text-xs uppercase tracking-widest mb-2 block">Department</label>
              <input
                name="department"
                value={form.department}
                onChange={handle}
                required
                placeholder="e.g. Computer Science"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
              />
            </div>

            <div>
              <label className="text-zinc-400 text-xs uppercase tracking-widest mb-2 block">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'buyer' })}
                  className={`py-3 rounded-xl text-sm font-medium border transition-all ${
                    form.role === 'buyer'
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                      : 'bg-white/5 border-white/10 text-zinc-500 hover:border-white/20'
                  }`}
                >
                  🛒 Buy
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'seller' })}
                  className={`py-3 rounded-xl text-sm font-medium border transition-all ${
                    form.role === 'seller'
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                      : 'bg-white/5 border-white/10 text-zinc-500 hover:border-white/20'
                  }`}
                >
                  🏪 Sell
                </button>
              </div>
            </div>

            {form.role === 'seller' && (
              <div>
                <label className="text-zinc-400 text-xs uppercase tracking-widest mb-2 block">Store Name</label>
                <input
                  name="storeName"
                  value={form.storeName}
                  onChange={handle}
                  placeholder="Your store name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-all text-sm"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl transition-all duration-200 mt-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-zinc-600 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}