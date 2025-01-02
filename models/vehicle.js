import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  noPolisi: {
    type: String,
    required: true,
    unique: true, // No Polisi harus unik
  },
  noRangka: {
    type: String,
    required: true,
    unique: true, // No Rangka harus unik
  },
  noMesin: {
    type: String,
    required: true,
    unique: true, // No Mesin harus unik
  },
  tipe: {
    type: String,
    required: true,
  },
  tahun: {
    type: Number,
    required: true,
  },
  produk: {
    type: String,
    required: true,
  },
  kilometer: {
    type: Number,
    required: true,
  },
  customer: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Customer', // Referensi ke koleksi Customer
  required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Otomatis menambahkan tanggal pembuatan data
  },
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;