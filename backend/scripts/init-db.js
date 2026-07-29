const db = require('../database');
const bcrypt = require('bcryptjs');

const initDatabase = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('superadmin', 'takmir', 'bendahara', 'marbot')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Jadwal Sholat
  db.exec(`
    CREATE TABLE IF NOT EXISTS jadwal_sholat (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama_sholat TEXT NOT NULL,
      waktu TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Kajian
  db.exec(`
    CREATE TABLE IF NOT EXISTS kajian (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      judul TEXT NOT NULL,
      ustadz TEXT NOT NULL,
      tanggal TEXT NOT NULL,
      jam_mulai TEXT NOT NULL,
      jam_selesai TEXT,
      deskripsi TEXT,
      is_recurring INTEGER DEFAULT 0,
      recurring_day TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Keuangan
  db.exec(`
    CREATE TABLE IF NOT EXISTS keuangan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tanggal TEXT NOT NULL,
      jenis TEXT NOT NULL CHECK(jenis IN ('masuk', 'keluar')),
      kategori TEXT NOT NULL,
      deskripsi TEXT,
      jumlah REAL NOT NULL,
      bukti_path TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Agenda
  db.exec(`
    CREATE TABLE IF NOT EXISTS agenda (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      judul TEXT NOT NULL,
      tanggal TEXT NOT NULL,
      jam_mulai TEXT,
      jam_selesai TEXT,
      deskripsi TEXT,
      lokasi TEXT,
      is_published INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Running Text
  db.exec(`
    CREATE TABLE IF NOT EXISTS running_text (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teks TEXT NOT NULL,
      jenis TEXT NOT NULL CHECK(jenis IN ('pengumuman', 'infaq', 'info')),
      is_active INTEGER DEFAULT 1,
      urutan INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Settings
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Audit log
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      table_name TEXT NOT NULL,
      record_id INTEGER,
      old_value TEXT,
      new_value TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Insert default admin user
  const existingAdmin = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!existingAdmin) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)').run(
      'admin', hashedPassword, 'Super Admin', 'superadmin'
    );
  }

  // Insert default settings
  const defaultSettings = [
    { key: 'masjid_name', value: 'Masjid Al-Hikmah' },
    { key: 'masjid_address', value: '' },
    { key: 'latitude', value: '-6.2088' },
    { key: 'longitude', value: '106.8456' },
    { key: 'timezone', value: 'Asia/Jakarta' },
    { key: 'metode_kalkulasi', value: 'kementerian' },
  ];

  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  defaultSettings.forEach(s => insertSetting.run(s.key, s.value));

  // Insert default jadwal sholat
  const existingSholat = db.prepare('SELECT COUNT(*) as count FROM jadwal_sholat').get();
  if (existingSholat.count === 0) {
    const insertSholat = db.prepare('INSERT INTO jadwal_sholat (nama_sholat, waktu) VALUES (?, ?)');
    const defaultJadwal = [
      ['Subuh', '04:30'],
      ['Dzuhur', '12:00'],
      ['Ashar', '15:15'],
      ['Maghrib', '18:00'],
      ['Isya', '19:15'],
    ];
    defaultJadwal.forEach(j => insertSholat.run(j[0], j[1]));
  }

  console.log('Database initialized successfully');
};

initDatabase();