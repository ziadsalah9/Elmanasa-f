import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { errorMessage, formatDate, getUser, statusClass, statusLabel } from '../auth'

const MyResults = () => {
  const user = getUser()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get('/api/quizzes/my-results', { params: { studentId: user?.id } })
      .then(res => setResults(res.data || []))
      .catch(err => setError(errorMessage(err, 'تعذّر تحميل النتائج')))
      .finally(() => setLoading(false))
  }, [user?.id])

  return (
    <div className="quiz-page">
      <div className="page-heading">
        <div>
          <span className="hero-eyebrow">نتائجي</span>
          <h1>نتائج الاختبارات</h1>
          <p>تابع حالة كل اختبار قدّمته، وافتح النتيجة بعد اعتماد المعلم.</p>
        </div>
        <Link to="/quizzes" className="btn btn-primary">اختبارات جديدة</Link>
      </div>

      {loading && <div className="alert alert-info">جارٍ تحميل النتائج…</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && results.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">🏆</span>
          <h3>لا توجد نتائج بعد</h3>
          <p>ابدأ بحل اختبار لتظهر نتيجتك هنا بعد التصحيح.</p>
          <Link to="/quizzes" className="btn btn-primary">استعرض الاختبارات</Link>
        </div>
      )}

      <div className="result-list">
        {results.map(result => (
          <article key={result.id} className="result-card">
            <div className="result-main">
              <h3>{result.quizTitle}</h3>
              <div className="quiz-meta">
                <span>🕒 {formatDate(result.submittedAt)}</span>
                {result.gradedAt && <span>✅ {formatDate(result.gradedAt)}</span>}
              </div>
            </div>
            <div className="result-side">
              <span className={statusClass(result.status)}>{statusLabel(result.status)}</span>
              {result.status === 'GRADED' ? (
                <div className="result-score">
                  <strong>{result.totalScore}</strong>
                  <span>من {result.maxScore}</span>
                </div>
              ) : (
                <span className="result-pending">قيد التصحيح</span>
              )}
              <Link to={`/submissions/${result.id}`} className="btn btn-ghost btn-sm">عرض التفاصيل</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default MyResults
