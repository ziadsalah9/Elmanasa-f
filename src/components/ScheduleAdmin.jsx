import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { getUser, errorMessage, formatDate } from '../auth'

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

  return (
    <div className="quiz-page">
      <div className="page-heading">
        <h1>إدارة المجموعات الدراسية</h1>
        <p>إدارة الجداول الدراسية وطلبات تغيير المجموعات.</p>
      </div>

      <div className="button-row" style={{ gap: '10px' }}>
        <button className={`btn btn-ghost btn-sm ${view === 'pending' ? 'btn-selected' : ''}`} onClick={() => setView('pending')}>طلبات قيد الانتظار ({pendingRequests.length})</button>
        <button className={`btn btn-ghost btn-sm ${view === 'all' ? 'btn-selected' : ''}`} onClick={() => setView('all')}>كل الطلبات</button>
        <button className={`btn btn-ghost btn-sm ${view === 'groups' ? 'btn-selected' : ''}`} onClick={() => setView('groups')}>المجموعات</button>
      </div>

      <div className="stack" style={{ gap: '14px', marginTop: '20px' }}>
        {view === 'groups' && (
          <>
            <section className="panel" style={{ background: '#f8faff' }}>
              <div className="panel-head">
                <h2 className="panel-title">إضافة مجموعة جديدة</h2>
                <span className="badge badge-soft">مجموعات دراسية</span>
              </div>
              <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <input value={newGroup.name} onChange={e => setNewGroup({ ...newGroup, name: e.target.value })} placeholder="اسم المجموعة (مثال: المجموعة أ)" />
                <input value={newGroup.days} onChange={e => setNewGroup({ ...newGroup, days: e.target.value })} placeholder="الأيام (مثال: السبت والثلاثاء)" />
                <input value={newGroup.time} onChange={e => setNewGroup({ ...newGroup, time: e.target.value })} placeholder="الوقت (مثال: 3:00 م أو 4:00 م)" />
                <button className="btn btn-primary btn-sm" onClick={handleCreateGroup}>إضافة مجموعة جديدة</button>
              </div>
            </section>

            <section className="panel">
              <h2 className="panel-title">المجموعات الدراسية</h2>
              <div className="quiz-grid" style={{ marginTop: '16px' }}>
                {groups.map(g => (
                  <article key={g.id} className="quiz-card" style={{ padding: '20px', borderRadius: '14px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', color: '#1a2235' }}>{g.name}</h3>
                      <span className={g.active ? 'badge badge-success' : 'badge badge-muted'} style={{ fontSize: '12px', padding: '4px 8px' }}>
                        {g.active ? 'نشطة' : 'غير نشطة'}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                      <span>📅 {g.days || '—'}</span>
                      <span style={{ marginLeft: '12px' }}>⏰ {g.time || '—'}</span>
                    </div>
                    {g.description && <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '8px' }}>{g.description}</p>}
                  </article>
                ))}
                {groups.length === 0 && (
                  <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                    <h3>لا توجد مجموعات حالياً</h3>
                    <p>أضف أول مجموعة دراسية من الأعلى لتبدأ الإدارة.</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {(view === 'pending' || view === 'all') && (
          <section className="panel">
            <h2 className="panel-title">طلبات تغيير المجموعة {(view === 'pending') ? 'قيد الانتظار' : ''}</h2>
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
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <textarea rows={1} placeholder="ملاحظات المدير" style={{ width: '100px', fontSize: '12px', resize: 'none' }} value={adminNote} onChange={e => setAdminNote(e.target.value)} />
                          <button className="btn btn-primary btn-sm" onClick={() => handleApprove(req.id)}>موافقة</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleReject(req.id)}>رفض</button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--muted)', fontSize: '12px' }}>{req.adminNote ? 'ملاحظات: ' + req.adminNote : '-'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(view === 'pending' ? pendingRequests : requests).length === 0 && (
              <div className="empty-state">
                <h3>لا توجد طلبات</h3>
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
