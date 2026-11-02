export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
}

export function isAdmin(user = getUser()) {
  return user?.role === 'ADMIN'
}

export function logout() {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
}

export function updateStoredUser(patch) {
  const current = getUser() || {}
  const next = { ...current, ...patch }
  localStorage.setItem('user', JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('user-updated', { detail: next }))
  return next
}

const THEME_KEY = 'theme-v2'

export function applyTheme(theme) {
  const next = theme === 'dark' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', next)
  document.documentElement.classList.toggle('dark', next === 'dark')
  localStorage.setItem(THEME_KEY, next)
  return next
}

export function getInitialTheme() {
  const stored = localStorage.getItem(THEME_KEY)
  return stored === 'light' || stored === 'dark' ? stored : 'dark'
}

export const LEVELS = [
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

export function levelLabel(level) {
  return LEVELS.find(l => l.value === Number(level))?.label || 'جميع المستويات'
}

export function errorMessage(err, fallback = 'حدث خطأ غير متوقع') {
  const data = err?.response?.data
  if (typeof data === 'string' && data.trim()) return data
  if (data?.message) return data.message
  if (err?.message) return err.message
  return fallback
}

export function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function statusLabel(status) {
  if (status === 'GRADED') return 'تم التصحيح'
  if (status === 'SUBMITTED') return 'بانتظار التصحيح'
  return 'لم يبدأ'
}

export function statusClass(status) {
  if (status === 'GRADED') return 'badge badge-success'
  if (status === 'SUBMITTED') return 'badge badge-warning'
  return 'badge badge-muted'
}
