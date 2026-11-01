export const LIBRARY_CATEGORIES = [
  { value: 'BOOK', label: 'كتاب' },
  { value: 'NOTES', label: 'ملاحظات' },
  { value: 'PRESENTATION', label: 'عرض تقديمي' },
  { value: 'EXAM_REVISION', label: 'مراجعة امتحان' },
]

export const ALLOWED_LIBRARY_EXTENSIONS = ['pdf', 'ppt', 'pptx', 'pps', 'ppsx', 'doc', 'docx']

export const MAX_LIBRARY_FILE_SIZE = 100 * 1024 * 1024

export function categoryLabel(value) {
  return LIBRARY_CATEGORIES.find(item => item.value === value)?.label || value || 'ملف'
}

export function fileIcon(fileType) {
  switch ((fileType || '').toUpperCase()) {
    case 'PDF':
      return '📕'
    case 'PPT':
    case 'PPTX':
    case 'PPS':
    case 'PPSX':
      return '📊'
    case 'DOC':
    case 'DOCX':
      return '📝'
    default:
      return '📄'
  }
}

export function fileTypeLabel(fileType) {
  switch ((fileType || '').toUpperCase()) {
    case 'PPT':
    case 'PPTX':
    case 'PPS':
    case 'PPSX':
      return 'عرض تقديمي'
    case 'DOC':
    case 'DOCX':
      return 'مستند'
    case 'PDF':
      return 'PDF'
    default:
      return fileType || 'ملف'
  }
}

export function formatFileSize(bytes) {
  const value = Number(bytes)
  if (!value || value <= 0) return '—'
  if (value < 1024) return `${value} بايت`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(0)} كيلوبايت`
  return `${(value / (1024 * 1024)).toFixed(1)} ميجابايت`
}
