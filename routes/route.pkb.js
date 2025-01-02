import { Router } from 'express';
import PKB from '../models/pkb.js';
import Customer from '../models/customer.js';
import Vehicle from '../models/vehicle.js';
import Layanan from '../models/layanan.js';
import Sparepart from '../models/sparepart.js';

const router = Router();

// Generate No. PKB Baru
const generateNoPkb = async () => {
  const lastPkb = await PKB.findOne().sort({ noPkb: -1 });
  if (lastPkb) {
    const lastNumber = parseInt(lastPkb.noPkb, 10);
    const newNumber = (lastNumber + 1).toString().padStart(12, '0');
    return newNumber;
  }
  return '000000000001';
};

// Create PKB (POST)
router.post('/', async (req, res) => {
  const { tanggalWaktu, kilometer, keluhan, namaMekanik, namaSa, layananNames, sparepartNames, responsMekanik, customerName, noRangka } = req.body;

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

    // Cari Layanan berdasarkan array nama layanan
    const layanan = await Layanan.find({ namaLayanan: { $in: layananNames } });
    if (layanan.length !== layananNames.length) {
      return res.status(404).json({ message: 'Some layanan not found' });
    }

    // Cari Sparepart berdasarkan array nama part
    const spareparts = await Sparepart.find({ namaPart: { $in: sparepartNames } });
    if (spareparts.length !== sparepartNames.length) {
      return res.status(404).json({ message: 'Some spareparts not found' });
    }

    const noPkb = await generateNoPkb();

    const newPkb = new PKB({
      noPkb,
      tanggalWaktu,
      kilometer,
      keluhan,
      namaMekanik,
      namaSa,
      layanan: layanan.map(l => l._id),
      spareparts: spareparts.map(s => s._id),
      responsMekanik,
      customer: customer._id,
      vehicle: vehicle._id,
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
      .populate('layanan', 'namaLayanan deskripsi harga')
      .populate('spareparts', 'namaPart number harga stock');

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
      .populate('layanan', 'namaLayanan deskripsi harga')
      .populate('spareparts', 'namaPart number harga stock');

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
  const { tanggalWaktu, kilometer, keluhan, namaMekanik, namaSa, layananNames, sparepartNames, responsMekanik, customerName, noRangka } = req.body;

  try {
    let customer;
    if (customerName) {
      customer = await Customer.findOne({ nama: customerName });
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
    }

    let vehicle;
    if (noRangka) {
      vehicle = await Vehicle.findOne({ noRangka });
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
    }

    let layanan;
    if (layananNames) {
      layanan = await Layanan.find({ namaLayanan: { $in: layananNames } });
      if (layanan.length !== layananNames.length) {
        return res.status(404).json({ message: 'Some layanan not found' });
      }
    }

    let spareparts;
    if (sparepartNames) {
      spareparts = await Sparepart.find({ namaPart: { $in: sparepartNames } });
      if (spareparts.length !== sparepartNames.length) {
        return res.status(404).json({ message: 'Some spareparts not found' });
      }
    }

    const updatedPkb = await PKB.findByIdAndUpdate(
      id,
      {
        tanggalWaktu,
        kilometer,
        keluhan,
        namaMekanik,
        namaSa,
        layanan: layanan ? layanan.map(l => l._id) : undefined,
        spareparts: spareparts ? spareparts.map(s => s._id) : undefined,
        responsMekanik,
        customer: customer ? customer._id : undefined,
        vehicle: vehicle ? vehicle._id : undefined,
      },
      { new: true, runValidators: true }
    );

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

// Partial Update PKB (PATCH)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    if (updates.layananNames) {
      const layanan = await Layanan.find({ namaLayanan: { $in: updates.layananNames } });
      updates.layanan = layanan.map(l => l._id);
      delete updates.layananNames;
    }

    if (updates.sparepartNames) {
      const spareparts = await Sparepart.find({ namaPart: { $in: updates.sparepartNames } });
      updates.spareparts = spareparts.map(s => s._id);
      delete updates.sparepartNames;
    }

    const updatedPkb = await PKB.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!updatedPkb) {
      return res.status(404).json({ message: 'PKB not found' });
    }

    res.status(200).json({
      message: 'PKB partially updated successfully',
      pkb: updatedPkb,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating PKB', error });
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
