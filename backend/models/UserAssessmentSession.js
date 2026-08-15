const mongoose = require("mongoose");

const userAssessmentSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assessment: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment", required: true },
  startTime: { type: Date, required: true },
  submitted: { type: Boolean, default: false },

  // ── Phase 4 Additions for dynamic/adaptive sessions ──
  questionsPool: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question"
  }],
  
  questionsAnswered: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    userAnswer: String,
    isCorrect: Boolean,
    difficulty: { type: String, enum: ["easy", "medium", "hard"] }
  }],
  
  adaptiveState: {
    currentDifficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy"
    },
    consecutiveCorrect: { type: Number, default: 0 },
    consecutiveIncorrect: { type: Number, default: 0 }
  }
});

module.exports = mongoose.model("UserAssessmentSession", userAssessmentSessionSchema);
