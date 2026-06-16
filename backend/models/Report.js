const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true
  },
  overallScore: { type: Number, required: true, min: 0, max: 100 },
  technicalScore: { type: Number, required: true, min: 0, max: 100 },
  communicationScore: { type: Number, required: true, min: 0, max: 100 },
  problemSolvingScore: { type: Number, required: true, min: 0, max: 100 },
  strengths: { type: [String], default: [] },
  weaknesses: { type: [String], default: [] },
  missedConcepts: { type: [String], default: [] },
  recommendedTopics: { type: [String], default: [] },
  improvementPlan: { type: String, default: '' },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', ReportSchema);
