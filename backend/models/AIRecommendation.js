const mongoose = require('mongoose');

const aiRecommendationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['jobRole', 'skill', 'weightage', 'dependency', 'competency', 'assessment', 'forecast'],
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'ai_generated', 'under_review', 'approved', 'rejected', 'published'],
      default: 'ai_generated',
    },
    targetEntity: {
      kind: { type: String },   // 'JobRole' | 'Skill' | null for new role generation
      id:   { type: mongoose.Schema.Types.ObjectId, default: null },
    },
    prompt:        { type: String, required: true },
    payload:       { type: mongoose.Schema.Types.Mixed, required: true }, // raw AI output
    editedPayload: { type: mongoose.Schema.Types.Mixed, default: null },  // admin-modified version
    adminNotes:    { type: String, default: '' },
    generatedBy:   { type: String, default: 'gemini-1.5-flash' },
    reviewedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    reviewedAt:    { type: Date, default: null },
    publishedAt:   { type: Date, default: null },
    createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  },
  { timestamps: true }
);

// Index for fast queue queries
aiRecommendationSchema.index({ status: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('AIRecommendation', aiRecommendationSchema);
