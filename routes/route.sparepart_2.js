import express from 'express';
import xlsx from 'xlsx';
import Sparepart_2 from '../models/sparepart_2.js';

const router = express.Router();

router.post('/upload', async (req, res) => {
  const upload = req.upload.single('file'); // Middleware untuk menerima satu file

  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: 'File upload error', error: err.message });
    }

    const file = req.file; // File yang diunggah
    if (!file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    try {
      // Membaca file dari buffer menggunakan xlsx
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });

      // Ambil sheet pertama
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      // Konversi sheet ke JSON
      const data = xlsx.utils.sheet_to_json(sheet);

      // Proses data: kelompokkan data menjadi batch (misal 100 data per batch)
      const batchSize = 100;
      const batches = [];
      for (let i = 0; i < data.length; i += batchSize) {
        batches.push(data.slice(i, i + batchSize));
      }

      let totalProcessed = 0;

      // Proses tiap batch
      for (const batch of batches) {
        const bulkOps = batch.map((row) => {
          const materialNumber = row['Material'];
          const materialName = row['Material Name'];
          const totalQty = row['Total Qty.'];
          const retailPrice = row['retail '];

          // Validasi kolom wajib
          if (!materialNumber || !materialName || totalQty === undefined || retailPrice === undefined) {
            throw new Error(`Invalid row: Material, Material Name, Total Qty., and Retail are required.`);
          }

          // Bulk operation: Upsert
          return {
            updateOne: {
              filter: { number: materialNumber },
              update: {
                $set: {
                  namaPart: materialName,
                  stock: totalQty,
                  harga: retailPrice,
                  updatedAt: Date.now(),
                },
              },
              upsert: true, // Buat dokumen baru jika tidak ada
            },
          };
        });

        // Jalankan operasi batch menggunakan bulkWrite
        const result = await Sparepart_2.bulkWrite(bulkOps);
        totalProcessed += result.nUpserted + result.nModified;
      }

      res.status(200).json({ message: 'Data updated successfully', totalProcessed });
    } catch (error) {
      res.status(500).json({ message: 'Error processing file', error: error.message });
    }
  });
});



// GET All Spareparts (Hanya yang tidak dihapus)
router.get('/', async (req, res) => {
  try {
    const spareparts = await Sparepart.find({ isDeleted: false });
    res.status(200).json({ spareparts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching spareparts', error });
  }
});

// GET Sparepart by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const sparepart = await Sparepart.findOne({ _id: id, isDeleted: false });
    if (!sparepart) {
      return res.status(404).json({ message: 'Sparepart not found' });
    }
    res.status(200).json({ sparepart });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sparepart', error });
  }
});

// PATCH Sparepart (Partial Update)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedSparepart = await Sparepart.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!updatedSparepart || updatedSparepart.isDeleted) {
      return res.status(404).json({ message: 'Sparepart not found' });
    }

    res.status(200).json({ message: 'Sparepart updated successfully', sparepart: updatedSparepart });
  } catch (error) {
    res.status(500).json({ message: 'Error updating sparepart', error });
  }
});

// PUT Sparepart (Full Update)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { namaPart, number, stock, harga } = req.body;

  try {
    const updatedSparepart = await Sparepart.findByIdAndUpdate(
      id,
      { namaPart, number, stock, harga, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!updatedSparepart || updatedSparepart.isDeleted) {
      return res.status(404).json({ message: 'Sparepart not found' });
    }

    res.status(200).json({ message: 'Sparepart updated successfully', sparepart: updatedSparepart });
  } catch (error) {
    res.status(500).json({ message: 'Error updating sparepart', error });
  }
});

// SOFT DELETE Sparepart (Set isDeleted: true)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedSparepart = await Sparepart.findByIdAndUpdate(
      id,
      { isDeleted: true, updatedAt: Date.now() },
      { new: true }
    );

    if (!deletedSparepart) {
      return res.status(404).json({ message: 'Sparepart not found' });
    }

    res.status(200).json({ message: 'Sparepart deleted successfully', sparepart: deletedSparepart });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting sparepart', error });
  }
});

export default router;
