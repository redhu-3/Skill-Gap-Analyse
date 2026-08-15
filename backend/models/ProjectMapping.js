const mongoose = require("mongoose");

const projectMappingSchema = new mongoose.Schema({
  projectPattern: { 
    type: String, 
    required: [true, "Project pattern/title is required"], 
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

module.exports = mongoose.model("ProjectMapping", projectMappingSchema);
