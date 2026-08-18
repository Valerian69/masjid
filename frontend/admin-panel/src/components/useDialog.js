import { useEffect, useRef } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

// Perilaku dialog yang dijanjikan oleh aria-modal, dijalankan sungguhan.
//
// Sebelumnya ConfirmDialog dan WelcomeModal memasang role="dialog" dengan
// aria-modal="true" — janji bahwa sisa halaman tidak aktif — tanpa satu pun
// mekanisme yang menegakkannya: Tab keluar ke belakang overlay, Escape tidak
// menutup, dan fokus tidak pernah kembali ke pemicu. Hook ini yang menutup
// jarak itu, dipakai oleh kedua dialog supaya perilakunya sama.
//
// `open`      : dialog sedang tampil
// `onDismiss` : dipanggil saat Escape ditekan
// `initialRef`: elemen yang mendapat fokus saat dialog terbuka
const useDialog = ({ open, onDismiss, initialRef }) => {
  const dialogRef = useRef(null);
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    if (!open) return undefined;

    // Simpan pemicunya supaya fokus bisa dikembalikan saat dialog ditutup.
    const previouslyFocused = document.activeElement;

    // Fokus awal jatuh ke aksi yang aman, bukan aksi yang merusak.
    const focusTarget = initialRef?.current || dialogRef.current;
    focusTarget?.focus?.();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        dismissRef.current?.();
        return;
      }

      if (e.key !== 'Tab') return;

      const root = dialogRef.current;
      if (!root) return;
      const items = Array.from(root.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (items.length === 0) {
        e.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (!root.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [open, initialRef]);

  return dialogRef;
};

export default useDialog;
