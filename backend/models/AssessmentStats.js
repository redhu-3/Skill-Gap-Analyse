const mongoose = require("mongoose");

const assessmentStatsSchema = new mongoose.Schema(
  {
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
      unique: true, // one metrics summary per assessment
    },
    attemptCount: {
      type: Number,
      default: 0,
    },
    passRate: {
      type: Number,
      default: 0.0, // percentage (0 to 100)
    },
    averageScore: {
      type: Number,
      default: 0.0,
    },
    questionMetrics: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },
        totalAttempts: {
          type: Number,
          default: 0,
        },
        successRate: {
          type: Number,
          default: 0.0,
        },
      },
    ],
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AssessmentStats", assessmentStatsSchema);
