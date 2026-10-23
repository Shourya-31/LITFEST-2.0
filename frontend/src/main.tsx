import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './index.css';
import './styles/theme.css';
import './styles/timeline.css';
import './styles/faq.css';
import './styles/app.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
