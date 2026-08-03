const express = require('express');
const PDFDocument = require('pdfkit');
const { dbHelpers } = require('../database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { start_date, end_date, jenis, kategori, metode, status, search } = req.query;
    let data = await dbHelpers.findAll('keuangan');

    if (start_date) data = data.filter(d => d.tanggal >= start_date);
    if (end_date) data = data.filter(d => d.tanggal <= end_date);
    if (jenis) data = data.filter(d => d.jenis === jenis);
    if (kategori) data = data.filter(d => d.kategori === kategori);
    if (metode) data = data.filter(d => d.metode_pembayaran === metode);
    if (status) data = data.filter(d => d.status === status);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(d =>
        (d.deskripsi && d.deskripsi.toLowerCase().includes(q)) ||
        (d.penerima && d.penerima.toLowerCase().includes(q)) ||
        (d.catatan && d.catatan.toLowerCase().includes(q)) ||
        (d.kategori && d.kategori.toLowerCase().includes(q)) ||
        (d.no_ref && d.no_ref.toLowerCase().includes(q))
      );
    }

    data.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get keuangan', detail: err.message });
  }
});

router.get('/public', async (req, res) => {
  try {
    const data = (await dbHelpers.findAll('keuangan')).filter(d => d.status !== 'cancelled');
    const saldo = data.reduce((sum, d) => sum + (d.jenis === 'masuk' ? d.jumlah : -d.jumlah), 0);
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const totalInfaq = data.filter(d => d.jenis === 'masuk' && d.kategori === 'Infaq' && d.tanggal.startsWith(thisMonth)).reduce((sum, d) => sum + d.jumlah, 0);
    res.json({ saldo, total_infaq_bulan: totalInfaq });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get public keuangan', detail: err.message });
  }
});

router.get('/summary', auth, async (req, res) => {
  try {
    const data = (await dbHelpers.findAll('keuangan')).filter(d => d.status !== 'cancelled');
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

    const totalMasuk = data.filter(d => d.jenis === 'masuk').reduce((sum, d) => sum + d.jumlah, 0);
    const totalKeluar = data.filter(d => d.jenis === 'keluar').reduce((sum, d) => sum + d.jumlah, 0);
    const bulanIniMasuk = data.filter(d => d.jenis === 'masuk' && d.tanggal.startsWith(thisMonth)).reduce((sum, d) => sum + d.jumlah, 0);
    const bulanIniKeluar = data.filter(d => d.jenis === 'keluar' && d.tanggal.startsWith(thisMonth)).reduce((sum, d) => sum + d.jumlah, 0);
    const bulanLaluMasuk = data.filter(d => d.jenis === 'masuk' && d.tanggal.startsWith(lastMonthStr)).reduce((sum, d) => sum + d.jumlah, 0);
    const bulanLaluKeluar = data.filter(d => d.jenis === 'keluar' && d.tanggal.startsWith(lastMonthStr)).reduce((sum, d) => sum + d.jumlah, 0);
    const jumlahTransaksi = data.filter(d => d.tanggal.startsWith(thisMonth)).length;

    res.json({
      total_masuk: totalMasuk,
      total_keluar: totalKeluar,
      saldo: totalMasuk - totalKeluar,
      bulan_ini_masuk: bulanIniMasuk,
      bulan_ini_keluar: bulanIniKeluar,
      bulan_lalu_masuk: bulanLaluMasuk,
      bulan_lalu_keluar: bulanLaluKeluar,
      jumlah_transaksi_bulan: jumlahTransaksi,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get summary', detail: err.message });
  }
});

router.get('/monthly-trend', auth, async (req, res) => {
  try {
    const data = (await dbHelpers.findAll('keuangan')).filter(d => d.status !== 'cancelled');
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
      const masuk = data.filter(x => x.jenis === 'masuk' && x.tanggal.startsWith(prefix)).reduce((s, x) => s + x.jumlah, 0);
      const keluar = data.filter(x => x.jenis === 'keluar' && x.tanggal.startsWith(prefix)).reduce((s, x) => s + x.jumlah, 0);
      months.push({ label, masuk, keluar });
    }

    res.json(months);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get monthly trend', detail: err.message });
  }
});

router.get('/category-breakdown', auth, async (req, res) => {
  try {
    const data = (await dbHelpers.findAll('keuangan')).filter(d => d.status !== 'cancelled');
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthData = data.filter(d => d.tanggal.startsWith(thisMonth));

    const masuk = {};
    const keluar = {};
    monthData.forEach(d => {
      if (d.jenis === 'masuk') {
        masuk[d.kategori] = (masuk[d.kategori] || 0) + d.jumlah;
      } else {
        keluar[d.kategori] = (keluar[d.kategori] || 0) + d.jumlah;
      }
    });

    const sorted = (obj) => Object.entries(obj)
      .map(([kategori, jumlah]) => ({ kategori, jumlah }))
      .sort((a, b) => b.jumlah - a.jumlah);

    res.json({ masuk: sorted(masuk), keluar: sorted(keluar) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get category breakdown', detail: err.message });
  }
});

router.get('/report', auth, async (req, res) => {
  try {
    const { year, month } = req.query;
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    const data = (await dbHelpers.findAll('keuangan')).filter(d => d.tanggal.startsWith(prefix) && d.status !== 'cancelled');
    const summary = {};
    data.forEach(d => {
      if (!summary[d.kategori]) summary[d.kategori] = { masuk: 0, keluar: 0 };
      summary[d.kategori][d.jenis] += d.jumlah;
    });
    res.json({ summary: Object.entries(summary).map(([kategori, val]) => ({ kategori, ...val })), detail: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get report', detail: err.message });
  }
});

router.get('/export', auth, authorize('superadmin', 'bendahara'), async (req, res) => {
  try {
    const { start_date, end_date, jenis } = req.query;
    let data = await dbHelpers.findAll('keuangan');
    if (start_date) data = data.filter(d => d.tanggal >= start_date);
    if (end_date) data = data.filter(d => d.tanggal <= end_date);
    if (jenis) data = data.filter(d => d.jenis === jenis);
    data.sort((a, b) => a.tanggal.localeCompare(b.tanggal));

    const header = 'Tanggal,Jenis,Kategori,Metode,Penerima/Pengirim,Jumlah,Deskripsi,Catatan,No Ref,Status\n';
    const rows = data.map(d =>
      `${d.tanggal},${d.jenis},${d.kategori || ''},${d.metode_pembayaran || ''},${d.penerima || ''},${d.jumlah},"${(d.deskripsi || '').replace(/"/g, '""')}","${(d.catatan || '').replace(/"/g, '""')}",${d.no_ref || ''},${d.status || 'confirmed'}`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=keuangan-${new Date().toISOString().slice(0, 10)}.csv`);
    res.send(header + rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export', detail: err.message });
  }
});

router.get('/report/pdf', auth, authorize('superadmin', 'bendahara'), async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) return res.status(400).json({ error: 'year and month are required' });

    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    const data = (await dbHelpers.findAll('keuangan')).filter(d => d.tanggal.startsWith(prefix) && d.status !== 'cancelled');
    data.sort((a, b) => a.tanggal.localeCompare(b.tanggal));

    const allSettings = await dbHelpers.findAll('settings');
    const settingsObj = {};
    allSettings.forEach(s => { settingsObj[s.key] = s.value; });
    const mosqueName = settingsObj.masjid_name || 'Masjid';
    const mosqueAddr = settingsObj.masjid_address || '';

    const summary = {};
    data.forEach(d => {
      if (!summary[d.kategori]) summary[d.kategori] = { masuk: 0, keluar: 0 };
      summary[d.kategori][d.jenis] += d.jumlah;
    });

    const totalMasuk = data.filter(d => d.jenis === 'masuk').reduce((s, d) => s + d.jumlah, 0);
    const totalKeluar = data.filter(d => d.jenis === 'keluar').reduce((s, d) => s + d.jumlah, 0);
    const saldo = totalMasuk - totalKeluar;
    const bulanNama = new Date(year, parseInt(month) - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    const formatRp = (n) => 'Rp ' + n.toLocaleString('id-ID');

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="laporan-keuangan-${year}-${month}.pdf"`);
    doc.pipe(res);

    const pageW = doc.page.width - 100;
    const greenDark = '#0b3d2e';
    const greenMid = '#146b4a';
    const amber = '#d4913d';
    const gray = '#666666';
    const lightGray = '#e8e8e8';

    doc.rect(0, 0, doc.page.width, 120).fill(greenDark);
    doc.fontSize(22).fillColor('#ffffff').font('Helvetica-Bold').text(mosqueName, 50, 30, { width: pageW, align: 'center' });
    doc.fontSize(10).fillColor('#b8ccc4').font('Helvetica').text(mosqueAddr, 50, 58, { width: pageW, align: 'center' });
    doc.fontSize(14).fillColor(amber).font('Helvetica-Bold').text('LAPORAN KEUANGAN', 50, 80, { width: pageW, align: 'center' });
    doc.fontSize(10).fillColor('#b8ccc4').font('Helvetica').text(bulanNama, 50, 100, { width: pageW, align: 'center' });

    let y = 145;
    doc.fontSize(11).fillColor(greenDark).font('Helvetica-Bold').text('RINGKASAN', 50, y);
    y += 20;

    const summaryBox = (label, value, color, bx) => {
      doc.roundedRect(bx, y, 165, 50, 6).fillAndStroke('#fafafa', lightGray);
      doc.fontSize(8).fillColor(gray).font('Helvetica').text(label.toUpperCase(), bx + 10, y + 10, { width: 145 });
      doc.fontSize(13).fillColor(color).font('Helvetica-Bold').text(formatRp(value), bx + 10, y + 26, { width: 145 });
    };
    summaryBox('Total Pemasukan', totalMasuk, greenMid, 50);
    summaryBox('Total Pengeluaran', totalKeluar, '#c62828', 225);
    summaryBox('Saldo Bersih', saldo, amber, 400);

    y += 70;
    doc.moveTo(50, y).lineTo(545, y).strokeColor(lightGray).lineWidth(1).stroke();
    y += 15;

    doc.fontSize(11).fillColor(greenDark).font('Helvetica-Bold').text('REKAP PER KATEGORI', 50, y);
    y += 22;

    doc.roundedRect(50, y, pageW, 22, 3).fill(greenDark);
    doc.fontSize(8).fillColor('#ffffff').font('Helvetica-Bold');
    doc.text('Kategori', 56, y + 7, { width: 180 });
    doc.text('Pemasukan', 240, y + 7, { width: 100, align: 'right' });
    doc.text('Pengeluaran', 350, y + 7, { width: 100, align: 'right' });
    doc.text('Selisih', 460, y + 7, { width: 80, align: 'right' });
    y += 24;

    const kategoriEntries = Object.entries(summary).sort((a, b) => (b[1].masuk - b[1].keluar) - (a[1].masuk - a[1].keluar));
    kategoriEntries.forEach(([kategori, val], i) => {
      const bg = i % 2 === 0 ? '#f9f9f9' : '#ffffff';
      doc.roundedRect(50, y, pageW, 20, 0).fill(bg);
      doc.fontSize(8).fillColor('#333333').font('Helvetica');
      doc.text(kategori, 56, y + 6, { width: 180 });
      doc.fillColor(val.masuk > 0 ? greenMid : gray).text(val.masuk > 0 ? formatRp(val.masuk) : '-', 240, y + 6, { width: 100, align: 'right' });
      doc.fillColor(val.keluar > 0 ? '#c62828' : gray).text(val.keluar > 0 ? formatRp(val.keluar) : '-', 350, y + 6, { width: 100, align: 'right' });
      const selisih = val.masuk - val.keluar;
      doc.fillColor(selisih >= 0 ? greenMid : '#c62828').text(formatRp(selisih), 460, y + 6, { width: 80, align: 'right' });
      y += 20;
    });

    doc.roundedRect(50, y, pageW, 22, 3).fill(greenDark);
    doc.fontSize(8).fillColor('#ffffff').font('Helvetica-Bold');
    doc.text('TOTAL', 56, y + 7, { width: 180 });
    doc.text(formatRp(totalMasuk), 240, y + 7, { width: 100, align: 'right' });
    doc.text(formatRp(totalKeluar), 350, y + 7, { width: 100, align: 'right' });
    doc.text(formatRp(saldo), 460, y + 7, { width: 80, align: 'right' });
    y += 35;

    doc.fontSize(11).fillColor(greenDark).font('Helvetica-Bold').text('DETAIL TRANSAKSI', 50, y);
    y += 22;

    doc.roundedRect(50, y, pageW, 22, 3).fill(greenDark);
    doc.fontSize(7).fillColor('#ffffff').font('Helvetica-Bold');
    doc.text('Tanggal', 56, y + 7, { width: 60 });
    doc.text('Jenis', 116, y + 7, { width: 50 });
    doc.text('Kategori', 166, y + 7, { width: 80 });
    doc.text('Deskripsi', 246, y + 7, { width: 130 });
    doc.text('Pihak', 376, y + 7, { width: 70 });
    doc.text('Jumlah', 476, y + 7, { width: 60, align: 'right' });
    y += 24;

    data.forEach((item, i) => {
      if (y > 750) {
        doc.addPage();
        y = 50;
        doc.roundedRect(50, y, pageW, 22, 3).fill(greenDark);
        doc.fontSize(7).fillColor('#ffffff').font('Helvetica-Bold');
        doc.text('Tanggal', 56, y + 7, { width: 60 });
        doc.text('Jenis', 116, y + 7, { width: 50 });
        doc.text('Kategori', 166, y + 7, { width: 80 });
        doc.text('Deskripsi', 246, y + 7, { width: 130 });
        doc.text('Pihak', 376, y + 7, { width: 70 });
        doc.text('Jumlah', 476, y + 7, { width: 60, align: 'right' });
        y += 24;
      }

      const bg = i % 2 === 0 ? '#f9f9f9' : '#ffffff';
      doc.roundedRect(50, y, pageW, 18, 0).fill(bg);
      doc.fontSize(7).fillColor('#333333').font('Helvetica');
      const jenisLabel = item.jenis === 'masuk' ? 'Masuk' : 'Keluar';
      const jenisColor = item.jenis === 'masuk' ? greenMid : '#c62828';
      doc.text(item.tanggal, 56, y + 5, { width: 60 });
      doc.fillColor(jenisColor).text(jenisLabel, 116, y + 5, { width: 50 });
      doc.fillColor('#333333').text(item.kategori || '-', 166, y + 5, { width: 80 });
      doc.text((item.deskripsi || '-').substring(0, 40), 246, y + 5, { width: 130 });
      doc.text((item.penerima || '-').substring(0, 18), 376, y + 5, { width: 70 });
      doc.fillColor(item.jenis === 'masuk' ? greenMid : '#c62828')
        .text((item.jenis === 'masuk' ? '+' : '-') + formatRp(item.jumlah), 476, y + 5, { width: 60, align: 'right' });
      y += 18;
    });

    y += 20;
    doc.moveTo(50, y).lineTo(545, y).strokeColor(lightGray).lineWidth(1).stroke();
    y += 10;
    doc.fontSize(7).fillColor(gray).font('Helvetica')
      .text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 50, y, { width: pageW / 2 })
      .text(`${mosqueName} - Sistem Keuangan Masjid`, 50, y + 12, { width: pageW / 2 });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate PDF', detail: err.message });
  }
});

router.post('/', auth, authorize('superadmin', 'bendahara'), async (req, res) => {
  try {
    const { tanggal, jenis, kategori, deskripsi, jumlah, metode_pembayaran, penerima, no_ref, catatan, status } = req.body;
    const parsedJumlah = parseFloat(jumlah);
    if (Number.isNaN(parsedJumlah) || parsedJumlah < 0) {
      return res.status(400).json({ error: 'Invalid jumlah: must be a non-negative number' });
    }
    const transaksi = await dbHelpers.insert('keuangan', {
      tanggal,
      jenis,
      kategori,
      deskripsi,
      jumlah: parsedJumlah,
      metode_pembayaran: metode_pembayaran || 'cash',
      penerima: penerima || '',
      no_ref: no_ref || '',
      catatan: catatan || '',
      status: status || 'confirmed',
      created_by: req.user.id
    });
    await dbHelpers.insert('audit_log', { user_id: req.user.id, action: 'CREATE', table_name: 'keuangan', record_id: transaksi.id, new_value: JSON.stringify(req.body) });
    res.json(transaksi);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add transaksi', detail: err.message });
  }
});

router.put('/:id', auth, authorize('superadmin', 'bendahara'), async (req, res) => {
  try {
    const { tanggal, jenis, kategori, deskripsi, jumlah, metode_pembayaran, penerima, no_ref, catatan, status } = req.body;
    const parsedJumlah = parseFloat(jumlah);
    if (Number.isNaN(parsedJumlah) || parsedJumlah < 0) {
      return res.status(400).json({ error: 'Invalid jumlah: must be a non-negative number' });
    }
    const old = await dbHelpers.findById('keuangan', req.params.id);
    await dbHelpers.update('keuangan', req.params.id, {
      tanggal, jenis, kategori, deskripsi, jumlah: parsedJumlah,
      metode_pembayaran: metode_pembayaran || 'cash',
      penerima: penerima || '',
      no_ref: no_ref || '',
      catatan: catatan || '',
      status: status || 'confirmed'
    });
    await dbHelpers.insert('audit_log', { user_id: req.user.id, action: 'UPDATE', table_name: 'keuangan', record_id: req.params.id, old_value: JSON.stringify(old), new_value: JSON.stringify(req.body) });
    res.json({ message: 'Keuangan updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update keuangan', detail: err.message });
  }
});

router.delete('/:id', auth, authorize('superadmin', 'bendahara'), async (req, res) => {
  try {
    const old = await dbHelpers.findById('keuangan', req.params.id);
    await dbHelpers.remove('keuangan', req.params.id);
    await dbHelpers.insert('audit_log', { user_id: req.user.id, action: 'DELETE', table_name: 'keuangan', record_id: req.params.id, old_value: JSON.stringify(old) });
    res.json({ message: 'Keuangan deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete keuangan', detail: err.message });
  }
});

module.exports = router;
