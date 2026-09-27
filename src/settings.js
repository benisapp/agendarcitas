import { doc, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'

const SETTINGS_COLLECTION = 'settings'
const SCHEDULE_DOC = 'schedule'

export const DEFAULT_SCHEDULE = {
  openTime: '09:00',
  closeTime: '19:00',
  slotStep: 0,
  calendarStep: 30,
  daysAhead: 3,
  restDay: 0,
  adminPhone: '',
}

// Suscripción en tiempo real a la configuración: si la administradora cambia
// el horario, la app de clientas lo refleja sin recargar.
export function watchSchedule(onData, onError) {
  const ref = doc(db, SETTINGS_COLLECTION, SCHEDULE_DOC)
  return onSnapshot(
    ref,
    (snapshot) => {
      onData(
        snapshot.exists()
          ? { ...DEFAULT_SCHEDULE, ...snapshot.data() }
          : { ...DEFAULT_SCHEDULE },
      )
    },
    onError,
  )
}
