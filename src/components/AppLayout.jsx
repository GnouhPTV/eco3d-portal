import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const canManageUsers = isAccountCreator(user)
  const assetBase = import.meta.env.BASE_URL
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('eco3d-sidebar') === 'collapsed')
  const [openCollapsedMenu, setOpenCollapsedMenu] = useState('')
  const pageTitle = getPageTitle(location.pathname)

  useEffect(() => {
    localStorage.setItem('eco3d-sidebar', collapsed ? 'collapsed' : 'expanded')
  }, [collapsed])

  useEffect(() => {
    setOpenCollapsedMenu('')
  }, [location.pathname, collapsed])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className={collapsed ? 'app-shell sidebar-collapsed' : 'app-shell'}>
      <aside className="sidebar">
        <div className="brand">
          <img className="brand-logo-full" src={`${assetBase}eco3d-logo.png`} alt="ECO3D" />
          <img className="brand-logo-icon" src={`${assetBase}eco3d-icon.png`} alt="ECO3D" />
          <div className="brand-copy">
            <strong>ECO3D</strong>
            <span>Quản trị nội bộ</span>
          </div>
        </div>

        <nav className="nav-menu">
          <NavLink to="/" end>
            <NavIcon type="dashboard" />
            <span>Tổng quan</span>
          </NavLink>
          <details className="nav-group" open>
            <summary
              className={location.pathname.startsWith('/products') ? 'active' : ''}
              onClick={(event) => handleCollapsedSummaryClick(event, 'catalog')}
            >
              <NavIcon type="box" />
              <span>Danh mục</span>
            </summary>
            {collapsed && openCollapsedMenu === 'catalog' && (
              <div className="collapsed-flyout">
                <NavLink to="/products">
                  <NavIcon type="products" />
                  <span>Hàng hóa</span>
                </NavLink>
              </div>
            )}
            <div className="nav-submenu">
              <NavLink to="/products">
                <NavIcon type="products" />
                <span>Hàng hóa</span>
              </NavLink>
            </div>
          </details>
          <details className="nav-group" open>
            <summary
              className={location.pathname.startsWith('/users') || location.pathname.startsWith('/change-password') ? 'active' : ''}
              onClick={(event) => handleCollapsedSummaryClick(event, 'account')}
            >
              <NavIcon type="users" />
              <span>Tài khoản</span>
            </summary>
            {collapsed && openCollapsedMenu === 'account' && (
              <div className="collapsed-flyout">
                {canManageUsers && (
                  <NavLink to="/users">
                    <NavIcon type="users" />
                    <span>Tài khoản nhân viên</span>
                  </NavLink>
                )}
                <NavLink to="/change-password">
                  <NavIcon type="lock" />
                  <span>Đổi mật khẩu</span>
                </NavLink>
              </div>
            )}
            <div className="nav-submenu">
              {canManageUsers && (
                <NavLink to="/users">
                  <NavIcon type="users" />
                  <span>Tài khoản nhân viên</span>
                </NavLink>
              )}
              <NavLink to="/change-password">
                <NavIcon type="lock" />
                <span>Đổi mật khẩu</span>
              </NavLink>
            </div>
          </details>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-avatar">{(user?.ten || 'U').slice(0, 1).toUpperCase()}</div>
          <div className="sidebar-user-copy">
            <strong>{user?.ten || 'User'}</strong>
            <span>Đang đăng nhập</span>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setCollapsed((value) => !value)}
            title={collapsed ? 'Mở sidebar' : 'Thu gọn sidebar'}
            aria-label={collapsed ? 'Mở sidebar' : 'Thu gọn sidebar'}
          >
            <span>{collapsed ? '☰' : '‹'}</span>
          </button>
          <div className="breadcrumb">
            <span>Trang chủ</span>
            <span>/</span>
            <strong>{pageTitle}</strong>
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

  function handleCollapsedSummaryClick(event, menuName) {
    if (!collapsed) return
    event.preventDefault()
    setOpenCollapsedMenu((current) => (current === menuName ? '' : menuName))
  }
}

function getPageTitle(pathname) {
  if (pathname.startsWith('/products')) return 'Hàng hóa'
  if (pathname.startsWith('/users')) return 'Tài khoản nhân viên'
  if (pathname.startsWith('/change-password')) return 'Đổi mật khẩu'
  return 'Tổng quan'
}

function isAccountCreator(user) {
  const username = user?.ten || ''
  return username.toLowerCase() === 'administrator' || username.toLowerCase() === 'administrators'
}

function NavIcon({ type }) {
  const icons = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    box: (
      <>
        <path d="M4 8.2 12 4l8 4.2v7.6L12 20l-8-4.2Z" />
        <path d="M4.5 8.5 12 12.4l7.5-3.9" />
        <path d="M12 12.4V20" />
      </>
    ),
    products: (
      <>
        <path d="M5 7h14" />
        <path d="M5 12h14" />
        <path d="M5 17h14" />
      </>
    ),
    users: (
      <>
        <path d="M16 20v-1.8c0-1.8-1.6-3.2-3.6-3.2H7.6C5.6 15 4 16.4 4 18.2V20" />
        <circle cx="10" cy="8" r="4" />
        <path d="M20 20v-1.6c0-1.5-1.1-2.8-2.7-3.2" />
        <path d="M15.5 4.4a3.5 3.5 0 0 1 0 6.8" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        <path d="M12 14v2" />
      </>
    ),
  }

  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      {icons[type]}
    </svg>
  )
}
