import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Footer from './components/Footer.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      boxSizing: 'border-box',
    }}>
      <App />
      <Footer />
    </div>
  </StrictMode>,
)
