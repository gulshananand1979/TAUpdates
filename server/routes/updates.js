const express = require('express');
const router = express.Router();
const Update = require('../models/Update');

// Get all
router.get('/', async (req, res) => {
  try {
    const updates = await Update.find().sort({ timestamp: -1 });
    res.json(updates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
