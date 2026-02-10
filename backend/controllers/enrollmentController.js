const mongoose = require("mongoose");
const UserRoleEnrollment = require("../models/UserRoleEnrollment");
const UserSkill = require("../models/UserSkill");
const Skill = require("../models/Skill");
const JobRole = require("../models/JobRole");

/**
 * USER: Enroll into a Job Role
 * Triggered when user clicks "Get Started"
 */
exports.enrollInJobRole = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobRoleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobRoleId)) {
      return res.status(400).json({ message: "Invalid Job Role ID" });
    }

    // 1️⃣ Check Job Role
    const jobRole = await JobRole.findById(jobRoleId);
    if (!jobRole || jobRole.status !== "published") {
      return res.status(404).json({ message: "Job role not available" });
    }

    // 2️⃣ Prevent duplicate enrollment
    const existingEnrollment = await UserRoleEnrollment.findOne({
      user: userId,
      jobRole: jobRoleId,
    });

    if (existingEnrollment) {
      return res.status(400).json({
        message: "You are already enrolled in this job role",
      });
    }

    // 3️⃣ Create enrollment
    const enrollment = await UserRoleEnrollment.create({
      user: userId,
      jobRole: jobRoleId,
      roleVersion: jobRole.version,
      status: "active",
    });

    // 4️⃣ Get skills in correct order (topological order)
    const skills = await Skill.find({ jobRole: jobRoleId })
      .sort({ createdAt: 1 }) // temporary; later replace with topo sort
      .lean();

    if (skills.length === 0) {
      return res.status(400).json({
        message: "No skills found for this job role",
      });
    }

    // 5️⃣ Create UserSkill entries
    const userSkillDocs = skills.map((skill, index) => ({
      user: userId,
      skill: skill._id,
      status: index === 0 ? "in-progress" : "locked",
      score: 0,
      attempts: 0,
    }));

    await UserSkill.insertMany(userSkillDocs);

    res.status(201).json({
      message: "Enrollment successful. Your journey has started!",
      enrollmentId: enrollment._id,
      firstSkillId: skills[0]._id,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error enrolling in job role",
      error: error.message,
    });
  }
};
