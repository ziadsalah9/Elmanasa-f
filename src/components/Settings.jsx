import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  applyTheme,
  errorMessage,
  getInitialTheme,
  getUser,
  levelLabel,
  updateStoredUser,
} from '../auth'

const TABS = [
  { key: 'profile', label: 'الملف الشخصي', icon: '👤' },
  { key: 'security', label: 'الأمان وكلمة المرور', icon: '🔒' },
  { key: 'notifications', label: 'الإشعارات', icon: '🔔' },
  { key: 'appearance', label: 'المظهر', icon: '🌙' },
]

const Settings = () => {
  const user = getUser()
  const [activeTab, setActiveTab] = useState('profile')
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [avatar, setAvatar] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  const [notify, setNotify] = useState({
    notificationsEnabled: true,
    notifyNewVideos: true,
    notifyQuizResults: true,
    notifyScheduleUpdates: true,
  })
  const [savingNotify, setSavingNotify] = useState(false)

  const [theme, setTheme] = useState(getInitialTheme(user))
  const [savingTheme, setSavingTheme] = useState(false)

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const switchTab = (tab) => {
    clearMessages()
    setActiveTab(tab)
  }

  const applySettings = (data, { syncTheme = false } = {}) => {
    setSettings(data)
    setName(data.displayName || data.name || '')
    setPhoneNumber(data.phoneNumber || '')
    setAvatar(data.avatarUrl || '')
    setNotify({
      notificationsEnabled: data.notificationsEnabled,
      notifyNewVideos: data.notifyNewVideos,
      notifyQuizResults: data.notifyQuizResults,
      notifyScheduleUpdates: data.notifyScheduleUpdates,
    })
    if (syncTheme) {
      setTheme(data.theme || 'light')
    }
  }

  useEffect(() => {
    axios.get(`/api/users/${user?.id}/settings`)
      .then(res => {
        applySettings(res.data, { syncTheme: true })
        applyTheme(res.data.theme || getInitialTheme(user))
      })
      .catch(err => setError(errorMessage(err, 'تعذّر تحميل الإعدادات')))
      .finally(() => setLoading(false))
  }, [user?.id])

  const handleAvatarFile = (event) => {
    clearMessages()
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار ملف صورة صالح')
      return
    }
    if (file.size > 1.5 * 1024 * 1024) {
      setError('حجم الصورة يجب أن يكون أقل من 1.5 ميجابايت')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setAvatar(String(reader.result || ''))
    reader.onerror = () => setError('تعذّر قراءة الصورة')
    reader.readAsDataURL(file)
  }

  const saveProfile = async (event) => {
    event.preventDefault()
    clearMessages()
    if (!name.trim()) return setError('الاسم مطلوب')
    if (!phoneNumber.trim()) return setError('رقم الهاتف مطلوب')
    setSavingProfile(true)
    try {
      const res = await axios.put(`/api/users/${user?.id}/profile`, {
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        avatarUrl: avatar || null,
      })
      applySettings(res.data)
      updateStoredUser({
        name: res.data.displayName,
        phoneNumber: res.data.phoneNumber,
        avatarUrl: res.data.avatarUrl,
      })
      setSuccess('تم تحديث الملف الشخصي بنجاح')
    } catch (err) {
      setError(errorMessage(err, 'تعذّر تحديث الملف الشخصي'))
    } finally {
      setSavingProfile(false)
    }
  }

  const savePassword = async (event) => {
    event.preventDefault()
    clearMessages()
    if (!currentPassword) return setError('أدخل كلمة المرور الحالية')
    if (newPassword.length < 6) return setError('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل')
    if (newPassword !== confirmPassword) return setError('تأكيد كلمة المرور غير مطابق')
    setSavingPassword(true)
    try {
      await axios.post(`/api/users/${user?.id}/change-password`, {
        currentPassword,
        newPassword,
        confirmPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccess('تم تغيير كلمة المرور بنجاح')
    } catch (err) {
      setError(errorMessage(err, 'تعذّر تغيير كلمة المرور'))
    } finally {
      setSavingPassword(false)
    }
  }

  const saveNotifications = async (event) => {
    event.preventDefault()
    clearMessages()
    setSavingNotify(true)
    try {
      const res = await axios.put(`/api/users/${user?.id}/preferences`, notify)
      applySettings(res.data)
      updateStoredUser({ notifications: notify })
      setSuccess('تم حفظ تفضيلات الإشعارات')
    } catch (err) {
      setError(errorMessage(err, 'تعذّر حفظ تفضيلات الإشعارات'))
    } finally {
      setSavingNotify(false)
    }
  }

  const chooseTheme = async (value) => {
    clearMessages()
    setTheme(value)
    applyTheme(value)
    setSavingTheme(true)
    try {
      const res = await axios.put(`/api/users/${user?.id}/preferences`, { theme: value })
      applySettings(res.data)
      updateStoredUser({ theme: value })
      setSuccess(value === 'dark' ? 'تم تفعيل الوضع الليلي' : 'تم تفعيل الوضع النهاري')
    } catch (err) {
      setError(errorMessage(err, 'تعذّر حفظ المظهر'))
    } finally {
      setSavingTheme(false)
    }
  }

  const toggleNotify = (field) => {
    setNotify(prev => ({ ...prev, [field]: !prev[field] }))
  }

  if (loading) return <div className="quiz-page"><div className="alert alert-info">جارٍ تحميل الإعدادات…</div></div>

  return (
    <div className="quiz-page settings-page">
      <div className="page-heading">
        <div>
          <span className="hero-eyebrow">حسابي</span>
          <h1>الإعدادات والملف الشخصي</h1>
          <p>تحكّم في بياناتك الشخصية، أمان حسابك، إشعاراتك، ومظهر المنصة.</p>
        </div>
      </div>

      <div className="settings-shell">
        <nav className="settings-nav">
          {TABS.map(tab => (
            <button
              key={tab.key}
              type="button"
              className={activeTab === tab.key ? 'active' : ''}
              onClick={() => switchTab(tab.key)}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="settings-content">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {activeTab === 'profile' && (
            <section className="panel settings-panel">
              <h2 className="panel-title">الملف الشخصي</h2>

              <div className="avatar-uploader">
                <div className="avatar-preview">
                  {avatar ? (
                    <img src={avatar} alt="الصورة الشخصية" />
                  ) : (
                    <span>{(settings?.displayName || user?.name || '؟').charAt(0)}</span>
                  )}
                </div>
                <div className="avatar-actions">
                  <label className="btn btn-ghost btn-sm">
                    رفع صورة
                    <input type="file" accept="image/*" onChange={handleAvatarFile} hidden />
                  </label>
                  {avatar && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => setAvatar('')}>
                      إزالة الصورة
                    </button>
                  )}
                  <small>PNG أو JPG، بحد أقصى 1.5 ميجابايت.</small>
                </div>
              </div>

              <form className="settings-form" onSubmit={saveProfile}>
                <div className="form-grid">
                  <div className="field">
                    <label>الاسم الظاهر</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="اسمك الكامل" />
                  </div>
                  <div className="field">
                    <label>رقم الهاتف</label>
                    <input dir="ltr" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="01xxxxxxxxx" />
                  </div>
                  <div className="field">
                    <label>اسم المستخدم</label>
                    <input value={settings?.username || '-'} readOnly className="read-only" />
                  </div>
                  <div className="field">
                    <label>الصف الدراسي</label>
                    <input value={levelLabel(settings?.level)} readOnly className="read-only" />
                  </div>
                  <div className="field">
                    <label>الدور</label>
                    <input value={settings?.role === 'ADMIN' ? 'مدير / معلم' : 'طالب'} readOnly className="read-only" />
                  </div>
                  <div className="field">
                    <label>المجموعة الدراسية</label>
                    <input value={settings?.groupName || 'غير محددة'} readOnly className="read-only" />
                  </div>
                </div>
                <div className="button-row">
                  <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                    {savingProfile ? 'جارٍ الحفظ…' : 'حفظ التغييرات'}
                  </button>
                </div>
              </form>
            </section>
          )}

          {activeTab === 'security' && (
            <section className="panel settings-panel">
              <h2 className="panel-title">الأمان وكلمة المرور</h2>
              <p className="settings-hint">استخدم كلمة مرور قوية لا تقل عن 6 أحرف ولا تشاركها مع أحد.</p>

              <form className="settings-form settings-form-narrow" onSubmit={savePassword}>
                <div className="field">
                  <label>كلمة المرور الحالية</label>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} autoComplete="current-password" />
                </div>
                <div className="field">
                  <label>كلمة المرور الجديدة</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" />
                </div>
                <div className="field">
                  <label>تأكيد كلمة المرور الجديدة</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" />
                </div>
                <div className="button-row">
                  <button type="submit" className="btn btn-primary" disabled={savingPassword}>
                    {savingPassword ? 'جارٍ التحديث…' : 'تغيير كلمة المرور'}
                  </button>
                </div>
              </form>
            </section>
          )}

          {activeTab === 'notifications' && (
            <section className="panel settings-panel">
              <h2 className="panel-title">تفضيلات الإشعارات</h2>
              <p className="settings-hint">اختر الأحداث التي تريد استلام إشعارات عنها داخل المنصة.</p>

              <form className="settings-form" onSubmit={saveNotifications}>
                <div className="switch-row switch-row-master">
                  <div>
                    <strong>تفعيل الإشعارات</strong>
                    <p>تشغيل أو إيقاف كل الإشعارات دفعة واحدة.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notify.notificationsEnabled}
                      onChange={() => toggleNotify('notificationsEnabled')}
                    />
                    <span className="switch-slider" />
                  </label>
                </div>

                <div className="switch-list">
                  <div className="switch-row">
                    <div>
                      <strong>فيديوهات جديدة</strong>
                      <p>إشعار عند إضافة فيديو شرح جديد لمستواك.</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notify.notifyNewVideos}
                        disabled={!notify.notificationsEnabled}
                        onChange={() => toggleNotify('notifyNewVideos')}
                      />
                      <span className="switch-slider" />
                    </label>
                  </div>
                  <div className="switch-row">
                    <div>
                      <strong>نتائج الاختبارات</strong>
                      <p>إشعار عند اعتماد نتيجة اختبار أو تصحيحه.</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notify.notifyQuizResults}
                        disabled={!notify.notificationsEnabled}
                        onChange={() => toggleNotify('notifyQuizResults')}
                      />
                      <span className="switch-slider" />
                    </label>
                  </div>
                  <div className="switch-row">
                    <div>
                      <strong>تحديثات المجموعة</strong>
                      <p>إشعار عند الموافقة على طلب تغيير المجموعة.</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notify.notifyScheduleUpdates}
                        disabled={!notify.notificationsEnabled}
                        onChange={() => toggleNotify('notifyScheduleUpdates')}
                      />
                      <span className="switch-slider" />
                    </label>
                  </div>
                </div>

                <div className="button-row">
                  <button type="submit" className="btn btn-primary" disabled={savingNotify}>
                    {savingNotify ? 'جارٍ الحفظ…' : 'حفظ التفضيلات'}
                  </button>
                </div>
              </form>
            </section>
          )}

          {activeTab === 'appearance' && (
            <section className="panel settings-panel">
              <h2 className="panel-title">المظهر</h2>
              <p className="settings-hint">اختر مظهر المنصة المناسب لك. يتم حفظ اختيارك تلقائياً.</p>

              <div className="theme-options">
                <button
                  type="button"
                  className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => chooseTheme('light')}
                  disabled={savingTheme}
                >
                  <span className="theme-preview theme-preview-light">
                    <span /><span /><span />
                  </span>
                  <strong>الوضع النهاري</strong>
                  <small>خلفية فاتحة وألوان مريحة</small>
                </button>

                <button
                  type="button"
                  className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => chooseTheme('dark')}
                  disabled={savingTheme}
                >
                  <span className="theme-preview theme-preview-dark">
                    <span /><span /><span />
                  </span>
                  <strong>الوضع الليلي</strong>
                  <small>راحة أكبر للعين في الإضاءة المنخفضة</small>
                </button>
              </div>

              <div className="theme-status">
                {savingTheme ? 'جارٍ حفظ المظهر…' : `المظهر الحالي: ${theme === 'dark' ? 'الوضع الليلي' : 'الوضع النهاري'}`}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
