const mongoose = require("mongoose");

const certificationMappingSchema = new mongoose.Schema({
  certificationName: { 
    type: String, 
    required: [true, "Certification name is required"], 
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

module.exports = mongoose.model("CertificationMapping", certificationMappingSchema);
