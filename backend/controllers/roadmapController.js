// const Skill = require("../models/Skill");
// const UserSkill = require("../models/UserSkill");
// const JobRole = require("../models/JobRole");
// const mongoose = require("mongoose");

// exports.getUserRoadmap = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { jobRoleId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(jobRoleId)) {
//       return res.status(400).json({ message: "Invalid job role ID" });
//     }

//     const jobRole = await JobRole.findById(jobRoleId);
//     if (!jobRole || jobRole.status !== "published") {
//       return res.status(404).json({ message: "Job role not available" });
//     }

//     // All skills for role
//     const skills = await Skill.find({ jobRole: jobRoleId }).sort({ createdAt: 1 });

//     // User progress
//     const userSkills = await UserSkill.find({
//       user: userId,
//       skill: { $in: skills.map(s => s._id) }
//     });

//     const userSkillMap = {};
//     userSkills.forEach(us => {
//       userSkillMap[us.skill.toString()] = us;
//     });

//     const roadmap = skills.map(skill => {
//       const userSkill = userSkillMap[skill._id.toString()];
//       const prereqs = skill.prerequisites || [];

//       let status = "locked";

//       // Check prerequisites
//       const prereqCompleted = prereqs.every(prId => {
//         const us = userSkillMap[prId.toString()];
//         return us && us.status === "completed";
//       });

//       if (userSkill) {
//         status = userSkill.status;
//       } else if (prereqCompleted) {
//         status = "unlocked";
//       }

//       return {
//         _id: skill._id,
//         name: skill.name,
//         category: skill.category,
//         requiredProficiency: skill.requiredProficiency,
//         status,
//         prerequisites: prereqs,
//         score: userSkill?.score || 0,
//         attempts: userSkill?.attempts || 0
//       };
//     });

//     res.status(200).json({
//       jobRole: jobRole.name,
//       version: jobRole.version,
//       roadmap
//     });

//   } catch (error) {
//     res.status(500).json({
//       message: "Error generating roadmap",
//       error: error.message
//     });
//   }
// };
const Skill = require("../models/Skill");
const UserSkill = require("../models/UserSkill");
const JobRole = require("../models/JobRole");
const mongoose = require("mongoose");

/**
 * Topological sort to order skills by prerequisites
 * Also detects circular dependency
 */
const topologicalSortSkills = (skills) => {
  const graph = new Map();
  const inDegree = new Map();

  // Initialize graph
  skills.forEach(skill => {
    const id = skill._id.toString();
    graph.set(id, []);
    inDegree.set(id, 0);
  });

  // Build graph (prerequisite -> skill)
  skills.forEach(skill => {
    skill.prerequisites.forEach(prereqId => {
      const from = prereqId.toString();
      const to = skill._id.toString();

      if (graph.has(from)) {
        graph.get(from).push(to);
        inDegree.set(to, inDegree.get(to) + 1);
      }
    });
  });

  // Queue skills with no prerequisites
  const queue = [];
  inDegree.forEach((count, id) => {
    if (count === 0) queue.push(id);
  });

  const sortedIds = [];

  while (queue.length) {
    const id = queue.shift();
    sortedIds.push(id);

    for (const neighbor of graph.get(id)) {
      inDegree.set(neighbor, inDegree.get(neighbor) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }

  // Circular dependency check
  if (sortedIds.length !== skills.length) {
    throw new Error("Circular dependency detected in skill prerequisites");
  }

  // Convert IDs back to skill objects
  const skillMap = new Map(skills.map(s => [s._id.toString(), s]));
  return sortedIds.map(id => skillMap.get(id));
};

exports.getUserRoadmap = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobRoleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobRoleId)) {
      return res.status(400).json({ message: "Invalid job role ID" });
    }

    const jobRole = await JobRole.findById(jobRoleId);
    if (!jobRole || jobRole.status !== "published") {
      return res.status(404).json({ message: "Job role not available" });
    }

    // 1️⃣ Get all skills for job role
    const skills = await Skill.find({ jobRole: jobRoleId }).lean();

    // 2️⃣ Order skills using prerequisites
    const orderedSkills = topologicalSortSkills(skills);

    // 3️⃣ Get user progress
    const userSkills = await UserSkill.find({
      user: userId,
      skill: { $in: orderedSkills.map(s => s._id) }
    });

    const userSkillMap = {};
    userSkills.forEach(us => {
      userSkillMap[us.skill.toString()] = us;
    });

    // 4️⃣ Build roadmap
    const roadmap = orderedSkills.map(skill => {
      const userSkill = userSkillMap[skill._id.toString()];
      const prereqs = skill.prerequisites || [];

      let status = "locked";

      const prereqCompleted = prereqs.every(prId => {
        const us = userSkillMap[prId.toString()];
        return us && us.status === "completed";
      });

      if (userSkill) {
        status = userSkill.status;
      } else if (prereqCompleted) {
        status = "in-progress";
      }

      return {
        _id: skill._id,
        name: skill.name,
        category: skill.category,
        requiredProficiency: skill.requiredProficiency,
        status,
        prerequisites: prereqs,
        score: userSkill?.score || 0,
        attempts: userSkill?.attempts || 0
      };
    });

    res.status(200).json({
      jobRole: jobRole.name,
      version: jobRole.version,
      roadmap
    });

  } catch (error) {
    res.status(500).json({
      message: error.message || "Error generating roadmap"
    });
  }
};
