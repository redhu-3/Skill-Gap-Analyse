const mongoose = require("mongoose");

const diagnosticResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // The raw score the user achieved by competency area or category
    scoresByCategory: {
      type: Map,
      of: Number,
      default: {},
    },
    // The exact score the user achieved on specific skills
    scoresBySkillName: {
      type: Map,
      of: Number,
      default: {},
    },
    // The algorithm's top matches
    recommendedRoles: [
      {
        jobRole: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "JobRole",
        },
        matchScore: {
          type: Number, // Percentage 0-100
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("DiagnosticResult", diagnosticResultSchema);
