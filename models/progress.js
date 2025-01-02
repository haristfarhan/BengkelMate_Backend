import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  persentase: {
    type: Number,
    required: true,
    min: 0,
    max: 100, // Persentase harus di antara 0 hingga 100
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'In Progress', 'Completed'], // Status hanya bisa salah satu dari opsi ini
  },
  progresLayanan: {
    type: String,
    required: true,
  },
  pkb: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'PKB', // Referensi ke koleksi PKB
},
vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Vehicle', // Referensi ke koleksi PKB
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;
