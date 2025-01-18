import { Router } from 'express';
import PKB from '../models/pkb.js';
import Summary from '../models/summary.js';
import Customer from '../models/customer.js';
import Vehicle from '../models/vehicle.js';

const router = Router();

// Generate No. PKB Baru
const generateNoPkb = async () => {
  const lastPkb = await PKB.findOne().sort({ noPkb: -1 });
  if (lastPkb) {
    const lastNumber = parseInt(lastPkb.noPkb, 10);
    return (lastNumber + 1).toString().padStart(12, '0');
  }
  return '000000000001';
};

// Create PKB (POST)
router.post('/', async (req, res) => {
  const { tanggalWaktu, kilometer, keluhan, namaMekanik, namaSa, customerName, noRangka } = req.body;

  try {
    // Cari Customer berdasarkan nama
    const customer = await Customer.findOne({ nama: customerName });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Cari Vehicle berdasarkan noRangka
    const vehicle = await Vehicle.findOne({ noRangka });
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const noPkb = await generateNoPkb();

    const newPkb = new PKB({
      noPkb,
      tanggalWaktu,
      kilometer,
      keluhan,
      namaMekanik,
      namaSa,
      customer: customer._id,
      vehicle: vehicle._id,
      summary: null, // Summary belum dihubungkan
    });

    await newPkb.save();

    res.status(201).json({
      message: 'PKB created successfully',
      pkb: newPkb,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating PKB', error });
  }
});

// Get All PKBs (GET)
router.get('/', async (req, res) => {
  try {
    const pkbs = await PKB.find()
      .populate('customer', 'nama alamat noTelp')
      .populate('vehicle', 'noPolisi noRangka noMesin tipe tahun produk kilometer')
      .populate({
        path: 'summary',
        populate: [
          { path: 'layanan', select: 'namaLayanan harga total' },
          { path: 'sparepart', select: 'namaPart harga total' },
        ],
      });

    res.status(200).json({ pkbs });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching PKBs', error });
  }
});

// Get PKB by ID (GET by ID)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pkb = await PKB.findById(id)
      .populate('customer', 'nama alamat noTelp')
      .populate('vehicle', 'noPolisi noRangka noMesin tipe tahun produk kilometer')
      .populate({
        path: 'summary',
        populate: [
          { path: 'layanan', select: 'namaLayanan harga total' },
          { path: 'sparepart', select: 'namaPart harga total' },
        ],
      });

    if (!pkb) {
      return res.status(404).json({ message: 'PKB not found' });
    }

    res.status(200).json({ pkb });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching PKB', error });
  }
});

// Update PKB (PUT)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedPkb = await PKB.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updatedPkb) {
      return res.status(404).json({ message: 'PKB not found' });
    }

    res.status(200).json({
      message: 'PKB updated successfully',
      pkb: updatedPkb,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating PKB', error });
  }
});

// Patch Summary to PKB (PATCH Summary)
router.patch('/:id/summary', async (req, res) => {
  const { id } = req.params;
  const { summaryId } = req.body;

  try {
    // Validasi Summary
    const summary = await Summary.findById(summaryId);
    if (!summary) {
      return res.status(404).json({ message: 'Summary not found' });
    }

    // Update PKB untuk menambahkan referensi Summary
    const updatedPkb = await PKB.findByIdAndUpdate(
      id,
      { summary: summaryId },
      { new: true, runValidators: true }
    );

    if (!updatedPkb) {
      return res.status(404).json({ message: 'PKB not found' });
    }

    res.status(200).json({
      message: 'Summary added to PKB successfully',
      pkb: updatedPkb,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating PKB with Summary', error });
  }
});

// Delete PKB (DELETE)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPkb = await PKB.findByIdAndDelete(id);

    if (!deletedPkb) {
      return res.status(404).json({ message: 'PKB not found' });
    }

    res.status(200).json({ message: 'PKB deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting PKB', error });
  }
});

export default router;
