const mongoose = require("mongoose");

const readinessConfigSchema = new mongoose.Schema({
  // ── Readiness Formulas ──
  formulas: {
    assessmentWeight: { type: Number, default: 0.7 },    // assessment score contribution weight
    skillCompletionWeight: { type: Number, default: 0.3 }, // skill completion status contribution weight
    mandatorySkillPenalty: { type: Number, default: 0.25 }  // multiplier penalty if mandatory skills are failed
  },
  
  // ── Gap severity levels ──
  gapRules: [{
    label: { type: String, required: true }, // e.g. "Critical Gap", "Moderate Gap", "Strong Skill"
    minThreshold: { type: Number, required: true }, // e.g. 0
    maxThreshold: { type: Number, required: true }, // e.g. 40
    color: { type: String, required: true }, // HEX or color class name
    priority: { type: String, enum: ["high", "medium", "low"], default: "medium" }
  }],
  
  // ── Industry Readiness Categories ──
  industryLevels: [{
    label: { type: String, required: true }, // e.g. "Beginner", "Industry Ready", "Expert"
    minThreshold: { type: Number, required: true },
    maxThreshold: { type: Number, required: true },
    color: { type: String, required: true }
  }],

  // ── Benchmark Rules ──
  benchmarks: {
    defaultBenchmarkScore: { type: Number, default: 80 }, // default target for any skill if not specified in role
    allowRoleOverrides: { type: Boolean, default: true }
  },

  // ── Recommendation Triggers ──
  recommendationRules: [{
    triggerMetric: { type: String, enum: ["score", "gap_percentage"], default: "score" },
    thresholdOperator: { type: String, enum: ["lt", "lte", "gt", "gte"], default: "lt" },
    thresholdValue: { type: Number, default: 60 },
    recommendationType: { type: String, enum: ["learning_path", "projects", "interview_prep"] }
  }]
}, { timestamps: true });

module.exports = mongoose.model("ReadinessConfig", readinessConfigSchema);
