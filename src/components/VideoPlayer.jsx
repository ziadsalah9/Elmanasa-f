import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { errorMessage, formatDate, getUser, isAdmin } from '../auth'

const countAll = list => list.reduce((total, item) => total + 1 + (item.replies?.length || 0), 0)

const formatTime = (value) => {
  if (!Number.isFinite(value) || value < 0) return '0:00'
  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2]

const VideoPlayer = () => {
  const { id } = useParams()
  const user = getUser()
  const admin = isAdmin(user)
  const navigate = useNavigate()
  const recordedFor = useRef(null)
  const videoRef = useRef(null)

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [video, setVideo] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [liking, setLiking] = useState(false)
  const [notice, setNotice] = useState('')

  const loadComments = () => axios
    .get(`/api/videos/${id}/comments`, { params: admin ? { admin: true } : { userId: user?.id } })
    .then(res => setComments(res.data || []))
    .catch(err => setError(errorMessage(err, 'تعذّر تحميل التعليقات')))

  const refreshVideo = () => axios
    .get(`/api/videos/${id}`, { params: admin ? { admin: true } : { userId: user?.id } })
    .then(res => setVideo(res.data))
    .catch(() => {})

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    axios.get(`/api/videos/${id}`, { params: admin ? { admin: true } : { userId: user?.id } })
      .then(res => {
        if (cancelled) return
        setVideo(res.data)
        if (!admin && recordedFor.current !== id) {
          recordedFor.current = id
          axios.post(`/api/videos/${id}/view`, null, { params: { userId: user?.id } })
            .then(viewRes => { if (!cancelled) setVideo(viewRes.data) })
            .catch(() => {})
        }
        loadComments()
      })
      .catch(err => setError(errorMessage(err, 'تعذّر تحميل الفيديو')))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id, admin, user?.id])

  const toggleLike = async () => {
    if (liking) return
    setLiking(true)
    try {
      const res = await axios.post(`/api/videos/${id}/like`, { userId: user?.id })
      setVideo(res.data)
    } catch (err) {
      setNotice(errorMessage(err, 'تعذّر تسجيل الإعجاب'))
    } finally {
      setLiking(false)
    }
  }

  const submitComment = async (event) => {
    event.preventDefault()
    if (!newComment.trim() || sending) return
    setSending(true)
    setNotice('')
    try {
      await axios.post(`/api/videos/${id}/comments`, { userId: user?.id, text: newComment.trim() })
      setNewComment('')
      await loadComments()
      refreshVideo()
    } catch (err) {
      setNotice(errorMessage(err, 'تعذّر إضافة التعليق'))
    } finally {
      setSending(false)
    }
  }

  const submitReply = async (parentId) => {
    if (!replyText.trim() || sending) return
    setSending(true)
    setNotice('')
    try {
      await axios.post(`/api/videos/${id}/comments`, { userId: user?.id, text: replyText.trim(), parentId })
      setReplyText('')
      setReplyTo(null)
      await loadComments()
      refreshVideo()
    } catch (err) {
      setNotice(errorMessage(err, 'تعذّر إضافة الرد'))
    } finally {
      setSending(false)
    }
  }

  const deleteComment = async (commentId) => {
    if (!window.confirm('هل تريد حذف هذا التعليق؟')) return
    try {
      await axios.delete(`/api/videos/${id}/comments/${commentId}`, { params: { userId: user?.id } })
      await loadComments()
      refreshVideo()
    } catch (err) {
      setNotice(errorMessage(err, 'تعذّر حذف التعليق'))
    }
  }

  const deleteVideo = async () => {
    if (!window.confirm('هل تريد حذف هذا الفيديو وكل تعليقاته؟')) return
    try {
      await axios.delete(`/api/videos/${id}`, { params: { adminId: user?.id } })
      navigate('/videos')
    } catch (err) {
      setNotice(errorMessage(err, 'تعذّر حذف الفيديو'))
    }
  }

  const togglePlay = () => {
    const player = videoRef.current
    if (!player) return
    if (player.paused) {
      player.play().catch(() => {})
    } else {
      player.pause()
    }
  }

  const stopVideo = () => {
    const player = videoRef.current
    if (!player) return
    player.pause()
    player.currentTime = 0
    setCurrentTime(0)
  }

  const skipBy = (seconds) => {
    const player = videoRef.current
    if (!player) return
    const limit = Number.isFinite(player.duration) ? player.duration : player.currentTime + seconds
    const next = Math.min(Math.max(0, player.currentTime + seconds), limit)
    player.currentTime = next
    setCurrentTime(next)
  }

  const changeSpeed = (rate) => {
    setSpeed(rate)
    if (videoRef.current) videoRef.current.playbackRate = rate
  }

  const toggleFullscreen = () => {
    const player = videoRef.current
    if (!player) return
    if (document.fullscreenElement) {
      document.exitFullscreen?.()
    } else {
      player.requestFullscreen?.().catch(() => {})
    }
  }

  useEffect(() => {
    setPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setSpeed(1)
  }, [id])

  if (loading) return <div className="alert alert-info">جارٍ تحميل الفيديو…</div>
  if (error || !video) {
    return (
      <div className="quiz-page">
        <div className="alert alert-error">{error || 'الفيديو غير موجود'}</div>
        <Link to="/videos" className="btn btn-ghost">رجوع إلى الفيديوهات</Link>
      </div>
    )
  }

  return (
    <div className="quiz-page video-page">
      <div className="video-breadcrumb">
        <Link to="/videos">← الفيديوهات التعليمية</Link>
      </div>

      <div className="video-watch-layout">
        <div className="video-main">
          <div className="video-player-panel">
            {video.videoType === 'DIRECT' && video.embedUrl ? (
              <>
                <video
                  ref={videoRef}
                  className="video-player"
                  controls
                  preload="metadata"
                  playsInline
                  src={video.embedUrl}
                  poster={video.thumbnailUrl || undefined}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  onEnded={() => setPlaying(false)}
                  onTimeUpdate={event => setCurrentTime(event.currentTarget.currentTime)}
                  onLoadedMetadata={event => {
                    setDuration(event.currentTarget.duration || 0)
                    event.currentTarget.playbackRate = speed
                  }}
                  onRateChange={event => setSpeed(event.currentTarget.playbackRate)}
                />
                <div className="video-controls">
                  <button type="button" className="video-control-btn video-control-primary" onClick={togglePlay}>
                    {playing ? '⏸ إيقاف مؤقت' : '▶ تشغيل'}
                  </button>
                  <button type="button" className="video-control-btn" onClick={stopVideo}>
                    ⏹ إيقاف
                  </button>
                  <button type="button" className="video-control-btn" onClick={() => skipBy(-10)}>
                    ⏪ 10 ثوانٍ
                  </button>
                  <button type="button" className="video-control-btn" onClick={() => skipBy(10)}>
                    10 ثوانٍ ⏩
                  </button>
                  <span className="video-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
                  <label className="video-speed">
                    سرعة التشغيل
                    <select value={speed} onChange={event => changeSpeed(Number(event.target.value))}>
                      {PLAYBACK_RATES.map(rate => (
                        <option key={rate} value={rate}>{rate}x</option>
                      ))}
                    </select>
                  </label>
                  <button type="button" className="video-control-btn" onClick={toggleFullscreen}>
                    ⛶ ملء الشاشة
                  </button>
                </div>
              </>
            ) : video.embedUrl ? (
              <div className="video-frame">
                <iframe
                  src={video.embedUrl}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="video-external">
                <span className="video-thumb-icon">▶</span>
                <p>هذا الفيديو مستضاف على رابط خارجي.</p>
                <a className="btn btn-primary" href={video.videoUrl} target="_blank" rel="noreferrer">فتح الفيديو</a>
              </div>
            )}
          </div>

          <div className="panel video-info">
            <div className="video-info-top">
              <div>
                <h1>{video.title}</h1>
                <div className="video-badges">
                  <span className="badge badge-soft">{video.gradeLabel}</span>
                  {video.groupName && <span className="badge badge-muted">👥 {video.groupName}</span>}
                  {admin && (
                    <span className={video.published ? 'badge badge-success' : 'badge badge-muted'}>
                      {video.published ? 'منشور' : 'مسودة'}
                    </span>
                  )}
                </div>
              </div>
              {admin && (
                <div className="video-admin-actions">
                  <Link to={`/videos/${video.id}/edit`} className="btn btn-ghost btn-sm">تعديل</Link>
                  <button className="btn btn-danger btn-sm" onClick={deleteVideo}>حذف</button>
                </div>
              )}
            </div>

            {video.description && <p className="video-description">{video.description}</p>}

            <div className="video-engagement">
              <span>👁 {video.viewsCount} مشاهدة</span>
              {admin ? (
                <span>❤️ {video.likesCount}</span>
              ) : (
                <button className={`like-btn ${video.likedByMe ? 'liked' : ''}`} onClick={toggleLike} disabled={liking}>
                  {video.likedByMe ? '❤️' : '🤍'} {video.likesCount}
                </button>
              )}
              <span>💬 {video.commentCount} تعليق</span>
              <span className="video-author">{video.authorName ? `أضيف بواسطة ${video.authorName}` : ''}</span>
            </div>
          </div>
        </div>

        <aside className="video-side panel">
          <h2 className="panel-title">عن الفيديو</h2>
          <div className="video-side-row"><span>الصف</span><strong>{video.gradeLabel}</strong></div>
          <div className="video-side-row"><span>المجموعة</span><strong>{video.groupName || 'جميع المجموعات'}</strong></div>
          <div className="video-side-row"><span>عدد المشاهدات</span><strong>{video.viewsCount}</strong></div>
          <div className="video-side-row"><span>الإعجابات</span><strong>{video.likesCount}</strong></div>
          <div className="video-side-row"><span>التعليقات</span><strong>{video.commentCount}</strong></div>
          <div className="video-side-row"><span>تاريخ الإضافة</span><strong>{formatDate(video.createdAt)}</strong></div>
        </aside>
      </div>

      <section className="panel comments-panel">
        <div className="comments-head">
          <h2 className="panel-title">الأسئلة والتعليقات ({countAll(comments)})</h2>
        </div>

        {notice && <div className="alert alert-error">{notice}</div>}

        <form className="comment-form" onSubmit={submitComment}>
          <textarea
            rows={2}
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder={admin ? 'أضف ملاحظة أو توضيحاً للطلاب…' : 'اكتب سؤالك عن الدرس هنا…'}
          />
          <button type="submit" className="btn btn-primary" disabled={sending || !newComment.trim()}>
            {sending ? 'جارٍ الإرسال…' : 'إرسال'}
          </button>
        </form>

        {comments.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">💬</span>
            <h3>لا توجد أسئلة بعد</h3>
            <p>كن أول من يسأل عن هذا الدرس.</p>
          </div>
        ) : (
          <div className="comment-list">
            {comments.map(comment => (
              <article key={comment.id} className="comment-item">
                <div className="comment-head">
                  <span className="comment-avatar">{comment.userName?.charAt(0) || '؟'}</span>
                  <div>
                    <div className="comment-author">
                      {comment.userName}
                      {comment.userRole === 'ADMIN' && <span className="role-pill role-admin">معلم</span>}
                    </div>
                    <div className="comment-date">{formatDate(comment.createdAt)}</div>
                  </div>
                  <div className="comment-actions">
                    {admin && <button className="btn btn-ghost btn-sm" onClick={() => { setReplyTo(comment.id); setReplyText('') }}>رد</button>}
                    {comment.canDelete && <button className="btn btn-ghost btn-sm" onClick={() => deleteComment(comment.id)}>حذف</button>}
                  </div>
                </div>
                <p className="comment-text">{comment.text}</p>

                {replyTo === comment.id && (
                  <div className="reply-form">
                    <textarea rows={2} value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="اكتب رد المعلم…" />
                    <div className="button-row">
                      <button className="btn btn-primary btn-sm" disabled={sending || !replyText.trim()} onClick={() => submitReply(comment.id)}>إرسال الرد</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setReplyTo(null)}>إلغاء</button>
                    </div>
                  </div>
                )}

                {comment.replies?.length > 0 && (
                  <div className="comment-replies">
                    {comment.replies.map(reply => (
                      <article key={reply.id} className="comment-item comment-reply">
                        <div className="comment-head">
                          <span className="comment-avatar">{reply.userName?.charAt(0) || '؟'}</span>
                          <div>
                            <div className="comment-author">
                              {reply.userName}
                              {reply.userRole === 'ADMIN' && <span className="role-pill role-admin">معلم</span>}
                            </div>
                            <div className="comment-date">{formatDate(reply.createdAt)}</div>
                          </div>
                          {reply.canDelete && <button className="btn btn-ghost btn-sm" onClick={() => deleteComment(reply.id)}>حذف</button>}
                        </div>
                        <p className="comment-text">{reply.text}</p>
                      </article>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default VideoPlayer
