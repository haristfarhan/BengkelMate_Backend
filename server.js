// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/route.auth.js'; // Rute autentikasi
import serviceRoutes from './routes/route.ticket.js'; // Rute servis kendaraan
import customerRoutes from './routes/route.customer.js' // rute customer
import vehicleRoutes from './routes/route.vehicle.js'// rute kendaraan
import pkbRoutes from './routes/route.pkb.js' // rute PKB
import sparepartRoutes from './routes/route.sparepart.js'
import sparepart2Routes from './routes/route.sparepart_2.js'
import layananRoutes from './routes/route.layanan.js'
import progressRoutes from './routes/route.progress.js'
import futureRoutes from './routes/route.future.js'
import summaryRoutes from './routes/route.summary.js'
import multer from 'multer';
import path from 'path';

dotenv.config();
const app = express();

// Middleware
// app.use(cors());
app.use(cors({
    origin: process.env.FRONTEND_URL, // Ganti dengan URL frontend Anda
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Metode yang diizinkan
    credentials: true, // Jika Anda menggunakan cookies atau credentials
  }));
app.use(express.json());
app.use(bodyParser.json());

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Konfigurasi Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads'); // Folder untuk menyimpan file sementara
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  
  const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      cb(null, true);
    } else {
      cb(new Error('File must be an Excel file'), false);
    }
  };
  
  const upload = multer({
    storage,
    fileFilter,
  });


// Routes
app.get('/', (req,res) => {
    res.send("Hello");
})

app.use('/api/auth', authRoutes); // Rute autentikasi
app.use('/api/tickets', serviceRoutes); // Rute servis kendaraan
app.use('/api/customers', customerRoutes); // Rute data customer
app.use('/api/vehicles', vehicleRoutes); // rute vehicle
app.use('/api/pkb', pkbRoutes) // rute PKB
app.use('/api/spareparts', sparepartRoutes) // rute sparepart
app.use('/api/layanan', layananRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/futures',futureRoutes)
app.use('/api/summary',summaryRoutes)
app.use('/api/sparepart_2',sparepart2Routes)

// Database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('Database connection error:', err));

// Server listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
