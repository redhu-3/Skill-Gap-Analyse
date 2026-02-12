const Skill = require("../models/Skill");
const JobRole = require("../models/JobRole");
const UserSkill = require('../models/UserSkill');
const Assessment = require("../models/Assessment");
const Question = require("../models/Question");

const hasCircularDependency = async (skillId, prerequisiteIds) => {
  const visited = new Set();

  const dfs = async (currentSkillId) => {
    if (visited.has(currentSkillId.toString())) {
      return true; // cycle detected
    }

    visited.add(currentSkillId.toString());

    const skill = await Skill.findById(currentSkillId).select("prerequisites");
    if (!skill || !skill.prerequisites.length) return false;

    for (const prereqId of skill.prerequisites) {
      if (await dfs(prereqId)) return true;
    }

    visited.delete(currentSkillId.toString());
    return false;
  };

  // simulate new prereqs
  for (const prereqId of prerequisiteIds) {
    if (prereqId.toString() === skillId.toString()) return true;
    if (await dfs(prereqId)) return true;
  }

  return false;
};


// Admin: Add a new skill to a job role
exports.createSkill = async (req, res) => {
  try {
    const { name, category, requiredProficiency, jobRoleId } = req.body;

    // Basic validation
    if (!name || !category || requiredProficiency === undefined || !jobRoleId) {
      return res.status(400).json({
        message: "All fields (name, category, requiredProficiency, jobRoleId) are required",
      });
    }

    // Check if JobRole exists and belongs to admin
    const jobRole = await JobRole.findOne({
      _id: jobRoleId,
      createdBy: req.user.id,
    });

    if (!jobRole) {
      return res.status(404).json({ message: "Job Role not found or access denied" });
    }

    // Create skill
    const newSkill = new Skill({
      name,
      category,
      requiredProficiency,
      jobRole: jobRoleId,
      createdBy: req.user.id,
    });

    await newSkill.save();

    res.status(201).json({
      message: "Skill added successfully",
      skill: newSkill,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding skill",
      error: error.message,
    });
  }
};



// Admin: Get all skills of a specific job role
exports.getSkillsByJobRole = async (req, res) => {
  try {
    const { jobRoleId } = req.params;

    // Check if JobRole exists and belongs to admin
    const jobRole = await JobRole.findOne({
      _id: jobRoleId,
      createdBy: req.user.id,
    });

    if (!jobRole) {
      return res.status(404).json({ message: "Job Role not found or access denied" });
    }

    // Fetch skills
    const skills = await Skill.find({ jobRole: jobRoleId }).sort({ createdAt: 1 });

    res.status(200).json({
      message: "Skills fetched successfully",
      skills,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching skills",
      error: error.message,
    });
  }
};



// Admin: Update a skill
exports.updateSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const { name, category, requiredProficiency, status } = req.body;

    // Find skill and ensure it belongs to an admin-owned job role
    const skill = await Skill.findById(skillId).populate("jobRole");

    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    // Check if admin owns the job role
    if (skill.jobRole.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: Cannot edit this skill" });
    }

    // Update fields if provided
    if (name) skill.name = name;
    if (category) skill.category = category;
    if (requiredProficiency !== undefined) skill.requiredProficiency = requiredProficiency;
    if (status) skill.status = status;

    await skill.save();

    res.status(200).json({
      message: "Skill updated successfully",
      skill,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating skill",
      error: error.message,
    });
  }
};


// Admin: Set / Update prerequisites for a skill
exports.setPrerequisites = async (req, res) => {
  try {
    const { skillId } = req.params;
    const { prerequisiteIds } = req.body; // array of skill IDs

    // Validate input
    if (!Array.isArray(prerequisiteIds)) {
      return res.status(400).json({
        message: "prerequisiteIds must be an array",
      });
    }

    // Fetch skill and check admin ownership
    const skill = await Skill.findById(skillId).populate("jobRole");
    if (!skill) {
      return res.status(404).json({
        message: "Skill not found",
      });
    }

    if (skill.jobRole.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Forbidden: Cannot update this skill",
      });
    }

    // ❌ Prevent skill from being its own prerequisite
    if (prerequisiteIds.includes(skillId)) {
      return res.status(400).json({
        message: "A skill cannot be its own prerequisite",
      });
    }

    // Ensure all prerequisite skills belong to the same Job Role
    const invalidPrereqs = await Skill.find({
      _id: { $in: prerequisiteIds },
      jobRole: { $ne: skill.jobRole._id },
    });

    if (invalidPrereqs.length > 0) {
      return res.status(400).json({
        message: "All prerequisite skills must belong to the same Job Role",
      });
    }

    // Remove duplicate prerequisite IDs
    // const uniquePrerequisites = [...new Set(prerequisiteIds)];

    // // Set prerequisites
    // skill.prerequisites = uniquePrerequisites;
    // await skill.save();

    // Remove duplicate prerequisite IDs
const uniquePrerequisites = [...new Set(prerequisiteIds)];

// ❌ PREVENT CIRCULAR DEPENDENCY
const hasCycle = await hasCircularDependency(skillId, uniquePrerequisites);

if (hasCycle) {
  return res.status(400).json({
    message: "Circular prerequisite detected. Please fix skill dependency order.",
  });
}

// ✅ Safe to save
skill.prerequisites = uniquePrerequisites;
await skill.save();


    res.status(200).json({
      message: "Prerequisites updated successfully",
      skill,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating prerequisites",
      error: error.message,
    });
  }
};

// Admin: Get prerequisite data for a skill
exports.getPrerequisiteData = async (req, res) => {
  try {
    const { skillId } = req.params;

    const skill = await Skill.findById(skillId).populate("jobRole");
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    // ownership check
    if (skill.jobRole.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // fetch all skills in same job role except itself
    const allSkills = await Skill.find({
      jobRole: skill.jobRole._id,
      _id: { $ne: skillId },
    }).select("_id name");

    res.status(200).json({
      skillId: skill._id,
      currentPrerequisites: skill.prerequisites, // already selected
      availableSkills: allSkills, // show in UI
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching prerequisite data",
      error: error.message,
    });
  }
};

exports.getSkillWithPrerequisites = async (req, res) => {
  try {
    const { skillId } = req.params;

    // Fetch skill and populate prerequisites
    const skill = await Skill.findById(skillId)
      .populate({
        path: "prerequisites",
        select: "name category requiredProficiency status",
      });

    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    res.status(200).json({
      message: "Skill fetched successfully",
      skill,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching skill",
      error: error.message,
    });
  }
};

exports.getCurrentSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobRoleId } = req.params;

    const skills = await Skill.find({ jobRole: jobRoleId })
      .populate("prerequisites")
      .sort({ createdAt: 1 });

    if (!skills.length) {
      return res.status(404).json({ message: "No skills found" });
    }

    const userSkills = await UserSkill.find({
      user: userId,
      jobRole: jobRoleId,
    });

    const userSkillMap = {};
    userSkills.forEach(us => {
      userSkillMap[us.skill.toString()] = us;
    });

    // 1️⃣ If already in progress → return it
    for (const us of userSkills) {
      if (us.status === "in-progress") {
        return res.json({ skillId: us.skill });
      }
    }

    // 2️⃣ Find first unlocked skill (prereqs completed)
    for (const skill of skills) {
      const prereqs = skill.prerequisites || [];

      const prereqsCompleted = prereqs.every(pr =>
        userSkills.some(
          us =>
            us.skill.toString() === pr._id.toString() &&
            us.status === "completed"
        )
      );

      if (prereqsCompleted) {
        const existing = userSkillMap[skill._id.toString()];

        if (!existing) {
          await UserSkill.create({
            user: userId,
            jobRole: jobRoleId,
            skill: skill._id,
            status: "in-progress",
          });
        } else {
          existing.status = "in-progress";
          await existing.save();
        }

        return res.json({ skillId: skill._id });
      }
    }

    return res.status(403).json({
      message: "No unlocked skills available yet",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// exports.getSkillDetails = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { skillId } = req.params;

//     // 1️⃣ Check if user has started this skill
//     const userSkill = await UserSkill.findOne({
//       user: userId,
//       skill: skillId,
//     }).populate("skill");

//     if (!userSkill) {
//       return res.status(404).json({ message: "Skill not started" });
//     }

//     // 2️⃣ Get all assessments for this skill (NO status filter as you requested)
//     const assessments = await Assessment.find({
//       skill: skillId,
//     }).sort({ level: 1 });

//     // 3️⃣ Attach questions to each assessment
//     const assessmentsWithQuestions = await Promise.all(
//       assessments.map(async (assessment) => {
//         const questions = await Question.find({
//           assessment: assessment._id,
//           status: "active", // only active questions
//         });

//         return {
//           ...assessment.toObject(),
//           questions,
//         };
//       })
//     );

//     // 4️⃣ Send response
//     res.status(200).json({
//       skill: {
//         name: userSkill.skill.name,
//         description: userSkill.skill.description || "No description",
//         status: userSkill.status,
//       },
//       progress: {
//         currentAssessmentLevel: userSkill.currentAssessmentLevel,
//         completedAssessmentLevels: userSkill.completedAssessmentLevels,
//       },
//       assessments: assessmentsWithQuestions,
//     });
//   } catch (error) {
//     console.error("getSkillDetails error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };


exports.getSkillDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skillId } = req.params;

    // 1️⃣ Check if user has started this skill
    const userSkill = await UserSkill.findOne({
      user: userId,
      skill: skillId,
    }).populate("skill");

    if (!userSkill) {
      return res.status(404).json({ message: "Skill not started" });
    }

    // 2️⃣ Get all assessments for this skill
    const assessments = await Assessment.find({
      skill: skillId,
    }).sort({ level: 1 });

    // 3️⃣ Attach completion + lock status + questions
    const assessmentsWithStatus = await Promise.all(
      assessments.map(async (assessment) => {
        const questions = await Question.find({
          assessment: assessment._id,
          status: "active",
        });

        // ✅ Check if completed
        const isCompleted =
          userSkill.completedAssessmentLevels.includes(assessment.level);

        // ✅ Lock logic (only allow next level)
        const isLocked =
          assessment.level > userSkill.currentAssessmentLevel;

        return {
          ...assessment.toObject(),
          questions,
          isCompleted,
          isLocked,
        };
      })
    );

    // 4️⃣ Send response
    res.status(200).json({
      skill: {
        name: userSkill.skill.name,
        description: userSkill.skill.description || "No description",
        status: userSkill.status,
      },
      progress: {
        currentAssessmentLevel: userSkill.currentAssessmentLevel,
        completedAssessmentLevels: userSkill.completedAssessmentLevels,
      },
      assessments: assessmentsWithStatus,
    });
  } catch (error) {
    console.error("getSkillDetails error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.startLearning = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { jobRoleId } = req.params;

    const inProgress = await UserSkill.findOne({
      user: userId,
      jobRole: jobRoleId,
      status: "in-progress",
    });

    if (inProgress) return res.json({ skillId: inProgress.skill });

    const skills = await Skill.find({ jobRole: jobRoleId })
      .populate("prerequisites")
      .sort({ createdAt: 1 });

    if (!skills.length) return res.status(404).json({ message: "No skills found" });

    const userSkills = await UserSkill.find({ user: userId, jobRole: jobRoleId });

    const completedSkillIds = userSkills
      .filter(us => us.status === "completed")
      .map(us => us.skill.toString());

    for (const skill of skills) {
      const prereqsCompleted = skill.prerequisites.every(pr =>
        completedSkillIds.includes(pr._id.toString())
      );

      if (prereqsCompleted) {
        let existing = await UserSkill.findOne({ user: userId, skill: skill._id });
        if (!existing) {
          existing = await UserSkill.create({
            user: userId,
            jobRole: jobRoleId,
            skill: skill._id,
            status: "in-progress",
            currentAssessmentLevel: 1,
            completedAssessmentLevels: [],
          });
        } else {
          existing.status = "in-progress";
          existing.currentAssessmentLevel = existing.currentAssessmentLevel || 1;
          existing.completedAssessmentLevels = existing.completedAssessmentLevels || [];
          await existing.save();
        }
        return res.json({ skillId: existing.skill });
      }
    }

    return res.status(403).json({ message: "No skills unlocked yet" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
