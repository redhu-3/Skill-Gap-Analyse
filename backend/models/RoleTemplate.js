const mongoose = require("mongoose");

const templateSkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, enum: ["core", "secondary", "optional"], default: "core" },
  isMandatory: { type: Boolean, default: true },
  weightage: { type: Number, required: true },
  competencyArea: { type: String, required: true },
  prerequisites: [String] // Named references to build dependency tree during seeding
});

const roleTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  industry: { type: String, required: true },
  experienceLevel: { type: String, enum: ["beginner", "junior", "mid", "senior"], required: true },
  estimatedLearningDuration: {
    value: { type: Number, required: true },
    unit: { type: String, enum: ["days", "weeks", "months"], default: "days" }
  },
  competencyAreas: [{
    name: { type: String, required: true },
    description: { type: String, default: "" },
    weightage: { type: Number, required: true }
  }],
  skills: [templateSkillSchema]
}, { timestamps: true });

module.exports = mongoose.model("RoleTemplate", roleTemplateSchema);
