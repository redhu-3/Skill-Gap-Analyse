const mongoose = require("mongoose");

const userLearningPathSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  jobRole: { type: mongoose.Schema.Types.ObjectId, ref: "JobRole", required: true },
  templateUsed: { type: mongoose.Schema.Types.ObjectId, ref: "LearningPathTemplate" },
  steps: [{
    skill: { type: mongoose.Schema.Types.ObjectId, ref: "Skill" },
    status: { type: String, enum: ["locked", "in-progress", "completed"], default: "locked" },
    scoreSnapshot: { type: Number, default: 0 },
    completedAt: { type: Date }
  }],
  estimatedCompletionDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("UserLearningPath", userLearningPathSchema);
