import mongoose from 'mongoose';

const sparepartSchema = new mongoose.Schema({
  namaPart: {
    type: String,
    required: true,
  },
  number: {
    type: String,
    required: true,
    unique: true, // Nomor sparepart harus unik
    match: /^\d{2}-\d{5}-\d{3}-[0-9A-Za-z]$/, // Pola: 00-00000-000-0/A-Z
  },
  stock: {
    type: Number,
    required: true,
    min: 0, // Stock tidak boleh negatif
  },
  harga: {
    type: Number,
    required: true,
    min: 0, // Harga tidak boleh negatif
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Sparepart = mongoose.model('Sparepart', sparepartSchema);

export default Sparepart;
