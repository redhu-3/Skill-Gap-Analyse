// backend/services/aiService.js
// All Gemini API calls and prompt templates for Phase 3.

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL = 'gemini-1.5-flash';

/**
 * Call Gemini and parse JSON from the response.
 * Retries up to 3 times with exponential back-off.
 */
const callGemini = exports.callGemini = async (prompt, retries = 3) => {
  const model = genAI.getGenerativeModel({ model: MODEL });
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      // Strip markdown code fences if present
      const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
      return JSON.parse(clean);
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 500 * attempt));
    }
  }
};

// ─────────────────────────────────────────────────────────
// 1. Job Role Generator
// ─────────────────────────────────────────────────────────
exports.generateJobRole = async ({ roleName, industry = '', experienceLevel = 'junior' }) => {
  const prompt = `
You are a senior curriculum architect. Return ONLY valid JSON with no extra text.
Generate a complete job role definition for the role: "${roleName}".
Industry hint: "${industry || 'Software Development'}".
Experience level: "${experienceLevel}".

Required JSON shape:
{
  "name": "string",
  "description": "string (2-4 sentences)",
  "industry": "string",
  "category": "string",
  "experienceLevel": "beginner|junior|mid|senior",
  "estimatedLearningDuration": { "value": number, "unit": "days|weeks|months" },
  "competencyAreas": [
    {
      "name": "string",
      "description": "string",
      "weightage": number (all must sum to 100),
      "skills": [
        {
          "name": "string",
          "category": "string",
          "priority": "core|secondary|optional",
          "difficulty": number (1-5),
          "industryDemandScore": number (1-5),
          "importanceScore": number (1-5),
          "statusClassification": "Emerging|Current|Legacy",
          "weightage": number,
          "competencyArea": "string (same as parent)"
        }
      ]
    }
  ]
}

Return ONLY the JSON object.`;
  return callGemini(prompt);
};

// ─────────────────────────────────────────────────────────
// 2. Skill Recommendation Engine
// ─────────────────────────────────────────────────────────
exports.generateSkillRecommendations = async ({ roleName, industry, existingSkills }) => {
  const prompt = `
You are a curriculum architect. Return ONLY valid JSON.
Job Role: "${roleName}" (Industry: "${industry}").
Existing skills: ${JSON.stringify(existingSkills.map(s => s.name))}.

Suggest missing skills that are important for this role but not yet in the list.

Required JSON shape:
{
  "recommendations": [
    {
      "name": "string",
      "category": "string",
      "priority": "core|secondary|optional",
      "difficulty": number (1-5),
      "industryDemandScore": number (1-5),
      "importanceScore": number (1-5),
      "statusClassification": "Emerging|Current|Legacy",
      "rationale": "string – why this skill is recommended"
    }
  ]
}

Return ONLY the JSON object.`;
  return callGemini(prompt);
};

// ─────────────────────────────────────────────────────────
// 3. Weightage Advisor
// ─────────────────────────────────────────────────────────
exports.generateWeightageRecommendations = async ({ roleName, skills }) => {
  const skillList = skills.map(s => ({ name: s.name, priority: s.priority, currentWeightage: s.weightage }));
  const prompt = `
You are a curriculum architect. Return ONLY valid JSON.
Job Role: "${roleName}".
Current skills: ${JSON.stringify(skillList)}.

Suggest optimal weightages that sum to 100 across all skills.
Consider priority (core > secondary > optional) and industry demand.

Required JSON shape:
{
  "recommendations": [
    {
      "skillName": "string",
      "suggestedWeightage": number,
      "rationale": "string"
    }
  ],
  "summary": "string – brief explanation of the distribution logic"
}

Return ONLY the JSON object.`;
  return callGemini(prompt);
};

// ─────────────────────────────────────────────────────────
// 4. Dependency Advisor
// ─────────────────────────────────────────────────────────
exports.generateDependencyRecommendations = async ({ skillName, allSkillsInRole }) => {
  const prompt = `
You are a curriculum architect. Return ONLY valid JSON.
Skill: "${skillName}".
Available skills in the same role: ${JSON.stringify(allSkillsInRole.map(s => s.name))}.

Suggest prerequisite/dependency relationships for "${skillName}" from the available skills list.

Required JSON shape:
{
  "dependencies": [
    {
      "skillName": "string (must be from available list)",
      "relationshipType": "prerequisite|related|parent|child",
      "dependencyType": "Required|Recommended|Optional",
      "rationale": "string"
    }
  ]
}

Return ONLY the JSON object.`;
  return callGemini(prompt);
};

// ─────────────────────────────────────────────────────────
// 5. Competency Area Advisor
// ─────────────────────────────────────────────────────────
exports.generateCompetencyRecommendations = async ({ roleName, skills }) => {
  const prompt = `
You are a curriculum architect. Return ONLY valid JSON.
Job Role: "${roleName}".
Skills to group: ${JSON.stringify(skills.map(s => ({ id: s._id, name: s.name, category: s.category })))}.

Group these skills into meaningful competency areas. Each competency area should have a weightage (all sum to 100).

Required JSON shape:
{
  "competencyAreas": [
    {
      "name": "string",
      "description": "string",
      "weightage": number,
      "skills": ["skill name", ...]
    }
  ]
}

Return ONLY the JSON object.`;
  return callGemini(prompt);
};

// ─────────────────────────────────────────────────────────
// 6. Assessment Planner
// ─────────────────────────────────────────────────────────
exports.generateAssessmentPlan = async ({ roleName, skills }) => {
  const prompt = `
You are a curriculum architect. Return ONLY valid JSON.
Job Role: "${roleName}".
Skills: ${JSON.stringify(skills.map(s => ({ name: s.name, difficulty: s.difficulty, priority: s.priority })))}.

Suggest an assessment configuration for this role.

Required JSON shape:
{
  "title": "string",
  "description": "string",
  "difficultyDistribution": {
    "easy": number (percentage),
    "medium": number (percentage),
    "hard": number (percentage)
  },
  "passThreshold": number (percentage, 0-100),
  "totalQuestions": number,
  "timeLimit": number (minutes),
  "skillWeights": [
    { "skillName": "string", "questionCount": number }
  ],
  "rationale": "string"
}

All difficulty percentages must sum to 100. Return ONLY the JSON object.`;
  return callGemini(prompt);
};

// ─────────────────────────────────────────────────────────
// 7. Skill Gap Forecast
// ─────────────────────────────────────────────────────────
exports.generateSkillForecast = async ({ skillName, category, industry }) => {
  const prompt = `
You are a technology labor market analyst. Return ONLY valid JSON.
Skill: "${skillName}" (Category: "${category}", Industry: "${industry}").

Provide a skill demand forecast and market intelligence.

Required JSON shape:
{
  "growthTrend": "High|Stable|Declining",
  "demandForecast": "string – 2-3 sentence forecast for 2025-2027",
  "relatedCertifications": ["string"],
  "topEmployers": ["string"],
  "averageSalaryImpact": "string",
  "aiConfidenceScore": number (0.0 to 1.0),
  "lastGeneratedAt": "${new Date().toISOString()}"
}

Return ONLY the JSON object.`;
  return callGemini(prompt);
};
