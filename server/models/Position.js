const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
  title: String,
  department: String,
  location: String,
  type: String,
  experience: String,
  posted: Date,
  applicants: Number,
  status: String,
  priority: String,
  description: String,
  skills: [String],
  taPartner: String,
});

module.exports = mongoose.model('Position', positionSchema);
