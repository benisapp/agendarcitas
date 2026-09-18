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
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/agendarcitas/serviceWorker.js', { scope: '/agendarcitas/' })
  })
}
