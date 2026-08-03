import React from 'react';

const defaultIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="40" height="40">
    <path d="M22 12h-6l-2 3h-4l-2-3H2"/>
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
);

const EmptyState = ({ icon, title = 'Belum ada data', message, action }) => (
  <div className="empty-state">
    <div className="empty-state-icon">{icon || defaultIcon}</div>
    <h3 className="empty-state-title">{title}</h3>
    {message && <p className="empty-state-message">{message}</p>}
    {action && <div className="empty-state-action">{action}</div>}
  </div>
);

export default EmptyState;
