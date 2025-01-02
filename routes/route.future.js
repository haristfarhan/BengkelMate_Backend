import { Router } from 'express';
import { Future } from '../models/future.js';
import Vehicle from '../models/vehicle.js'; // Pastikan sudah ada model Vehicle
import Layanan from '../models/layanan.js';
import { authenticate } from '../middleware/middleware.auth.js'; // Opsional untuk autentikasi
import { authorize } from '../middleware/middleware.authorize.js'; // Opsional untuk otorisasi

const router = Router();

// Create Future (POST)
router.post('/', async (req, res) => {
  const { noRangka, tanggalServisKembali, nextKm, namaLayanan } = req.body;

  try {
    // Cari vehicle berdasarkan noRangka
    const vehicle = await Vehicle.findOne({ noRangka });
    if (!vehicle) {
      return res.status(404).json({ message: `Vehicle with noRangka "${noRangka}" not found` });
    }

    // Cari layanan berdasarkan namaLayanan
    const layanan = await Layanan.find({ namaLayanan: { $in: namaLayanan } });
    if (layanan.length === 0) {
      return res.status(404).json({ message: 'Layanan not found' });
    }

    const newFuture = new Future({
      vehicle: vehicle._id, // Simpan ObjectId kendaraan
      tanggalServisKembali,
      nextKm,
      layanan: layanan.map(l => l._id), // Simpan ObjectId layanan
    });

    await newFuture.save();

    res.status(201).json({
      message: 'Future service created successfully',
      future: newFuture,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating future service', error });
  }
});

// Get All Future Services (GET)
router.get('/', async (req, res) => {
  try {
    const futures = await Future.find()
      .populate('vehicle', 'noPolisi noRangka noMesin tipe tahun produk kilometer') // Detail kendaraan
      .populate('layanan', 'namaLayanan harga'); // Detail layanan

    res.status(200).json({ futures });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching future services', error });
  }
});

// Get Future Service by ID (GET by ID)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const future = await Future.findById(id)
      .populate('vehicle', 'noPolisi noRangka noMesin tipe tahun produk kilometer') // Detail kendaraan
      .populate('layanan', 'namaLayanan harga'); // Detail layanan

    if (!future) {
      return res.status(404).json({ message: 'Future service not found' });
    }

    res.status(200).json({ future });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching future service', error });
  }
});

// Update Future Service (PUT - Full Update)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { tanggalServisKembali, nextKm, namaLayanan } = req.body;

  try {
    // Cari vehicle berdasarkan noRangka
    const vehicle = await Vehicle.findOne({ noRangka });
    if (!vehicle) {
      return res.status(404).json({ message: `Vehicle with noRangka "${noRangka}" not found` });
    }

    // Cari layanan berdasarkan namaLayanan
    const layanan = await Layanan.find({ namaLayanan: { $in: namaLayanan } });
    if (layanan.length === 0) {
      return res.status(404).json({ message: 'Layanan not found' });
    }

    const updatedFuture = await Future.findByIdAndUpdate(
      id,
      {
        tanggalServisKembali,
        nextKm,
        layanan: layanan.map(l => l._id), // Update layanan dengan ObjectId
      },
      { new: true, runValidators: true }
    );

    if (!updatedFuture) {
      return res.status(404).json({ message: 'Future service not found' });
    }

    res.status(200).json({
      message: 'Future service updated successfully',
      future: updatedFuture,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating future service', error });
  }
});

// Partial Update Future Service (PATCH)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedFuture = await Future.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedFuture) {
      return res.status(404).json({ message: 'Future service not found' });
    }

    res.status(200).json({
      message: 'Future service partially updated successfully',
      future: updatedFuture,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating future service', error });
  }
});

// Delete Future Service (DELETE)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedFuture = await Future.findByIdAndDelete(id);

    if (!deletedFuture) {
      return res.status(404).json({ message: 'Future service not found' });
    }

    res.status(200).json({ message: 'Future service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting future service', error });
  }
});

export default router;
