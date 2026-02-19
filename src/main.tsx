import * as buffer from 'buffer'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Providers } from './providers'
import './index.css'
import App from './App.tsx'

// Polyfill Buffer for browser - must be at the top before any Solana libraries load
window.Buffer = window.Buffer || buffer.Buffer

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
)
