import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import { db } from './firebase'

const CLIENTS_COLLECTION = 'clients'

export function normalizePhone(value) {
  let digits = (value || '').replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('57')) {
    digits = digits.slice(2)
  }
  return digits
}

// Nombre visible de la clienta: usa el nombre y, si no hay, el celular.
export function clientDisplayName(client) {
  const name = String(client?.name || '').trim()
  if (name) return name
  const phone = normalizePhone(client?.phone)
  return phone || 'Cliente'
}

export async function getClientByPhone(phone) {
  const normalized = normalizePhone(phone)
  if (!normalized) return null

  const q = query(
    collection(db, CLIENTS_COLLECTION),
    where('phone', '==', normalized),
  )
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null

  const first = snapshot.docs[0]
  return { id: first.id, ...first.data() }
}

// Guarda la clienta con el mismo formato que usa el panel admin.
export async function createClient({ name, phone, email, birthday }) {
  const normalized = normalizePhone(phone)
  const nameValue = String(name || '').trim()
  const emailValue = email ? email.trim() : null
  const birthdayValue = birthday || null

  const existing = await getClientByPhone(normalized)
  if (existing) return existing

  const now = new Date().toISOString()
  const ref = await addDoc(collection(db, CLIENTS_COLLECTION), {
    name: nameValue,
    phone: normalized,
    email: emailValue,
    birthday: birthdayValue,
    points: 0,
    active: true,
    createdAt: now,
    updatedAt: now,
  })

  return {
    id: ref.id,
    name: nameValue,
    phone: normalized,
    email: emailValue,
    birthday: birthdayValue,
    points: 0,
    active: true,
    createdAt: now,
    updatedAt: now,
  }
}
