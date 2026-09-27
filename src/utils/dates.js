function toMinutes(time) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function toTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function addMinutesToTime(time, minutes) {
  return toTime(toMinutes(time) + (Number(minutes) || 0))
}

// Redondea la duración hacia arriba al múltiplo del paso (por defecto 30 min),
// para que los bloques y horarios queden alineados a la grilla.
export function roundUpToStep(minutes, step = 30) {
  const size = Number(step) > 0 ? Number(step) : 30
  const value = Number(minutes) || 0
  if (value <= 0) return 0
  return Math.ceil(value / size) * size
}

export function minutesBetween(startTime, endTime) {
  if (!startTime || !endTime) return null
  return Math.max(0, toMinutes(endTime) - toMinutes(startTime))
}

function toDateString(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Día de descanso configurable (0 = domingo, 1 = lunes, ... 6 = sábado).
export function isRestDay(date, restDay = 0) {
  return date.getDay() === Number(restDay)
}

export function nextWorkingDays(count, restDay = 0) {
  const days = []
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)

  while (days.length < count) {
    if (!isRestDay(cursor, restDay)) {
      days.push(new Date(cursor))
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  return days
}

export function generateSlots(
  durationMinutes,
  { open = '09:00', close = '19:00', step = 0 } = {},
) {
  const openMinutes = toMinutes(open)
  const closeMinutes = toMinutes(close)
  const stepMinutes = step > 0 ? step : durationMinutes
  const slots = []

  for (
    let start = openMinutes;
    start + durationMinutes <= closeMinutes;
    start += stepMinutes
  ) {
    slots.push({
      startTime: toTime(start),
      endTime: toTime(start + durationMinutes),
    })
  }

  return slots
}

export function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart
}

export function isSlotInPast(date, startTime) {
  const now = new Date()
  const todayStr = toDateString(now)
  if (date < todayStr) return true
  if (date > todayStr) return false

  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return toMinutes(startTime) <= nowMinutes
}

export function formatDateString(date) {
  return toDateString(date)
}

export function formatDateLong(dateString) {
  const [y, m, d] = dateString.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const text = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatTime12h(time) {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

export function formatDayShort(date) {
  const weekday = new Intl.DateTimeFormat('es-CO', { weekday: 'short' })
    .format(date)
    .replace('.', '')
  return {
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
    day: date.getDate(),
  }
}

export function addDays(date, amount) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}
