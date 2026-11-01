import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getUser, logout } from '../auth'

const Navbar = () => {
  const [user, setUser] = useState(getUser())
  const navigate = useNavigate()

  useEffect(() => {
    const syncUser = () => setUser(getUser())
    window.addEventListener('user-updated', syncUser)
    return () => window.removeEventListener('user-updated', syncUser)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-logo">ر</span>
          <span className="brand-text">
            <strong>منصة مس رشا يحيى</strong>
            <small>التعليمية</small>
          </span>
        </Link>

        <nav className="nav-links">
          <Link to="/">الرئيسية</Link>
          {user && <Link to="/dashboard">لوحتي</Link>}
          {user && <Link to="/quizzes">الاختبارات</Link>}
          {user && <Link to="/videos">{user.role === 'ADMIN' ? 'إدارة الفيديوهات' : 'الفيديوهات'}</Link>}
          {user && user.role === 'ADMIN' && <Link to="/quizzes/create">إنشاء اختبار</Link>}
          {user && user.role === 'ADMIN' && <Link to="/schedule/admin">إدارة المجموعات</Link>}
          {user && user.role !== 'ADMIN' && <Link to="/results">نتائجي</Link>}
          {user && user.role !== 'ADMIN' && <Link to="/schedule">المجموعة الدراسية</Link>}
          {user && <Link to="/library">المكتبة</Link>}
          {user && <Link to="/settings">الإعدادات</Link>}
        </nav>

        <div className="nav-user">
          {user ? (
            <>
              <Link to="/settings" className="nav-profile">
                {user.avatarUrl ? (
                  <img className="nav-avatar-img" src={user.avatarUrl} alt="الصورة الشخصية" />
                ) : (
                  <span className="nav-avatar">{(user.name || user.username || '؟').charAt(0)}</span>
                )}
                <span className="nav-user-name">{user.name || user.username || user.phoneNumber}</span>
              </Link>
              <span className={`role-pill ${user.role === 'ADMIN' ? 'role-admin' : ''}`}>
                {user.role === 'ADMIN' ? 'مدير' : 'طالب'}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>خروج</button>
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
