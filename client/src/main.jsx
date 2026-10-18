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

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('RootErrorBoundary caught:', error, errorInfo);
  }
  handleReset = () => {
    try {
      localStorage.removeItem('selected_tab');
      localStorage.removeItem('active_tool_id');
      sessionStorage.removeItem('active_mode');
      window.location.href = '/';
    } catch(e) {
      window.location.reload();
    }
  };
  handleFullReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    } catch(e) {
      window.location.reload();
    }
  };
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '32px 24px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🇮🇳</div>
            <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '8px' }}>
              Smart Cafe डिजिटल सेवा केंद्र
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.5 }}>
              पोर्टल को सुरक्षित रूप से पुनः लोड करने के लिए नीचे दिए गए बटन पर क्लिक करें।
            </p>
            {this.state.error && (
              <pre id="root-error-text" style={{ fontSize: '11px', color: '#f87171', background: 'rgba(0,0,0,0.6)', padding: '12px', borderRadius: '8px', textAlign: 'left', overflow: 'auto', maxHeight: '200px', marginBottom: '16px', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                {this.state.error.stack || this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  background: 'linear-gradient(to right, #f97316, #ea580c)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontWeight: 900,
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(234, 88, 12, 0.4)'
                }}
              >
                🔄 पोर्टल लोड करें (Reload)
              </button>
              <button
                onClick={this.handleFullReset}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '12px 18px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                🧹 कैश साफ़ कर रीसेट करें
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </RootErrorBoundary>
  </React.StrictMode>,
);
