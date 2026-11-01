import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { errorMessage, getUser, LEVELS } from '../auth'
import {
  ALLOWED_LIBRARY_EXTENSIONS,
  LIBRARY_CATEGORIES,
  MAX_LIBRARY_FILE_SIZE,
  fileIcon,
  formatFileSize,
} from '../library'

const LibraryUpload = () => {
  const user = getUser()
  const navigate = useNavigate()
  const redirectTimer = useRef(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    gradeLevel: '',
    category: 'BOOK',
  })
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => () => {
    if (redirectTimer.current) clearTimeout(redirectTimer.current)
  }, [])

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const validateAndSetFile = (selected) => {
    setError('')
    setSuccess('')
    if (!selected) return
    const extension = selected.name.split('.').pop()?.toLowerCase() || ''
    if (!ALLOWED_LIBRARY_EXTENSIONS.includes(extension)) {
      setError('صيغة الملف غير مدعومة. المسموح: PDF, PPT, PPTX, DOC, DOCX')
      return
    }
    if (selected.size > MAX_LIBRARY_FILE_SIZE) {
      setError('حجم الملف يتجاوز الحد الأقصى 100 ميجابايت')
      return
    }
    setFile(selected)
    if (!form.title.trim()) {
      set('title', selected.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '))
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    validateAndSetFile(event.dataTransfer.files?.[0])
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!form.title.trim()) return setError('عنوان الملف مطلوب')
    if (!form.category) return setError('نوع الملف مطلوب')
    if (!file) return setError('يرجى اختيار ملف PDF أو عرض تقديمي للرفع')

    const data = new FormData()
    data.append('file', file)
    data.append('adminId', user?.id)
    data.append('title', form.title.trim())
    data.append('description', form.description.trim())
    data.append('category', form.category)
    if (form.gradeLevel !== '') data.append('gradeLevel', form.gradeLevel)

    setUploading(true)
    setProgress(0)
    try {
      await axios.post('/api/library/upload', data, {
        onUploadProgress: (event) => {
          if (event.total) {
            setProgress(Math.min(100, Math.round((event.loaded * 100) / event.total)))
          }
        },
      })
      setProgress(100)
      setSuccess('تم رفع الملف وإضافته إلى المكتبة بنجاح')
      redirectTimer.current = setTimeout(() => navigate('/library'), 1000)
    } catch (err) {
      setError(errorMessage(err, 'تعذّر رفع الملف'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="quiz-page">
      <div className="page-heading">
        <div>
          <span className="hero-eyebrow">المكتبة الرقمية</span>
          <h1>رفع كتاب أو مذكرة</h1>
          <p>ارفع ملفات PDF أو العروض التقديمية وصنّفها حسب الصف والنوع.</p>
        </div>
        <Link to="/library" className="btn btn-ghost">العودة للمكتبة</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form className="panel library-upload-form" onSubmit={submit}>
        <div
          className={`upload-dropzone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
          onDragOver={event => { event.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <span className="upload-drop-icon">{file ? fileIcon(file.name.split('.').pop()) : '📤'}</span>
          {file ? (
            <>
              <strong>{file.name}</strong>
              <span>{formatFileSize(file.size)}</span>
              <div className="upload-file-actions">
                <label className="btn btn-ghost btn-sm">
                  تغيير الملف
                  <input
                    type="file"
                    accept=".pdf,.ppt,.pptx,.pps,.ppsx,.doc,.docx"
                    onChange={event => validateAndSetFile(event.target.files?.[0])}
                    hidden
                  />
                </label>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => setFile(null)}>
                  إزالة
                </button>
              </div>
            </>
          ) : (
            <>
              <strong>اسحب الملف هنا أو اختره من جهازك</strong>
              <span>PDF أو PowerPoint أو Word — بحد أقصى 100 ميجابايت</span>
              <label className="btn btn-primary btn-sm">
                اختيار ملف
                <input
                  type="file"
                  accept=".pdf,.ppt,.pptx,.pps,.ppsx,.doc,.docx"
                  onChange={event => validateAndSetFile(event.target.files?.[0])}
                  hidden
                />
              </label>
            </>
          )}
        </div>

        {uploading && (
          <div className="upload-progress-wrap">
            <div className="upload-progress">
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className="upload-progress-label">{progress}% — جارٍ رفع الملف…</div>
          </div>
        )}

        <div className="form-grid">
          <div className="field">
            <label>عنوان الملف</label>
            <input
              value={form.title}
              onChange={event => set('title', event.target.value)}
              placeholder="مثال: مراجعة الوحدة الأولى — الجبر"
            />
          </div>

          <div className="field">
            <label>الصف الدراسي</label>
            <select value={form.gradeLevel} onChange={event => set('gradeLevel', event.target.value)}>
              <option value="">جميع الصفوف</option>
              {LEVELS.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label>وصف الملف</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={event => set('description', event.target.value)}
            placeholder="اكتب نبذة قصيرة عن محتوى الملف…"
          />
        </div>

        <div className="field">
          <label>نوع الملف / التصنيف</label>
          <div className="category-options">
            {LIBRARY_CATEGORIES.map(category => (
              <label key={category.value} className={`category-option ${form.category === category.value ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="category"
                  value={category.value}
                  checked={form.category === category.value}
                  onChange={event => set('category', event.target.value)}
                />
                <strong>{category.label}</strong>
                <small>
                  {category.value === 'BOOK' && 'كتب المنهج والقراءة'}
                  {category.value === 'NOTES' && 'ملخصات ومذكرات الشرح'}
                  {category.value === 'PRESENTATION' && 'عروض PowerPoint'}
                  {category.value === 'EXAM_REVISION' && 'مراجعات ونماذج امتحانات'}
                </small>
              </label>
            ))}
          </div>
        </div>

        <div className="button-row">
          <button type="submit" className="btn btn-primary" disabled={uploading || !file}>
            {uploading ? 'جارٍ الرفع…' : 'رفع وإضافة للمكتبة'}
          </button>
          <Link to="/library" className="btn btn-ghost">إلغاء</Link>
        </div>
      </form>
    </div>
  )
}

export default LibraryUpload
