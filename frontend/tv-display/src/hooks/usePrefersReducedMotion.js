import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

const read = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia(QUERY).matches;

// Dibaca di JS, bukan hanya di CSS, karena sebagian gerak di layar ini
// membawa konten (teks berjalan). Mematikannya lewat CSS saja akan menghapus
// pengumumannya, jadi komponen perlu tahu preferensinya untuk berganti ke
// penyajian statis.
const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(read);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const mq = window.matchMedia(QUERY);
    const onChange = (e) => setReduced(e.matches);
    // Safari lama hanya punya addListener.
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  return reduced;
};

export default usePrefersReducedMotion;
