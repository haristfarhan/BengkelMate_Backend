import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true,
  },
  alamat: {
    type: String,
    required: true,
  },
  noTelp: {
    type: Number,
    required: true,
  },
  userName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Referensi ke koleksi User
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
