import mongoose from 'mongoose';

const layananSchema = new mongoose.Schema({
  namaLayanan: {
    type: String,
    required: true,
    unique: true, // Nama layanan harus unik
  },
  harga: {
    type: Number,
    required: true,
    min: 0, // Harga tidak boleh negatif
  },
  isDeleted: { 
    type: Boolean, default: false 
  },
  createdAt: {
    type: Date,
    default: Date.now, // Otomatis menambahkan tanggal pembuatan data
  },
});

const Layanan = mongoose.model('Layanan', layananSchema);

export default Layanan;
