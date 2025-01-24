import express from 'express';
import xlsx from 'xlsx';
import Sparepart_2 from '../models/sparepart_2.js';

const router = express.Router();

router.post('/upload', async (req, res) => {
  const upload = req.upload.single('file'); // Hanya menerima satu file dengan key 'file'

  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: 'File upload error', error: err.message });
    }

    const file = req.file; // File yang diunggah
    if (!file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    try {
      // Baca file dari buffer menggunakan xlsx
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });

      // Ambil sheet pertama dari file
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      // Konversi sheet ke JSON
      const data = xlsx.utils.sheet_to_json(sheet);

      // Proses data
      const spareparts = data.map((row) => ({
        namaPart: row['Material Name'], // Nama Part diambil dari kolom 'Material Name'
        number: row['Material'], // Material number
        stock: row['Total Qty.'], // Stok dari kolom 'Total Qty.'
        harga: row['Retail'], // Harga dari kolom 'Retail' (default 0 jika tidak ada)
      }));

      // Simpan ke database
      for (const sparepart of spareparts) {
        await Sparepart_2.findOneAndUpdate(
          { number: sparepart.number }, // Cari berdasarkan "Material" (number)
          sparepart, // Data yang akan diupdate
          { upsert: true, new: true } // Buat baru jika tidak ada
        );
      }

      res.status(200).json({ message: 'Data updated successfully', spareparts });
    } catch (error) {
      res.status(500).json({ message: 'Error processing file', error: error.message });
    }
  });
});

export default router;
