// backend/services/aiPublishService.js
// Writes approved AI recommendation payloads into real production collections.
// Called ONLY after status === 'approved'.

const mongoose = require('mongoose');
const JobRole = require('../models/JobRole');
const Skill = require('../models/Skill');
const SkillRelation = require('../models/SkillRelation');
const AIRecommendation = require('../models/AIRecommendation');

/**
 * Main publish dispatcher – routes to the correct publisher by type.
 */
exports.publish = async (recommendation, adminId) => {
  const data = recommendation.editedPayload || recommendation.payload;
  const recId = recommendation._id;

  switch (recommendation.type) {
    case 'jobRole':    return publishJobRole(data, recId, adminId);
    case 'skill':      return publishSkills(data, recommendation.targetEntity.id, recId, adminId);
    case 'weightage':  return publishWeightages(data, recommendation.targetEntity.id);
    case 'dependency': return publishDependencies(data, recommendation.targetEntity.id);
    case 'competency': return publishCompetencies(data, recommendation.targetEntity.id);
    case 'assessment': return publishAssessment(data, recommendation.targetEntity.id);
    case 'forecast':   return publishForecast(data, recommendation.targetEntity.id);
    default: throw new Error(`Unknown recommendation type: ${recommendation.type}`);
  }
};

// ── 1. Job Role ──────────────────────────────────────────
async function publishJobRole(data, recId, adminId) {
  // Create JobRole as 'draft' (admin must manually publish to users)
  const jobRole = await JobRole.create({
    name: data.name,
    description: data.description,
    industry: data.industry || 'Software Development',
    category: data.category || 'General',
    experienceLevel: data.experienceLevel || 'junior',
    estimatedLearningDuration: data.estimatedLearningDuration || { value: 90, unit: 'days' },
    competencyAreas: (data.competencyAreas || []).map(ca => ({
      name: ca.name,
      description: ca.description || '',
      weightage: ca.weightage,
      associatedSkills: [],
    })),
    status: 'draft',
    createdBy: adminId,
    aiGeneratedFrom: recId,
  });

  // Create associated skills
  const skillDocs = [];
  for (const ca of (data.competencyAreas || [])) {
    for (const s of (ca.skills || [])) {
      const skill = await Skill.create({
        name: s.name,
        category: s.category,
        jobRole: jobRole._id,
        priority: s.priority || 'core',
        difficulty: s.difficulty,
        industryDemandScore: s.industryDemandScore,
        importanceScore: s.importanceScore,
        statusClassification: s.statusClassification || 'Current',
        weightage: s.weightage || 0,
        competencyArea: ca.name,
        status: 'active',
        createdBy: adminId,
        aiGeneratedFrom: recId,
      });
      skillDocs.push({ caName: ca.name, skillId: skill._id });
    }
  }

  // Update competencyAreas.associatedSkills
  for (const ca of jobRole.competencyAreas) {
    ca.associatedSkills = skillDocs
      .filter(s => s.caName === ca.name)
      .map(s => s.skillId);
  }
  await jobRole.save();

  return { jobRoleId: jobRole._id, skillsCreated: skillDocs.length };
}

// ── 2. Skill Recommendations ─────────────────────────────
async function publishSkills(data, jobRoleId, recId, adminId) {
  const created = [];
  for (const s of (data.recommendations || [])) {
    const skill = await Skill.create({
      name: s.name,
      category: s.category,
      jobRole: jobRoleId,
      priority: s.priority || 'secondary',
      difficulty: s.difficulty,
      industryDemandScore: s.industryDemandScore,
      importanceScore: s.importanceScore,
      statusClassification: s.statusClassification || 'Current',
      status: 'active',
      createdBy: adminId,
      aiGeneratedFrom: recId,
    });
    created.push(skill._id);
  }
  return { skillsCreated: created.length };
}

// ── 3. Weightage Recommendations ─────────────────────────
async function publishWeightages(data, jobRoleId) {
  let updated = 0;
  for (const rec of (data.recommendations || [])) {
    const result = await Skill.updateOne(
      { jobRole: jobRoleId, name: rec.skillName },
      { $set: { weightage: rec.suggestedWeightage } }
    );
    if (result.modifiedCount > 0) updated++;
  }
  return { weightagesUpdated: updated };
}

// ── 4. Dependency Recommendations ────────────────────────
async function publishDependencies(data, fromSkillId) {
  let created = 0;
  for (const dep of (data.dependencies || [])) {
    // Look up target skill by name within the same role
    const fromSkill = await Skill.findById(fromSkillId);
    if (!fromSkill) continue;
    const toSkill = await Skill.findOne({ name: dep.skillName, jobRole: fromSkill.jobRole });
    if (!toSkill) continue;
    // Avoid duplicates
    const existing = await SkillRelation.findOne({ from: fromSkillId, to: toSkill._id, type: dep.relationshipType });
    if (!existing) {
      await SkillRelation.create({
        from: fromSkillId,
        to: toSkill._id,
        type: dep.relationshipType || 'prerequisite',
        dependencyType: dep.dependencyType || 'Recommended',
      });
      created++;
    }
  }
  return { dependenciesCreated: created };
}

// ── 5. Competency Recommendations ────────────────────────
async function publishCompetencies(data, jobRoleId) {
  const jobRole = await JobRole.findById(jobRoleId);
  if (!jobRole) throw new Error('JobRole not found');

  // Rebuild competency areas from AI recommendation
  const newAreas = [];
  for (const ca of (data.competencyAreas || [])) {
    const skillDocs = await Skill.find({ jobRole: jobRoleId, name: { $in: ca.skills } });
    // Update each skill's competencyArea
    await Skill.updateMany(
      { jobRole: jobRoleId, name: { $in: ca.skills } },
      { $set: { competencyArea: ca.name } }
    );
    newAreas.push({
      name: ca.name,
      description: ca.description || '',
      weightage: ca.weightage,
      associatedSkills: skillDocs.map(s => s._id),
    });
  }
  jobRole.competencyAreas = newAreas;
  await jobRole.save();
  return { competencyAreasUpdated: newAreas.length };
}

// ── 6. Assessment Plan ───────────────────────────────────
async function publishAssessment(data, jobRoleId) {
  // Upsert assessment configuration via Assessment model if it exists
  try {
    const Assessment = require('../models/Assessment');
    const existing = await Assessment.findOne({ jobRole: jobRoleId });
    const payload = {
      title: data.title,
      description: data.description,
      difficultyDistribution: data.difficultyDistribution,
      passThreshold: data.passThreshold,
      totalQuestions: data.totalQuestions,
      timeLimit: data.timeLimit,
    };
    if (existing) {
      Object.assign(existing, payload);
      await existing.save();
      return { assessmentId: existing._id, action: 'updated' };
    } else {
      const a = await Assessment.create({ ...payload, jobRole: jobRoleId });
      return { assessmentId: a._id, action: 'created' };
    }
  } catch (err) {
    // If Assessment model doesn't have jobRole field, store as metadata only
    console.warn('Assessment publish partial:', err.message);
    return { partial: true, note: 'Assessment config stored in recommendation only' };
  }
}

// ── 7. Skill Forecast ────────────────────────────────────
async function publishForecast(data, skillId) {
  await Skill.findByIdAndUpdate(skillId, { $set: { aiMetadata: data } });
  return { skillId, forecastUpdated: true };
}
