import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import Footer from './Footer'
import './Login.css'

const Register = () => {
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [level, setLevel] = useState(1)
  const levels = [
    { value: 1, label: 'الصف الأول الابتدائي' },
    { value: 2, label: 'الصف الثاني الابتدائي' },
    { value: 3, label: 'الصف الثالث الابتدائي' },
    { value: 4, label: 'الصف الرابع الابتدائي' },
    { value: 5, label: 'الصف الخامس الابتدائي' },
    { value: 6, label: 'الصف السادس الابتدائي' },
    { value: 7, label: 'الصف الأول الإعدادي' },
    { value: 8, label: 'الصف الثاني الإعدادي' },
    { value: 9, label: 'الصف الثالث الإعدادي' },
  ]
  const [gender, setGender] = useState('male')
  const [groups, setGroups] = useState([])
  const [scheduleGroupId, setScheduleGroupId] = useState('')
  const [step, setStep] = useState(1) // 1: fill info, 2: enter otp
  const [message, setMessage] = useState('')
  const [username, setUsername] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('/api/schedules/groups')
      .then(res => setGroups(res.data || []))
      .catch(() => setGroups([]))
  }, [])

  const handleSendOtp = async () => {
    try {
      const res = await axios.post('/api/auth/send-otp', { phoneNumber })
      setMessage('تم إرسال رمز التحقق: ' + res.data)
      setStep(2)
    } catch (err) {
      setMessage(err.response?.data || 'خطأ في إرسال الرمز')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('/api/auth/register', {
        fullName, phoneNumber, otp, level, gender, scheduleGroupId: scheduleGroupId ? Number(scheduleGroupId) : null
      })
      setUsername(res.data.username)
      setMessage('تم التسجيل بنجاح! اسم المستخدم: ' + res.data.username)
      // After 2 seconds redirect to login
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setMessage(err.response?.data?.message || err.response?.data || 'خطأ في التسجيل')
    }
  }

  return (
    <div className="auth-shell">
      <div className="login-container">
        <div className="login-card">
        <h2 className="login-title">منصة مس رشا يحيى التعليمية</h2>
        <h3 className="login-subtitle">تسجيل جديد</h3>
        <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleSendOtp(); }} className="login-form">
          <div className="form-group">
            <label htmlFor="fullName">الاسم الكامل</label>
            <input
              type="text" id="fullName" value={fullName}
              onChange={e => setFullName(e.target.value)} placeholder="أدخل اسمك الكامل"
              required disabled={step === 2}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">رقم الهاتف</label>
            <input
              type="text" id="phoneNumber" value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)} placeholder="أدخل رقم الهاتف"
              required disabled={step === 2}
            />
          </div>

          <div className="form-group">
            <label>المستوى الدراسي</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '8px' }}>
              {levels.map(l => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => setLevel(l.value)}
                  disabled={step === 2}
                  style={{
                    padding: '12px 6px',
                    border: level === l.value ? '2px solid #667eea' : '1px solid #ddd',
                    borderRadius: '10px',
                    background: level === l.value ? '#e8f0fe' : '#fff',
                    color: '#333',
                    fontSize: '13px',
                    cursor: step === 2 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: level === l.value ? '0 4px 12px rgba(102,126,234,0.15)' : '0 2px 6px rgba(0,0,0,0.05)',
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>الجنس</label>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              {[
                { value: 'male', label: 'ذكر', emoji: '👨' },
                { value: 'female', label: 'أنثى', emoji: '👩' },
              ].map(g => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGender(g.value)}
                  disabled={step === 2}
                  style={{
                    flex: 1,
                    padding: '14px 10px',
                    border: gender === g.value ? '2px solid #667eea' : '1px solid #ddd',
                    borderRadius: '12px',
                    background: gender === g.value ? '#e8f0fe' : '#fff',
                    color: '#333',
                    fontSize: '15px',
                    cursor: step === 2 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: gender === g.value ? '0 4px 12px rgba(102,126,234,0.15)' : '0 2px 6px rgba(0,0,0,0.05)',
                    fontWeight: gender === g.value ? 600 : 400,
                  }}
                >
                  <div style={{ fontSize: '22px', marginBottom: '4px' }}>{g.emoji}</div>
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>المجموعة الدراسية (جدول الحصة)</label>
            <select value={scheduleGroupId} onChange={e => setScheduleGroupId(e.target.value)} required>
              <option value="">اختر المجموعتك الدراسية</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name} - {g.days || ''} {g.time || ''}</option>
              ))}
            </select>
          </div>

          {step === 2 && (
            <div className="form-group">
              <label htmlFor="otp">رمز التحقق (OTP)</label>
              <input type="text" id="otp" value={otp} onChange={e => setOtp(e.target.value)} placeholder="أدخل الرمز" required />
            </div>
          )}

          {message && <div className="error-message" style={{ color: message.includes('نجاح') ? 'green' : '#e74c3c' }}>{message}</div>}

          <button type="submit" className="login-button">
            {step === 1 ? 'إرسال رمز التحقق' : 'تسجيل الحساب'}
          </button>

          <p className="auth-switch">
            لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link>
          </p>
        </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Register
