import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { errorMessage, getUser, isAdmin, levelLabel, statusClass, statusLabel } from '../auth'

const QuizList = () => {
  const user = getUser()
  const admin = isAdmin(user)
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const params = admin ? { admin: true } : { studentId: user?.id }
    axios.get('/api/quizzes', { params })
      .then(res => setQuizzes(res.data || []))
      .catch(err => setError(errorMessage(err, 'تعذّر تحميل الاختبارات')))
      .finally(() => setLoading(false))
  }, [admin, user?.id])

  return (
    <div className="quiz-page">
      <div className="page-heading">
        <div>
          <span className="hero-eyebrow">الاختبارات</span>
          <h1>{admin ? 'إدارة الاختبارات' : 'الاختبارات المتاحة'}</h1>
          <p>
            {admin
              ? 'تابع الاختبارات التي أنشأتها وافتح تسليمات الطلاب لتصحيحها.'
              : 'اختر اختباراً وابدأ الحل. تظهر النتيجة بعد اعتماد تصحيح المعلم.'}
          </p>
        </div>
        {admin && <Link to="/quizzes/create" className="btn btn-primary">+ إنشاء اختبار</Link>}
      </div>

      {loading && <div className="alert alert-info">جارٍ تحميل الاختبارات…</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && quizzes.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <h3>لا توجد اختبارات بعد</h3>
          <p>{admin ? 'ابدأ بإنشاء أول اختبار لطلابك.' : 'ستظهر الاختبارات هنا بمجرد إضافتها من المعلم.'}</p>
          {admin && <Link to="/quizzes/create" className="btn btn-primary">إنشاء اختبار</Link>}
        </div>
      )}

      <div className="quiz-grid">
        {quizzes.map(quiz => (
          <article key={quiz.id} className="quiz-card">
            <div className="quiz-card-top">
              <span className={quiz.published ? 'badge badge-success' : 'badge badge-muted'}>
                {quiz.published ? 'منشور' : 'مسودة'}
              </span>
              <span className="badge badge-soft">{levelLabel(quiz.level)}</span>
            </div>

            <h3>{quiz.title}</h3>
            {quiz.description && <p className="quiz-desc">{quiz.description}</p>}

            <div className="quiz-meta">
              <span>📝 {quiz.questionCount} سؤال</span>
              <span>🎯 {quiz.totalPoints} درجة</span>
              {quiz.durationMinutes ? <span>⏱ {quiz.durationMinutes} دقيقة</span> : null}
            </div>

            {admin ? (
              <>
                <div className="quiz-meta quiz-meta-bottom">
                  <span>👥 {quiz.submissionCount} تسليم</span>
                </div>
                <div className="quiz-actions">
                  <Link to={`/quizzes/${quiz.id}/submissions`} className="btn btn-primary btn-block">
                    عرض التسليمات والتصحيح
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="quiz-status-row">
                  <span className={statusClass(quiz.myStatus)}>{statusLabel(quiz.myStatus)}</span>
                  {quiz.myStatus === 'GRADED' && (
                    <strong className="quiz-score">{quiz.myScore} / {quiz.myMaxScore}</strong>
                  )}
                </div>
                <div className="quiz-actions">
                  {quiz.myStatus ? (
                    <Link to={`/submissions/${quiz.mySubmissionId}`} className="btn btn-ghost btn-block">
                      عرض التفاصيل
                    </Link>
                  ) : (
                    <Link to={`/quizzes/${quiz.id}/take`} className="btn btn-primary btn-block">
                      ابدأ الاختبار
                    </Link>
                  )}
                </div>
              </>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}

export default QuizList
