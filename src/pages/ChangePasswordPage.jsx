import { useState } from 'react'
import api from '../api/client.js'

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setMessage('')
    setError('')
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }
    if (!isStrongPassword(newPassword)) {
      setError('Mật khẩu mới cần tối thiểu 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/auth/change-password', { currentPassword, newPassword })
      setMessage(res.data?.message || 'Đổi mật khẩu thành công')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err.response?.data?.message || 'Không đổi được mật khẩu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page-section">
      <div className="section-title">
        <h2>Đổi mật khẩu</h2>
        <p>Mật khẩu mới sẽ được lưu vào cột PWDMD5 bằng BCrypt.</p>
      </div>
      <form className="form-card" onSubmit={submit}>
        <label>Mật khẩu hiện tại</label>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        <label>Mật khẩu mới</label>
        <input type="password" minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <label>Nhập lại mật khẩu mới</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}
        <button type="submit" className="primary-btn" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu mật khẩu mới'}</button>
      </form>
    </section>
  )
}

function isStrongPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/.test(password)
}
