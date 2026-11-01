import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getUser, isAdmin, levelLabel, logout } from '../auth'

const Dashboard = () => {
  const user = getUser()
  const admin = isAdmin(user)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="dashboard">
      <section className="welcome-banner">
        <div>
          <span className="hero-eyebrow">{admin ? 'لوحة المعلم' : 'لوحة الطالب'}</span>
          <h1>مرحباً {user?.name || user?.username || 'بك'} 👋</h1>
          <p>
            {admin
              ? 'أنشئ الاختبارات، تابع تسليمات الطلاب، وصحّح الإجابات من لوحة واحدة.'
              : 'استعرض الاختبارات المتاحة، حل الأسئلة، وتابع نتائجك بعد التصحيح.'}
          </p>
        </div>
        <div className="welcome-meta">
          <div><span>الدور</span><strong>{admin ? 'مدير / معلم' : 'طالب'}</strong></div>
          <div><span>المستوى</span><strong>{levelLabel(user?.level)}</strong></div>
          <div><span>الهاتف</span><strong>{user?.phoneNumber}</strong></div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading section-heading-inline">
          <h2>اختصارات سريعة</h2>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>تسجيل الخروج</button>
        </div>

        <div className="action-grid">
          <Link to="/quizzes" className="action-card">
            <span className="feature-icon">📚</span>
            <div>
              <h3>{admin ? 'إدارة الاختبارات' : 'الاختبارات المتاحة'}</h3>
              <p>{admin ? 'استعرض الاختبارات وتسليمات الطلاب' : 'ابدأ اختباراً جديداً أو تابع تقدّمك'}</p>
            </div>
            <span className="action-arrow">←</span>
          </Link>

          {admin ? (
            <>
              <Link to="/quizzes/create" className="action-card">
                <span className="feature-icon">➕</span>
                <div>
                  <h3>إنشاء اختبار جديد</h3>
                  <p>أضف أسئلة اختيار من متعدد وأسئلة مقالية</p>
                </div>
                <span className="action-arrow">←</span>
              </Link>
              <Link to="/quizzes" className="action-card">
                <span className="feature-icon">✅</span>
                <div>
                  <h3>تصحيح التسليمات</h3>
                  <p>راجع إجابات الطلاب واعتمد النتائج</p>
                </div>
                <span className="action-arrow">←</span>
              </Link>
              <Link to="/schedule/admin" className="action-card">
                <span className="feature-icon">📅</span>
                <div>
                  <h3>إدارة المجموعات</h3>
                  <p>راجع طلبات تغيير المجموعات واعتمدها</p>
                </div>
                <span className="action-arrow">←</span>
              </Link>
              <Link to="/videos" className="action-card">
                <span className="feature-icon">🎬</span>
                <div>
                  <h3>إدارة الفيديوهات</h3>
                  <p>أضف فيديوهات الشرح وتابع مشاهدات وتفاعل الطلاب</p>
                </div>
                <span className="action-arrow">←</span>
              </Link>
              <Link to="/videos/create" className="action-card">
                <span className="feature-icon">📹</span>
                <div>
                  <h3>إضافة فيديو جديد</h3>
                  <p>ارفع رابط شرح وحدّد الصف والمجموعة</p>
                </div>
                <span className="action-arrow">←</span>
              </Link>
              <Link to="/library/upload" className="action-card">
                <span className="feature-icon">📚</span>
                <div>
                  <h3>رفع كتاب أو مذكرة</h3>
                  <p>أضف ملفات PDF والعروض التقديمية إلى المكتبة الرقمية</p>
                </div>
                <span className="action-arrow">←</span>
              </Link>
              <Link to="/settings" className="action-card">
                <span className="feature-icon">⚙️</span>
                <div>
                  <h3>الإعدادات</h3>
                  <p>حدّث بياناتك الشخصية وكلمة المرور والمظهر</p>
                </div>
                <span className="action-arrow">←</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/videos" className="action-card">
                <span className="feature-icon">🎬</span>
                <div>
                  <h3>فيديوهات الشرح</h3>
                  <p>شاهد دروسك المصوّرة واسأل المعلم عن أي نقطة</p>
                </div>
                <span className="action-arrow">←</span>
              </Link>
              <Link to="/library" className="action-card">
                <span className="feature-icon">📚</span>
                <div>
                  <h3>المكتبة الرقمية</h3>
                  <p>اقرأ كتب صفّك وحمّل المذكرات والعروض التقديمية</p>
                </div>
                <span className="action-arrow">←</span>
              </Link>
              <Link to="/results" className="action-card">
                <span className="feature-icon">🏆</span>
                <div>
                  <h3>نتائجي</h3>
                  <p>شاهد درجاتك وحالة تصحيح كل اختبار</p>
                </div>
                <span className="action-arrow">←</span>
              </Link>
              <Link to="/schedule" className="action-card">
                <span className="feature-icon">📅</span>
                <div>
                  <h3>المجموعة الدراسية</h3>
                  <p>استعرض مجموعتك واطلب تغييرات</p>
                </div>
                <span className="action-arrow">←</span>
              </Link>
              <Link to="/settings" className="action-card">
                <span className="feature-icon">⚙️</span>
                <div>
                  <h3>الإعدادات</h3>
                  <p>حدّث بياناتك الشخصية وكلمة المرور والمظهر</p>
                </div>
                <span className="action-arrow">←</span>
              </Link>
              <Link to="/" className="action-card">
                <span className="feature-icon">🏠</span>
                <div>
                  <h3>الصفحة الرئيسية</h3>
                  <p>تعرّف على مميزات المنصة</p>
                </div>
                <span className="action-arrow">←</span>
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default Dashboard
