// backend/models/SkillRelation.js

const mongoose = require('mongoose');

const skillRelationSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true, index: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true, index: true },
  type: {
    type: String,
    enum: ['parent', 'child', 'prerequisite', 'related'],
    required: true,
  },
  // only for prerequisite edges
  dependencyType: {
    type: String,
    enum: ['Required', 'Recommended', 'Optional'],
  },
}, { timestamps: true });

module.exports = mongoose.model('SkillRelation', skillRelationSchema);
