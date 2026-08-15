const mongoose = require("mongoose");

const resumeKeywordMappingSchema = new mongoose.Schema({
  keyword: { 
    type: String, 
    required: [true, "Keyword is required"], 
    unique: true, 
    trim: true 
  },
  skill: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Skill", 
    required: [true, "Skill reference is required"] 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Admin" 
  }
}, { timestamps: true });

module.exports = mongoose.model("ResumeKeywordMapping", resumeKeywordMappingSchema);
