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
    // Si ya había un SW controlando, al activarse uno nuevo recargamos una vez
    // para aplicar la versión fresca (evita ver la app vieja tras un deploy).
    const hadController = Boolean(navigator.serviceWorker.controller)
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || refreshing) return
      refreshing = true
      window.location.reload()
    })

    window.addEventListener('load', () => {
      const base = import.meta.env.BASE_URL
      navigator.serviceWorker
        .register(`${base}serviceWorker.js`, {
          scope: base,
          updateViaCache: 'none',
        })
        .then((registration) => registration.update())
        .catch(() => {})
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
