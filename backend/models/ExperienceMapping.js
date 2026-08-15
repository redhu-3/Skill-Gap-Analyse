const mongoose = require("mongoose");

const experienceMappingSchema = new mongoose.Schema({
  experiencePattern: { 
    type: String, 
    required: [true, "Experience pattern/phrase is required"], 
    unique: true, 
    trim: true 
  },
  mappedSkills: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Skill" 
  }],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Admin" 
  }
}, { timestamps: true });

module.exports = mongoose.model("ExperienceMapping", experienceMappingSchema);
