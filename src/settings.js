import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase'

const SETTINGS_COLLECTION = 'settings'
const SCHEDULE_DOC = 'schedule'

export const DEFAULT_SCHEDULE = {
  openTime: '09:00',
  closeTime: '19:00',
  slotStep: 0,
  daysAhead: 3,
  adminPhone: '',
}

export async function getSchedule() {
  const ref = doc(db, SETTINGS_COLLECTION, SCHEDULE_DOC)
  const snapshot = await getDoc(ref)
  if (!snapshot.exists()) return { ...DEFAULT_SCHEDULE }
  return { ...DEFAULT_SCHEDULE, ...snapshot.data() }
}

let cachedSchedule = null
let schedulePromise = null

export function getScheduleCached() {
  if (cachedSchedule) return Promise.resolve(cachedSchedule)
  if (!schedulePromise) {
    schedulePromise = getSchedule()
      .then((data) => {
        cachedSchedule = data
        return data
      })
      .catch((err) => {
        schedulePromise = null
        throw err
      })
  }
  return schedulePromise
}

export async function saveSchedule({ openTime, closeTime, slotStep, daysAhead }) {
  await setDoc(doc(db, SETTINGS_COLLECTION, SCHEDULE_DOC), {
    openTime,
    closeTime,
    slotStep,
    daysAhead,
    updatedAt: new Date().toISOString(),
  })
}
