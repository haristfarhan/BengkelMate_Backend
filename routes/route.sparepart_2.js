import express from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import fs from 'fs';
import Sparepart_2 from '../models/sparepart_2.js';

const router = express.Router();

// Konfigurasi Multer untuk upload file
const upload = multer({ dest: './uploads/' }); // Folder sementara untuk file Excel

// Fungsi untuk membersihkan nama kolom
const cleanHeaders = (data) => {
  return data.map((row) => {
    const cleanedRow = {};
    Object.keys(row).forEach((key) => {
      const trimmedKey = key.trim(); // Hapus spasi di awal/akhir nama kolom
      cleanedRow[trimmedKey] = row[key];
    });
    return cleanedRow;
  });
};

// Upload dan Proses File
router.post('/upload', upload.array('files', 2), async (req, res) => {
  const files = req.files; // Array berisi dua file Excel

  if (files.length !== 2) {
    return res.status(400).json({ message: 'Please upload exactly two files' });
  }

  try {
    // Baca file Excel
    const workbook1 = xlsx.readFile(files[0].path);
    const workbook2 = xlsx.readFile(files[1].path);

    // Ambil sheet pertama dari setiap file
    const sheet1 = workbook1.Sheets[workbook1.SheetNames[0]];
    const sheet2 = workbook2.Sheets[workbook2.SheetNames[0]];

    // Konversi sheet ke JSON
    let data1 = xlsx.utils.sheet_to_json(sheet1);
    let data2 = xlsx.utils.sheet_to_json(sheet2);

    // Bersihkan header dengan spasi
    data1 = cleanHeaders(data1);
    data2 = cleanHeaders(data2);

    // Filter dan proses data dari excel_1
    const processedData1 = data1.map((row) => ({
      material: row['Material'], // Pastikan header sesuai dengan file setelah dibersihkan
      materialName: row['Material Name'],
      totalQty: row['Total Qty.'],
    }));

    // Buat mapping Retail berdasarkan Material di excel_2
    const retailMap = {};
    data2.forEach((row) => {
      if (row['material']) { // Gunakan header yang sudah dibersihkan
        retailMap[row['material']] = row['retail'];
      }
    });

    // Gabungkan data dari excel_1 dan excel_2
    const spareparts = processedData1.map((row) => ({
      namaPart: row.materialName,
      number: row.material,
      stock: row.totalQty,
      harga: retailMap[row.material] || 0, // Jika tidak ditemukan, harga diisi 0
    }));

    // Simpan ke database (update atau buat baru)
    for (const sparepart of spareparts) {
      await Sparepart_2.findOneAndUpdate(
        { number: sparepart.number }, // Cari berdasarkan "Material" (number)
        sparepart, // Data yang akan diupdate
        { upsert: true, new: true } // Buat baru jika tidak ada
      );
    }

    // Hapus file yang diunggah setelah diproses
    files.forEach((file) => fs.unlinkSync(file.path));

    res.status(200).json({ message: 'Data updated successfully', spareparts });
  } catch (error) {
    res.status(500).json({ message: 'Error processing files', error: error.message });
  }
});

export default router;
