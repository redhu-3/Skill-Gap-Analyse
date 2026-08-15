const Question = require("../models/Question");
const Skill = require("../models/Skill");

/**
 * Generates a dynamic pool of questions based on blueprint configs.
 * Supports fallback to legacy skill if skillsCovered is empty.
 */
exports.generateDynamicPool = async (assessment) => {
  const { blueprint, skill: mainSkillId } = assessment;
  const totalQ = blueprint?.totalQuestions || 10;
  
  // Calculate counts per difficulty based on distribution percentages
  const dist = blueprint?.difficultyDistribution || { easy: 40, medium: 40, hard: 20 };
  const easyCount = Math.round((dist.easy / 100) * totalQ);
  const mediumCount = Math.round((dist.medium / 100) * totalQ);
  const hardCount = Math.max(0, totalQ - (easyCount + mediumCount)); // balance check

  // Resolve skill scope
  let skillIds = [mainSkillId];
  if (blueprint?.skillsCovered && blueprint.skillsCovered.length > 0) {
    skillIds = blueprint.skillsCovered.map(sc => sc.skill);
  }

  // Sampling helper
  const sampleFromTier = async (difficulty, limit) => {
    if (limit <= 0) return [];
    return Question.aggregate([
      { 
        $match: { 
          skill: { $in: skillIds }, 
          difficulty, 
          status: "active" 
        } 
      },
      { $sample: { size: limit } }
    ]);
  };

  const [easyQ, mediumQ, hardQ] = await Promise.all([
    sampleFromTier("easy", easyCount),
    sampleFromTier("medium", mediumCount),
    sampleFromTier("hard", hardCount)
  ]);

  // Combine and shuffle the pool
  const combined = [...easyQ, ...mediumQ, ...hardQ];
  return combined.sort(() => Math.random() - 0.5);
};

/**
 * Resolves the next adaptive question based on the user's active session logs.
 */
exports.resolveNextAdaptiveQuestion = async (session, assessment) => {
  const { blueprint, skill: mainSkillId, adaptiveRules } = assessment;
  const answeredIds = session.questionsAnswered.map(qa => qa.question.toString());

  // Determine skill scope
  let skillIds = [mainSkillId];
  if (blueprint?.skillsCovered && blueprint.skillsCovered.length > 0) {
    skillIds = blueprint.skillsCovered.map(sc => sc.skill);
  }

  const currentDiff = session.adaptiveState.currentDifficulty || "easy";

  // Try to find an unanswered question matching the target difficulty
  let nextQ = await Question.findOne({
    skill: { $in: skillIds },
    difficulty: currentDiff,
    status: "active",
    _id: { $nin: answeredIds }
  });

  // Fallback chain if no question of current difficulty remains
  if (!nextQ) {
    const difficultiesOrder = ["easy", "medium", "hard"];
    // Try others
    for (const diff of difficultiesOrder) {
      if (diff === currentDiff) continue;
      nextQ = await Question.findOne({
        skill: { $in: skillIds },
        difficulty: diff,
        status: "active",
        _id: { $nin: answeredIds }
      });
      if (nextQ) break;
    }
  }

  return nextQ;
};

/**
 * Updates consecutive streak tallies and recalibrates the session's difficulty tier.
 */
exports.updateAdaptiveState = (session, isCorrect, assessment) => {
  const rules = assessment.adaptiveRules || { baseDifficulty: "easy", thresholdToUpgrade: 2, thresholdToDowngrade: 1 };
  const state = session.adaptiveState || { currentDifficulty: "easy", consecutiveCorrect: 0, consecutiveIncorrect: 0 };

  const difficulties = ["easy", "medium", "hard"];
  let currIdx = difficulties.indexOf(state.currentDifficulty);
  if (currIdx === -1) currIdx = 0;

  if (isCorrect) {
    state.consecutiveCorrect += 1;
    state.consecutiveIncorrect = 0;

    if (state.consecutiveCorrect >= rules.thresholdToUpgrade) {
      // Step up difficulty if not already Hard
      if (currIdx < difficulties.length - 1) {
        state.currentDifficulty = difficulties[currIdx + 1];
        console.log(`[Adaptive Engine] Upgrading difficulty to: ${state.currentDifficulty}`);
      }
      state.consecutiveCorrect = 0;
    }
  } else {
    state.consecutiveIncorrect += 1;
    state.consecutiveCorrect = 0;

    if (state.consecutiveIncorrect >= rules.thresholdToDowngrade) {
      // Step down difficulty if not already Easy
      if (currIdx > 0) {
        state.currentDifficulty = difficulties[currIdx - 1];
        console.log(`[Adaptive Engine] Downgrading difficulty to: ${state.currentDifficulty}`);
      }
      state.consecutiveIncorrect = 0;
    }
  }

  session.adaptiveState = state;
};

/**
 * Computes general scores, weights and granular breakdowns (skills/competencies) to log results.
 */
exports.gradeSession = async (session, assessment) => {
  const answered = session.questionsAnswered;
  if (!answered || answered.length === 0) {
    return {
      score: 0,
      passed: false,
      skillBreakdown: [],
      competencyBreakdown: [],
      weightedScore: 0
    };
  }

  // Populate questions and their skills
  const questionIds = answered.map(a => a.question);
  const questions = await Question.find({ _id: { $in: questionIds } }).populate("skill");
  const questionsMap = new Map(questions.map(q => [q._id.toString(), q]));

  // Track raw counts
  let totalCorrect = 0;
  const competencyMap = {}; // { competencyArea: { correct, total } }
  const skillMap = {};      // { skillId: { correct, total, skillName } }

  for (const item of answered) {
    const question = questionsMap.get(item.question.toString());
    if (!question) continue;

    const isCorrect = item.isCorrect;
    if (isCorrect) totalCorrect++;

    // Resolve Competency Area override or skill fallback
    const compArea = question.competencyArea || question.skill?.competencyArea || "Core Skills";
    if (!competencyMap[compArea]) {
      competencyMap[compArea] = { correct: 0, total: 0 };
    }
    competencyMap[compArea].total += 1;
    if (isCorrect) competencyMap[compArea].correct += 1;

    // Resolve Skill
    const skillId = question.skill?._id?.toString();
    if (skillId) {
      if (!skillMap[skillId]) {
        skillMap[skillId] = { correct: 0, total: 0, skillName: question.skill.name };
      }
      skillMap[skillId].total += 1;
      if (isCorrect) skillMap[skillId].correct += 1;
    }
  }

  // Compile Competency Breakdown
  const competencyBreakdown = Object.entries(competencyMap).map(([area, data]) => ({
    competencyArea: area,
    totalQuestions: data.total,
    correctCount: data.correct,
    score: (data.correct / data.total) * 100
  }));

  // Compile Skill Breakdown & check pass thresholds
  const skillThresholdsMap = new Map(
    (assessment.skillThresholds || []).map(t => [t.skill.toString(), t.minPassingPercentage])
  );
  
  const skillBreakdown = Object.entries(skillMap).map(([sId, data]) => {
    const pct = (data.correct / data.total) * 100;
    const threshold = skillThresholdsMap.get(sId) ?? assessment.minPassingPercentage ?? 70;
    return {
      skill: sId,
      totalQuestions: data.total,
      correctCount: data.correct,
      passed: pct >= threshold
    };
  });

  // Calculate Weighted Score
  const weightagesMap = new Map(
    (assessment.skillWeightages || []).map(w => [w.skill.toString(), w.weight])
  );

  let totalWeightedScore = 0;
  let totalWeights = 0;

  Object.entries(skillMap).forEach(([sId, data]) => {
    const accuracy = data.correct / data.total;
    const weight = weightagesMap.get(sId) ?? 1.0;
    totalWeightedScore += accuracy * weight;
    totalWeights += weight;
  });

  const weightedScore = totalWeights > 0 ? (totalWeightedScore / totalWeights) * 100 : (totalCorrect / answered.length) * 100;
  const simpleScore = (totalCorrect / answered.length) * 100;

  // Decide overall pass status (Must pass global limit AND all individual skill thresholds)
  const passedGlobal = simpleScore >= assessment.minPassingPercentage;
  const passedAllSkills = skillBreakdown.every(sb => sb.passed);
  const passed = passedGlobal && passedAllSkills;

  return {
    score: simpleScore,
    passed,
    skillBreakdown,
    competencyBreakdown,
    weightedScore
  };
};
