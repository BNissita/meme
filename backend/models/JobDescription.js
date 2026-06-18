const mongoose = require('mongoose');

const jobDescriptionSchema = new mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId,ref: "User",required: true,},
  title: { type: String, default: 'Untitled Position' },
  company: { type: String, default: '' },
  content: {type: String,required: true,},
  requiredSkills: { type: [String], default: [] },
  responsibilities: { type: [String], default: [] },
  experienceRequirements: { type: String, default: '' },
  technologies: { type: [String], default: [] },
  softSkills: { type: [String], default: [] },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
jobDescriptionSchema.index({
  userId: 1,
  createdAt: -1
});

module.exports = mongoose.model("JobDescription",jobDescriptionSchema);