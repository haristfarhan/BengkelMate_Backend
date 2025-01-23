import mongoose from 'mongoose';

const sparepart2Schema = new mongoose.Schema({
  namaPart: {
    type: String,
    required: true,
  },
  number: {
    type: String,
    required: true,
    unique: true, // Nomor sparepart harus unik
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
  isDeleted: { 
    type: Boolean, default: false 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Sparepart_2 = mongoose.model('Sparepart_2', sparepart2Schema);

export default Sparepart_2;
