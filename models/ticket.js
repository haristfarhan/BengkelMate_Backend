// models/service.js
import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    noPolisi: { type: String, required: true, unique: true }, // No. Polisi
    kilometer: { type: Number, required: true }, // Kilometer Kendaraan
    tanggalMasuk: { type: Date, required: true, default: Date.now }, // Tanggal Masuk
}, { timestamps: true });

const Ticket = mongoose.model('Tickets', ticketSchema);

export default Ticket;
