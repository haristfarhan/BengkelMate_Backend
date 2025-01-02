import mongoose from 'mongoose';

// Skema untuk Future
const futureSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle', // Referensi ke model Vehicle berdasarkan noRangka
    required: true,
  },
  tanggalServisKembali: {
    type: Date,
    required: true,
  },
  nextKm: {
    type: Number,
    required: true,
  },
  layanan: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Layanan', // Referensi ke model Layanan berdasarkan nama layanan
      required: true,
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Future = mongoose.model('Future', futureSchema);

export { Future};
