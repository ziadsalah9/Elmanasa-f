import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { errorMessage, formatDate, getUser, isAdmin, LEVELS, levelLabel } from '../auth'
import {
  LIBRARY_CATEGORIES,
  categoryLabel,
  fileIcon,
  fileTypeLabel,
  formatFileSize,
} from '../library'

const Library = () => {
  const user = getUser()
  const admin = isAdmin(user)

  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [filters, setFilters] = useState({
    search: '',
    level: '',
    category: '',
    sort: 'newest',
  })

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(() => {
      setLoading(true)
      setError('')
      const params = admin ? { admin: true } : { studentId: user?.id }
      if (admin && filters.level) params.level = filters.level
      if (filters.category) params.category = filters.category
      if (filters.search.trim()) params.search = filters.search.trim()
      params.sort = filters.sort

      axios.get('/api/library', { params })
        .then(res => {
          if (!cancelled) setDocuments(res.data || [])
        })
        .catch(err => {
          if (!cancelled) setError(errorMessage(err, 'تعذّر تحميل المكتبة'))
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 250)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [filters, admin, user?.id, reloadKey])

  const removeDocument = async (doc) => {
    if (!window.confirm(`هل تريد حذف «${doc.title}» من المكتبة؟`)) return
    setError('')
    setMessage('')
    try {
      await axios.delete(`/api/library/${doc.id}`, { params: { adminId: user?.id } })
      setMessage('تم حذف الملف بنجاح')
      setReloadKey(key => key + 1)
    } catch (err) {
      setError(errorMessage(err, 'تعذّر حذف الملف'))
    }
  }

  return (
    <div className="quiz-page library-page">
      <div className="page-heading">
        <div>
          <span className="hero-eyebrow">المكتبة الرقمية</span>
          <h1>{admin ? 'إدارة الكتب والمذكرات' : 'مكتبة صفّك الدراسي'}</h1>
          <p>
            {admin
              ? 'ارفع الكتب والمذكرات والعروض التقديمية، وصنّفها حسب الصف والنوع.'
              : `تصفّح الكتب والمذكرات والمراجعات الخاصة بـ${levelLabel(user?.level)}.`}
          </p>
        </div>
        {admin && (
          <Link to="/library/upload" className="btn btn-primary">+ رفع ملف جديد</Link>
        )}
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <section className="panel library-toolbar">
        <div className="library-search">
          <span className="library-search-icon">🔍</span>
          <input
            type="search"
            value={filters.search}
            onChange={event => updateFilter('search', event.target.value)}
            placeholder="ابحث بالعنوان أو الوصف أو نوع الملف…"
          />
        </div>

        <div className="library-filters">
          {admin ? (
            <label className="filter-field">
              <span>الصف الدراسي</span>
              <select value={filters.level} onChange={event => updateFilter('level', event.target.value)}>
                <option value="">جميع الصفوف</option>
                {LEVELS.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </label>
          ) : (
            <div className="library-grade-lock">
              <span>الصف الدراسي</span>
              <strong>{levelLabel(user?.level)}</strong>
            </div>
          )}

          <label className="filter-field">
            <span>نوع الملف</span>
            <select value={filters.category} onChange={event => updateFilter('category', event.target.value)}>
              <option value="">كل الأنواع</option>
              {LIBRARY_CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>الترتيب</span>
            <select value={filters.sort} onChange={event => updateFilter('sort', event.target.value)}>
              <option value="newest">الأحدث أولاً</option>
              <option value="oldest">الأقدم أولاً</option>
              <option value="title">الاسم أبجدياً</option>
              <option value="grade">الصف الدراسي</option>
            </select>
          </label>
        </div>

        <div className="library-results">
          <span>{documents.length} ملف متاح</span>
          {(filters.search || filters.category || filters.level) && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setFilters({ search: '', level: '', category: '', sort: filters.sort })}
            >
              مسح الفلاتر
            </button>
          )}
        </div>
      </section>

      {loading && <div className="alert alert-info">جارٍ تحميل ملفات المكتبة…</div>}

      {!loading && !error && documents.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📚</span>
          <h3>لا توجد ملفات مطابقة</h3>
          <p>
            {admin
              ? 'ارفع أول كتاب أو مذكرة لطلابك، أو جرّب تغيير الفلاتر.'
              : 'ستظهر الكتب والمذكرات هنا بمجرد إضافتها من قِبل المعلم.'}
          </p>
          {admin && <Link to="/library/upload" className="btn btn-primary">رفع ملف جديد</Link>}
        </div>
      )}

      {!loading && documents.length > 0 && (
        <div className="library-grid">
          {documents.map(doc => (
            <article key={doc.id} className="library-card">
              <Link to={`/library/${doc.id}`} className={`library-file-icon file-${(doc.fileType || '').toLowerCase()}`}>
                <span>{fileIcon(doc.fileType)}</span>
                <strong>{doc.fileType || 'FILE'}</strong>
              </Link>

              <div className="library-card-body">
                <div className="library-card-top">
                  <span className="badge badge-soft">{doc.categoryLabel || categoryLabel(doc.category)}</span>
                  <span className="badge badge-muted">{doc.gradeLabel}</span>
                </div>

                <h3>
                  <Link to={`/library/${doc.id}`}>{doc.title}</Link>
                </h3>
                {doc.description && <p className="library-desc">{doc.description}</p>}

                <div className="library-meta">
                  <span>{fileTypeLabel(doc.fileType)}</span>
                  <span>{formatFileSize(doc.fileSize)}</span>
                  <span>{formatDate(doc.uploadedAt)}</span>
                </div>
                <div className="library-uploader">أضيف بواسطة {doc.uploadedByName}</div>

                <div className="library-actions">
                  <Link to={`/library/${doc.id}`} className="btn btn-primary btn-sm">
                    {doc.fileType === 'PDF' ? 'قراءة الآن' : 'عرض الملف'}
                  </Link>
                  <a
                    href={doc.fileUrl}
                    className="btn btn-ghost btn-sm"
                    download={doc.originalFileName || doc.title}
                    target="_blank"
                    rel="noreferrer"
                  >
                    تحميل
                  </a>
                  {admin && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeDocument(doc)}>
                      حذف
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default Library
