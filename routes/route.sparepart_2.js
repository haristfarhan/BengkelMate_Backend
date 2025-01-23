import express from 'express';
import xlsx from 'xlsx';
import Sparepart_2 from '../models/sparepart_2.js';

const router = express.Router();

// Endpoint untuk upload dan proses file Excel
router.post('/upload', async (req, res) => {
  const upload = req.upload.array('files', 2); // Ambil middleware Multer dari `req.upload`

  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: 'File upload error', error: err.message });
    }

    const files = req.files; // File yang diunggah
    if (!files || files.length !== 2) {
      return res.status(400).json({ message: 'Please upload exactly two files' });
    }

    try {
      // Baca file dari buffer
      const workbook1 = xlsx.read(files[0].buffer, { type: 'buffer' });
      const workbook2 = xlsx.read(files[1].buffer, { type: 'buffer' });

      // Ambil sheet pertama dari setiap file
      const sheet1 = workbook1.Sheets[workbook1.SheetNames[0]];
      const sheet2 = workbook2.Sheets[workbook2.SheetNames[0]];

      // Konversi sheet ke JSON
      const data1 = xlsx.utils.sheet_to_json(sheet1);
      const data2 = xlsx.utils.sheet_to_json(sheet2);

      // Proses data Excel_1 dan Excel_2
      const processedData1 = data1.map((row) => ({
        material: row['Material'],
        materialName: row['Material Name'],
        totalQty: row['Total Qty.'],
      }));

      const retailMap = {};
      data2.forEach((row) => {
        if (row['material']) {
          retailMap[row['material']] = row['retail'];
        }
      });

      const spareparts = processedData1.map((row) => ({
        namaPart: row.materialName,
        number: row.material,
        stock: row.totalQty,
        harga: retailMap[row.material] || 0,
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
      res.status(500).json({ message: 'Error processing files', error: error.message });
    }
  });
});

export default router;
