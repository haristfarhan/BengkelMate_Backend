import { Router } from 'express';
import Progress from '../models/progress.js';
import PKB from '../models/pkb.js';
import Vehicle from '../models/vehicle.js';

const router = Router();

// Create Progress (POST)
router.post('/', async (req, res) => {
  const { persentase, status,progresLayanan, noPkb, noRangka } = req.body;

  try {
    // Cari PKB berdasarkan noPkb
    const pkb = await PKB.findOne({ noPkb });
    if (!pkb) {
      return res.status(404).json({ message: `PKB with No PKB "${noPkb}" not found` });
    }

    // Cari Vehicle berdasarkan noRangka
    const vehicle = await Vehicle.findOne({ noRangka });
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const newProgress = new Progress({
      persentase,
      status,
      progresLayanan,
      pkb: pkb._id, 
      vehicle: vehicle._id
    });

    await newProgress.save();

    res.status(201).json({
      message: 'Progress created successfully',
      progress: newProgress,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating progress', error });
  }
});

// Get All Progresses (GET)
router.get('/', async (req, res) => {
  try {
    const progresses = await Progress.find()
    .populate('pkb', 'noPkb tanggalWaktu keluhan layanan')
    .populate('vehicle', 'noPolisi noRangka noMesin tipe tahun produk kilometer')

    res.status(200).json({ progresses });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching progresses', error });
  }
});

// Get Progress by ID (GET by ID)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const progress = await Progress.findById(id).populate('pkb', 'noPkb tanggalWaktu keluhan layanan').populate('vehicle', 'noPolisi noRangka noMesin tipe tahun produk kilometer');

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    res.status(200).json({ progress });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching progress', error });
  }
});

// Update Progress (PUT - Full Update)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { persentase, status } = req.body;

  try {
    const updatedProgress = await Progress.findByIdAndUpdate(
      id,
      { persentase, status, progresLayanan },
      { new: true, runValidators: true }
    );

    if (!updatedProgress) {s
      return res.status(404).json({ message: 'Progress not found' });
    }

    res.status(200).json({
      message: 'Progress updated successfully',
      progress: updatedProgress,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating progress', error });
  }
});

// Partial Update Progress (PATCH)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedProgress = await Progress.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedProgress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    res.status(200).json({
      message: 'Progress partially updated successfully',
      progress: updatedProgress,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating progress', error });
  }
});

// Delete Progress (DELETE)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProgress = await Progress.findByIdAndDelete(id);

    if (!deletedProgress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    res.status(200).json({ message: 'Progress deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting progress', error });
  }
});

export default router;
