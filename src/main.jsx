import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/** After a new deploy, stale index.html can reference deleted chunks; reload once per tab session. */
const CHUNK_RELOAD_KEY = 'gx_chunk_reload_done'

function isChunkLoadFailureMessage(text) {
  if (!text || typeof text !== 'string') return false
  return (
    text.includes('Failed to fetch dynamically imported module') ||
    text.includes('Importing a module script failed') ||
    text.includes('Loading chunk') ||
    text.includes('ChunkLoadError') ||
    text.includes('error loading dynamically imported module')
  )
}

function installChunkLoadRecovery() {
  const tryReload = () => {
    try {
      if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) return
      sessionStorage.setItem(CHUNK_RELOAD_KEY, '1')
    } catch {
      return
    }
    window.location.reload()
  }

  window.addEventListener('error', (event) => {
    const msg = event?.message || ''
    if (isChunkLoadFailureMessage(msg)) tryReload()
  })

  window.addEventListener('unhandledrejection', (event) => {
    const r = event?.reason
    const msg = r?.message != null ? String(r.message) : String(r || '')
    if (!isChunkLoadFailureMessage(msg)) return
    event.preventDefault()
    tryReload()
  })
}

installChunkLoadRecovery()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
