import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { errorMessage, formatDate, getUser, isAdmin } from '../auth'

function posterFor(video) {
  if (video.thumbnailUrl) return video.thumbnailUrl
  if (video.videoType === 'YOUTUBE' && video.embedUrl) {
    const id = video.embedUrl.split('/embed/')[1]
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
  }
  return null
}

const VideoList = () => {
  const user = getUser()
  const admin = isAdmin(user)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = () => {
    setLoading(true)
    const params = admin ? { admin: true } : { studentId: user?.id }
    axios.get('/api/videos', { params })
      .then(res => setVideos(res.data || []))
      .catch(err => setError(errorMessage(err, 'تعذّر تحميل الفيديوهات')))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [admin, user?.id])

  const handleDelete = async (id) => {
    if (!window.confirm('هل تريد حذف هذا الفيديو وكل تعليقاته؟')) return
    try {
      await axios.delete(`/api/videos/${id}`, { params: { adminId: user?.id } })
      setMessage('تم حذف الفيديو بنجاح')
      load()
    } catch (err) {
      setMessage(errorMessage(err, 'تعذّر حذف الفيديو'))
    }
  }

  return (
    <div className="quiz-page">
      <div className="page-heading">
        <div>
          <span className="hero-eyebrow">الفيديوهات التعليمية</span>
          <h1>{admin ? 'إدارة الفيديوهات' : 'شرح الدروس بالفيديو'}</h1>
          <p>
            {admin
              ? 'ارفع أو أضف روابط شرح، وحدّد الصف الدراسي والمجموعة، وتابع تفاعل الطلاب.'
              : 'شاهد فيديوهات الشرح المتاحة لمستواك، وتفاعل بالأسئلة والإعجاب.'}
          </p>
        </div>
        {admin && <Link to="/videos/create" className="btn btn-primary">+ إضافة فيديو</Link>}
      </div>

      {message && <div className="alert alert-info">{message}</div>}
      {loading && <div className="alert alert-info">جارٍ تحميل الفيديوهات…</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && videos.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">🎬</span>
          <h3>لا توجد فيديوهات بعد</h3>
          <p>{admin ? 'أضف أول فيديو شرح لطلابك.' : 'ستظهر فيديوهات الشرح هنا بمجرد إضافتها.'}</p>
          {admin && <Link to="/videos/create" className="btn btn-primary">إضافة فيديو</Link>}
        </div>
      )}

      <div className="video-grid">
        {videos.map(video => {
          const poster = posterFor(video)
          return (
            <article key={video.id} className="video-card">
              <Link to={`/videos/${video.id}`} className="video-thumb" style={poster ? { backgroundImage: `url(${poster})` } : undefined}>
                {!poster && <span className="video-thumb-icon">▶</span>}
                <span className="video-type-chip">{video.videoType}</span>
              </Link>

              <div className="video-card-body">
                <div className="video-card-top">
                  <span className="badge badge-soft">{video.gradeLabel}</span>
                  {video.groupName && <span className="badge badge-muted">👥 {video.groupName}</span>}
                  {admin && (
                    <span className={video.published ? 'badge badge-success' : 'badge badge-muted'}>
                      {video.published ? 'منشور' : 'مسودة'}
                    </span>
                  )}
                </div>

                <h3>{video.title}</h3>
                {video.description && <p className="quiz-desc">{video.description}</p>}

                <div className="quiz-meta">
                  <span>👁 {video.viewsCount}</span>
                  <span>❤️ {video.likesCount}</span>
                  <span>💬 {video.commentCount}</span>
                </div>
                <div className="video-card-date">{formatDate(video.createdAt)}</div>

                <div className="video-card-actions">
                  <Link to={`/videos/${video.id}`} className="btn btn-primary btn-block">
                    {admin ? 'معاينة وإدارة' : 'شاهد الفيديو'}
                  </Link>
                  {admin && (
                    <div className="video-admin-actions">
                      <Link to={`/videos/${video.id}/edit`} className="btn btn-ghost btn-sm">تعديل</Link>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(video.id)}>حذف</button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default VideoList
