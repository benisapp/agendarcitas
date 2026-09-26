import { formatDateLong, formatTime12h, minutesBetween } from './dates'
import { formatDuration, formatPrice } from './format'
import {
  getAppointmentAddons,
  addonQuantity,
  addonLineDuration,
  addonLinePrice,
} from './appointmentServices'

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
  const serviceList = Array.isArray(services) && services.length
    ? services
    : service
      ? [service]
      : []

  const addonList = getAppointmentAddons(appointment)
  const name = client.name
  const date = formatDateLong(slot.date)
  const endTime = appointment?.endTime || slot.endTime
  const time = `${formatTime12h(slot.startTime)} - ${formatTime12h(endTime)}`
  const addonLabels = addonList.map((addon) => {
    const quantity = addonQuantity(addon)
    return quantity > 1 ? `${addon.name} ×${quantity}` : addon.name
  })
  const serviceName = clip(
    [...serviceList.map((s) => s.name), ...addonLabels].join(', ') || 'Servicio',
    40,
  )
  const computedDuration =
    serviceList.reduce((sum, s) => sum + (s.duration || 0), 0) +
    addonList.reduce((sum, addon) => sum + addonLineDuration(addon), 0)
  const totalDuration =
    minutesBetween(slot.startTime, endTime) ?? computedDuration
  const duration = totalDuration ? formatDuration(totalDuration) : '—'
  const servicesPrice = serviceList.every((s) => s.price != null)
    ? serviceList.reduce((sum, s) => sum + (s.price || 0), 0)
    : null
  const addonsPrice = addonList.reduce(
    (sum, addon) => sum + addonLinePrice(addon),
    0,
  )
  const subtotal = servicesPrice != null ? servicesPrice + addonsPrice : null
  const discountPercent = appointment?.discountPercent ?? null
  // El descuento aplica solo sobre los servicios.
  const discountAmount =
    servicesPrice != null && discountPercent != null
      ? Math.round((servicesPrice * discountPercent) / 100)
      : 0
  const total = subtotal != null ? subtotal - discountAmount : null
  const code = getTicketCode(appointment) || '—'

  const rows = [
    ['Servicio', serviceName],
    ['Fecha', date],
    ['Hora', time],
    ['Duración', duration],
  ]
  if (subtotal != null) rows.push(['Subtotal', formatPrice(subtotal)])
  if (discountAmount > 0) {
    rows.push([`Descuento ${discountPercent}%`, `-${formatPrice(discountAmount)}`])
  }
  if (total != null) rows.push(['Total', formatPrice(total)])

  const panelTop = 362
  const rowStart = 408
  const rowGap = 56
  const panelHeight = 46 + (rows.length - 1) * rowGap + 22
  const delta = panelHeight - 240
  const height = HEIGHT + Math.max(0, delta)

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = height
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = COLORS.bg
  ctx.fillRect(0, 0, WIDTH, height)

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
  roundRect(ctx, 48, panelTop, 544, panelHeight, 16)
  ctx.fill()
  ctx.strokeStyle = COLORS.border
  ctx.lineWidth = 2
  roundRect(ctx, 48, panelTop, 544, panelHeight, 16)
  ctx.stroke()

  rows.forEach(([label, value], i) => {
    const y = rowStart + i * rowGap
    ctx.textAlign = 'left'
    ctx.fillStyle = COLORS.muted
    ctx.font = `400 18px ${FONT}`
    ctx.fillText(label, 72, y)
    ctx.textAlign = 'right'
    ctx.fillStyle =
      label === 'Total' ? COLORS.roseDeep : COLORS.ink
    ctx.font = `${label === 'Total' ? 800 : 600} 18px ${FONT}`
    ctx.fillText(value, 568, y)
  })

  const dividerY = 654 + Math.max(0, delta)

  ctx.strokeStyle = COLORS.border
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(90, dividerY)
  ctx.lineTo(WIDTH - 90, dividerY)
  ctx.stroke()

  ctx.textAlign = 'center'
  ctx.fillStyle = COLORS.muted
  ctx.font = `400 18px ${FONT}`
  ctx.fillText('Comprobante Nº', WIDTH / 2, dividerY + 54)

  ctx.fillStyle = COLORS.rose
  ctx.font = `800 34px ${FONT}`
  ctx.fillText(code.split('').join(' '), WIDTH / 2, dividerY + 96)

  ctx.fillStyle = COLORS.muted
  ctx.font = `400 20px ${FONT}`
  ctx.fillText('Gracias por confiar en Benis.', WIDTH / 2, dividerY + 172)
  ctx.font = `400 18px ${FONT}`
  ctx.fillText(
    'Te esperamos. Presentá este comprobante al llegar.',
    WIDTH / 2,
    dividerY + 204,
  )

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
