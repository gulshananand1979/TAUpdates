const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
  type: String,
  title: String,
  description: String,
  timestamp: Date,
  department: String,
  icon: String,
});

module.exports = mongoose.model('Update', updateSchema);
