const mongoose = require("mongoose");

const learningResourceSchema = new mongoose.Schema({
  skill: { type: mongoose.Schema.Types.ObjectId, ref: "Skill", required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ["course", "video", "documentation", "article", "practice_platform"], required: true },
  url: { type: String, required: true },
  description: { type: String },
  estimatedDurationMins: { type: Number, default: 60 }
}, { timestamps: true });

module.exports = mongoose.model("LearningResource", learningResourceSchema);
