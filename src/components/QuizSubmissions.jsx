import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import { errorMessage, formatDate, statusClass, statusLabel } from '../auth'

const QuizSubmissions = () => {
  const { id } = useParams()
  const [quiz, setQuiz] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      axios.get(`/api/quizzes/${id}`, { params: { admin: true } }),
      axios.get(`/api/quizzes/${id}/submissions`),
    ])
      .then(([quizRes, submissionsRes]) => {
        setQuiz(quizRes.data)
        setSubmissions(submissionsRes.data || [])
      })
      .catch(err => setError(errorMessage(err, 'تعذّر تحميل التسليمات')))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="quiz-page">
      <div className="page-heading">
        <div>
          <span className="hero-eyebrow">تصحيح</span>
          <h1>{quiz ? quiz.title : 'تسليمات الاختبار'}</h1>
          <p>راجع إجابات الطلاب وامنح الدرجات، ثم يعتمد النظام النتيجة للطالب.</p>
        </div>
        <Link to="/quizzes" className="btn btn-ghost">رجوع للاختبارات</Link>
      </div>

      {loading && <div className="alert alert-info">جارٍ تحميل التسليمات…</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && submissions.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <h3>لا توجد تسليمات بعد</h3>
          <p>سيظهر هنا كل طالب يسلّم هذا الاختبار.</p>
        </div>
      )}

      {submissions.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>الطالب</th>
                <th>رقم الهاتف</th>
                <th>تاريخ التسليم</th>
                <th>الحالة</th>
                <th>الدرجة</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(submission => (
                <tr key={submission.id}>
                  <td>{submission.studentName}</td>
                  <td dir="ltr">{submission.phoneNumber}</td>
                  <td>{formatDate(submission.submittedAt)}</td>
                  <td><span className={statusClass(submission.status)}>{statusLabel(submission.status)}</span></td>
                  <td>
                    {submission.status === 'GRADED'
                      ? `${submission.totalScore} / ${submission.maxScore}`
                      : '—'}
                  </td>
                  <td>
                    <Link to={`/submissions/${submission.id}`} className="btn btn-primary btn-sm">
                      {submission.status === 'GRADED' ? 'مراجعة' : 'تصحيح'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default QuizSubmissions
