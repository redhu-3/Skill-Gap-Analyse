const mongoose = require("mongoose");

const skillAliasSchema = new mongoose.Schema({
  alias: { 
    type: String, 
    required: [true, "Alias name is required"], 
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

module.exports = mongoose.model("SkillAlias", skillAliasSchema);
