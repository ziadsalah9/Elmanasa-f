import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { errorMessage, getUser, LEVELS } from '../auth'

const EMPTY = {
  title: '',
  description: '',
  videoUrl: '',
  videoType: '',
  gradeLevel: '',
  scheduleGroupId: '',
  thumbnailUrl: '',
  published: true,
}

const ALLOWED_VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov', 'm4v', 'ogg', 'ogv']
const MAX_VIDEO_FILE_SIZE = 500 * 1024 * 1024

const formatSize = (bytes) => {
  if (!bytes) return '0 ميجابايت'
  return `${(bytes / (1024 * 1024)).toFixed(1)} ميجابايت`
}

const isLocalUpload = (url) => Boolean(url && url.startsWith('/uploads/videos/'))

const VideoForm = () => {
  const { id } = useParams()
  const editing = Boolean(id)
  const user = getUser()
  const navigate = useNavigate()
  const redirectTimer = useRef(null)

  const [form, setForm] = useState(EMPTY)
  const [groups, setGroups] = useState([])
  const [sourceMode, setSourceMode] = useState('file')
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(editing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  useEffect(() => () => {
    if (redirectTimer.current) clearTimeout(redirectTimer.current)
  }, [])

  useEffect(() => {
    axios.get('/api/schedules/groups')
      .then(res => setGroups(res.data || []))
      .catch(() => setGroups([]))
  }, [])

  useEffect(() => {
    if (!editing) return
    axios.get(`/api/videos/${id}`, { params: { admin: true } })
      .then(res => {
        const v = res.data
        setForm({
          title: v.title || '',
          description: v.description || '',
          videoUrl: v.videoUrl || '',
          videoType: v.videoType || '',
          gradeLevel: v.gradeLevel ?? '',
          scheduleGroupId: v.groupId ?? '',
          thumbnailUrl: v.thumbnailUrl || '',
          published: v.published !== false,
        })
        setSourceMode(isLocalUpload(v.videoUrl) ? 'file' : 'link')
      })
      .catch(err => setError(errorMessage(err, 'تعذّر تحميل الفيديو')))
      .finally(() => setLoading(false))
  }, [editing, id])

  const validateAndSetFile = (selected) => {
    setError('')
    setSuccess('')
    if (!selected) return
    const extension = selected.name.split('.').pop()?.toLowerCase() || ''
    if (!ALLOWED_VIDEO_EXTENSIONS.includes(extension)) {
      setError('صيغة الفيديو غير مدعومة. المسموح: MP4, WebM, MOV, M4V')
      return
    }
    if (selected.size > MAX_VIDEO_FILE_SIZE) {
      setError('حجم الفيديو يتجاوز الحد الأقصى 500 ميجابايت')
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

  const switchMode = (mode) => {
    setError('')
    setSuccess('')
    setSourceMode(mode)
    if (mode === 'link' && isLocalUpload(form.videoUrl)) {
      set('videoUrl', '')
    }
  }

  const buildPayload = () => ({
    adminId: user?.id,
    title: form.title.trim(),
    description: form.description.trim(),
    videoUrl: form.videoUrl.trim(),
    videoType: sourceMode === 'file' ? 'DIRECT' : form.videoType || null,
    gradeLevel: form.gradeLevel === '' ? null : Number(form.gradeLevel),
    scheduleGroupId: form.scheduleGroupId === '' ? null : Number(form.scheduleGroupId),
    thumbnailUrl: form.thumbnailUrl.trim(),
    published: form.published,
  })

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!form.title.trim()) return setError('عنوان الفيديو مطلوب')

    if (sourceMode === 'file' && !file && !(editing && isLocalUpload(form.videoUrl))) {
      return setError('يرجى اختيار ملف فيديو MP4 من جهازك')
    }
    if (sourceMode === 'link' && !form.videoUrl.trim()) {
      return setError('رابط الفيديو مطلوب')
    }

    setSaving(true)
    setProgress(0)
    try {
      if (sourceMode === 'file' && file) {
        const data = new FormData()
        data.append('file', file)
        data.append('adminId', user?.id)
        data.append('title', form.title.trim())
        data.append('description', form.description.trim())
        data.append('thumbnailUrl', form.thumbnailUrl.trim())
        data.append('published', String(form.published))
        if (form.gradeLevel !== '') data.append('gradeLevel', form.gradeLevel)
        if (form.scheduleGroupId !== '') data.append('scheduleGroupId', form.scheduleGroupId)

        const config = {
          onUploadProgress: (event) => {
            if (event.total) {
              setProgress(Math.min(100, Math.round((event.loaded * 100) / event.total)))
            }
          },
        }
        if (editing) {
          await axios.put(`/api/videos/${id}/upload`, data, config)
        } else {
          await axios.post('/api/videos/upload', data, config)
        }
        setProgress(100)
      } else {
        const payload = buildPayload()
        if (sourceMode === 'file') {
          payload.videoUrl = form.videoUrl.trim()
          payload.videoType = 'DIRECT'
        }
        if (editing) {
          await axios.put(`/api/videos/${id}`, payload)
        } else {
          await axios.post('/api/videos', payload)
        }
      }
      setSuccess(editing ? 'تم حفظ الفيديو بنجاح' : 'تم رفع الفيديو بنجاح')
      redirectTimer.current = setTimeout(() => navigate('/videos'), 900)
    } catch (err) {
      setError(errorMessage(err, 'تعذّر حفظ الفيديو'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="alert alert-info">جارٍ تحميل الفيديو…</div>

  return (
    <div className="quiz-page">
      <div className="page-heading">
        <div>
          <span className="hero-eyebrow">الفيديوهات التعليمية</span>
          <h1>{editing ? 'تعديل الفيديو' : 'إضافة فيديو شرح'}</h1>
          <p>ارفع ملف فيديو MP4 من جهازك مباشرةً، أو أضف رابط YouTube/Vimeo.</p>
        </div>
        <Link to="/videos" className="btn btn-ghost">رجوع</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form className="panel video-form" onSubmit={submit}>
        <div className="source-switch">
          <button
            type="button"
            className={sourceMode === 'file' ? 'active' : ''}
            onClick={() => switchMode('file')}
          >
            🎬 رفع ملف من الجهاز
          </button>
          <button
            type="button"
            className={sourceMode === 'link' ? 'active' : ''}
            onClick={() => switchMode('link')}
          >
            🔗 رابط YouTube / Vimeo
          </button>
        </div>

        <div className="field">
          <label>عنوان الفيديو</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="مثال: شرح الدرس الأول - الجبر" />
        </div>

        <div className="field">
          <label>وصف الفيديو</label>
          <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="نبذة قصيرة عن محتوى الدرس" />
        </div>

        {sourceMode === 'file' ? (
          <div className="field">
            <label>ملف الفيديو</label>
            <div
              className={`upload-dropzone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
              onDragOver={event => { event.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <span className="upload-drop-icon">{file ? '🎬' : '📤'}</span>
              {file ? (
                <>
                  <strong>{file.name}</strong>
                  <span>{formatSize(file.size)}</span>
                  <div className="upload-file-actions">
                    <label className="btn btn-ghost btn-sm">
                      تغيير الملف
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.m4v"
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
                  <strong>اسحب ملف MP4 هنا أو اختره من جهازك</strong>
                  <span>MP4 أو WebM — بحد أقصى 500 ميجابايت</span>
                  <label className="btn btn-primary btn-sm">
                    اختيار ملف الفيديو
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.m4v"
                      onChange={event => validateAndSetFile(event.target.files?.[0])}
                      hidden
                    />
                  </label>
                </>
              )}
            </div>

            {editing && isLocalUpload(form.videoUrl) && !file && (
              <div className="video-current-file">
                <span>الملف الحالي محفوظ على الخادم.</span>
                <a href={form.videoUrl} target="_blank" rel="noreferrer">معاينة الفيديو الحالي</a>
              </div>
            )}

            {saving && file && (
              <div className="upload-progress-wrap">
                <div className="upload-progress">
                  <span style={{ width: `${progress}%` }} />
                </div>
                <div className="upload-progress-label">{progress}% — جارٍ رفع الفيديو…</div>
              </div>
            )}
          </div>
        ) : (
          <div className="field">
            <label>رابط الفيديو</label>
            <input dir="ltr" value={form.videoUrl} onChange={e => set('videoUrl', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
            <small className="field-hint">يدعم روابط YouTube وVimeo وروابط ملفات MP4 المباشرة.</small>
          </div>
        )}

        <div className="form-grid">
          {sourceMode === 'link' && (
            <div className="field">
              <label>نوع الفيديو</label>
              <select value={form.videoType} onChange={e => set('videoType', e.target.value)}>
                <option value="">تلقائي حسب الرابط</option>
                <option value="YOUTUBE">YouTube</option>
                <option value="VIMEO">Vimeo</option>
                <option value="DIRECT">ملف فيديو مباشر</option>
                <option value="OTHER">رابط آخر</option>
              </select>
            </div>
          )}

          <div className="field">
            <label>الصف الدراسي</label>
            <select value={form.gradeLevel} onChange={e => set('gradeLevel', e.target.value)}>
              <option value="">جميع الصفوف</option>
              {LEVELS.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>المجموعة الدراسية</label>
            <select value={form.scheduleGroupId} onChange={e => set('scheduleGroupId', e.target.value)}>
              <option value="">جميع المجموعات</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name} - {group.time}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>صورة الغلاف (اختياري)</label>
            <input dir="ltr" value={form.thumbnailUrl} onChange={e => set('thumbnailUrl', e.target.value)} placeholder="https://..." />
          </div>
        </div>

        <label className="checkbox-field">
          <input type="checkbox" checked={form.published} onChange={e => set('published', e.target.checked)} />
          <span>نشر الفيديو للطلاب</span>
        </label>

        <div className="button-row">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? `جارٍ الحفظ${file ? ` (${progress}%)` : '…'}` : editing ? 'حفظ التعديلات' : 'رفع وإضافة الفيديو'}
          </button>
          <Link to="/videos" className="btn btn-ghost">إلغاء</Link>
        </div>
      </form>
    </div>
  )
}

export default VideoForm
