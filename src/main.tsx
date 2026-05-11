import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for PWA support
try {
  registerSW({ 
    immediate: true,
    onRegisterError(error) {
      console.error('SW registration error', error);
    }
  });
} catch (e) {
  console.warn('PWA registration skipped or failed', e);
}

console.log('App initializing...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find root element');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
