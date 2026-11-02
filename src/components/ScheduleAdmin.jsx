import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { getUser, errorMessage } from '../auth'

const icons = {
  Plus: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="17" rx="3" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  Clock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  Group: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" />
    </svg>
  ),
  Inbox: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  ),
}

const ScheduleAdmin = () => {
  const user = getUser()
  const [groups, setGroups] = useState([])
  const [requests, setRequests] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [newGroup, setNewGroup] = useState({ name: '', days: '', time: '' })
  const [adminNote, setAdminNote] = useState('')
  const [message, setMessage] = useState('')
  const [view, setView] = useState('pending') // pending / all / groups

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = () => {
    axios.get('/api/schedules/groups')
      .then(res => setGroups(res.data || []))
      .catch(err => setMessage(errorMessage(err, 'فشل تحميل المجموعات')))
    axios.get('/api/schedules/requests', { params: { adminId: user?.id } })
      .then(res => setRequests(res.data || []))
    axios.get('/api/schedules/requests/pending', { params: { adminId: user?.id } })
      .then(res => setPendingRequests(res.data || []))
  }

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim() || !newGroup.days.trim() || !newGroup.time.trim()) return
    try {
      await axios.post('/api/schedules/groups', {
        adminId: user?.id,
        name: newGroup.name.trim(),
        days: newGroup.days.trim(),
        time: newGroup.time.trim(),
        description: '',
        active: true,
      })
      setNewGroup({ name: '', days: '', time: '' })
      setMessage('تم إنشاء المجموعة بنجاح')
      loadAll()
    } catch (err) {
      setMessage(err.response?.data || 'خطأ في إنشاء المجموعة')
    }
  }

  const handleApprove = async (id) => {
    try {
      await axios.post(`/api/schedules/requests/${id}/approve`, { adminId: user?.id, adminNote })
      setMessage('تمت الموافقة بنجاح')
      setAdminNote('')
      loadAll()
    } catch (err) {
      setMessage(err.response?.data || 'خطأ في الموافقة')
    }
  }

  const handleReject = async (id) => {
    try {
      await axios.post(`/api/schedules/requests/${id}/reject`, { adminId: user?.id, adminNote })
      setMessage('تم الرفض بنجاح')
      setAdminNote('')
      loadAll()
    } catch (err) {
      setMessage(err.response?.data || 'خطأ في الرفض')
    }
  }

  const tabs = [
    { key: 'pending', label: 'طلبات قيد الانتظار', count: pendingRequests.length },
    { key: 'all', label: 'كل الطلبات', count: requests.length },
    { key: 'groups', label: 'المجموعات', count: groups.length },
  ]

  return (
    <div className="quiz-page schedule-admin-page">
      <div className="page-heading schedule-heading">
        <div>
          <span className="hero-eyebrow">إدارة</span>
          <h1>إدارة المجموعات الدراسية</h1>
          <p>إدارة الجداول الدراسية وطلبات تغيير المجموعات.</p>
        </div>
        <div className="schedule-summary">
          <div>
            <strong>{groups.length}</strong>
            <span>مجموعة</span>
          </div>
          <div>
            <strong>{pendingRequests.length}</strong>
            <span>طلب معلّق</span>
          </div>
        </div>
      </div>

      <div className="schedule-tabs" role="tablist" aria-label="أقسام إدارة المجموعات">
        {tabs.map(tab => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={view === tab.key}
            className={`schedule-tab${view === tab.key ? ' active' : ''}`}
            onClick={() => setView(tab.key)}
          >
            {tab.label}
            {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
          </button>
        ))}
      </div>

      <div className="schedule-stack">
        {view === 'groups' && (
          <>
            <section className="panel schedule-form-panel">
              <div className="panel-head">
                <div className="schedule-panel-heading">
                  <span className="schedule-panel-icon"><icons.Plus /></span>
                  <div>
                    <h2 className="panel-title">إضافة مجموعة جديدة</h2>
                    <p>أدخل بيانات المجموعة بالأيام والوقت المناسبين.</p>
                  </div>
                </div>
                <span className="badge badge-soft">مجموعات دراسية</span>
              </div>

              <div className="schedule-form-grid">
                <div className="field schedule-field">
                  <label htmlFor="group-name">اسم المجموعة</label>
                  <input
                    id="group-name"
                    type="text"
                    value={newGroup.name}
                    onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                    placeholder="مثال: المجموعة أ"
                  />
                </div>
                <div className="field schedule-field">
                  <label htmlFor="group-days">الأيام</label>
                  <input
                    id="group-days"
                    type="text"
                    value={newGroup.days}
                    onChange={e => setNewGroup({ ...newGroup, days: e.target.value })}
                    placeholder="مثال: السبت والثلاثاء"
                  />
                </div>
                <div className="field schedule-field">
                  <label htmlFor="group-time">الوقت</label>
                  <input
                    id="group-time"
                    type="text"
                    value={newGroup.time}
                    onChange={e => setNewGroup({ ...newGroup, time: e.target.value })}
                    placeholder="مثال: 3:00 م"
                  />
                </div>
              </div>

              <div className="schedule-form-actions">
                <button type="button" className="btn btn-primary" onClick={handleCreateGroup}>
                  <icons.Plus />
                  إضافة مجموعة جديدة
                </button>
              </div>
            </section>

            <section className="panel">
              <div className="panel-head">
                <h2 className="panel-title">المجموعات الدراسية</h2>
                <span className="badge badge-soft">{groups.length} مجموعة</span>
              </div>

              <div className="group-grid">
                {groups.map(g => (
                  <article key={g.id} className="group-card">
                    <div className="group-card-head">
                      <span className="group-avatar"><icons.Group /></span>
                      <div className="group-title-wrap">
                        <h3>{g.name}</h3>
                        <span className={g.active ? 'badge badge-success' : 'badge badge-muted'}>
                          {g.active ? 'نشطة' : 'غير نشطة'}
                        </span>
                      </div>
                    </div>

                    <div className="group-meta">
                      <div className="group-meta-item">
                        <span className="group-meta-icon"><icons.Calendar /></span>
                        <div>
                          <small>الأيام</small>
                          <strong>{g.days || '—'}</strong>
                        </div>
                      </div>
                      <div className="group-meta-item">
                        <span className="group-meta-icon"><icons.Clock /></span>
                        <div>
                          <small>الوقت</small>
                          <strong>{g.time || '—'}</strong>
                        </div>
                      </div>
                    </div>

                    {g.description && <p className="group-desc">{g.description}</p>}
                  </article>
                ))}
              </div>

              {groups.length === 0 && (
                <div className="empty-state schedule-empty">
                  <span className="empty-icon"><icons.Inbox /></span>
                  <h3>لا توجد مجموعات حالياً</h3>
                  <p>أضف أول مجموعة دراسية من الأعلى لتبدأ الإدارة.</p>
                </div>
              )}
            </section>
          </>
        )}

        {(view === 'pending' || view === 'all') && (
          <section className="panel">
            <div className="panel-head">
              <h2 className="panel-title">طلبات تغيير المجموعة {(view === 'pending') ? 'قيد الانتظار' : ''}</h2>
              <span className="badge badge-soft">{(view === 'pending' ? pendingRequests : requests).length} طلب</span>
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>الطالب</th>
                    <th>الهاتف</th>
                    <th>المجموعة الحالية</th>
                    <th>المجموعة المطلوبة</th>
                    <th>السبب</th>
                    <th>الحالة</th>
                    <th>الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {(view === 'pending' ? pendingRequests : requests).map(req => (
                    <tr key={req.id}>
                      <td>{req.studentName}</td>
                      <td dir="ltr">{req.phoneNumber}</td>
                      <td>{req.currentGroupLabel || '-'}</td>
                      <td>{req.requestedGroupLabel}</td>
                      <td>{req.reason || '-'}</td>
                      <td>
                        <span className={req.status === 'PENDING' ? 'badge badge-warning' : req.status === 'APPROVED' ? 'badge badge-success' : 'badge badge-muted'}>
                          {req.status === 'PENDING' ? 'قيد الانتظار' : req.status === 'APPROVED' ? 'موافق' : 'مرفوض'}
                        </span>
                      </td>
                      <td>
                        {req.status === 'PENDING' ? (
                          <div className="request-actions">
                            <textarea
                              rows={1}
                              className="request-note"
                              placeholder="ملاحظات المدير"
                              value={adminNote}
                              onChange={e => setAdminNote(e.target.value)}
                            />
                            <button className="btn btn-primary btn-sm" onClick={() => handleApprove(req.id)}>موافقة</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleReject(req.id)}>رفض</button>
                          </div>
                        ) : (
                          <span className="request-admin-note">{req.adminNote ? 'ملاحظات: ' + req.adminNote : '-'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(view === 'pending' ? pendingRequests : requests).length === 0 && (
              <div className="empty-state schedule-empty">
                <span className="empty-icon"><icons.Inbox /></span>
                <h3>لا توجد طلبات</h3>
                <p>ستظهر هنا طلبات تغيير المجموعات عند وصولها.</p>
              </div>
            )}
          </section>
        )}

        {message && <div className="alert alert-info">{message}</div>}
      </div>
    </div>
  )
}

export default ScheduleAdmin
