// const mongoose = require("mongoose");

// const userSkillSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     skill: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Skill",
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["completed", "in-progress", "locked"],
//       default: "in-progress",
//     },
//     score: {
//       type: Number,
//       default: 0, // stores assessment score for this skill
//     },
//     attempts: {
//       type: Number,
//       default: 0, // number of assessment attempts
//     },
//     lastAttemptAt: {
//   type: Date
// },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("UserSkill", userSkillSchema);

const mongoose = require("mongoose");

const userSkillSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
     jobRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobRole",
      required: true,
    },

    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },

    status: {
      type: String,
      enum: ["locked", "in-progress", "completed"],
      default: "locked",
    },

    // 🔑 assessment progress inside this skill
    currentAssessmentLevel: {
      type: Number,
      default: 1,
    },

    completedAssessmentLevels: [
      {
        type: Number,
      }
    ],

    attemptsByLevel: {
      type: Map,
      of: Number, // { "1": 2, "2": 1 }
      default: {},
    },

    lastAttemptAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// one skill per user only once
userSkillSchema.index({ user: 1, skill: 1 }, { unique: true });

module.exports = mongoose.model("UserSkill", userSkillSchema);
