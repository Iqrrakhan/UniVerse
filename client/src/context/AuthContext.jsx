import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // ─── Restore session on mount ────────────────────────────
  useEffect(() => {
    const storedUser = localStorage.getItem('universe_user')
    const accessToken = localStorage.getItem('universe_access_token')
    if (storedUser && accessToken) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  // ─── Login: store tokens and user ───────────────────────
  const login = useCallback((userData, accessToken, refreshToken) => {
    setUser(userData)
    localStorage.setItem('universe_user', JSON.stringify(userData))
    localStorage.setItem('universe_access_token', accessToken)
    localStorage.setItem('universe_refresh_token', refreshToken)
  }, [])

  // ─── Logout: clear tokens, call server to invalidate ────
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignore errors (e.g., already expired token)
    } finally {
      setUser(null)
      localStorage.removeItem('universe_user')
      localStorage.removeItem('universe_access_token')
      localStorage.removeItem('universe_refresh_token')
    }
  }, [])

  // ─── Refresh user data from server ──────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me')
      const updated = data.user
      setUser(updated)
      localStorage.setItem('universe_user', JSON.stringify(updated))
      return updated
    } catch {
      return null
    }
  }, [])

  // ─── Helpers ─────────────────────────────────────────────
  const isVendor = user?.role === 'VENDOR' || user?.role === 'ADMIN'
  const isAdmin = user?.role === 'ADMIN'
  const hasStorefront = !!user?.storefront
  const isEmailVerified = user?.emailVerified === true

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        isVendor,
        isAdmin,
        hasStorefront,
        isEmailVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}