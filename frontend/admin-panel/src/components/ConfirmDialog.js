import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

const ConfirmContext = createContext(null);

const warningIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolver.current = resolve;
      setState({
        title: options.title || 'Konfirmasi',
        message: options.message || 'Apakah Anda yakin?',
        confirmText: options.confirmText || 'Hapus',
        cancelText: options.cancelText || 'Batal',
        danger: options.danger !== false,
      });
    });
  }, []);

  const close = useCallback((result) => {
    if (resolver.current) resolver.current(result);
    resolver.current = null;
    setState(null);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div className="modal-overlay" onClick={() => close(false)}>
          <div className="modal-dialog" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className={`modal-icon ${state.danger ? 'modal-icon-danger' : ''}`}>{warningIcon}</div>
            <h3 className="modal-title">{state.title}</h3>
            <p className="modal-message">{state.message}</p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => close(false)}>{state.cancelText}</button>
              <button className={`btn ${state.danger ? 'btn-danger' : 'btn-primary'}`} onClick={() => close(true)} autoFocus>
                {state.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
  return ctx;
};
