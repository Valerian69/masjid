const fs = require('fs');
const path = require('path');
const { pageTours, getPageTour, pageTourLabel } = require('./pageTours');

const PAGES_DIR = path.join(__dirname, '..', '..', 'pages');

// Seluruh sumber halaman digabung jadi satu string; cukup untuk memastikan
// sebuah data-tour benar-benar ada di markup.
const readAllPageSources = () => {
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.js')) files.push(full);
    }
  };
  walk(PAGES_DIR);
  return files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
};

const selectorsOf = (step) => {
  const list = [step.target];
  if (step.openWith) list.push(...(Array.isArray(step.openWith) ? step.openWith : [step.openWith]));
  return list;
};

// '[data-tour="keu-export"]' -> 'keu-export'
const keyOf = (selector) => selector.replace(/^\[data-tour="/, '').replace(/"\]$/, '');

// Nilai data-tour yang dihasilkan template literal di Keuangan.js, ditulis
// eksplisit karena pencocokan awalan akan meloloskan akhiran yang salah ketik.
const TEMPLATE_KEYS = ['keu-tab-dashboard', 'keu-tab-transaksi', 'keu-tab-laporan'];

describe('pageTours — bentuk data', () => {
  it('setiap langkah punya target, judul, dan isi', () => {
    Object.values(pageTours).forEach((steps) => {
      expect(Array.isArray(steps)).toBe(true);
      expect(steps.length).toBeGreaterThan(0);
      steps.forEach((step) => {
        expect(typeof step.target).toBe('string');
        expect(step.target).toMatch(/^\[data-tour="[a-z0-9-]+"\]$/);
        expect(step.title.length).toBeGreaterThan(0);
        expect(step.body.length).toBeGreaterThan(0);
      });
    });
  });

  it('total langkah halaman berjumlah 37', () => {
    const total = Object.values(pageTours).reduce((n, steps) => n + steps.length, 0);
    expect(total).toBe(37);
  });
});

describe('pageTours — selector cocok dengan markup', () => {
  it('setiap data-tour yang dirujuk benar-benar ada di berkas halaman', () => {
    const source = readAllPageSources();
    const missing = [];
    Object.entries(pageTours).forEach(([route, steps]) => {
      steps.forEach((step) => {
        selectorsOf(step).forEach((sel) => {
          const key = keyOf(sel);
          const literal = `data-tour="${key}"`;
          if (!source.includes(literal) && !TEMPLATE_KEYS.includes(key)) {
            missing.push(`${route}: ${key}`);
          }
        });
      });
    });
    expect(missing).toEqual([]);
  });
});

describe('pageTours — cakupan rute', () => {
  const SIDEBAR_ROUTES = [
    '/', '/jadwal-sholat', '/kajian', '/keuangan', '/agenda',
    '/running-text', '/laporan', '/settings', '/monitoring', '/users',
  ];

  it('setiap rute bermenu punya tur halaman', () => {
    SIDEBAR_ROUTES.forEach((route) => {
      expect(getPageTour(route).length).toBeGreaterThan(0);
    });
  });

  it('rute tanpa tur mengembalikan larik kosong dan label null', () => {
    expect(getPageTour('/panduan')).toEqual([]);
    expect(pageTourLabel('/panduan')).toBeNull();
  });

  it('label halaman tersedia untuk tiap rute bermenu', () => {
    SIDEBAR_ROUTES.forEach((route) => {
      expect(typeof pageTourLabel(route)).toBe('string');
    });
  });
});
