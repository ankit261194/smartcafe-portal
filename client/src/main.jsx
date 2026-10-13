import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { getServerBaseUrl } from './utils/api';
import { LanguageProvider } from './context/LanguageContext';

// Intercept window.fetch for mobile Capacitor and custom server address
const originalFetch = window.fetch;
window.fetch = function(input, init) {
  if (typeof input === 'string' && input.startsWith('/')) {
    const base = getServerBaseUrl();
    if (base) {
      input = `${base}${input}`;
    }
  }
  return originalFetch.call(this, input, init);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>,
);
