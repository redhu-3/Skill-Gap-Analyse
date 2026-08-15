const Skill = require('../models/Skill');
const mongoose = require('mongoose');

// ─── Aggregation helpers ────────────────────────────────────────────────────

/**
 * Build a pipeline that returns per-competencyArea stats for a numeric field.
 */
const byCompetencyPipeline = (field, matchStage) => [
  { $match: { ...matchStage, [field]: { $exists: true, $ne: null } } },
  {
    $group: {
      _id: '$competencyArea',
      average: { $avg: `$${field}` },
      min:     { $min: `$${field}` },
      max:     { $max: `$${field}` },
      count:   { $sum: 1 },
    },
  },
  {
    $project: {
      _id: 0,
      competencyArea: '$_id',
      average: { $round: ['$average', 2] },
      min: 1,
      max: 1,
      count: 1,
    },
  },
  { $sort: { average: -1 } },
];

/**
 * Build a pipeline that returns per-jobRole stats, with role name populated
 * via a $lookup on the JobRole collection.
 */
const byJobRolePipeline = (field, matchStage) => [
  { $match: { ...matchStage, [field]: { $exists: true, $ne: null } } },
  {
    $group: {
      _id: '$jobRole',
      average: { $avg: `$${field}` },
      min:     { $min: `$${field}` },
      max:     { $max: `$${field}` },
      count:   { $sum: 1 },
    },
  },
  {
    $lookup: {
      from: 'jobroles',
      localField: '_id',
      foreignField: '_id',
      as: 'role',
    },
  },
  { $unwind: { path: '$role', preserveNullAndEmpty: true } },
  {
    $project: {
      _id: 0,
      jobRoleId: '$_id',
      jobRoleName: { $ifNull: ['$role.name', 'Unknown'] },
      average: { $round: ['$average', 2] },
      min: 1,
      max: 1,
      count: 1,
    },
  },
  { $sort: { average: -1 } },
];

/**
 * Build a pipeline that returns a single global stats object.
 */
const globalPipeline = (field, matchStage) => [
  { $match: { ...matchStage, [field]: { $exists: true, $ne: null } } },
  {
    $group: {
      _id: null,
      average: { $avg: `$${field}` },
      min:     { $min: `$${field}` },
      max:     { $max: `$${field}` },
      count:   { $sum: 1 },
    },
  },
  {
    $project: {
      _id: 0,
      average: { $round: ['$average', 2] },
      min: 1,
      max: 1,
      count: 1,
    },
  },
];

// ─── Shared aggregation runner ───────────────────────────────────────────────

const runStats = async (field, req, res) => {
  try {
    const match = {};
    if (req.query.jobRoleId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.jobRoleId)) {
        return res.status(400).json({ message: 'Invalid jobRoleId' });
      }
      match.jobRole = new mongoose.Types.ObjectId(req.query.jobRoleId);
    }
    if (req.query.competencyArea) {
      match.competencyArea = req.query.competencyArea;
    }

    const [byCompetency, byJobRole, globalArr] = await Promise.all([
      Skill.aggregate(byCompetencyPipeline(field, match)),
      Skill.aggregate(byJobRolePipeline(field, match)),
      Skill.aggregate(globalPipeline(field, match)),
    ]);

    const global = globalArr[0] || { average: null, min: null, max: null, count: 0 };

    res.json({ global, byCompetency, byJobRole });
  } catch (err) {
    console.error(`${field} stats error:`, err);
    res.status(500).json({ message: err.message });
  }
};

// ─── Controllers ────────────────────────────────────────────────────────────

// GET /api/analytics/demand?jobRoleId=...&competencyArea=...
exports.getDemandStats = (req, res) => runStats('industryDemandScore', req, res);

// GET /api/analytics/importance?jobRoleId=...&competencyArea=...
exports.getImportanceStats = (req, res) => runStats('importanceScore', req, res);
