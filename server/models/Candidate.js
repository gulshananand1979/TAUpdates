const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: String,
  role: String,
  email: String,
  status: String,
  stage: String,
  feedback: String,
  experience: String,
  technicalDetails: String,
  domain: String,
  appliedDate: Date,
  avatar: String,
  source: String,
  hiringManager: String,
});

module.exports = mongoose.model('Candidate', candidateSchema);
