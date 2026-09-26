import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PublicApp from './public/PublicApp'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PublicApp />
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      const base = import.meta.env.BASE_URL
      navigator.serviceWorker.register(`${base}serviceWorker.js`, { scope: base })
    })
  } else {
    // En desarrollo no cacheamos: evitamos servir módulos viejos (HMR).
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) =>
        registrations.forEach((registration) => registration.unregister()),
      )
      .catch(() => {})
  }
}
