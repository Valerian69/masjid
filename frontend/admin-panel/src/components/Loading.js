import React from 'react';

const Loading = ({ text = 'Memuat data...' }) => (
  <div className="loading-state" role="status" aria-live="polite">
    <span className="spinner" />
    <span className="loading-text">{text}</span>
  </div>
);

export default Loading;
