const mongoose = require('mongoose');

const jobDescriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  title: String,

  company: String,

  content: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

JobDescriptionSchema.index({
  userId: 1,
  createdAt: -1
});

module.exports = mongoose.model(
  "JobDescription",
  jobDescriptionSchema
);