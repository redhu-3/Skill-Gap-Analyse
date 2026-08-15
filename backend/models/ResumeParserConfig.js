const mongoose = require("mongoose");

const resumeParserConfigSchema = new mongoose.Schema({
  confidenceWeights: {
    exactMatch: { type: Number, default: 100 },
    aliasMatch: { type: Number, default: 95 },
    keywordMatch: { type: Number, default: 80 },
    fuzzyMatch: { type: Number, default: 70 }
  },
  thresholds: {
    highMin: { type: Number, default: 90 },
    mediumMin: { type: Number, default: 70 },
    lowMin: { type: Number, default: 0 }
  },
  rules: {
    enableFuzzyMatching: { type: Boolean, default: true },
    fuzzyThreshold: { type: Number, default: 0.8 },
    caseSensitive: { type: Boolean, default: false }
  },
  roleMatching: {
    formulaType: { 
      type: String, 
      enum: ["weighted_sum", "simple_coverage", "mandatory_first"], 
      default: "weighted_sum" 
    },
    customFormula: { type: String, default: "(skillWeight * score) / totalWeight" },
    minMatchPercentage: { type: Number, default: 60 }
  },
  benchmarks: {
    industryCompareEnabled: { type: Boolean, default: true },
    competencyTargetScore: { type: Number, default: 75 }
  },
  workflow: {
    autoTransitionToUnderReview: { type: Boolean, default: true },
    requireAdminApprovalForExport: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model("ResumeParserConfig", resumeParserConfigSchema);
