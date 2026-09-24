const PHONE_STORAGE_KEY = 'benis.phone'

export function getSavedPhone() {
  try {
    return localStorage.getItem(PHONE_STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

export function savePhone(value, remember = false) {
  try {
    if (remember) {
      localStorage.setItem(PHONE_STORAGE_KEY, value)
    } else {
      localStorage.removeItem(PHONE_STORAGE_KEY)
    }
  } catch {
    /* noop */
  }
}

export function isPhoneRemembered() {
  try {
    return Boolean(localStorage.getItem(PHONE_STORAGE_KEY))
  } catch {
    return false
  }
}

export function clearSavedPhone() {
  try {
    localStorage.removeItem(PHONE_STORAGE_KEY)
  } catch {
    /* noop */
  }
}