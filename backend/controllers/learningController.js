const UserLearningPath = require("../models/UserLearningPath");
const learningPathEngine = require("../services/learningPathEngine");

/**
 * Generates and saves a dynamic learning path for a user/role.
 */
exports.generatePath = async (req, res) => {
  try {
    const { roleId } = req.params;
    const userId = req.user.id;

    // Generate path dynamically from gaps + prerequisites
    const dynamicData = await learningPathEngine.generateDynamicPath(userId, roleId);

    // Save or update user path
    let userPath = await UserLearningPath.findOne({ user: userId, jobRole: roleId });

    if (userPath) {
      userPath.steps = dynamicData.steps;
      userPath.estimatedCompletionDate = dynamicData.estimatedCompletionDate;
      await userPath.save();
    } else {
      userPath = await UserLearningPath.create({
        user: userId,
        jobRole: roleId,
        steps: dynamicData.steps,
        estimatedCompletionDate: dynamicData.estimatedCompletionDate
      });
    }

    res.status(200).json({ message: "Learning path generated successfully", userPath });
  } catch (error) {
    console.error("generatePath error:", error);
    res.status(500).json({ message: "Error generating learning path", error: error.message });
  }
};

/**
 * Fetches the user's active learning path for a role.
 */
exports.getActivePath = async (req, res) => {
  try {
    const { roleId } = req.params;
    const userId = req.user.id;

    const userPath = await UserLearningPath.findOne({ user: userId, jobRole: roleId })
      .populate("steps.skill")
      .populate("jobRole");

    if (!userPath) {
      return res.status(404).json({ message: "No active learning path found for this role. Generate one first." });
    }

    res.status(200).json({ userPath });
  } catch (error) {
    console.error("getActivePath error:", error);
    res.status(500).json({ message: "Error fetching active learning path", error: error.message });
  }
};

/**
 * Updates status of a skill inside a user's learning path.
 */
exports.updateStepStatus = async (req, res) => {
  try {
    const { roleId, skillId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const userPath = await UserLearningPath.findOne({ user: userId, jobRole: roleId });
    if (!userPath) return res.status(404).json({ message: "Learning path not found" });

    const step = userPath.steps.find(s => s.skill.toString() === skillId);
    if (!step) return res.status(404).json({ message: "Skill step not found in this learning path" });

    step.status = status;
    if (status === "completed") {
      step.completedAt = new Date();
    }

    await userPath.save();
    res.status(200).json({ message: "Step status updated successfully", userPath });
  } catch (error) {
    console.error("updateStepStatus error:", error);
    res.status(500).json({ message: "Error updating step status", error: error.message });
  }
};
