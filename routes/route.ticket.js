// routes/service.js
import { Router } from 'express';
import Service from '../models/ticket.js';

const router = Router();

// Create Service Entry (Tambah Servis)
router.post('/', async (req, res) => {
    const { noPolisi, kilometer, tanggalMasuk } = req.body;

    try {
        const existingService = await Service.findOne({ noPolisi, tanggalMasuk });
        if (existingService) {
            return res.status(400).json({ message: 'Service entry already exists for this vehicle on this date' });
        }

        const newService = new Service({ noPolisi, kilometer, tanggalMasuk });
        await newService.save();
        
        res.status(201).json({ message: 'Service entry created successfully', service: newService });
    } catch (error) {
        res.status(500).json({ message: 'Error creating service entry', error });
    }
});

// Get All Service Entries (Get Semua Servis)
router.get('/', async (req, res) => {
    const { tanggalMasuk } = req.query;  // Ambil tanggalMasuk dari query parameter

    try {
        let services;
        
        // Jika ada tanggalMasuk, filter berdasarkan tanggalMasuk
        if (tanggalMasuk) {
            services = await Service.find({ tanggalMasuk });
        } else {
            // Jika tidak ada tanggalMasuk, ambil semua data
            services = await Service.find();
        }

        res.status(200).json({ services });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching service entries', error });
    }
});

// Get Service Entry by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const service = await Service.findById(id);
        if (!service) {
            return res.status(404).json({ message: 'Service entry not found' });
        }
        res.status(200).json({ service });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching service entry', error });
    }
});

// Update Service Entry (Update Servis)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { noPolisi, kilometer, tanggalMasuk } = req.body;

    try {
        const updatedService = await Service.findByIdAndUpdate(id, { noPolisi, kilometer, tanggalMasuk }, { new: true });
        
        if (!updatedService) {
            return res.status(404).json({ message: 'Service entry not found' });
        }

        res.status(200).json({ message: 'Service entry updated successfully', service: updatedService });
    } catch (error) {
        res.status(500).json({ message: 'Error updating service entry', error });
    }
});

// Delete Service Entry (Hapus Servis)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedService = await Service.findByIdAndDelete(id);
        
        if (!deletedService) {
            return res.status(404).json({ message: 'Service entry not found' });
        }
        
        res.status(200).json({ message: 'Service entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting service entry', error });
    }
});

export default router;
