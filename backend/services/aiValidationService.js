// backend/services/aiValidationService.js
// Validates AI-generated JSON payloads before saving to AIRecommendation.

const validateJobRole = (payload) => {
  if (!payload || typeof payload !== 'object') throw new Error('Payload must be an object');
  if (!payload.name || typeof payload.name !== 'string') throw new Error('payload.name is required');
  if (!payload.description) throw new Error('payload.description is required');
  if (!Array.isArray(payload.competencyAreas)) throw new Error('payload.competencyAreas must be an array');
  const totalWeightage = payload.competencyAreas.reduce((s, ca) => s + (ca.weightage || 0), 0);
  if (totalWeightage < 95 || totalWeightage > 105)
    throw new Error(`Competency area weightages must sum to ~100 (got ${totalWeightage})`);
};

const validateSkills = (payload) => {
  if (!payload || !Array.isArray(payload.recommendations))
    throw new Error('payload.recommendations must be an array');
};

const validateWeightage = (payload) => {
  if (!payload || !Array.isArray(payload.recommendations))
    throw new Error('payload.recommendations must be an array');
};

const validateDependency = (payload) => {
  if (!payload || !Array.isArray(payload.dependencies))
    throw new Error('payload.dependencies must be an array');
};

const validateCompetency = (payload) => {
  if (!payload || !Array.isArray(payload.competencyAreas))
    throw new Error('payload.competencyAreas must be an array');
};

const validateAssessment = (payload) => {
  if (!payload || !payload.difficultyDistribution)
    throw new Error('payload.difficultyDistribution is required');
  const { easy = 0, medium = 0, hard = 0 } = payload.difficultyDistribution;
  if (Math.abs(easy + medium + hard - 100) > 2)
    throw new Error('Difficulty percentages must sum to 100');
};

const validateForecast = (payload) => {
  if (!payload || !payload.growthTrend)
    throw new Error('payload.growthTrend is required');
};

const VALIDATORS = {
  jobRole:    validateJobRole,
  skill:      validateSkills,
  weightage:  validateWeightage,
  dependency: validateDependency,
  competency: validateCompetency,
  assessment: validateAssessment,
  forecast:   validateForecast,
};

/**
 * validate – throws an Error if payload does not match the expected shape.
 */
exports.validate = (type, payload) => {
  const fn = VALIDATORS[type];
  if (!fn) throw new Error(`Unknown recommendation type: ${type}`);
  fn(payload);
};
