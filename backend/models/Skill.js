const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Skill name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Skill category is required"],
      trim: true,
    },
    jobRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobRole",
      required: [true, "Job Role reference is required"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    priority: {
      type: String,
      enum: ["core", "secondary", "optional"],
      default: "core",
    },
    difficulty: { type: Number, min: 1, max: 5 },
    industryDemandScore: { type: Number, min: 1, max: 5 },
    importanceScore: { type: Number, min: 1, max: 5 },
    statusClassification: { type: String, enum: ["Emerging", "Current", "Legacy"], default: "Current" },
    isMandatory: {
      type: Boolean,
      default: true,
    },
    weightage: {
      type: Number,
      default: 0,
    },
    competencyArea: {
      type: String,
      default: "Core Skills",
    },
    weightageHistory: [{
      oldWeightage: { type: Number },
      newWeightage: { type: Number },
      modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
      changedAt: { type: Date, default: Date.now },
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    prerequisites: [{
      skill: { type: mongoose.Schema.Types.ObjectId, ref: "Skill" },
      dependencyType: { type: String, enum: ["Required", "Recommended", "Optional"] }
    }],
    aiMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    // Phase 3: trace which AIRecommendation generated this skill (null for manual)
    aiGeneratedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AIRecommendation",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Skill", skillSchema);
