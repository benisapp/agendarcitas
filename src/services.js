import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'

const SERVICES_COLLECTION = 'services'

const toService = (snapshot) => ({
  id: snapshot.id,
  ...snapshot.data(),
})

export async function fetchServices() {
  const snapshot = await getDocs(collection(db, SERVICES_COLLECTION))
  return snapshot.docs.map(toService)
}

// El servicio se muestra a las clientas salvo que esté marcado como solo admin.
export function isServiceVisibleToClients(service) {
  return service?.adminOnly !== true
}

function toMonthDay(value) {
  if (!value || typeof value !== 'string') return null
  if (value.length === 10 && value[4] === '-') return value.slice(5)
  return value
}

export function isServiceAvailable(service, dateString) {
  if (service.active !== false) return true

  const activeFrom = toMonthDay(service.activeFrom)
  const activeUntil = toMonthDay(service.activeUntil)
  if (!activeFrom && !activeUntil) return false

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
