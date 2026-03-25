const express = require('express');
const router = express.Router();
const Position = require('../models/Position');

// Get all
router.get('/', async (req, res) => {
  try {
    const positions = await Position.find().sort({ posted: -1 });
    res.json(positions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create one
router.post('/', async (req, res) => {
  const position = new Position({
    ...req.body,
    posted: new Date(),
    applicants: 0,
    status: req.body.status || 'Active',
    priority: req.body.priority || 'Medium'
  });

  // Convert comma-separated string to array if needed
  if (typeof position.skills === 'string') {
    position.skills = position.skills.split(',').map(s => s.trim());
  }

  try {
    const newPosition = await position.save();
    res.status(201).json(newPosition);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update one
router.put('/:id', async (req, res) => {
  try {
    // If skills is a string, convert to array
    if (req.body.skills && typeof req.body.skills === 'string') {
      req.body.skills = req.body.skills.split(',').map(s => s.trim());
    }

    const updatedPosition = await Position.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedPosition) return res.status(404).json({ message: 'Position not found' });
    res.json(updatedPosition);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete one
router.delete('/:id', async (req, res) => {
  try {
    const deletedPosition = await Position.findByIdAndDelete(req.params.id);
    if (!deletedPosition) return res.status(404).json({ message: 'Position not found' });
    res.json({ message: 'Position deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

