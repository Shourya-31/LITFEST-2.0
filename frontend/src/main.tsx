import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ContactUs from './features/contact/ContactUs'
import SponsorPage from './SponsorPageStandalone'

const path = window.location.pathname.toLowerCase().replace(/\/+$/, "")
const isContactPage = path === '/contact' || path.endsWith('/contactus.html')
const isSponsorPage = path === '/sponsors' || path.endsWith('/sponsors.html')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isContactPage ? <ContactUs /> : isSponsorPage ? <SponsorPage /> : <App />}
  </StrictMode>,
)
