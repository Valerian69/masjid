const fs = require('fs');
const path = require('path');
const { pageTours, getPageTour, pageTourLabel } = require('./pageTours');

const PAGES_DIR = path.join(__dirname, '..', '..', 'pages');

// Peta rute -> berkas yang benar-benar merender markup rute itu. Eksplisit,
// bukan diturunkan otomatis dari nama rute, supaya tetap benar walau nama
// berkas dan nama rute berbeda (mis. '/' -> Dashboard.js). Untuk Keuangan,
// tiap tab hidup di sub-komponennya sendiri di pages/keuangan/.
const ROUTE_FILES = {
  '/': ['Dashboard.js'],
  '/jadwal-sholat': ['JadwalSholat.js'],
  '/kajian': ['Kajian.js'],
  '/keuangan': [
    'Keuangan.js',
    'keuangan/KeuanganDashboard.js',
    'keuangan/KeuanganTransaksi.js',
    'keuangan/KeuanganLaporan.js',
    'keuangan/TransaksiForm.js',
    'keuangan/constants.js',
  ],
  '/agenda': ['Agenda.js'],
  '/running-text': ['RunningText.js'],
  '/laporan': ['Laporan.js'],
  '/settings': ['Settings.js'],
  '/monitoring': ['Monitoring.js'],
  '/users': ['Users.js'],
};

const readFile = (relPath) => fs.readFileSync(path.join(PAGES_DIR, relPath), 'utf8');

// Sumber markup milik satu rute saja — bukan seluruh pages/ digabung jadi
// satu string. Itu yang membuat test ini berarti: sebuah selector yang cocok
// hanya karena ada di berkas rute LAIN sekarang gagal, bukan lolos diam-diam.
const readRouteSource = (route) => (ROUTE_FILES[route] || []).map(readFile).join('\n');

// Seluruh sumber halaman digabung — dipakai khusus untuk memeriksa atribut
// data-tour yang tidak dirujuk oleh langkah manapun (lihat describe di bawah).
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
  if (step.revealWith) list.push(...(Array.isArray(step.revealWith) ? step.revealWith : [step.revealWith]));
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

describe('pageTours — selector cocok dengan markup rutenya sendiri', () => {
  it('setiap data-tour yang dirujuk (target, openWith, revealWith) benar-benar ada di berkas rute itu', () => {
    const missing = [];
    Object.entries(pageTours).forEach(([route, steps]) => {
      const source = readRouteSource(route);
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

  it('tidak ada atribut data-tour di halaman yang tidak dirujuk oleh langkah manapun', () => {
    const source = readAllPageSources();
    const referenced = new Set();
    Object.values(pageTours).forEach((steps) => {
      steps.forEach((step) => selectorsOf(step).forEach((sel) => referenced.add(keyOf(sel))));
    });

    const found = [...source.matchAll(/data-tour="([a-z0-9-]+)"/g)].map((m) => m[1]);
    const orphans = [...new Set(found)].filter((key) => !referenced.has(key));
    expect(orphans).toEqual([]);
  });
});

describe('pageTours — cakupan rute', () => {
  const SIDEBAR_ROUTES = [
    '/', '/jadwal-sholat', '/kajian', '/keuangan', '/agenda',
    '/running-text', '/laporan', '/settings', '/monitoring', '/users',
  ];

  it('setiap rute bermenu punya tur halaman', () => {
    SIDEBAR_ROUTES.forEach((route) => {
      expect(getPageTour(route, 'superadmin').length).toBeGreaterThan(0);
    });
  });

  it('rute tanpa tur mengembalikan larik kosong dan label null', () => {
    expect(getPageTour('/panduan', 'superadmin')).toEqual([]);
    expect(pageTourLabel('/panduan')).toBeNull();
  });

  it('label halaman tersedia untuk tiap rute bermenu', () => {
    SIDEBAR_ROUTES.forEach((route) => {
      expect(typeof pageTourLabel(route)).toBe('string');
    });
  });

  it('trailing slash tetap cocok dengan rute yang sama', () => {
    expect(getPageTour('/keuangan/', 'superadmin').length).toBe(getPageTour('/keuangan', 'superadmin').length);
    expect(pageTourLabel('/keuangan/')).toBe(pageTourLabel('/keuangan'));
  });
});

describe('pageTours — penggerbangan peran', () => {
  it('langkah tanpa `roles` tampil untuk semua peran', () => {
    const step = pageTours['/jadwal-sholat'][0];
    expect(step.roles).toBeUndefined();
    ['superadmin', 'takmir', 'bendahara', 'marbot', undefined].forEach((role) => {
      expect(getPageTour('/jadwal-sholat', role)).toContainEqual(step);
    });
  });

  it('langkah form Keuangan hanya tampil untuk superadmin dan bendahara', () => {
    const steps = getPageTour('/keuangan', 'takmir');
    expect(steps.find((s) => s.target === '[data-tour="keu-form"]')).toBeUndefined();
    expect(getPageTour('/keuangan', 'bendahara').find((s) => s.target === '[data-tour="keu-form"]')).toBeDefined();
  });

  it('langkah mon-danger hanya tampil untuk superadmin', () => {
    expect(getPageTour('/monitoring', 'takmir').find((s) => s.target === '[data-tour="mon-danger"]')).toBeUndefined();
    expect(getPageTour('/monitoring', 'superadmin').find((s) => s.target === '[data-tour="mon-danger"]')).toBeDefined();
  });
});
