const PHONE_STORAGE_KEY = 'benis.phone'

export function getSavedPhone() {
  try {
    return localStorage.getItem(PHONE_STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

export function savePhone(value) {
  try {
    localStorage.setItem(PHONE_STORAGE_KEY, value)
  } catch {
    /* noop */
  }
}
