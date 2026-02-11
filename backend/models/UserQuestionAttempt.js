const mongoose = require("mongoose");

const userQuestionAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  assessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assessment",
    required: true,
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },

  // For MCQ & Fill
  answer: String,
  isCorrect: Boolean,

  // For Coding
  code: String,
  language: String,
  allPublicPassed: Boolean,
  allHiddenPassed: Boolean,

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("UserQuestionAttempt", userQuestionAttemptSchema);
