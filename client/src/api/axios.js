import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://universe-oinp.onrender.com/api' : 'http://localhost:5000/api')

// Create the main axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
})

// ─── Request Interceptor: Attach access token ─────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('universe_access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor: Auto-refresh on 401 ───────────────
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and not already retrying and not a login/refresh request
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Queue this request until refresh is done
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('universe_refresh_token')
      if (!refreshToken) {
        // No refresh token - clear auth and redirect
        localStorage.removeItem('universe_access_token')
        localStorage.removeItem('universe_refresh_token')
        localStorage.removeItem('universe_user')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
        localStorage.setItem('universe_access_token', data.accessToken)
        localStorage.setItem('universe_refresh_token', data.refreshToken)
        api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`
        processQueue(null, data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('universe_access_token')
        localStorage.removeItem('universe_refresh_token')
        localStorage.removeItem('universe_user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api