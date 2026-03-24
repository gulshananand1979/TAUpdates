const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');

// Get all
router.get('/', async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ appliedDate: -1 });
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create one
router.post('/', async (req, res) => {
  const nameParts = req.body.name ? req.body.name.split(' ') : [''];
  const avatar = nameParts.length > 1 
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
    : (req.body.name ? req.body.name.substring(0, 2).toUpperCase() : 'NA');

  const candidate = new Candidate({
    ...req.body,
    appliedDate: new Date(),
    status: req.body.status || 'Under Review',
    stage: req.body.stage || 'Resume Screening',
    feedback: req.body.feedback || '',
    hiringManager: req.body.hiringManager || '',
    avatar: avatar
  });

  try {
    const newCandidate = await candidate.save();
    res.status(201).json(newCandidate);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update one
router.put('/:id', async (req, res) => {
  try {
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Return the updated document
    );
    if (!updatedCandidate) return res.status(404).json({ message: 'Candidate not found' });
    res.json(updatedCandidate);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
