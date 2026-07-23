import express from 'express';
import { protect } from '../middleware/auth.js';
import Goal from '../database/models/Goal.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Get all active goals for user
router.get('/', async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: goals.length, data: goals });
  } catch (error) {
    logger.error('Error fetching goals:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Create a new goal
router.post('/', async (req, res) => {
  try {
    req.body.userId = req.user._id;
    const goal = await Goal.create(req.body);
    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    logger.error('Error creating goal:', error);
    res.status(400).json({ success: false, message: error.message || 'Invalid data' });
  }
});

// Update a goal (e.g., current progress or status)
router.put('/:id', async (req, res) => {
  try {
    let goal = await Goal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }
    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.json({ success: true, data: goal });
  } catch (error) {
    logger.error('Error updating goal:', error);
    res.status(400).json({ success: false, message: error.message || 'Invalid data' });
  }
});

// Delete a goal
router.delete('/:id', async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }
    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    await goal.deleteOne();
    res.json({ success: true, data: {} });
  } catch (error) {
    logger.error('Error deleting goal:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

export default router;
