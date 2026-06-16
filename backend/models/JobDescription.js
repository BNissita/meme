const mongoose = require('mongoose');

const JobDescriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: { type: String, default: 'Untitled Position' },
  company: { type: String, default: '' },
  jdText: { type: String, required: true },
  requiredSkills: { type: [String], default: [] },
  responsibilities: { type: [String], default: [] },
  experienceRequirements: { type: String, default: '' },
  technologies: { type: [String], default: [] },
  softSkills: { type: [String], default: [] },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('JobDescription', JobDescriptionSchema);
