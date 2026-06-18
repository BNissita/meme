const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  technologies: { type: [String], default: [] }
});

const ExperienceSchema = new mongoose.Schema({
  role: { type: String, default: '' },
  company: { type: String, default: '' },
  duration: { type: String, default: '' },
  description: { type: String, default: '' }
});

const EducationSchema = new mongoose.Schema({
  degree: { type: String, default: '' },
  institution: { type: String, default: '' },
  year: { type: String, default: '' }
});

const ResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: { type: String, default: '' },
  extractedText: { type: String, required: true },
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  skills: { type: [String], default: [] },
  projects: { type: [ProjectSchema], default: [] },
  experience: { type: [ExperienceSchema], default: [] },
  education: { type: [EducationSchema], default: [] },
  certifications: { type: [String], default: [] },
  summary: { type: String, default: '' },
  strengths: { type: [String], default: [] },
  weaknesses: { type: [String], default: [] },

  atsScore: {
    type: Number,
    default: 0
  },

  interviewReadiness: {
    type: Number,
    default: 0
  },

  aiSummary: {
    type: String,
    default: ""
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

ResumeSchema.index({
  userId: 1,
  createdAt: -1
});

module.exports = mongoose.model('Resume', ResumeSchema);
