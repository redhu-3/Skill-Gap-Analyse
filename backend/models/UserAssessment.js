const mongoose = require("mongoose");

const userAssessmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    level: {
      type: Number,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
    timeTaken: {
      type: Number,
      default: 0,
    },

    // ── Phase 4 Additions ──
    assessmentVersion: {
      type: Number,
      default: 1
    },

    adaptiveQuestionsCount: {
      type: Number,
      default: 0
    },

    skillBreakdown: [{
      skill: { type: mongoose.Schema.Types.ObjectId, ref: "Skill" },
      totalQuestions: Number,
      correctCount: Number,
      passed: Boolean
    }],

    competencyBreakdown: [{
      competencyArea: String,
      totalQuestions: Number,
      correctCount: Number,
      score: Number // percentage
    }],

    weightedScore: {
      type: Number,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserAssessment", userAssessmentSchema);
