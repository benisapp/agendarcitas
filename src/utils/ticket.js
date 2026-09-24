import { formatDateLong, formatTime12h } from './dates'
import { formatDuration } from './format'

const WIDTH = 640
const HEIGHT = 900

const COLORS = {
  rose: '#b76e79',
  roseDeep: '#8e4a55',
  roseLight: '#d4a0a6',
  blush: '#f5ecea',
  bg: '#ffffff',
  header: '#faf6f4',
  panel: '#faf6f4',
  ink: '#33262b',
  muted: '#8c7a80',
  border: '#e0cdc9',
  white: '#ffffff',
}

const FONT = "'Nunito', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"

function clip(text, max = 24) {
  if (!text) return ''
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export function getTicketCode(appointment) {
  const id = appointment?.id || ''
  return id.slice(-6).toUpperCase()
}

function generateTicketCanvas({ services, service, client, slot, appointment }) {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = COLORS.bg
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  const serviceList = Array.isArray(services) && services.length
    ? services
    : service
      ? [service]
      : []

  const name = client.name
  const date = formatDateLong(slot.date)
  const time = `${formatTime12h(slot.startTime)} - ${formatTime12h(slot.endTime)}`
  const serviceName = clip(serviceList.map((s) => s.name).join(', ') || 'Servicio')
  const totalDuration = serviceList.reduce((sum, s) => sum + (s.duration || 0), 0)
  const duration = totalDuration ? formatDuration(totalDuration) : '—'
  const code = getTicketCode(appointment) || '—'

  ctx.fillStyle = COLORS.header
  ctx.fillRect(0, 0, WIDTH, 200)

  ctx.fillStyle = 'rgba(183, 110, 121, 0.08)'
  ctx.beginPath()
  ctx.arc(580, 30, 100, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(50, 190, 70, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = COLORS.rose
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(48, 200)
  ctx.lineTo(WIDTH - 48, 200)
  ctx.stroke()

  ctx.fillStyle = COLORS.rose
  ctx.textAlign = 'center'
  ctx.font = `800 56px ${FONT}`
  ctx.fillText('Benis', WIDTH / 2, 106)

  ctx.fillStyle = COLORS.muted
  ctx.font = `400 20px ${FONT}`
  ctx.fillText('Tu centro de belleza', WIDTH / 2, 152)

  ctx.fillStyle = COLORS.rose
  roundRect(ctx, 210, 176, 220, 50, 25)
  ctx.fill()
  ctx.fillStyle = COLORS.white
  ctx.font = `700 22px ${FONT}`
  ctx.fillText('Cita agendada', WIDTH / 2, 209)

  ctx.fillStyle = COLORS.ink
  ctx.font = `700 40px ${FONT}`
  ctx.fillText(name, WIDTH / 2, 294)

  ctx.fillStyle = COLORS.muted
  ctx.font = `400 20px ${FONT}`
  ctx.fillText(`Te esperamos, ${name}.`, WIDTH / 2, 330)

  ctx.fillStyle = COLORS.panel
  roundRect(ctx, 48, 362, 544, 240, 16)
  ctx.fill()
  ctx.strokeStyle = COLORS.border
  ctx.lineWidth = 2
  roundRect(ctx, 48, 362, 544, 240, 16)
  ctx.stroke()

  const rows = [
    ['Servicio', serviceName],
    ['Fecha', date],
    ['Hora', time],
    ['Duración', duration],
  ]
  rows.forEach(([label, value], i) => {
    const y = 408 + i * 60
    ctx.textAlign = 'left'
    ctx.fillStyle = COLORS.muted
    ctx.font = `400 18px ${FONT}`
    ctx.fillText(label, 72, y)
    ctx.textAlign = 'right'
    ctx.fillStyle = COLORS.ink
    ctx.font = `600 18px ${FONT}`
    ctx.fillText(value, 568, y)
  })

  ctx.strokeStyle = COLORS.border
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(90, 654)
  ctx.lineTo(WIDTH - 90, 654)
  ctx.stroke()

  ctx.textAlign = 'center'
  ctx.fillStyle = COLORS.muted
  ctx.font = `400 18px ${FONT}`
  ctx.fillText('Comprobante Nº', WIDTH / 2, 708)

  ctx.fillStyle = COLORS.rose
  ctx.font = `800 34px ${FONT}`
  ctx.fillText(code.split('').join(' '), WIDTH / 2, 750)

  ctx.fillStyle = COLORS.muted
  ctx.font = `400 20px ${FONT}`
  ctx.fillText('Gracias por confiar en Benis.', WIDTH / 2, 826)
  ctx.font = `400 18px ${FONT}`
  ctx.fillText('Te esperamos. Presentá este comprobante al llegar.', WIDTH / 2, 858)

  return canvas
}

export async function downloadTicketImage({ services, service, client, slot, appointment }) {
  const canvas = generateTicketCanvas({ services, service, client, slot, appointment })
  const code = getTicketCode(appointment) || 'cita'
  const link = document.createElement('a')
  link.download = `cita-benis-${code}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
