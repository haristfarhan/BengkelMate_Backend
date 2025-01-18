import mongoose from 'mongoose';

const pkbSchema = new mongoose.Schema({
  noPkb: {
    type: String,
    required: true,
    unique: true,
  },
  tanggalWaktu: {
    type: Date,
    default: Date.now,
  },
  kilometer: {
    type: Number,
    required: true,
  },
  keluhan: {
    type: String,
    required: true,
  },
  namaMekanik: {
    type: String,
    required: true,
  },
  namaSa: {
    type: String,
    required: true,
  },
  // layanan: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'Layanan', // Referensi ke koleksi Layanan
  //   },
  // ],
  // spareparts: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'Sparepart', // Referensi ke koleksi Sparepart
  //   },
  // ],
  summary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Summary', // Referensi ke Summary
    default: null, // Bisa null jika Summary belum ada
  },
  responsMekanik: {
    type: String,
    default: '-',
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer', // Referensi ke koleksi Customer
    required: true, 
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle', // Referensi ke koleksi Vehicle
    required: true,
  },
});

const PKB = mongoose.model('PKB', pkbSchema);

export default PKB;