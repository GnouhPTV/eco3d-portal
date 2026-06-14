import axios from 'axios'

const appBasePath = import.meta.env.BASE_URL || '/'
const loginPath = `${appBasePath.replace(/\/$/, '')}/login`
const defaultApiBaseUrl =
  window.location.hostname === 'gnouhptv.github.io'
    ? 'https://eco3d-portal-backend.onrender.com/api'
    : 'http://localhost:8080/api'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eco3d_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('eco3d_token')
      localStorage.removeItem('eco3d_user')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = loginPath
      }
    }
    return Promise.reject(error)
  },
)

export default api
