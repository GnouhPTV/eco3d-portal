import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const assetBase = import.meta.env.BASE_URL

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Backend hoặc SQL Server phản hồi quá chậm. Vui lòng kiểm tra lại kết nối backend/database.')
      } else {
        setError(err.response?.data?.message || err.message || 'Đăng nhập thất bại')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <img className="login-logo-image" src={`${assetBase}eco3d-logo.png`} alt="ECO3D" />
        <h1>Đăng nhập hệ thống</h1>
        <p>Cổng quản lý nội bộ dành cho kinh doanh và kho hàng</p>
        <form onSubmit={handleSubmit}>
          <label>Tên đăng nhập</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Ví dụ: Administrators" autoFocus />
          <label>Mật khẩu</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Nhập mật khẩu" />
          {error && <div className="alert error">{error}</div>}
          <button type="submit" className="primary-btn" disabled={loading}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
        </form>
      </div>
    </div>
  )
}
