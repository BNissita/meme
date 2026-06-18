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
  },
  title: {
    type: String,
    default: "Interview Report"
  },

  executiveSummary: {
    type: String,
    default: ""
  },

  confidenceScore: {
    type: Number,
    default: 0
  },

  behavioralScore: {
    type: Number,
    default: 0
  },

  jdMatchScore: {
    type: Number,
    default: 0
  },

  appearanceAnalysis: {
    type: String,
    default: ""
  },

  behavioralAnalysis: {
    type: String,
    default: ""
  },

  emotionalAnalysis: {
    type: String,
    default: ""
  },

  hireRecommendation: {
    type: String,
    default: ""
  },

  topPositiveMoment: {
    type: String,
    default: ""
  },

  topImprovementMoment: {
    type: String,
    default: ""
  },

  transcript: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },

  perceptionAnalysis: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  whatWentWell: {
    type: [String],
    default: []
  },

  whatHurtScore: {
    type: [String],
    default: []
  }
}
);

module.exports = mongoose.model('Report', ReportSchema);
