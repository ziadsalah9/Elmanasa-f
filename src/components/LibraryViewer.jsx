import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import { errorMessage, formatDate, getUser, isAdmin } from '../auth'
import { categoryLabel, fileIcon, fileTypeLabel, formatFileSize } from '../library'

const LibraryViewer = () => {
  const { id } = useParams()
  const user = getUser()
  const admin = isAdmin(user)

  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    const params = admin ? { admin: true } : { studentId: user?.id }
    axios.get(`/api/library/${id}`, { params })
      .then(res => {
        if (!cancelled) setDocument(res.data)
      })
      .catch(err => {
        if (!cancelled) setError(errorMessage(err, 'تعذّر تحميل الملف'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [id, admin, user?.id])

  if (loading) return <div className="alert alert-info">جارٍ تجهيز الملف…</div>

  if (error || !document) {
    return (
      <div className="quiz-page">
        <div className="alert alert-error">{error || 'الملف غير موجود'}</div>
        <Link to="/library" className="btn btn-ghost">العودة إلى المكتبة</Link>
      </div>
    )
  }

  const isPdf = document.fileType === 'PDF'

  return (
    <div className="quiz-page library-viewer-page">
      <div className="video-breadcrumb">
        <Link to="/library">← العودة إلى المكتبة</Link>
      </div>

      <div className="panel library-viewer-head">
        <div className="library-viewer-title">
          <span className={`library-file-icon file-${(document.fileType || '').toLowerCase()}`}>
            <span>{fileIcon(document.fileType)}</span>
            <strong>{document.fileType || 'FILE'}</strong>
          </span>
          <div>
            <div className="video-badges">
              <span className="badge badge-soft">{document.categoryLabel || categoryLabel(document.category)}</span>
              <span className="badge badge-muted">{document.gradeLabel}</span>
              <span className="badge badge-muted">{fileTypeLabel(document.fileType)}</span>
            </div>
            <h1>{document.title}</h1>
            <p className="library-viewer-meta">
              {document.uploadedByName} • {formatDate(document.uploadedAt)} • {formatFileSize(document.fileSize)}
            </p>
          </div>
        </div>

        <div className="library-viewer-actions">
          <a
            href={document.fileUrl}
            className="btn btn-primary btn-sm"
            target="_blank"
            rel="noreferrer"
          >
            فتح في نافذة جديدة
          </a>
          <a
            href={document.fileUrl}
            className="btn btn-ghost btn-sm"
            download={document.originalFileName || document.title}
          >
            تحميل الملف
          </a>
        </div>
      </div>

      {document.description && (
        <div className="panel library-viewer-description">
          <h2 className="panel-title">عن الملف</h2>
          <p>{document.description}</p>
        </div>
      )}

      {isPdf ? (
        <div className="panel library-pdf-panel">
          <iframe
            className="library-pdf-frame"
            src={`${document.fileUrl}#view=FitH`}
            title={document.title}
          />
          <p className="library-viewer-hint">
            إذا لم يظهر الملف داخل الصفحة، استخدم زر «فتح في نافذة جديدة» أو «تحميل الملف».
          </p>
        </div>
      ) : (
        <div className="panel library-download-panel">
          <span className="library-download-icon">{fileIcon(document.fileType)}</span>
          <h2>هذا الملف غير قابل للعرض داخل المتصفح</h2>
          <p>
            ملفات {fileTypeLabel(document.fileType)} تُحمَّل وتُفتح باستخدام PowerPoint أو Word.
          </p>
          <a
            href={document.fileUrl}
            className="btn btn-primary"
            download={document.originalFileName || document.title}
          >
            تحميل الملف
          </a>
        </div>
      )}
    </div>
  )
}

export default LibraryViewer
