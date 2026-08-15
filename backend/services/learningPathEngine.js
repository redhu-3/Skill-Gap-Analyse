const SkillRelation = require("../models/SkillRelation");
const LearningResource = require("../models/LearningResource");
const LearningPathTemplate = require("../models/LearningPathTemplate");
const UserLearningPath = require("../models/UserLearningPath");
const JobRole = require("../models/JobRole");
const readinessEngine = require("./readinessEngine");

/**
 * Perform topological sorting with gap-priority mapping.
 */
async function generateDynamicPath(userId, roleId, templateId = null) {
  // 1. Get readiness details for this role
  const readiness = await readinessEngine.calculateUserReadiness(userId, roleId);
  const skillDetails = readiness.skillDetails; // contains composite score, targetScore, gapPercent, gapLabel, gapPriority

  // Create lookup maps
  const skillDetailsMap = {};
  skillDetails.forEach(sd => {
    skillDetailsMap[sd.skillId.toString()] = sd;
  });

  // 2. Fetch prerequisite relations
  const allSkills = skillDetails.map(sd => sd.skillId);
  const relations = await SkillRelation.find({
    type: "prerequisite",
    from: { $in: allSkills },
    to: { $in: allSkills }
  });

  // Build DAG: "from" must be learned before "to"
  // So "from" is a prerequisite of "to".
  // Adj list: node -> array of nodes that depend on it
  const adj = {};
  const inDegree = {};

  allSkills.forEach(s => {
    const sId = s.toString();
    adj[sId] = [];
    inDegree[sId] = 0;
  });

  relations.forEach(rel => {
    const fromId = rel.from.toString();
    const toId = rel.to.toString();
    if (adj[fromId] && adj[toId] !== undefined) {
      adj[fromId].push(toId);
      inDegree[toId]++;
    }
  });

  // Kahn's algorithm or custom topological sort with priority queue
  // Priority queue element contains [skillId, inDegree, gapPercent]
  // We want to process nodes with inDegree == 0 first.
  // Among nodes with inDegree == 0, we prioritize higher gapPercent (Critical gaps first)
  const queue = [];
  allSkills.forEach(s => {
    const sId = s.toString();
    if (inDegree[sId] === 0) {
      queue.push(sId);
    }
  });

  const sortedSkills = [];

  while (queue.length > 0) {
    // Sort queue: inDegree is 0, but sort by gapPercent DESC so we prioritize learning skills with larger gaps first
    queue.sort((a, b) => {
      const gapA = skillDetailsMap[a]?.gapPercent || 0;
      const gapB = skillDetailsMap[b]?.gapPercent || 0;
      return gapB - gapA;
    });

    const curr = queue.shift();
    sortedSkills.push(curr);

    if (adj[curr]) {
      adj[curr].forEach(neighbor => {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
          queue.push(neighbor);
        }
      });
    }
  }

  // Handle cycles: append any remaining skills that weren't sorted
  allSkills.forEach(s => {
    const sId = s.toString();
    if (!sortedSkills.includes(sId)) {
      sortedSkills.push(sId);
    }
  });

  // 3. Assemble steps with resources
  const pathSteps = [];
  let durationSumDays = 0;

  for (let i = 0; i < sortedSkills.length; i++) {
    const sId = sortedSkills[i];
    const sd = skillDetailsMap[sId];

    // Fetch resources mapped to this skill
    const resources = await LearningResource.find({ skill: sId });

    // Determine default status: if user already has a strong skill score (composite score >= target benchmark), mark as completed
    let status = "locked";
    if (sd.score >= sd.targetScore) {
      status = "completed";
    } else if (pathSteps.filter(step => step.status === "in-progress").length === 0) {
      // Set the first incomplete step as in-progress
      status = "in-progress";
    }

    const stepDurationDays = sd.gapLabel === "Critical Gap" ? 14 : sd.gapLabel === "Moderate Gap" ? 7 : 3;
    durationSumDays += stepDurationDays;

    pathSteps.push({
      skill: sId,
      status,
      scoreSnapshot: sd.score,
      estimatedDurationDays: stepDurationDays,
      resources: resources.map(r => ({
        title: r.title,
        type: r.type,
        url: r.url,
        description: r.description
      }))
    });
  }

  // Calculate estimated completion date
  const estimatedCompletionDate = new Date();
  estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + durationSumDays);

  return {
    jobRole: roleId,
    steps: pathSteps,
    estimatedCompletionDate,
    durationTotalDays: durationSumDays
  };
}

module.exports = {
  generateDynamicPath
};
