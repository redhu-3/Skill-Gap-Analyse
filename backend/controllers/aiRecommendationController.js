// backend/controllers/aiRecommendationController.js

const AIRecommendation = require('../models/AIRecommendation');
const Skill = require('../models/Skill');
const JobRole = require('../models/JobRole');
const aiService = require('../services/aiService');
const { validate } = require('../services/aiValidationService');
const { publish } = require('../services/aiPublishService');
const { canModifyJobRole } = require('../utils/authUtils');

// ── Helpers ────────────────────────────────────────────────────────────────
const adminId = (req) => req.user.id;

const saveRec = (type, prompt, payload, targetEntity, createdBy) =>
  AIRecommendation.create({ type, prompt, payload, targetEntity, createdBy });

// ── Generation Endpoints ────────────────────────────────────────────────────

// POST /generate/job-role
exports.generateJobRole = async (req, res) => {
  try {
    const { roleName, industry, experienceLevel } = req.body;
    if (!roleName) return res.status(400).json({ message: 'roleName is required' });

    const payload = await aiService.generateJobRole({ roleName, industry, experienceLevel });
    validate('jobRole', payload);

    const rec = await saveRec(
      'jobRole',
      `Generate job role: ${roleName}`,
      payload,
      { kind: 'JobRole', id: null },
      adminId(req)
    );
    res.status(201).json({ recommendation: rec });
  } catch (err) {
    console.error('generateJobRole error:', err);
    res.status(err.name === 'ValidationError' ? 400 : 502).json({ message: err.message });
  }
};

// POST /generate/skills/:jobRoleId
exports.generateSkills = async (req, res) => {
  try {
    const { jobRoleId } = req.params;
    const jobRole = await JobRole.findById(jobRoleId);
    if (!jobRole) return res.status(404).json({ message: 'JobRole not found' });

    const existingSkills = await Skill.find({ jobRole: jobRoleId });
    const payload = await aiService.generateSkillRecommendations({
      roleName: jobRole.name,
      industry: jobRole.industry,
      existingSkills,
    });
    validate('skill', payload);

    const rec = await saveRec(
      'skill',
      `Recommend skills for: ${jobRole.name}`,
      payload,
      { kind: 'JobRole', id: jobRoleId },
      adminId(req)
    );
    res.status(201).json({ recommendation: rec });
  } catch (err) {
    console.error('generateSkills error:', err);
    res.status(502).json({ message: err.message });
  }
};

// POST /generate/weightages/:jobRoleId
exports.generateWeightages = async (req, res) => {
  try {
    const { jobRoleId } = req.params;
    const jobRole = await JobRole.findById(jobRoleId);
    if (!jobRole) return res.status(404).json({ message: 'JobRole not found' });

    const skills = await Skill.find({ jobRole: jobRoleId });
    const payload = await aiService.generateWeightageRecommendations({ roleName: jobRole.name, skills });
    validate('weightage', payload);

    const rec = await saveRec(
      'weightage',
      `Suggest weightages for: ${jobRole.name}`,
      payload,
      { kind: 'JobRole', id: jobRoleId },
      adminId(req)
    );
    res.status(201).json({ recommendation: rec });
  } catch (err) {
    console.error('generateWeightages error:', err);
    res.status(502).json({ message: err.message });
  }
};

// POST /generate/dependencies/:skillId
exports.generateDependencies = async (req, res) => {
  try {
    const { skillId } = req.params;
    const skill = await Skill.findById(skillId);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });

    const allSkillsInRole = await Skill.find({ jobRole: skill.jobRole, _id: { $ne: skillId } });
    const payload = await aiService.generateDependencyRecommendations({
      skillName: skill.name,
      allSkillsInRole,
    });
    validate('dependency', payload);

    const rec = await saveRec(
      'dependency',
      `Suggest dependencies for: ${skill.name}`,
      payload,
      { kind: 'Skill', id: skillId },
      adminId(req)
    );
    res.status(201).json({ recommendation: rec });
  } catch (err) {
    console.error('generateDependencies error:', err);
    res.status(502).json({ message: err.message });
  }
};

// POST /generate/competencies/:jobRoleId
exports.generateCompetencies = async (req, res) => {
  try {
    const { jobRoleId } = req.params;
    const jobRole = await JobRole.findById(jobRoleId);
    if (!jobRole) return res.status(404).json({ message: 'JobRole not found' });

    const skills = await Skill.find({ jobRole: jobRoleId });
    const payload = await aiService.generateCompetencyRecommendations({ roleName: jobRole.name, skills });
    validate('competency', payload);

    const rec = await saveRec(
      'competency',
      `Suggest competency areas for: ${jobRole.name}`,
      payload,
      { kind: 'JobRole', id: jobRoleId },
      adminId(req)
    );
    res.status(201).json({ recommendation: rec });
  } catch (err) {
    console.error('generateCompetencies error:', err);
    res.status(502).json({ message: err.message });
  }
};

// POST /generate/assessment/:jobRoleId
exports.generateAssessment = async (req, res) => {
  try {
    const { jobRoleId } = req.params;
    const jobRole = await JobRole.findById(jobRoleId);
    if (!jobRole) return res.status(404).json({ message: 'JobRole not found' });

    const skills = await Skill.find({ jobRole: jobRoleId });
    const payload = await aiService.generateAssessmentPlan({ roleName: jobRole.name, skills });
    validate('assessment', payload);

    const rec = await saveRec(
      'assessment',
      `Plan assessment for: ${jobRole.name}`,
      payload,
      { kind: 'JobRole', id: jobRoleId },
      adminId(req)
    );
    res.status(201).json({ recommendation: rec });
  } catch (err) {
    console.error('generateAssessment error:', err);
    res.status(502).json({ message: err.message });
  }
};

// POST /generate/forecast/:skillId
exports.generateForecast = async (req, res) => {
  try {
    const { skillId } = req.params;
    const skill = await Skill.findById(skillId);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });

    const jobRole = await JobRole.findById(skill.jobRole);
    const payload = await aiService.generateSkillForecast({
      skillName: skill.name,
      category: skill.category,
      industry: jobRole?.industry || 'Software Development',
    });
    validate('forecast', payload);

    const rec = await saveRec(
      'forecast',
      `Forecast skill: ${skill.name}`,
      payload,
      { kind: 'Skill', id: skillId },
      adminId(req)
    );
    res.status(201).json({ recommendation: rec });
  } catch (err) {
    console.error('generateForecast error:', err);
    res.status(502).json({ message: err.message });
  }
};

// ── Queue Endpoints ─────────────────────────────────────────────────────────

// GET /queue
exports.getQueue = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const total = await AIRecommendation.countDocuments(filter);
    const items = await AIRecommendation.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /queue/:id
exports.getQueueItem = async (req, res) => {
  try {
    const rec = await AIRecommendation.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Not found' });
    res.json({ recommendation: rec });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /queue/:id/edit
exports.editQueueItem = async (req, res) => {
  try {
    const { editedPayload, adminNotes } = req.body;
    const rec = await AIRecommendation.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Not found' });
    if (['published', 'rejected'].includes(rec.status))
      return res.status(400).json({ message: 'Cannot edit a published or rejected recommendation' });

    // 🔒 AUTHORIZATION CHECK
    if (rec.type !== 'jobRole') {
      let jobRoleId = null;
      if (rec.targetEntity?.kind === 'JobRole') {
        jobRoleId = rec.targetEntity.id;
      } else if (rec.targetEntity?.kind === 'Skill') {
        const targetSkill = await Skill.findById(rec.targetEntity.id);
        if (targetSkill) {
          jobRoleId = typeof targetSkill.jobRole === 'object' ? targetSkill.jobRole._id : targetSkill.jobRole;
        }
      }

      if (jobRoleId) {
        if (!(await canModifyJobRole(adminId(req), jobRoleId))) {
          return res.status(403).json({ message: "Forbidden: You do not have active access to modify this Job Role." });
        }
      }
    }

    if (editedPayload !== undefined) rec.editedPayload = editedPayload;
    if (adminNotes !== undefined) rec.adminNotes = adminNotes;
    rec.status = 'under_review';
    await rec.save();
    res.json({ recommendation: rec });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /queue/:id/approve
exports.approveQueueItem = async (req, res) => {
  try {
    const rec = await AIRecommendation.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Not found' });
    if (rec.status === 'published') return res.status(400).json({ message: 'Already published' });

    // 🔒 AUTHORIZATION CHECK
    if (rec.type !== 'jobRole') {
      let jobRoleId = null;
      if (rec.targetEntity?.kind === 'JobRole') {
        jobRoleId = rec.targetEntity.id;
      } else if (rec.targetEntity?.kind === 'Skill') {
        const targetSkill = await Skill.findById(rec.targetEntity.id);
        if (targetSkill) {
          jobRoleId = typeof targetSkill.jobRole === 'object' ? targetSkill.jobRole._id : targetSkill.jobRole;
        }
      }

      if (jobRoleId) {
        if (!(await canModifyJobRole(adminId(req), jobRoleId))) {
          return res.status(403).json({ message: "Forbidden: You do not have active access to modify this Job Role." });
        }
      }
    }

    rec.status = 'approved';
    rec.reviewedBy = adminId(req);
    rec.reviewedAt = new Date();
    await rec.save();
    res.json({ recommendation: rec });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /queue/:id/reject
exports.rejectQueueItem = async (req, res) => {
  try {
    const { reason } = req.body;
    const rec = await AIRecommendation.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Not found' });

    rec.status = 'rejected';
    rec.adminNotes = reason || rec.adminNotes;
    rec.reviewedBy = adminId(req);
    rec.reviewedAt = new Date();
    await rec.save();
    res.json({ recommendation: rec });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /queue/:id/publish
exports.publishQueueItem = async (req, res) => {
  try {
    const rec = await AIRecommendation.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Not found' });
    if (rec.status !== 'approved')
      return res.status(400).json({ message: 'Recommendation must be approved before publishing' });

    // 🔒 AUTHORIZATION CHECK
    if (rec.type !== 'jobRole') {
      let jobRoleId = null;
      if (rec.targetEntity?.kind === 'JobRole') {
        jobRoleId = rec.targetEntity.id;
      } else if (rec.targetEntity?.kind === 'Skill') {
        const targetSkill = await Skill.findById(rec.targetEntity.id);
        if (targetSkill) {
          jobRoleId = typeof targetSkill.jobRole === 'object' ? targetSkill.jobRole._id : targetSkill.jobRole;
        }
      }

      if (jobRoleId) {
        if (!(await canModifyJobRole(adminId(req), jobRoleId))) {
          return res.status(403).json({ message: "Forbidden: You do not have active access to modify this Job Role." });
        }
      }
    }

    const result = await publish(rec, adminId(req));

    rec.status = 'published';
    rec.publishedAt = new Date();
    await rec.save();

    res.json({ recommendation: rec, result });
  } catch (err) {
    console.error('publishQueueItem error:', err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE /queue/:id
exports.deleteQueueItem = async (req, res) => {
  try {
    const rec = await AIRecommendation.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Not found' });
    if (rec.status === 'published')
      return res.status(400).json({ message: 'Cannot delete a published recommendation' });

    await rec.deleteOne();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
