import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { errorMessage, getUser, levelLabel } from '../auth'

const TakeQuiz = () => {
  const { id } = useParams()
  const user = getUser()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    axios.get(`/api/quizzes/${id}`, { params: { studentId: user?.id } })
      .then(res => setQuiz(res.data))
      .catch(err => setError(errorMessage(err, 'تعذّر تحميل الاختبار')))
      .finally(() => setLoading(false))
  }, [id, user?.id])

  const setAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!quiz) return
    const unanswered = quiz.questions.find(q => {
      const answer = answers[q.id]
      if (q.type === 'MCQ') return answer === undefined || answer === null
      return !answer || !answer.trim()
    })
    if (unanswered) {
      setError('يرجى الإجابة على جميع الأسئلة قبل تسليم الاختبار')
      return
    }

    const payload = {
      studentId: user?.id,
      answers: quiz.questions.map(q => ({
        questionId: q.id,
        selectedOptionIndex: q.type === 'MCQ' ? answers[q.id] : null,
        answerText: q.type === 'WRITTEN' ? answers[q.id] : null,
      })),
    }

    try {
      setSubmitting(true)
      const res = await axios.post(`/api/quizzes/${id}/submit`, payload)
      navigate(`/submissions/${res.data.id}`)
    } catch (err) {
      setError(errorMessage(err, 'تعذّر تسليم الاختبار'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="alert alert-info">جارٍ تحميل الاختبار…</div>
  if (error && !quiz) return <div className="alert alert-error">{error}</div>
  if (!quiz) return null

  if (quiz.myStatus) {
    return (
      <div className="quiz-page">
        <div className="empty-state">
          <span className="empty-icon">✅</span>
          <h3>لقد قدّمت هذا الاختبار بالفعل</h3>
          <p>يمكنك مراجعة إجاباتك وحالة التصحيح من صفحة التفاصيل.</p>
          <div className="button-row">
            <Link to={`/submissions/${quiz.mySubmissionId}`} className="btn btn-primary">عرض التفاصيل</Link>
            <Link to="/quizzes" className="btn btn-ghost">العودة للاختبارات</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz-page">
      <div className="page-heading">
        <div>
          <span className="hero-eyebrow">اختبار</span>
          <h1>{quiz.title}</h1>
          <p>{quiz.description || 'أجب على جميع الأسئلة ثم اضغط تسليم الاختبار.'}</p>
          <div className="quiz-meta">
            <span className="badge badge-soft">{levelLabel(quiz.level)}</span>
            <span>📝 {quiz.questions.length} سؤال</span>
            <span>🎯 {quiz.totalPoints} درجة</span>
            {quiz.durationMinutes ? <span>⏱ {quiz.durationMinutes} دقيقة</span> : null}
          </div>
        </div>
        <Link to="/quizzes" className="btn btn-ghost">رجوع</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="stack">
        {quiz.questions.map((q, index) => (
          <section key={q.id} className="question-card">
            <div className="question-card-head">
              <span className="question-number">سؤال {index + 1}</span>
              <span className="badge badge-soft">{q.points} درجة</span>
            </div>
            <h3 className="question-text">{q.text}</h3>

            {q.type === 'MCQ' ? (
              <div className="options-list">
                {q.options.map((option, optionIndex) => (
                  <label key={optionIndex} className={`option-row ${answers[q.id] === optionIndex ? 'option-row-selected' : ''}`}>
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      checked={answers[q.id] === optionIndex}
                      onChange={() => setAnswer(q.id, optionIndex)}
                    />
                    <span className="option-letter">{['أ', 'ب', 'ج', 'د', 'هـ', 'و'][optionIndex] || optionIndex + 1}</span>
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                className="written-answer"
                rows={5}
                value={answers[q.id] || ''}
                onChange={e => setAnswer(q.id, e.target.value)}
                placeholder="اكتب إجابتك هنا…"
              />
            )}
          </section>
        ))}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
            {submitting ? 'جارٍ التسليم…' : 'تسليم الاختبار'}
          </button>
          <Link to="/quizzes" className="btn btn-ghost btn-lg">إلغاء</Link>
        </div>
      </form>
    </div>
  )
}

export default TakeQuiz
