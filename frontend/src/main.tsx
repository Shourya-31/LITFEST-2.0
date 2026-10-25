import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import ContactUs from './features/contact/ContactUs';
import SponsorPage from './SponsorPageStandalone';
import './index.css';
import './styles/theme.css';
import './styles/timeline.css';
import './styles/faq.css';
import './styles/app.css';

const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
const isContactPage = path === '/contact' || path.endsWith('/contactus.html');
const isSponsorPage = path === '/sponsors' || path.endsWith('/sponsors.html');
const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      {isContactPage ? <ContactUs /> : isSponsorPage ? <SponsorPage /> : <App />}
    </StrictMode>,
  );
}
