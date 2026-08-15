const mongoose = require("mongoose");

const learningPathTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  jobRole: { type: mongoose.Schema.Types.ObjectId, ref: "JobRole", required: true },
  difficulty: { type: String, enum: ["beginner", "intermediate", "advanced", "fast_track"], default: "beginner" },
  description: { type: String },
  steps: [{
    stepNumber: { type: Number, required: true },
    skill: { type: mongoose.Schema.Types.ObjectId, ref: "Skill", required: true },
    estimatedDuration: {
      value: { type: Number, default: 7 },
      unit: { type: String, enum: ["hours", "days", "weeks"], default: "days" }
    },
    milestone: { type: String }
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("LearningPathTemplate", learningPathTemplateSchema);
