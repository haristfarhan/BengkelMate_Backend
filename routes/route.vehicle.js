import { Router } from 'express';
import Vehicle from '../models/vehicle.js';
import Customer from '../models/customer.js';
// import { authenticate } from '../middleware/middleware.auth.js';
// import { authorize } from '../middleware/middleware.authorize.js';

const router = Router();

// Create Vehicle (POST)
router.post('/', async (req, res) => {
  const { noPolisi, noRangka, noMesin, tipe, tahun, produk, kilometer, customerName } = req.body;

  try {
    // Cari Customer berdasarkan nama
    const customer = await Customer.findOne({ nama: customerName });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Buat dokumen Vehicle dengan referensi ke Customer
    const newVehicle = new Vehicle({
      noPolisi,
      noRangka,
      noMesin,
      tipe,
      tahun,
      produk,
      kilometer,
      customer: customer._id, // Simpan ID Customer
    });

    await newVehicle.save();

    res.status(201).json({
      message: 'Vehicle created successfully',
      vehicle: newVehicle,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating vehicle', error });
  }
});

// Get All Vehicles with Customer Details (GET)
router.get('/', async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate('customer', 'nama alamat noTelp'); // Ambil detail Customer
    res.status(200).json({ vehicles });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vehicles', error });
  }
});

// Get Vehicle by ID with Customer Details (GET by ID)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const vehicle = await Vehicle.findById(id).populate('customer', 'nama alamat noTelp'); // Ambil detail Customer

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.status(200).json({ vehicle });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vehicle', error });
  }
});

// Get Vehicles by Customer Name (GET /by-customer/:name)
router.get('/by-customer/:name', async (req, res) => {
  const { name } = req.params;

  try {
    // Cari Customer berdasarkan nama
    const customer = await Customer.findOne({ nama: name });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Cari Vehicle yang direferensikan oleh Customer tersebut
    const vehicles = await Vehicle.find({ customer: customer._id }).populate('customer', 'nama alamat noTelp');

    if (vehicles.length === 0) {
      return res.status(404).json({ message: 'No vehicles found for this customer' });
    }

    res.status(200).json({ vehicles });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vehicles by customer name', error });
  }
});

// Get Vehicles by Logged-In User (GET /by-user)
router.get('/by-user', async (req, res) => {
  try {
    // Ambil userId dari token (biasanya disimpan di `req.user` setelah middleware otentikasi)
    const userId = req.user._id; // Pastikan middleware otentikasi menambahkan req.user

    // Cari Customer berdasarkan userId
    const customer = await Customer.findOne({ user: userId });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found for this user' });
    }

    // Cari semua kendaraan yang dimiliki oleh Customer ini
    const vehicles = await Vehicle.find({ customer: customer._id }).populate('customer', 'nama alamat noTelp');

    if (vehicles.length === 0) {
      return res.status(404).json({ message: 'No vehicles found for this customer' });
    }

    res.status(200).json({ customer, vehicles });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vehicles by user', error });
  }
});


// Update Vehicle (PUT - Full Update)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { noPolisi, noRangka, noMesin, tipe, tahun, produk, kilometer, customerName } = req.body;

  try {
    // Cari Customer baru berdasarkan nama (jika diberikan)
    let customer;
    if (customerName) {
      customer = await Customer.findOne({ nama: customerName });

      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
    }

    // Update dokumen Vehicle
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      {
        noPolisi,
        noRangka,
        noMesin,
        tipe,
        tahun,
        produk,
        kilometer,
        customer: customer ? customer._id : undefined, // Perbarui referensi Customer jika diberikan
      },
      { new: true, runValidators: true }
    );

    if (!updatedVehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.status(200).json({
      message: 'Vehicle updated successfully',
      vehicle: updatedVehicle,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating vehicle', error });
  }
});

// Partial Update Vehicle (PATCH)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    // Jika ada `customerName` dalam pembaruan, cari ID Customer
    if (updates.customerName) {
      const customer = await Customer.findOne({ nama: updates.customerName });

      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      updates.customer = customer._id; // Tambahkan ID Customer ke pembaruan
      delete updates.customerName; // Hapus `customerName` untuk menghindari error validasi
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!updatedVehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.status(200).json({
      message: 'Vehicle partially updated successfully',
      vehicle: updatedVehicle,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating vehicle', error });
  }
});

// Delete Vehicle (DELETE)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedVehicle = await Vehicle.findByIdAndDelete(id);

    if (!deletedVehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting vehicle', error });
  }
});

export default router;
