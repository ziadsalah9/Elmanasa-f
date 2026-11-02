import React, { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  applyTheme,
  getInitialTheme,
  getUser,
  logout,
  updateStoredUser,
} from '../auth'

const icons = {
  Chevron: () => (
    <svg className="chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  Sun: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  ),
  Moon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </svg>
  ),
  Menu: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  ),
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="9" rx="2" />
      <rect x="14" y="3" width="7" height="5" rx="2" />
      <rect x="14" y="12" width="7" height="9" rx="2" />
      <rect x="3" y="16" width="7" height="5" rx="2" />
    </svg>
  ),
  Video: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="5" width="14" height="14" rx="3" />
      <path d="m22 8-6 4 6 4V8Z" />
    </svg>
  ),
  Create: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
      <rect x="2" y="2" width="20" height="20" rx="5" />
    </svg>
  ),
  Calendar: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="17" rx="3" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  Results: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  ),
  Users: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" />
    </svg>
  ),
  More: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  ),
}

const ADMIN_LINKS = [
  { to: '/videos', label: 'إدارة الفيديوهات', desc: 'رفع وتنظيم فيديوهات الشرح', icon: icons.Video },
  { to: '/quizzes/create', label: 'إنشاء اختبار', desc: 'بناء اختبار جديد للطلاب', icon: icons.Create },
  { to: '/schedule/admin', label: 'إدارة المجموعات', desc: 'المواعيد والمجموعات الدراسية', icon: icons.Users },
]

const STUDENT_LINKS = [
  { to: '/videos', label: 'الفيديوهات', desc: 'فيديوهات الشرح الخاصة بك', icon: icons.Video },
  { to: '/results', label: 'نتائجي', desc: 'درجاتك في الاختبارات', icon: icons.Results },
  { to: '/schedule', label: 'المجموعة الدراسية', desc: 'مواعيد حصص مجموعتك', icon: icons.Calendar },
]

const NavDropdown = ({ id, title, caption, icon: TitleIcon, links, open, onToggle, onClose }) => (
  <div className={`nav-dropdown${open ? ' open' : ''}`}>
    <button
      type="button"
      className="nav-dropdown-toggle"
      onClick={onToggle}
      aria-expanded={open}
      aria-haspopup="menu"
      aria-controls={id}
    >
      <TitleIcon />
      <span>{title}</span>
      <icons.Chevron />
    </button>
    <div className="nav-dropdown-menu" id={id} role="menu">
      <div className="nav-dropdown-head">
        <strong>{caption}</strong>
      </div>
      {links.map(link => {
        const ItemIcon = link.icon
        return (
          <NavLink
            key={link.to}
            to={link.to}
            role="menuitem"
            onClick={onClose}
            className={({ isActive }) => `nav-dropdown-item${isActive ? ' active' : ''}`}
          >
            <span className="dd-icon" aria-hidden="true"><ItemIcon /></span>
            <span className="dd-text">
              <span>{link.label}</span>
              <small>{link.desc}</small>
            </span>
          </NavLink>
        )
      })}
    </div>
  </div>
)

const Navbar = () => {
  const [user, setUser] = useState(getUser())
  const [theme, setTheme] = useState(getInitialTheme())
  const [menuOpen, setMenuOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [studentOpen, setStudentOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const navRef = useRef(null)

  useEffect(() => {
    const syncUser = () => {
      const next = getUser()
      setUser(next)
      setTheme(getInitialTheme(next))
    }
    window.addEventListener('user-updated', syncUser)
    return () => window.removeEventListener('user-updated', syncUser)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setAdminOpen(false)
    setStudentOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setAdminOpen(false)
        setStudentOpen(false)
        setMenuOpen(false)
      }
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setAdminOpen(false)
        setStudentOpen(false)
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const closeAll = () => {
    setMenuOpen(false)
    setAdminOpen(false)
    setStudentOpen(false)
  }

  const handleLogout = () => {
    closeAll()
    logout()
    navigate('/login')
  }

  const toggleMenu = () => {
    setMenuOpen(value => {
      if (value) {
        setAdminOpen(false)
        setStudentOpen(false)
      }
      return !value
    })
  }

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setAdminOpen(false)
    setStudentOpen(false)
    setTheme(next)
    applyTheme(next)
    if (user) updateStoredUser({ theme: next })
  }

  const isAdmin = user?.role === 'ADMIN'
  const displayName = user?.name || user?.username || user?.phoneNumber || 'مستخدم'
  const avatarLetter = (displayName || '؟').charAt(0)
  const ThemeIcon = theme === 'dark' ? icons.Sun : icons.Moon
  const themeLabel = theme === 'dark' ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'

  const primaryLinks = [
    { to: '/', label: 'الرئيسية', end: true },
    ...(user ? [
      { to: '/dashboard', label: 'لوحتي' },
      { to: '/quizzes', label: 'الاختبارات' },
      { to: '/library', label: 'المكتبة' },
    ] : []),
  ]

  const dropdown = user
    ? (isAdmin
      ? { id: 'nav-admin-menu', title: 'أدوات الإدارة', caption: 'لوحة التحكم', icon: icons.Dashboard, links: ADMIN_LINKS, open: adminOpen, onToggle: () => { setStudentOpen(false); setAdminOpen(value => !value) } }
      : { id: 'nav-student-menu', title: 'المزيد', caption: 'روابط إضافية', icon: icons.More, links: STUDENT_LINKS, open: studentOpen, onToggle: () => { setAdminOpen(false); setStudentOpen(value => !value) } })
    : null

  return (
    <header className="navbar">
      <div className="navbar-inner" ref={navRef}>
        <Link to="/" className="brand" onClick={closeAll}>
          <span className="brand-logo">ر</span>
          <span className="brand-text">
            <strong>منصة مس رشا يحيى</strong>
            <small>التعليمية</small>
          </span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          onClick={toggleMenu}
          aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          aria-expanded={menuOpen}
          aria-controls="nav-main"
        >
          {menuOpen ? <icons.Close /> : <icons.Menu />}
        </button>

        <nav id="nav-main" className={`nav-links${menuOpen ? ' nav-open' : ''}`} aria-label="التنقل الرئيسي">
          <div className="nav-links-main">
            {primaryLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={closeAll}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}

            {dropdown && (
              <NavDropdown
                id={dropdown.id}
                title={dropdown.title}
                caption={dropdown.caption}
                icon={dropdown.icon}
                links={dropdown.links}
                open={dropdown.open}
                onToggle={dropdown.onToggle}
                onClose={closeAll}
              />
            )}
          </div>

          <div className="nav-mobile-actions">
            {user ? (
              <>
                <div className="nav-mobile-profile">
                  <span className="nav-avatar-wrap">
                    {user.avatarUrl ? (
                      <img className="nav-avatar-img" src={user.avatarUrl} alt="الصورة الشخصية" />
                    ) : (
                      <span className="nav-avatar">{avatarLetter}</span>
                    )}
                    <span className="nav-presence" title="متصل الآن" />
                  </span>
                  <span className="nav-user-info">
                    <span className="nav-user-name">{displayName}</span>
                    <span className={`role-pill${isAdmin ? ' role-admin' : ''}`}>
                      {isAdmin ? 'مدير' : 'طالب'}
                    </span>
                  </span>
                </div>
                <Link to="/settings" className="nav-mobile-link" onClick={closeAll}>
                  <icons.Settings />
                  الإعدادات
                </Link>
                <button type="button" className="nav-mobile-link" onClick={toggleTheme}>
                  <ThemeIcon />
                  {theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
                </button>
                <button type="button" className="nav-mobile-link nav-mobile-danger" onClick={handleLogout}>
                  <icons.Logout />
                  تسجيل الخروج
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-mobile-link" onClick={closeAll}>دخول</Link>
                <Link to="/register" className="btn btn-primary btn-block" onClick={closeAll}>تسجيل جديد</Link>
              </>
            )}
          </div>
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <button
                type="button"
                className="nav-icon-btn"
                onClick={toggleTheme}
                title={themeLabel}
                aria-label={themeLabel}
              >
                <ThemeIcon />
              </button>
              <Link to="/settings" className="nav-icon-btn" title="الإعدادات" aria-label="الإعدادات">
                <icons.Settings />
              </Link>
              <Link to="/settings" className="nav-profile" title="الملف الشخصي">
                <span className="nav-avatar-wrap">
                  {user.avatarUrl ? (
                    <img className="nav-avatar-img" src={user.avatarUrl} alt="الصورة الشخصية" />
                  ) : (
                    <span className="nav-avatar">{avatarLetter}</span>
                  )}
                  <span className="nav-presence" title="متصل الآن" />
                </span>
                <span className="nav-user-info">
                  <span className="nav-user-name">{displayName}</span>
                  <span className={`role-pill${isAdmin ? ' role-admin' : ''}`}>
                    {isAdmin ? 'مدير' : 'طالب'}
                  </span>
                </span>
              </Link>
              <button type="button" className="btn btn-ghost btn-sm nav-logout" onClick={handleLogout}>
                <icons.Logout />
                خروج
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">دخول</Link>
              <Link to="/register" className="btn btn-primary btn-sm">تسجيل جديد</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
