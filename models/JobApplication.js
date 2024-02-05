const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  company: { type: String, required: true },
  applicationDate: { type: Date, required: true },
  status: { type: String, required: true },
});

module.exports = mongoose.model('JobApplication', jobApplicationSchema);