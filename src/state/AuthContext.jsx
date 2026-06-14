import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('eco3d_token'))
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('eco3d_user')
    return raw ? JSON.parse(raw) : null
  })
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem('eco3d_token')
    localStorage.removeItem('eco3d_user')
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    async function loadMe() {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const res = await api.get('/auth/me')
        if (res.data?.success) {
          setUser(res.data.data)
          localStorage.setItem('eco3d_user', JSON.stringify(res.data.data))
        }
      } catch (e) {
        logout()
      } finally {
        setLoading(false)
      }
    }
    loadMe()
  }, [logout, token])

  const login = useCallback(async (username, password) => {
    const res = await api.post('/auth/login', { username, password })
    if (!res.data?.success) throw new Error(res.data?.message || 'Đăng nhập thất bại')
    const { token, user } = res.data.data
    localStorage.setItem('eco3d_token', token)
    localStorage.setItem('eco3d_user', JSON.stringify(user))
    setToken(token)
    setUser(user)
    return user
  }, [])

  const value = useMemo(() => ({ token, user, loading, login, logout }), [token, user, loading, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
