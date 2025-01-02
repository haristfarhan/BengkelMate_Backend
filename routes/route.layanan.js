import { Router } from 'express';
import Layanan from '../models/layanan.js';

const router = Router();

// Create Layanan (POST)
router.post('/', async (req, res) => {
  const { namaLayanan, harga } = req.body;

  try {
    const newLayanan = new Layanan({ namaLayanan, harga });
    await newLayanan.save();

    res.status(201).json({
      message: 'Layanan created successfully',
      layanan: newLayanan,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating layanan', error });
  }
});

// Get All Layanan (GET)
router.get('/', async (req, res) => {
  try {
    const layanan = await Layanan.find();
    res.status(200).json({ layanan });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching layanan', error });
  }
});

// Get Layanan by ID (GET by ID)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const layanan = await Layanan.findById(id);
    if (!layanan) {
      return res.status(404).json({ message: 'Layanan not found' });
    }

    res.status(200).json({ layanan });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching layanan', error });
  }
});

// Update Layanan (PUT - Full Update)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { namaLayanan, harga } = req.body;

  try {
    const updatedLayanan = await Layanan.findByIdAndUpdate(
      id,
      { namaLayanan, harga },
      { new: true, runValidators: true }
    );

    if (!updatedLayanan) {
      return res.status(404).json({ message: 'Layanan not found' });
    }

    res.status(200).json({
      message: 'Layanan updated successfully',
      layanan: updatedLayanan,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating layanan', error });
  }
});

// Partial Update Layanan (PATCH)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedLayanan = await Layanan.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedLayanan) {
      return res.status(404).json({ message: 'Layanan not found' });
    }

    res.status(200).json({
      message: 'Layanan partially updated successfully',
      layanan: updatedLayanan,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating layanan', error });
  }
});

// Delete Layanan (DELETE)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedLayanan = await Layanan.findByIdAndDelete(id);

    if (!deletedLayanan) {
      return res.status(404).json({ message: 'Layanan not found' });
    }

    res.status(200).json({ message: 'Layanan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting layanan', error });
  }
});

export default router;
