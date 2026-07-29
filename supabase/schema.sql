-- ============================================
-- Masjid Dashboard - Supabase Schema
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'marbot' CHECK (role IN ('superadmin', 'takmir', 'bendahara', 'marbot')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Jadwal Sholat table
CREATE TABLE IF NOT EXISTS jadwal_sholat (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_sholat TEXT NOT NULL,
  waktu TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Kajian table
CREATE TABLE IF NOT EXISTS kajian (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  judul TEXT NOT NULL,
  ustadz TEXT NOT NULL,
  tanggal DATE NOT NULL,
  jam_mulai TEXT NOT NULL,
  jam_selesai TEXT,
  deskripsi TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurring_day TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Keuangan table
CREATE TABLE IF NOT EXISTS keuangan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tanggal DATE NOT NULL,
  jenis TEXT NOT NULL CHECK (jenis IN ('masuk', 'keluar')),
  kategori TEXT NOT NULL,
  deskripsi TEXT,
  jumlah NUMERIC(15,2) NOT NULL,
  metode_pembayaran TEXT DEFAULT 'cash' CHECK (metode_pembayaran IN ('cash', 'transfer', 'e-wallet')),
  penerima TEXT,
  no_ref TEXT,
  catatan TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Agenda table
CREATE TABLE IF NOT EXISTS agenda (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  judul TEXT NOT NULL,
  tanggal DATE NOT NULL,
  jam_mulai TEXT,
  jam_selesai TEXT,
  deskripsi TEXT,
  lokasi TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Running Text table
CREATE TABLE IF NOT EXISTS running_text (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teks TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Audit Log table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Laporan table
CREATE TABLE IF NOT EXISTS laporan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  judul TEXT NOT NULL,
  tanggal DATE NOT NULL,
  isi TEXT NOT NULL,
  kategori TEXT NOT NULL CHECK (kategori IN ('renovasi', 'sosial', 'edukasi', 'umum')),
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for better performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_keuangan_tanggal ON keuangan(tanggal);
CREATE INDEX IF NOT EXISTS idx_keuangan_jenis ON keuangan(jenis);
CREATE INDEX IF NOT EXISTS idx_keuangan_kategori ON keuangan(kategori);
CREATE INDEX IF NOT EXISTS idx_keuangan_status ON keuangan(status);
CREATE INDEX IF NOT EXISTS idx_kajian_tanggal ON kajian(tanggal);
CREATE INDEX IF NOT EXISTS idx_agenda_tanggal ON agenda(tanggal);
CREATE INDEX IF NOT EXISTS idx_laporan_tanggal ON laporan(tanggal);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jadwal_sholat ENABLE ROW LEVEL SECURITY;
ALTER TABLE kajian ENABLE ROW LEVEL SECURITY;
ALTER TABLE keuangan ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE running_text ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE laporan ENABLE ROW LEVEL SECURITY;

-- Allow anon read access (for public API)
CREATE POLICY "Allow public read" ON jadwal_sholat FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON kajian FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON agenda FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON running_text FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON laporan FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON settings FOR SELECT USING (true);

-- Allow authenticated full access (backend uses service role to bypass RLS)
CREATE POLICY "Allow authenticated full access" ON users FOR ALL USING (true);
CREATE POLICY "Allow authenticated full access" ON keuangan FOR ALL USING (true);
CREATE POLICY "Allow authenticated full access" ON audit_log FOR ALL USING (true);
CREATE POLICY "Allow authenticated full access" ON jadwal_sholat FOR ALL USING (true);
CREATE POLICY "Allow authenticated full access" ON kajian FOR ALL USING (true);
CREATE POLICY "Allow authenticated full access" ON agenda FOR ALL USING (true);
CREATE POLICY "Allow authenticated full access" ON running_text FOR ALL USING (true);
CREATE POLICY "Allow authenticated full access" ON settings FOR ALL USING (true);
CREATE POLICY "Allow authenticated full access" ON laporan FOR ALL USING (true);
