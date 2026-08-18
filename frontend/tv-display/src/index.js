import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AppErrorBoundary from './components/AppErrorBoundary';
import { ClockProvider } from './hooks/useClock';
import './styles/global.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppErrorBoundary>
      <ClockProvider>
        <App />
      </ClockProvider>
    </AppErrorBoundary>
  </React.StrictMode>
);
