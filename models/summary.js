import mongoose from 'mongoose';

const summarySchema = new mongoose.Schema({
    noPkb: {
     type: mongoose.Schema.Types.ObjectId,
     required: true,
     ref: 'PKB', // Referensi ke koleksi PKB
    },
  layanan: [
    {
        namaLayanan: {
          type: String,
          required: true,
        },
        quantity: {
        type: Number,
        required: true,
        min: 1, // Minimal quantity adalah 1
      },
      harga: {
        type: Number,
        required: true, // Harga diambil dari database layanan
      },
      total: {
        type: Number,
        required: true, // Total dihitung sebagai harga x quantity
      },
    },
  ],
  sparepart: [
    {
      namaPart: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1, // Minimal quantity adalah 1
      },
      harga: {
        type: Number,
        required: true, // Harga diambil dari database sparepart
      },
      total: {
        type: Number,
        required: true, // Total dihitung sebagai harga x quantity
      },
    },
  ],
  totalHarga: {
    type: Number,
    required: true,
    default: 0, // Total harga dihitung sebagai total layanan + total sparepart
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Summary = mongoose.model('Summary', summarySchema);

export default Summary;
