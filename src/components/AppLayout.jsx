import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">E3D</div>
          <div>
            <strong>ECO3D</strong>
            <span>Internal Portal</span>
          </div>
        </div>
        <nav className="nav-menu">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/products">Danh mục hàng hóa</NavLink>
          <NavLink to="/change-password">Đổi mật khẩu</NavLink>
        </nav>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <h1>Hệ thống quản lý ECO3D</h1>
            <p>Quản lý hàng hóa, tồn kho và dữ liệu bán hàng nội bộ</p>
          </div>
          <div className="user-box">
            <span>Xin chào, <strong>{user?.ten || 'User'}</strong></span>
            <button type="button" onClick={handleLogout}>Đăng xuất</button>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  )
}
