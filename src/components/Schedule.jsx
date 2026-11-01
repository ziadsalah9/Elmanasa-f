import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { getUser, errorMessage } from '../auth'

const Schedule = () => {
  const user = getUser()
  const [schedule, setSchedule] = useState(null)
  const [groups, setGroups] = useState([])
  const [requestedGroupId, setRequestedGroupId] = useState('')
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`/api/schedules/student/${user?.id}`)
      .then(res => setSchedule(res.data))
      .catch(err => {
        setMessage(errorMessage(err, 'فشل تحميل الجدول'))
      })
    axios.get('/api/schedules/groups')
      .then(res => setGroups(res.data || []))
      .catch(() => setGroups([]))
    setLoading(false)
  }, [user?.id])

  const submitRequest = async () => {
    try {
      await axios.post('/api/schedules/requests', {
        studentId: user?.id,
        requestedGroupId: Number(requestedGroupId),
        reason,
      })
      setMessage('تم إرسال طلب التغيير بنجاح')
      setRequestedGroupId('')
      setReason('')
      const res = await axios.get(`/api/schedules/student/${user?.id}`)
      setSchedule(res.data)
    } catch (err) {
      setMessage(err.response?.data || 'خطأ في إرسال الطلب')
    }
  }

  if (loading) return <div className="alert alert-info">جارٍ التحميل...</div>

  return (
    <div className="quiz-page">
      <div className="page-heading">
        <h1>المجموعة الدراسية</h1>
        <p>يمكنك طلب تغيير المجموعة الدراسية حسب رغبتك.</p>
      </div>

      <div className="stack">
        <section className="panel">
          <h2 className="panel-title">مجموعتك الحالية</h2>
          {schedule?.currentGroup ? (
            <div className="group-card">
              <h3>{schedule.currentGroup.name}</h3>
              <p>{schedule.currentGroup.days} - {schedule.currentGroup.time}</p>
              {schedule.currentGroup.description && <p style={{ color: 'var(--muted)' }}>{schedule.currentGroup.description}</p>}
            </div>
          ) : (
            <div className="empty-state">
              <h3>لا توجد مجموعة دراسية حالياً</h3>
            </div>
          )}
        </section>

        <section className="panel">
          <h2 className="panel-title">طلبات التغيير</h2>
          {(schedule?.requests || []).length === 0 ? (
            <div className="empty-state">
              <h3>لا توجد طلبات حالياً</h3>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>المجموعة المطلوبة</th>
                    <th>الحالة</th>
                    <th>السبب</th>
                    <th>ملاحظات المدير</th>
                    <th>تاريخ الطلب</th>
                  </tr>
                </thead>
                <tbody>
                  {(schedule?.requests || []).map(req => (
                    <tr key={req.id}>
                      <td>{req.requestedGroupLabel}</td>
                      <td><span className={`badge ${req.status === 'PENDING' ? 'badge-warning' : req.status === 'APPROVED' ? 'badge-success' : 'badge-muted'}`}>{req.status === 'PENDING' ? 'قيد الانتظار' : req.status === 'APPROVED' ? 'تمت الموافقة' : 'مرفوض'}</span></td>
                      <td>{req.reason || '-'}</td>
                      <td>{req.adminNote || '-'}</td>
                      <td>{req.createdAt ? new Date(req.createdAt).toLocaleString('ar-EG') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel">
          <h2 className="panel-title">طلب تغيير المجموعة</h2>
          <div className="form-group">
            <label>المجموعة المطلوبة</label>
            <select value={requestedGroupId} onChange={e => setRequestedGroupId(e.target.value)}>
              <option value="">اختر المجموعة</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name} - {g.days || ''} {g.time || ''}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>سبب الطلب</label>
            <textarea rows={2} value={reason} onChange={e => setReason(e.target.value)} placeholder="اكتب سبب تغيير المجموعة" />
          </div>
          <button className="btn btn-primary btn-lg" onClick={submitRequest} disabled={!requestedGroupId}>إرسال الطلب</button>
        </section>

        {message && <div className="alert" style={{ color: message.includes('نجاح') ? 'var(--success)' : '#e74c3c' }}>{message}</div>}
      </div>
    </div>
  )
}

export default Schedule
