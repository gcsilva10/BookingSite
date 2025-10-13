import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { apiGet } from './lib/api'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Validate token on load: if invalid, apiGet will clear tokens and notify
;(async () => {
  const token = localStorage.getItem('access_token')
  if (!token) return
  try {
    await apiGet('/auth/me/')
  } catch {
    // handled in apiGet
  }
})()
