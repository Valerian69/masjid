import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

// Berapa frame menunggu target muncul sebelum menyerah. Form yang baru dibuka
// butuh satu tick untuk terpasang; 10 frame (±160 ms) cukup longgar tanpa
// terasa menggantung.
const MAX_FRAMES = 10;

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));

const toArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

// Satu-satunya bagian fitur ini yang menyentuh DOM halaman. Menyetir tampilan
// lebih dulu bila langkahnya meminta, lalu mengukur targetnya.
const useTourTarget = (step, active) => {
  const [rect, setRect] = useState(null);

  const measureOnly = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(step.target);
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height, right: r.right, bottom: r.bottom });
  }, [step]);

  // Dipetakan sebagai const bernama di luar effect: array dependency yang
  // berupa ekspresi (mis. JSON.stringify(...) langsung di dalam larik) hanya
  // "aman" karena ESLint proyek ini belum menyalakan exhaustive-deps. Kalau
  // aturan itu dinyalakan nanti, ekspresi inline akan dianggap dependency baru
  // di setiap render dan memicu re-run terus-menerus.
  const openWithKey = JSON.stringify(step?.openWith);
  const revealWithKey = JSON.stringify(step?.revealWith);

  useLayoutEffect(() => {
    if (!active || !step) {
      setRect(null);
      return undefined;
    }

    let cancelled = false;

    const run = async () => {
      // Buka jalan menuju target: klik tiap selector openWith berurutan, beri
      // satu frame di antaranya supaya React sempat merender hasilnya. Ini
      // untuk pembuka yang idempoten (tab dsb) — aman diklik walau tujuannya
      // sudah aktif.
      for (const selector of toArray(step.openWith)) {
        if (cancelled) return;
        const opener = document.querySelector(selector);
        if (opener) opener.click();
        await nextFrame();
      }

      // revealWith: toggle pembuka (mis. tombol "Tambah ..."). Diklik hanya
      // bila targetnya belum ada di DOM — sebab tombolnya membalik status
      // (setShowForm(!showForm)), mengkliknya saat target sudah tampil justru
      // menutupnya lagi. Diperiksa setelah openWith supaya pemeriksaan "sudah
      // ada belum" memakai tab/tampilan yang sudah benar, bukan yang lama.
      if (step.revealWith && !document.querySelector(step.target)) {
        for (const selector of toArray(step.revealWith)) {
          if (cancelled) return;
          const opener = document.querySelector(selector);
          if (opener) opener.click();
          await nextFrame();
        }
      }

      for (let i = 0; i < MAX_FRAMES; i += 1) {
        if (cancelled) return;
        const el = document.querySelector(step.target);
        if (el) {
          el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          await nextFrame();
          if (cancelled) return;
          const r = el.getBoundingClientRect();
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height, right: r.right, bottom: r.bottom });
          return;
        }
        await nextFrame();
      }

      // Menyerah: null berarti tooltip tampil di tengah tanpa sorotan, bukan
      // langkah yang hilang diam-diam.
      if (!cancelled) setRect(null);
    };

    setRect(null);
    run();

    return () => { cancelled = true; };
    // Key on step contents (target + openWith + revealWith) not identity: if parent
    // passes a new object with identical contents, we should not re-run the entire
    // click sequence. Re-clicking a toggle like "Transaksi Baru" closes the form the
    // tour just opened.
  }, [active, step?.target, openWithKey, revealWithKey]);

  // Sorotan harus ikut bergerak saat halaman digulir atau jendela diubah.
  useEffect(() => {
    if (!active) return undefined;
    const onChange = () => measureOnly();
    window.addEventListener('resize', onChange);
    window.addEventListener('scroll', onChange, true);
    return () => {
      window.removeEventListener('resize', onChange);
      window.removeEventListener('scroll', onChange, true);
    };
  }, [active, measureOnly]);

  return rect;
};

export default useTourTarget;
