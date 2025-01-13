import { Router } from 'express';
import Sparepart from '../models/sparepart.js';

const router = Router();

// Create Sparepart (POST)
router.post('/', async (req, res) => {
  const { namaPart, number, stock, harga } = req.body;

  try {
    const newSparepart = new Sparepart({ namaPart, number, stock, harga });
    await newSparepart.save();

    res.status(201).json({
      message: 'Sparepart created successfully',
      sparepart: newSparepart,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating sparepart', error });
  }
});

// Get All Spareparts (GET)
router.get('/', async (req, res) => {
  try {
    const spareparts = await Sparepart.find({isDeleted: false});
    res.status(200).json({ spareparts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching spareparts', error });
  }
});

// Get Sparepart by ID (GET by ID)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Cari sparepart berdasarkan ID dan pastikan tidak "dihapus" (isDeleted: false)
    const sparepart = await Sparepart.findOne({ _id: id, isDeleted: false });

    if (!sparepart) {
      return res.status(404).json({ message: 'Sparepart not found or has been deleted' });
    }

    res.status(200).json({ sparepart });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sparepart', error });
  }
});


// Update Sparepart (PUT - Full Update)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { namaPart, number, stock, harga } = req.body;

  try {
    const updatedSparepart = await Sparepart.findByIdAndUpdate(
      id,
      { namaPart, number, stock, harga },
      { new: true, runValidators: true }
    );

    if (!updatedSparepart) {
      return res.status(404).json({ message: 'Sparepart not found' });
    }

    res.status(200).json({
      message: 'Sparepart updated successfully',
      sparepart: updatedSparepart,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating sparepart', error });
  }
});

// Partial Update Sparepart (PATCH)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedSparepart = await Sparepart.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedSparepart) {
      return res.status(404).json({ message: 'Sparepart not found' });
    }

    res.status(200).json({
      message: 'Sparepart partially updated successfully',
      sparepart: updatedSparepart,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating sparepart', error });
  }
});

// Soft Delete Sparepart (DELETE)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Update isDeleted menjadi true untuk soft delete
    const deletedSparepart = await Sparepart.findByIdAndUpdate(
      id,
      { isDeleted: true }, // Soft delete dengan menandai `isDeleted` sebagai true
      { new: true } // Mengembalikan data yang diperbarui
    );

    if (!deletedSparepart) {
      return res.status(404).json({ message: 'Sparepart not found' });
    }

    res.status(200).json({ message: 'Sparepart deleted successfully', data: deletedSparepart });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting sparepart', error });
  }
});


export default router;
