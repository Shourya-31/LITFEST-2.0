import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ContactUs from './features/contact/ContactUs'
import SponsorPage from './SponsorPageStandalone'
import { AbyssalExplorer } from './components/underwater/abyssal-explorer'

const path = window.location.pathname.toLowerCase().replace(/\/+$/, "")
const isContactPage = path === '/contact' || path.endsWith('/contactus.html')
const isSponsorPage = path === '/sponsors' || path.endsWith('/sponsors.html')
const isAbyssalPage = path === '/abyssal' || path === '/explorer'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAbyssalPage ? (
      <AbyssalExplorer autoplay onExit={() => { window.location.href = '/'; }} />
    ) : isContactPage ? (
      <ContactUs />
    ) : isSponsorPage ? (
      <SponsorPage />
    ) : (
      <App />
    )}
  </StrictMode>,
)
