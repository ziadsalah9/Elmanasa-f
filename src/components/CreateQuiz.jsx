import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { errorMessage, getUser, LEVELS } from '../auth'

const makeQuestion = (type = 'MCQ') => ({
  key: `${Date.now()}-${Math.random()}`,
  text: '',
  type,
  points: 1,
  options: type === 'MCQ' ? ['', '', '', ''] : [],
  correctOptionIndex: 0,
  expectedAnswer: '',
})

const CreateQuiz = () => {
  const user = getUser()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [published, setPublished] = useState(true)
  const [questions, setQuestions] = useState([makeQuestion('MCQ')])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const updateQuestion = (key, field, value) => {
    setQuestions(items => items.map(q => q.key === key ? { ...q, [field]: value } : q))
  }

  const updateOption = (key, index, value) => {
    setQuestions(items => items.map(q => {
      if (q.key !== key) return q
      const options = [...q.options]
      options[index] = value
      return { ...q, options }
    }))
  }

  const changeType = (key, type) => {
    setQuestions(items => items.map(q => {
      if (q.key !== key) return q
      if (type === 'MCQ') {
        return { ...q, type, options: q.options.length ? q.options : ['', '', '', ''], correctOptionIndex: 0 }
      }
      return { ...q, type, options: [], correctOptionIndex: null }
    }))
  }

  const addQuestion = (type) => setQuestions(items => [...items, makeQuestion(type)])
  const removeQuestion = (key) => setQuestions(items => items.filter(q => q.key !== key))

  const buildPayload = () => {
    if (!title.trim()) throw new Error('عنوان الاختبار مطلوب')
    if (questions.length === 0) throw new Error('أضف سؤالاً واحداً على الأقل')

    const payloadQuestions = questions.map((q, index) => {
      if (!q.text.trim()) throw new Error(`نص السؤال رقم ${index + 1} مطلوب`)
      const points = Number(q.points)
      if (!points || points <= 0) throw new Error(`درجة السؤال رقم ${index + 1} غير صحيحة`)

      if (q.type === 'MCQ') {
        const filled = q.options.map(o => o.trim()).filter(Boolean)
        const correctText = (q.options[q.correctOptionIndex] || '').trim()
        const correctOptionIndex = filled.indexOf(correctText)
        if (filled.length < 2) throw new Error(`السؤال رقم ${index + 1} يحتاج إلى خيارين على الأقل`)
        if (correctOptionIndex < 0) throw new Error(`اختر الإجابة الصحيحة للسؤال رقم ${index + 1}`)
        return { text: q.text.trim(), type: 'MCQ', points, options: filled, correctOptionIndex }
      }

      return {
        text: q.text.trim(),
        type: 'WRITTEN',
        points,
        options: [],
        expectedAnswer: q.expectedAnswer.trim(),
      }
    })

    return {
      title: title.trim(),
      description: description.trim(),
      level: level ? Number(level) : null,
      durationMinutes: durationMinutes ? Number(durationMinutes) : null,
      published,
      adminId: user?.id,
      questions: payloadQuestions,
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = buildPayload()
      setSaving(true)
      await axios.post('/api/quizzes', payload)
      navigate('/quizzes')
    } catch (err) {
      setError(err?.response ? errorMessage(err, 'تعذّر إنشاء الاختبار') : err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="quiz-page">
      <div className="page-heading">
        <div>
          <span className="hero-eyebrow">لوحة المعلم</span>
          <h1>إنشاء اختبار جديد</h1>
          <p>أضف بيانات الاختبار ثم أسئلة اختيار من متعدد أو أسئلة مقالية.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="stack">
        <section className="panel">
          <h2 className="panel-title">بيانات الاختبار</h2>
          <div className="form-grid">
            <div className="field field-wide">
              <label>عنوان الاختبار *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: اختبار الرياضيات - الوحدة الأولى" />
            </div>
            <div className="field field-wide">
              <label>وصف الاختبار</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="وصف مختصر للاختبار وتعليماته" />
            </div>
            <div className="field">
              <label>المستوى الدراسي</label>
              <select value={level} onChange={e => setLevel(e.target.value)}>
                <option value="">جميع المستويات</option>
                {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>المدة (بالدقائق)</label>
              <input type="number" min="1" value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)} placeholder="اختياري" />
            </div>
            <div className="field checkbox-field">
              <label>
                <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} />
                نشر الاختبار للطلاب مباشرة
              </label>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2 className="panel-title">الأسئلة ({questions.length})</h2>
            <div className="button-row">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => addQuestion('MCQ')}>+ اختيار من متعدد</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => addQuestion('WRITTEN')}>+ سؤال مقالي</button>
            </div>
          </div>

          <div className="stack">
            {questions.map((q, index) => (
              <div key={q.key} className="question-editor">
                <div className="question-editor-head">
                  <span className="question-number">سؤال {index + 1}</span>
                  <div className="question-editor-tools">
                    <select value={q.type} onChange={e => changeType(q.key, e.target.value)}>
                      <option value="MCQ">اختيار من متعدد</option>
                      <option value="WRITTEN">سؤال مقالي</option>
                    </select>
                    <input
                      className="points-input"
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={q.points}
                      onChange={e => updateQuestion(q.key, 'points', e.target.value)}
                      title="درجة السؤال"
                    />
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeQuestion(q.key)}
                      disabled={questions.length === 1}
                    >
                      حذف
                    </button>
                  </div>
                </div>

                <div className="field">
                  <label>نص السؤال *</label>
                  <textarea
                    value={q.text}
                    onChange={e => updateQuestion(q.key, 'text', e.target.value)}
                    rows={2}
                    placeholder="اكتب نص السؤال هنا"
                  />
                </div>

                {q.type === 'MCQ' ? (
                  <div className="options-editor">
                    <label>الخيارات (اختر الإجابة الصحيحة الافتراضية)</label>
                    {q.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="option-edit-row">
                        <input
                          type="radio"
                          name={`correct-${q.key}`}
                          checked={q.correctOptionIndex === optionIndex}
                          onChange={() => updateQuestion(q.key, 'correctOptionIndex', optionIndex)}
                        />
                        <input
                          value={option}
                          onChange={e => updateOption(q.key, optionIndex, e.target.value)}
                          placeholder={`الخيار ${optionIndex + 1}`}
                        />
                      </div>
                    ))}
                    <small className="hint">اختر زر الاختيار بجانب الإجابة الصحيحة الافتراضية، واترك الخيارات غير المستخدمة فارغة.</small>
                  </div>
                ) : (
                  <div className="field">
                    <label>الإجابة النموذجية الافتراضية (تُستخدم في التصحيح وتظهر للطالب بعد اعتماده)</label>
                    <textarea
                      value={q.expectedAnswer}
                      onChange={e => updateQuestion(q.key, 'expectedAnswer', e.target.value)}
                      rows={2}
                      placeholder="اكتب الإجابة النموذجية للسؤال المقالي"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? 'جارٍ الحفظ…' : 'حفظ الاختبار'}
          </button>
          <button type="button" className="btn btn-ghost btn-lg" onClick={() => navigate('/quizzes')}>إلغاء</button>
        </div>
      </form>
    </div>
  )
}

export default CreateQuiz
