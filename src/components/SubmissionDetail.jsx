import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import { errorMessage, formatDate, getUser, isAdmin, statusClass, statusLabel } from '../auth'

const SubmissionDetail = () => {
  const { id } = useParams()
  const user = getUser()
  const admin = isAdmin(user)
  const [submission, setSubmission] = useState(null)
  const [grades, setGrades] = useState({})
  const [adminFeedback, setAdminFeedback] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const applySubmission = (data) => {
    setSubmission(data)
    setAdminFeedback(data.adminFeedback || '')
    const nextGrades = {}
    ;(data.answers || []).forEach(answer => {
      nextGrades[answer.id] = {
        awardedPoints: answer.awardedPoints ?? (answer.type === 'WRITTEN' ? 0 : answer.points),
        feedback: answer.feedback || '',
        correctOptionIndex: answer.correctOptionIndex ?? (answer.type === 'MCQ' ? 0 : null),
        expectedAnswer: answer.expectedAnswer || '',
      }
    })
    setGrades(nextGrades)
  }

  useEffect(() => {
    const params = admin ? { admin: true } : { studentId: user?.id }
    axios.get(`/api/quizzes/submissions/${id}`, { params })
      .then(res => applySubmission(res.data))
      .catch(err => setError(errorMessage(err, 'تعذّر تحميل التسليم')))
      .finally(() => setLoading(false))
  }, [id, admin, user?.id])

  const updateGrade = (answerId, field, value) => {
    setGrades(prev => ({
      ...prev,
      [answerId]: { ...prev[answerId], [field]: value },
    }))
  }

  const updateCorrectOption = (answer, index) => {
    setGrades(prev => ({
      ...prev,
      [answer.id]: {
        ...prev[answer.id],
        correctOptionIndex: index,
        awardedPoints: answer.selectedOptionIndex === index ? answer.points : 0,
      },
    }))
  }

  const handleSave = async () => {
    setError('')
    setMessage('')
    try {
      setSaving(true)
      const payload = {
        adminId: user?.id,
        adminFeedback,
        grades: submission.answers.map(answer => ({
          answerId: answer.id,
          awardedPoints: Number(grades[answer.id]?.awardedPoints ?? 0),
          feedback: grades[answer.id]?.feedback || '',
          correctOptionIndex: answer.type === 'MCQ'
            ? Number(grades[answer.id]?.correctOptionIndex ?? 0)
            : null,
          expectedAnswer: answer.type === 'WRITTEN'
            ? (grades[answer.id]?.expectedAnswer || '')
            : null,
        })),
      }
      const res = await axios.post(`/api/quizzes/submissions/${id}/grade`, payload)
      applySubmission(res.data)
      setMessage('تم حفظ التصحيح وإرسال النتيجة للطالب بنجاح.')
    } catch (err) {
      setError(errorMessage(err, 'تعذّر حفظ التصحيح'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="alert alert-info">جارٍ تحميل التسليم…</div>
  if (error && !submission) return <div className="alert alert-error">{error}</div>
  if (!submission) return null

  const reveal = admin || submission.status === 'GRADED'

  return (
    <div className="quiz-page">
      <div className="page-heading">
        <div>
          <span className="hero-eyebrow">{admin ? 'تصحيح التسليم' : 'تفاصيل النتيجة'}</span>
          <h1>{submission.quizTitle}</h1>
          <div className="quiz-meta">
            <span>👤 {submission.studentName}</span>
            <span dir="ltr">📱 {submission.phoneNumber}</span>
            <span>🕒 {formatDate(submission.submittedAt)}</span>
            <span className={statusClass(submission.status)}>{statusLabel(submission.status)}</span>
          </div>
        </div>
        <Link to={admin ? `/quizzes/${submission.quizId}/submissions` : '/results'} className="btn btn-ghost">
          رجوع
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {reveal ? (
        <div className="score-banner">
          <div>
            <span>الدرجة</span>
            <strong>{submission.totalScore} / {submission.maxScore}</strong>
          </div>
          <div>
            <span>النسبة</span>
            <strong>
              {submission.maxScore > 0
                ? Math.round((submission.totalScore / submission.maxScore) * 100)
                : 0}%
            </strong>
          </div>
          <div>
            <span>تاريخ التصحيح</span>
            <strong>{formatDate(submission.gradedAt)}</strong>
          </div>
        </div>
      ) : (
        <div className="alert alert-info">
          تم استلام إجاباتك. ستظهر الدرجة والإجابات الصحيحة بعد أن يعتمد المعلم التصحيح.
        </div>
      )}

      <div className="stack">
        {submission.answers.map((answer, index) => {
          const selected = answer.selectedOptionIndex
          const correct = answer.correctOptionIndex

          return (
            <section key={answer.id} className="question-card">
              <div className="question-card-head">
                <span className="question-number">سؤال {index + 1}</span>
                <div className="button-row">
                  <span className="badge badge-soft">{answer.type === 'MCQ' ? 'اختيار من متعدد' : 'مقالي'}</span>
                  <span className="badge badge-soft">{answer.points} درجة</span>
                </div>
              </div>
              <h3 className="question-text">{answer.questionText}</h3>

              {answer.type === 'MCQ' ? (
                <div className="options-list">
                  {answer.options.map((option, optionIndex) => {
                    const isSelected = selected === optionIndex
                    const isCorrect = reveal && correct === optionIndex
                    const isWrong = reveal && isSelected && correct !== null && correct !== optionIndex
                    const classes = [
                      'option-row',
                      isSelected ? 'option-selected' : '',
                      isCorrect ? 'option-correct' : '',
                      isWrong ? 'option-wrong' : '',
                    ].filter(Boolean).join(' ')

                    return (
                      <div key={optionIndex} className={classes}>
                        <span className="option-letter">{['أ', 'ب', 'ج', 'د', 'هـ', 'و'][optionIndex] || optionIndex + 1}</span>
                        <span>{option}</span>
                        <span className="option-tags">
                          {isSelected && <span className="tag tag-selected">إجابتك</span>}
                          {isCorrect && <span className="tag tag-correct">الإجابة الصحيحة</span>}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="written-block">
                  <label>إجابة الطالب</label>
                  <div className="answer-box">{answer.answerText || 'لم يجب الطالب'}</div>
                  {reveal && answer.expectedAnswer && (
                    <>
                      <label>الإجابة النموذجية</label>
                      <div className="answer-box answer-box-muted">{answer.expectedAnswer}</div>
                    </>
                  )}
                </div>
              )}

              {admin && answer.type === 'MCQ' && (
                <div className="correct-key-editor">
                  <div className="field">
                    <label>الإجابة الصحيحة المعتمدة</label>
                    <select
                      value={grades[answer.id]?.correctOptionIndex ?? ''}
                      onChange={e => updateCorrectOption(answer, Number(e.target.value))}
                    >
                      {answer.options.map((option, optionIndex) => (
                        <option key={optionIndex} value={optionIndex}>
                          {['أ', 'ب', 'ج', 'د', 'هـ', 'و'][optionIndex] || optionIndex + 1} - {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <small className="hint">تغيير الإجابة الصحيحة يعيد احتساب درجات هذا السؤال لجميع الطلاب.</small>
                </div>
              )}

              {admin && answer.type === 'WRITTEN' && (
                <div className="correct-key-editor">
                  <div className="field">
                    <label>تحديث الإجابة النموذجية</label>
                    <textarea
                      rows={2}
                      value={grades[answer.id]?.expectedAnswer || ''}
                      onChange={e => updateGrade(answer.id, 'expectedAnswer', e.target.value)}
                      placeholder="الإجابة النموذجية التي ستظهر للطالب بعد التصحيح"
                    />
                  </div>
                </div>
              )}

              {admin ? (
                <div className="grading-row">
                  <div className="field field-small">
                    <label>الدرجة الممنوحة (من {answer.points})</label>
                    <input
                      type="number"
                      min="0"
                      max={answer.points}
                      step="0.5"
                      value={grades[answer.id]?.awardedPoints ?? 0}
                      onChange={e => updateGrade(answer.id, 'awardedPoints', e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>ملاحظة على الإجابة</label>
                    <textarea
                      rows={2}
                      value={grades[answer.id]?.feedback || ''}
                      onChange={e => updateGrade(answer.id, 'feedback', e.target.value)}
                      placeholder="ملاحظة اختيارية تظهر للطالب"
                    />
                  </div>
                </div>
              ) : (
                reveal && (
                  <div className="answer-result">
                    <span className={answer.correct ? 'badge badge-success' : 'badge badge-danger'}>
                      {answer.correct ? 'إجابة صحيحة' : 'إجابة غير مكتملة'}
                    </span>
                    <span>الدرجة: {answer.awardedPoints ?? 0} / {answer.points}</span>
                    {answer.feedback && <p className="feedback-text">{answer.feedback}</p>}
                  </div>
                )
              )}
            </section>
          )
        })}
      </div>

      <section className="panel">
        <h2 className="panel-title">{admin ? 'ملاحظات عامة للطالب' : 'ملاحظات المعلم'}</h2>
        {admin ? (
          <textarea
            rows={3}
            value={adminFeedback}
            onChange={e => setAdminFeedback(e.target.value)}
            placeholder="اكتب ملاحظة عامة عن أداء الطالب في الاختبار"
          />
        ) : submission.adminFeedback ? (
          <p className="feedback-text">{submission.adminFeedback}</p>
        ) : (
          <p className="feedback-text">لا توجد ملاحظات عامة.</p>
        )}
      </section>

      {admin && (
        <div className="form-actions">
          <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
            {saving ? 'جارٍ الحفظ…' : submission.status === 'GRADED' ? 'تحديث النتيجة' : 'اعتماد التصحيح وإرسال النتيجة'}
          </button>
        </div>
      )}
    </div>
  )
}

export default SubmissionDetail
