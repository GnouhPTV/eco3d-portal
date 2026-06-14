import { useEffect, useState } from 'react'
import api from '../api/client.js'
import { formatNumber } from '../utils/format.js'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/products/stats')
      .then(res => setStats(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Không tải được thống kê'))
  }, [])

  return (
    <section className="page-section">
      <div className="section-title">
        <h2>Dashboard</h2>
        <p>Tổng quan nhanh dữ liệu hàng hóa ECO3D</p>
      </div>
      {error && <div className="alert error">{error}</div>}
      <div className="stat-grid">
        <StatCard label="Tổng sản phẩm" value={formatNumber(stats?.totalProducts)} />
        <StatCard label="Sản phẩm còn hàng" value={formatNumber(stats?.inStockProducts)} />
        <StatCard label="Sản phẩm hết hàng" value={formatNumber(stats?.outOfStockProducts)} />
        <StatCard label="Tổng tồn kho" value={formatNumber(stats?.totalStock)} />
      </div>
      <div className="info-card">
        <h3>Giai đoạn hiện tại</h3>
        <p>Bản này đã có đăng nhập, đổi mật khẩu, danh mục hàng hóa, lọc/tìm kiếm/phân trang và popup hồ sơ hàng hóa.</p>
      </div>
    </section>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value ?? '...'}</strong>
    </div>
  )
}
