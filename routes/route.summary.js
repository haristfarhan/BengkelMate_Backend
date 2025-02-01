import { Router } from 'express';
import Summary from '../models/summary.js';
import Layanan from '../models/layanan.js';
import Sparepart_2 from '../models/sparepart_2.js';
import PKB from '../models/pkb.js';

const router = Router();

// Helper function to calculate total price and details
const calculateDetails = async (layanan, sparepart) => {
  let totalHarga = 0;
  const layananDetails = [];
  const sparepartDetails = [];

  // Hitung total harga layanan
  for (const item of layanan) {
    const layananDetail = await Layanan.findOne({ namaLayanan: item.namaLayanan });
    if (!layananDetail) throw new Error(`Layanan "${item.namaLayanan}" not found`);
    const total = layananDetail.harga * item.quantity;
    totalHarga += total;
    layananDetails.push({
      namaLayanan: item.namaLayanan,
      quantity: item.quantity,
      harga: layananDetail.harga,
      total,
    });
  }

  // Hitung total harga sparepart
  for (const item of sparepart) {
    const sparepartDetail = await Sparepart_2.findOne({ namaPart: item.namaPart });
    if (!sparepartDetail) throw new Error(`Sparepart "${item.namaPart}" not found`);
    const total = sparepartDetail.harga * item.quantity;
    totalHarga += total;
    sparepartDetails.push({
      namaPart: item.namaPart,
      quantity: item.quantity,
      harga: sparepartDetail.harga,
      total,
    });
  }

  return { totalHarga, layananDetails, sparepartDetails };
};

// Create Summary (POST)
router.post('/', async (req, res) => {
  const { noPkb, layanan, sparepart } = req.body;

  try {
    // Cari PKB berdasarkan noPkb
    const pkb = await PKB.findOne({ noPkb });
    if (!pkb) {
      return res.status(404).json({ message: `PKB with No PKB "${noPkb}" not found` });
    }

    // Hitung detail layanan, sparepart, dan total harga
    const { totalHarga, layananDetails, sparepartDetails } = await calculateDetails(layanan, sparepart);

    // Simpan data Summary
    const newSummary = new Summary({
      noPkb: pkb._id,
      layanan: layananDetails,
      sparepart: sparepartDetails,
      totalHarga,
    });

    await newSummary.save();

    // Hubungkan Summary ke PKB
    pkb.summary = newSummary._id;
    await pkb.save();

    res.status(201).json({
      message: 'Summary created successfully and linked to PKB',
      summary: newSummary,
      pkb,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating summary', error: error.message });
  }
});

// Get All Summaries (GET)
router.get('/', async (req, res) => {
  try {
    const summaries = await Summary.find()
      .populate({
        path: 'layanan',
        select: 'namaLayanan harga quantity total',
      })
      .populate({
        path: 'sparepart',
        select: 'namaPart harga quantity total',
      });

    res.status(200).json({ summaries });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching summaries', error });
  }
});

// Get Summary by ID (GET by ID)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const summary = await Summary.findById(id)
      .populate({
        path: 'layanan',
        select: 'namaLayanan harga quantity total',
      })
      .populate({
        path: 'sparepart',
        select: 'namaPart harga quantity total',
      });

    if (!summary) {
      return res.status(404).json({ message: 'Summary not found' });
    }

    res.status(200).json({ summary });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching summary', error });
  }
});

export default router;
