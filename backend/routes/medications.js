import express from 'express';
import { protect } from '../middleware/auth.js';
import Medication from '../database/models/Medication.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Get all medications for user
router.get('/', async (req, res) => {
  try {
    const medications = await Medication.find({ userId: req.user._id }).sort({ active: -1, name: 1 });
    res.json({ success: true, count: medications.length, data: medications });
  } catch (error) {
    logger.error('Error fetching medications:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Create a new medication
router.post('/', async (req, res) => {
  try {
    req.body.userId = req.user._id;
    const medication = await Medication.create(req.body);
    res.status(201).json({ success: true, data: medication });
  } catch (error) {
    logger.error('Error creating medication:', error);
    res.status(400).json({ success: false, message: error.message || 'Invalid data' });
  }
});

// Update a medication
router.put('/:id', async (req, res) => {
  try {
    let medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ success: false, message: 'Medication not found' });
    }
    if (medication.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    medication = await Medication.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.json({ success: true, data: medication });
  } catch (error) {
    logger.error('Error updating medication:', error);
    res.status(400).json({ success: false, message: error.message || 'Invalid data' });
  }
});

// Delete a medication
router.delete('/:id', async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ success: false, message: 'Medication not found' });
    }
    if (medication.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    await medication.deleteOne();
    res.json({ success: true, data: {} });
  } catch (error) {
    logger.error('Error deleting medication:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

export default router;
