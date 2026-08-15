const ResumeParserConfig = require("../models/ResumeParserConfig");

/**
 * Fetch the active Resume Parser Config. Creates a default config if one does not exist.
 */
const getActiveConfig = async () => {
  let config = await ResumeParserConfig.findOne();
  if (!config) {
    config = new ResumeParserConfig({
      confidenceWeights: {
        exactMatch: 100,
        aliasMatch: 95,
        keywordMatch: 80,
        fuzzyMatch: 70
      },
      thresholds: {
        highMin: 90,
        mediumMin: 70,
        lowMin: 0
      },
      rules: {
        enableFuzzyMatching: true,
        fuzzyThreshold: 0.8,
        caseSensitive: false
      },
      roleMatching: {
        formulaType: "weighted_sum",
        customFormula: "(skillWeight * score) / totalWeight",
        minMatchPercentage: 60
      },
      benchmarks: {
        industryCompareEnabled: true,
        competencyTargetScore: 75
      },
      workflow: {
        autoTransitionToUnderReview: true,
        requireAdminApprovalForExport: true
      }
    });
    await config.save();
  }
  return config;
};

exports.getActiveConfig = getActiveConfig;

/**
 * GET /api/admin/resume-intelligence/config
 */
exports.getConfig = async (req, res) => {
  try {
    const config = await getActiveConfig();
    res.status(200).json({ config });
  } catch (error) {
    console.error("getConfig error:", error);
    res.status(500).json({ message: "Error loading resume parser config", error: error.message });
  }
};

/**
 * POST /api/admin/resume-intelligence/config
 */
exports.updateConfig = async (req, res) => {
  try {
    const { confidenceWeights, thresholds, rules, roleMatching, benchmarks, workflow } = req.body;
    let config = await ResumeParserConfig.findOne();

    if (!config) {
      config = new ResumeParserConfig();
    }

    if (confidenceWeights) config.confidenceWeights = confidenceWeights;
    if (thresholds) {
      // Validate thresholds: highMin >= mediumMin >= lowMin
      const { highMin, mediumMin, lowMin } = thresholds;
      if (highMin < mediumMin || mediumMin < lowMin) {
        return res.status(400).json({ message: "Invalid thresholds: High must be >= Medium and Medium >= Low" });
      }
      config.thresholds = thresholds;
    }
    if (rules) config.rules = rules;
    if (roleMatching) config.roleMatching = roleMatching;
    if (benchmarks) config.benchmarks = benchmarks;
    if (workflow) config.workflow = workflow;

    await config.save();
    res.status(200).json({ message: "Resume parser configuration updated successfully", config });
  } catch (error) {
    console.error("updateConfig error:", error);
    res.status(500).json({ message: "Error updating resume parser config", error: error.message });
  }
};
