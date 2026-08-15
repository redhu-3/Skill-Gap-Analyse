const mongoose = require("mongoose");

const jobRoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft"
    },
    version: {
      type: Number,
      default: 1
    },
    category: {
      type: String,
      default: "General"
    },
    industry: {
      type: String,
      default: "Software Development"
    },
    experienceLevel: {
      type: String,
      enum: ["beginner", "junior", "mid", "senior"],
      default: "junior"
    },
    estimatedLearningDuration: {
      value: { type: Number, default: 90 },
      unit: { type: String, enum: ["days", "weeks", "months"], default: "days" }
    },
    competencyAreas: [{
      name: { type: String, required: true },
      description: { type: String, default: "" },
      weightage: { type: Number, required: true },
      associatedSkills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }]
    }],
    readinessConfig: {
      formulaType: { type: String, enum: ["weighted", "simple"], default: "weighted" },
      coreWeight: { type: Number, default: 0.6 },
      secondaryWeight: { type: Number, default: 0.3 },
      optionalWeight: { type: Number, default: 0.1 },
      gapThresholds: {
        critical: { type: Number, default: 40 },
        moderate: { type: Number, default: 70 },
        strong: { type: Number, default: 100 }
      }
    },
    skillsBenchmark: [{
      skill: { type: mongoose.Schema.Types.ObjectId, ref: "Skill" },
      targetScore: { type: Number, default: 80 },
      isMandatory: { type: Boolean, default: false }
    }],
    isPreset: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true
    },
    // Phase 3: trace which AIRecommendation generated this role (null for manual)
    aiGeneratedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AIRecommendation",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobRole", jobRoleSchema);
