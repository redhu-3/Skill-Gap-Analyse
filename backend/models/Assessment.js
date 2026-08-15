const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },

    name: {
      type: String,
      required: true, // e.g. "Level 1", "Beginner"
    },

    level: {
      type: Number,
      required: true, // 1, 2, 3...
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        validate: {
          validator: function(arr) {
            // Bypass validator if not using static questions
            if (this.selectionMode && this.selectionMode !== "static") return true;
            return arr.length >= this.randomPick;
          },
          message: 'Questions array must have at least randomPick number of questions'
        }
      }
    ],

    totalQuestions: {
      type: Number,
      required: true,
    },

    randomPick: {
      type: Number,
      required: true, // how many to show to user
    },

    timer: {
      type: Number, // seconds
      required: true,
    },

    minPassingPercentage: {
      type: Number,
      required: true,
    },

    maxAttempts: {
      type: Number,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "review", "approved", "published", "archived", "inactive"],
      default: "draft",
    },

    // ── Phase 4 Additions ──
    version: {
      type: Number,
      default: 1
    },

    isActiveVersion: {
      type: Boolean,
      default: true
    },

    selectionMode: {
      type: String,
      enum: ["static", "dynamic_pool", "adaptive"],
      default: "static"
    },

    blueprint: {
      totalQuestions: { type: Number, default: 10 },
      difficultyDistribution: {
        easy: { type: Number, default: 40 },   // percentage
        medium: { type: Number, default: 40 }, // percentage
        hard: { type: Number, default: 20 }    // percentage
      },
      skillsCovered: [{
        skill: { type: mongoose.Schema.Types.ObjectId, ref: "Skill" },
        questionCount: Number
      }]
    },

    adaptiveRules: {
      baseDifficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
      thresholdToUpgrade: { type: Number, default: 2 },
      thresholdToDowngrade: { type: Number, default: 1 }
    },

    skillThresholds: [{
      skill: { type: mongoose.Schema.Types.ObjectId, ref: "Skill" },
      minPassingPercentage: { type: Number, default: 70 }
    }],

    skillWeightages: [{
      skill: { type: mongoose.Schema.Types.ObjectId, ref: "Skill" },
      weight: { type: Number, default: 1.0 }
    }]
  },
  { timestamps: true }
);
assessmentSchema.index({ skill: 1, level: 1 }, { unique: false }); // Disable unique index since multiple versions of same level will exist. Instead version is scoped.
module.exports = mongoose.model("Assessment", assessmentSchema);
