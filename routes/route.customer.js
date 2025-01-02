import { Router } from 'express';
import Customer from '../models/customer.js';
import User from '../models/user.js';
// import { authenticate } from '../middleware/middleware.auth.js';
// import { authorize } from '../middleware/middleware.authorize.js';

const router = Router();

// Create Customer (POST)
router.post('/', async (req, res) => {
  const { nama, alamat, noTelp, userName } = req.body;

  try {
    // Cari Customer berdasarkan nama

    const user = await User.findOne({username: userName });
    // console.log(user)
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const newCustomer = new Customer({ nama, alamat, noTelp, userName: user._id });
    await newCustomer.save();

    res.status(201).json({
      message: 'Customer created successfully',
      customer: newCustomer,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating customer', error });
  }
});

// Get All Customers (GET)
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json({ customers });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customers', error });
  }
});

// Get Customer by ID (GET by ID)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json({ customer });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer', error });
  }
});

// Search Customers by Name
router.get('/search', async (req, res) => {
    const { nama } = req.query; // Ambil query parameter 'nama'
  
    try {
      if (!nama) {
        return res.status(400).json({ message: 'Nama is required for search' });
      }
  
      const customers = await Customer.find({ nama: { $regex: nama, $options: 'i' } });
      res.status(200).json({ customers });
    } catch (error) {
      res.status(500).json({ message: 'Error searching customers', error });
    }
  });
  
// Get Customer by Username (GET /search-by-username/:username)
router.get('/search-by-username/:username', async (req, res) => {
  const { username } = req.params;

  try {
    // Cari User berdasarkan username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: `User with username "${username}" not found` });
    }

    // Cari Customer berdasarkan ID User
    const customer = await Customer.findOne({ userName: user._id }).populate('userName', 'username');

    if (!customer) {
      return res.status(404).json({ message: `Customer not found for the username "${username}"` });
    }

    res.status(200).json({ customer });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer by username', error });
  }
});


// Update Customer (PUT - Full Update)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nama, alamat, noTelp } = req.body;

  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { nama, alamat, noTelp },
      { new: true, runValidators: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json({
      message: 'Customer updated successfully',
      customer: updatedCustomer,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating customer', error });
  }
});

// Partial Update Customer (PATCH)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json({
      message: 'Customer partially updated successfully',
      customer: updatedCustomer,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating customer', error });
  }
});

// Delete Customer (DELETE)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCustomer = await Customer.findByIdAndDelete(id);

    if (!deletedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting customer', error });
  }
});

export default router;
