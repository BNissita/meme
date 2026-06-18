const mongoose = require('mongoose');

const EvaluationSchema = new mongoose.Schema({
  relevance: { type: Number, min: 0, max: 10, default: 0 },
  accuracy: { type: Number, min: 0, max: 10, default: 0 },
  communication: { type: Number, min: 0, max: 10, default: 0 },
  completeness: { type: Number, min: 0, max: 10, default: 0 },
  confidence: { type: Number, min: 0, max: 10, default: 0 },
  score: { type: Number, min: 0, max: 10, default: 0 }, // Overall out of 10
  feedback: { type: String, default: '' },
  suggestions: { type: String, default: '' }
}, { _id: false });

const AnswerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  question: { type: String, required: true },
  type: { type: String, enum: ['Technical', 'HR', 'Behavioral', 'Project-Based'], default: 'Technical' },
  answer: { type: String, required: true },
  evaluation: { type: EvaluationSchema }
}, { _id: false });

const QuestionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  question: { type: String, required: true },
  type: { type: String, enum: ['Technical', 'HR', 'Behavioral', 'Project-Based'], default: 'Technical' }
}, { _id: false });

const InterviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  jdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobDescription',
    required: true
  },
  questions: [QuestionSchema],
  answers: [AnswerSchema],
  status: {
    type: String,
    enum: ['in-progress', 'completed'],
    default: 'in-progress'
  },
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  tavusConversationId: {
  type: String,
  default: null
},

tavusConversationUrl: {
  type: String,
  default: null
},

transcript: {
  type: String,
  default: ""
},
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Interview', InterviewSchema);
