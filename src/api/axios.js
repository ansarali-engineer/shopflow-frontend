import axios from 'axios'

// In dev, Vite proxies /api → http://127.0.0.1:8000 (see vite.config.js).
// In production, same origin is used — never hardcode a host.
const BASE_URL = '/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ── Request interceptor: attach access token ──────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor: auto-refresh on 401 ────────────
let isRefreshing = false
let refreshQueue = []

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  )
  refreshQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    // Don't retry if:
    //  - not a 401
    //  - already retried
    //  - no refresh token stored
    //  - this IS the refresh endpoint (avoid infinite loop)
    const isRefreshEndpoint = original.url?.includes('/auth/refresh/')
    if (
      error.response?.status !== 401 ||
      original._retry ||
      !localStorage.getItem('refresh_token') ||
      isRefreshEndpoint
    ) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      // Queue this request until the in-flight refresh finishes
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject })
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      // POST to the refresh endpoint WITHOUT an Authorization header
      // so the expired token doesn't cause another 401.
      const { data } = await axios.post(
        `${BASE_URL}/auth/refresh/`,
        { refresh_token: localStorage.getItem('refresh_token') },
        { headers: { 'Content-Type': 'application/json' } },
      )

      const newToken = data.data.access_token
      localStorage.setItem('access_token', newToken)
      api.defaults.headers.common.Authorization = `Bearer ${newToken}`

      processQueue(null, newToken)

      original.headers.Authorization = `Bearer ${newToken}`
      return api(original)
    } catch (refreshError) {
      processQueue(refreshError, null)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      // Only redirect if we're not already on an auth page
      if (!window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login'
      }
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default api
