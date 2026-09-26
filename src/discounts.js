import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'

const DISCOUNTS_COLLECTION = 'discounts'

export const BIRTHDAY_DISCOUNT_ID = 'birthday'

const toDiscount = (snapshot) => ({
  id: snapshot.id,
  ...snapshot.data(),
})

export const isBirthdayDiscount = (discount) =>
  discount?.type === 'birthday' || discount?.id === BIRTHDAY_DISCOUNT_ID

export async function fetchDiscounts() {
  const snapshot = await getDocs(collection(db, DISCOUNTS_COLLECTION))
  return snapshot.docs.map(toDiscount)
}

function toMonthDay(value) {
  if (!value || typeof value !== 'string') return null
  if (value.length === 10 && value[4] === '-') return value.slice(5)
  return value
}

export function isDiscountActiveOnDate(discount, dateString) {
  if (!discount || discount.active === false) return false

  const activeFrom = toMonthDay(discount.activeFrom)
  const activeUntil = toMonthDay(discount.activeUntil)
  if (!activeFrom && !activeUntil) return true

  const todayMD = dateString.slice(5)

  if (activeFrom && activeUntil) {
    if (activeFrom <= activeUntil) {
      return todayMD >= activeFrom && todayMD <= activeUntil
    }
    return todayMD >= activeFrom || todayMD <= activeUntil
  }

  if (activeFrom) return todayMD >= activeFrom
  if (activeUntil) return todayMD <= activeUntil
  return false
}

const DAY_MS = 24 * 60 * 60 * 1000

function birthdayOccurrenceUTC(year, month, day) {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const safeDay = Math.min(day, lastDay)
  return Date.UTC(year, month - 1, safeDay)
}

export function isBirthdayDiscountActiveForClient(discount, client, dateString) {
  if (!discount || discount.active === false) return false

  const birthday = client?.birthday
  if (!birthday || typeof birthday !== 'string' || birthday.length < 10) {
    return false
  }

  const month = Number(birthday.slice(5, 7))
  const day = Number(birthday.slice(8, 10))
  if (!month || !day) return false

  const [year, monthIndex, dayOfMonth] = String(dateString).split('-').map(Number)
  if (!year || !monthIndex || !dayOfMonth) return false

  const before = Math.max(0, Number(discount.birthdayDaysBefore) || 0)
  const after = Math.max(0, Number(discount.birthdayDaysAfter) || 0)
  const apptTime = Date.UTC(year, monthIndex - 1, dayOfMonth)

  // Se comparan las tres ocurrencias posibles para cubrir el cambio de año.
  for (const candidateYear of [year - 1, year, year + 1]) {
    const occurrence = birthdayOccurrenceUTC(candidateYear, month, day)
    if (
      apptTime >= occurrence - before * DAY_MS &&
      apptTime <= occurrence + after * DAY_MS
    ) {
      return true
    }
  }

  return false
}

export function getApplicableDiscounts(dateString, serviceIds, discounts, client) {
  const ids = Array.isArray(serviceIds) ? serviceIds : []
  if (ids.length === 0 || !Array.isArray(discounts) || discounts.length === 0) {
    return []
  }

  // Los descuentos no son acumulables: se devuelven todos los candidatos
  // ordenados por mayor porcentaje para que el usuario elija uno.
  return discounts
    .filter((discount) => {
      if (
        !Array.isArray(discount.serviceIds) ||
        !discount.serviceIds.some((sid) => ids.includes(sid))
      ) {
        return false
      }
      return isBirthdayDiscount(discount)
        ? isBirthdayDiscountActiveForClient(discount, client, dateString)
        : isDiscountActiveOnDate(discount, dateString)
    })
    .sort((a, b) => (b.percent || 0) - (a.percent || 0))
}

export function getDefaultDiscount(discounts) {
  const list = Array.isArray(discounts) ? discounts : []
  if (list.length === 0) return null
  // Se preselecciona el de cumpleaños; si no hay, el de mayor porcentaje.
  return list.find(isBirthdayDiscount) || list[0]
}

export function getApplicableDiscount(dateString, serviceIds, discounts, client) {
  return getApplicableDiscounts(dateString, serviceIds, discounts, client)[0] ?? null
}

export function applyDiscountToTotal(total, discount) {
  if (!discount || typeof discount.percent !== 'number') {
    return { subtotal: total, discountAmount: 0, total }
  }
  const discountAmount = Math.round((total * discount.percent) / 100)
  return {
    subtotal: total,
    discountAmount,
    total: total - discountAmount,
  }
}

// Descuentos vigentes para mostrar en la página: los dinámicos activos hoy y
// el de cumpleaños solo si aplica al cliente según sus días de ventana.
export function getVisibleDiscounts(discounts, client, dateString) {
  const list = Array.isArray(discounts) ? discounts : []
  return list
    .filter((discount) => {
      if (!discount || discount.active === false) return false
      if (isBirthdayDiscount(discount)) {
        return isBirthdayDiscountActiveForClient(discount, client, dateString)
      }
      return isDiscountActiveOnDate(discount, dateString)
    })
    .sort((a, b) => {
      const aBirthday = isBirthdayDiscount(a) ? 1 : 0
      const bBirthday = isBirthdayDiscount(b) ? 1 : 0
      if (aBirthday !== bBirthday) return bBirthday - aBirthday
      return (b.percent || 0) - (a.percent || 0)
    })
}

const MONTHS_SHORT = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
]

function formatMonthDay(value) {
  if (!value || typeof value !== 'string') return null
  const monthDay = value.length === 10 && value[4] === '-' ? value.slice(5) : value
  const [month, day] = monthDay.split('-').map(Number)
  if (!month || !day) return null
  return `${day} ${MONTHS_SHORT[month - 1]}`
}

export function describeDiscountValidity(discount) {
  if (isBirthdayDiscount(discount)) {
    const before = Math.max(0, Number(discount.birthdayDaysBefore) || 0)
    const after = Math.max(0, Number(discount.birthdayDaysAfter) || 0)
    const parts = []
    if (before) parts.push(`${before} días antes`)
    if (after) parts.push(`${after} días después`)
    return parts.length
      ? `${parts.join(' y ')} de tu cumpleaños`
      : 'El día de tu cumpleaños'
  }

  const from = formatMonthDay(discount.activeFrom)
  const until = formatMonthDay(discount.activeUntil)
  if (from && until) return `Del ${from} al ${until}`
  if (from) return `Desde el ${from}`
  if (until) return `Hasta el ${until}`
  return 'Disponible'
}
