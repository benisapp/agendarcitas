import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './firebase'
import { sanitizeAppointmentAddons } from './utils/appointmentServices'

export const APPOINTMENT_STATUS = {
  CONFIRMED: 'confirmed',
  ATTENDED: 'attended',
  MISSED: 'missed',
  CANCELLED: 'cancelled',
}

const APPOINTMENTS_COLLECTION = 'appointments'

const toAppointment = (snapshot) => ({
  id: snapshot.id,
  ...snapshot.data(),
})

export async function getAppointmentsByDate(date) {
  const q = query(
    collection(db, APPOINTMENTS_COLLECTION),
    where('date', '==', date),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(toAppointment)
}

export async function getAppointmentsByRange(startDate, endDate) {
  const q = query(
    collection(db, APPOINTMENTS_COLLECTION),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(toAppointment)
}

export async function getAppointmentsByClient(clientId) {
  const q = query(
    collection(db, APPOINTMENTS_COLLECTION),
    where('clientId', '==', clientId),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(toAppointment)
}

export async function updateAppointmentStatus(id, status) {
  await updateDoc(doc(db, APPOINTMENTS_COLLECTION, id), {
    status,
    updatedAt: new Date().toISOString(),
  })
}

export async function updateAppointment(
  id,
  { clientId, serviceIds, date, startTime, endTime, addons },
) {
  const ids = Array.isArray(serviceIds) ? serviceIds : []
  const addonList = sanitizeAppointmentAddons(addons)
  await updateDoc(doc(db, APPOINTMENTS_COLLECTION, id), {
    clientId,
    serviceIds: ids,
    date,
    startTime,
    endTime,
    addons: addonList,
    updatedAt: new Date().toISOString(),
  })
}

export async function createAppointment({
  clientId,
  serviceIds,
  date,
  startTime,
  endTime,
  addons,
  discountId,
  discountTitle,
  discountPercent,
}) {
  const now = new Date().toISOString()
  const ids = Array.isArray(serviceIds) && serviceIds.length ? serviceIds : []
  const addonList = sanitizeAppointmentAddons(addons)

  const ref = await addDoc(collection(db, APPOINTMENTS_COLLECTION), {
    clientId,
    serviceIds: ids,
    date,
    startTime,
    endTime,
    addons: addonList,
    discountId: discountId || null,
    discountTitle: discountTitle || null,
    discountPercent: discountPercent ?? null,
    status: APPOINTMENT_STATUS.CONFIRMED,
    createdAt: now,
    updatedAt: now,
  })

  return {
    id: ref.id,
    clientId,
    serviceIds: ids,
    date,
    startTime,
    endTime,
    addons: addonList,
    discountId: discountId || null,
    discountTitle: discountTitle || null,
    discountPercent: discountPercent ?? null,
    status: APPOINTMENT_STATUS.CONFIRMED,
    createdAt: now,
    updatedAt: now,
  }
}
