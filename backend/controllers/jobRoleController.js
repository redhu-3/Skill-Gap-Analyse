const JobRole = require("../models/JobRole");
const RoleTemplate = require("../models/RoleTemplate");
const { canModifyJobRole } = require("../utils/authUtils");

// Admin & User: Get all dynamic role templates
exports.getRoleTemplates = async (req, res) => {
  try {
    const templates = await RoleTemplate.find().sort({ name: 1 });
    res.status(200).json({
      message: "Templates fetched successfully",
      templates
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching templates",
      error: error.message
    });
  }
};

// Admin: Create new template
exports.createRoleTemplate = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      industry,
      experienceLevel,
      estimatedLearningDuration,
      competencyAreas,
      skills
    } = req.body;

    if (!name || !description || !category || !industry || !experienceLevel || !estimatedLearningDuration || !competencyAreas || !skills) {
      return res.status(400).json({ message: "Missing required template fields" });
    }

    const newTemplate = new RoleTemplate({
      name,
      description,
      category,
      industry,
      experienceLevel,
      estimatedLearningDuration,
      competencyAreas,
      skills
    });

    await newTemplate.save();
    res.status(201).json({
      message: "Role template created successfully",
      template: newTemplate
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating role template",
      error: error.message
    });
  }
};

// Admin: Create new job role
exports.createJobRole = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      industry,
      experienceLevel,
      estimatedLearningDuration,
      competencyAreas,
      templateId
    } = req.body;

    // basic validation
    if (!name && !templateId) {
      return res.status(400).json({
        message: "Name is required"
      });
    }

    let clonedSkills = [];
    let savedRole;

    if (templateId) {
      const template = await RoleTemplate.findById(templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      savedRole = new JobRole({
        name: name || template.name,
        description: description || template.description,
        category: category || template.category,
        industry: industry || template.industry,
        experienceLevel: experienceLevel || template.experienceLevel,
        estimatedLearningDuration: estimatedLearningDuration || template.estimatedLearningDuration,
        competencyAreas: template.competencyAreas,
        isPreset: true,
        createdBy: req.user.id
      });

      await savedRole.save();
      clonedSkills = template.skills || [];
    } else {
      savedRole = new JobRole({
        name,
        description: description || "No description provided.",
        category: category || "General",
        industry: industry || "Software Development",
        experienceLevel: experienceLevel || "junior",
        estimatedLearningDuration: estimatedLearningDuration || { value: 90, unit: "days" },
        competencyAreas: competencyAreas || [{ name: "Core Skills", description: "", weightage: 100, associatedSkills: [] }],
        createdBy: req.user.id
      });

      await savedRole.save();
    }

    // Seed preset skills if template was selected
    if (clonedSkills.length > 0) {
      const Skill = require("../models/Skill");
      const nameToSkillMap = {};
      const newSkillDocs = [];

      // Step 1: Create skills without prerequisites
      for (const tSkill of clonedSkills) {
        const newSkill = new Skill({
          name: tSkill.name,
          category: tSkill.category,
          priority: tSkill.priority || "core",
          isMandatory: tSkill.isMandatory !== undefined ? tSkill.isMandatory : true,
          weightage: tSkill.weightage,
          competencyArea: tSkill.competencyArea,
          jobRole: savedRole._id,
          createdBy: req.user.id,
          prerequisites: []
        });
        await newSkill.save();
        nameToSkillMap[newSkill.name] = newSkill;
        newSkillDocs.push({ doc: newSkill, templatePrereqs: tSkill.prerequisites || [] });
      }

      // Step 2: Resolve prerequisite ObjectIds
      for (const item of newSkillDocs) {
        const resolvedPrereqs = [];
        for (const prereqName of item.templatePrereqs) {
          const matchSkill = nameToSkillMap[prereqName];
          if (matchSkill) {
            resolvedPrereqs.push(matchSkill._id);
          }
        }
        if (resolvedPrereqs.length > 0) {
          item.doc.prerequisites = resolvedPrereqs;
          await item.doc.save();
        }
      }
    }

    res.status(201).json({
      message: "Job role created successfully",
      role: savedRole
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating job role",
      error: error.message
    });
  }
};

// Admin: Get all job roles (viewable by all admins)
exports.getAllJobRoles = async (req, res) => {
  try {
    const roles = await JobRole.find({})
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Job roles fetched successfully",
      roles
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching job roles",
      error: error.message
    });
  }
};

// Admin: Update job role (ONLY if draft)
exports.updateJobRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, industry, experienceLevel, estimatedLearningDuration, competencyAreas } = req.body;

    const role = await JobRole.findById(id);

    if (!role) {
      return res.status(404).json({
        message: "Job role not found",
      });
    }

    if (!(await canModifyJobRole(req.user.id, id))) {
      return res.status(403).json({
        message: "Forbidden: You do not have active access to modify this Job Role.",
      });
    }

    // 🚫 Prevent editing published roles
    if (role.status === "published") {
      return res.status(400).json({
        message:
          "Published roles cannot be edited. Create a new draft version.",
      });
    }

    if (name) role.name = name;
    if (description) role.description = description;
    if (category) role.category = category;
    if (industry) role.industry = industry;
    if (experienceLevel) role.experienceLevel = experienceLevel;
    if (estimatedLearningDuration) role.estimatedLearningDuration = estimatedLearningDuration;
    if (competencyAreas) role.competencyAreas = competencyAreas;

    role.updatedBy = req.user.id;

    await role.save();

    res.status(200).json({
      message: "Draft job role updated successfully",
      role,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating job role",
      error: error.message,
    });
  }
};

// Public: Get all published job roles
exports.getPublishedJobRoles = async (req, res) => {
  try {
    const roles = await JobRole.find({
      status: "published",
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Published job roles fetched successfully",
      roles,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching published job roles",
      error: error.message,
    });
  }
};

// Admin: Publish a job role
exports.publishJobRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await JobRole.findById(id);

    if (!role) {
      return res.status(404).json({ message: "Job role not found" });
    }

    if (!(await canModifyJobRole(req.user.id, id))) {
      return res.status(403).json({
        message: "Forbidden: You do not have active access to modify this Job Role.",
      });
    }

    // Helper to compare numbers with tolerance
    const approxEqual = (a, b, epsilon = 0.5) => Math.abs(a - b) <= epsilon;

    // 1. Validate Competency Areas sum (allow small tolerance)
    const areas = role.competencyAreas || [];
    const areaSum = areas.reduce((acc, curr) => acc + curr.weightage, 0);
    if (areas.length === 0) {
      return res.status(400).json({ message: "Cannot publish job role: No competency areas defined." });
    }
    if (!approxEqual(areaSum, 100)) {
      return res.status(400).json({
        message: `Competency areas weightage must total ~100% (allowed ±0.5%). Current total: ${areaSum}%. Please adjust the weightage values.`
      });
    }

    // 2. Fetch all active skills for this job role
    const Skill = require("../models/Skill");
    const activeSkills = await Skill.find({ jobRole: role._id, status: "active" });

    // Validate global skill weightages sum (tolerant)
    const globalSkillSum = activeSkills.reduce((acc, curr) => acc + curr.weightage, 0);
    if (!approxEqual(globalSkillSum, 100)) {
      return res.status(400).json({
        message: `Total weightage of active skills should be ~100% (±0.5%). Current total: ${globalSkillSum}%. Adjust skill weightages accordingly.`
      });
    }

    // Validate per-area skill weightage alignment (tolerant)
    for (const area of areas) {
      const skillsInArea = activeSkills.filter(s => s.competencyArea === area.name);
      const skillAreaSum = skillsInArea.reduce((acc, curr) => acc + curr.weightage, 0);
      if (!approxEqual(skillAreaSum, area.weightage)) {
        return res.status(400).json({
          message: `Skills in competency area "${area.name}" must sum to ~${area.weightage}% (±0.5%). Current sum: ${skillAreaSum}%. Please adjust.`
        });
      }
    }

    // Mark older versions as draft
    await JobRole.updateMany(
      {
        name: role.name,
        createdBy: req.user.id,
        _id: { $ne: role._id },
      },
      {
        $set: { status: "draft" }
      }
    );

    // Publish this role
    role.status = "published";
    await role.save();

    res.status(200).json({
      message: "Job role published successfully",
      role,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error publishing job role",
      error: error.message,
    });
  }
};

// Admin: Create a new draft version of a published Job Role
exports.duplicateJobRoleVersion = async (req, res) => {
  try {
    const { id } = req.params;

    const oldRole = await JobRole.findById(id);

    if (!oldRole) {
      return res.status(404).json({ message: "Job role not found" });
    }

    if (!(await canModifyJobRole(req.user.id, id))) {
      return res.status(403).json({
        message: "Forbidden: You do not have active access to modify this Job Role.",
      });
    }

    // Find the max version number for this job role name
    const versions = await JobRole.find({
      name: oldRole.name,
      createdBy: req.user.id
    }).select("version");

    const maxVersion = versions.reduce((max, r) => r.version > max ? r.version : max, 0);

    // Create the new JobRole draft clone
    const newRole = new JobRole({
      name: oldRole.name,
      description: oldRole.description,
      category: oldRole.category,
      industry: oldRole.industry,
      experienceLevel: oldRole.experienceLevel,
      estimatedLearningDuration: oldRole.estimatedLearningDuration,
      competencyAreas: oldRole.competencyAreas,
      isPreset: oldRole.isPreset,
      status: "draft",
      version: maxVersion + 1,
      createdBy: oldRole.createdBy
    });

    await newRole.save();

    // Duplicate skills and handle prerequisites mapping
    const Skill = require("../models/Skill");
    const oldSkills = await Skill.find({ jobRole: oldRole._id });

    const oldToNewMap = {};
    const newSkillDocs = [];

    // Step 1: Clone basic skill properties
    for (const oldSkill of oldSkills) {
      const newSkill = new Skill({
        name: oldSkill.name,
        category: oldSkill.category,
        status: oldSkill.status,
        priority: oldSkill.priority,
        isMandatory: oldSkill.isMandatory,
        weightage: oldSkill.weightage,
        competencyArea: oldSkill.competencyArea,
        jobRole: newRole._id,
        createdBy: req.user.id,
        prerequisites: []
      });
      await newSkill.save();
      oldToNewMap[oldSkill._id.toString()] = newSkill._id;
      newSkillDocs.push({ doc: newSkill, oldPrereqs: oldSkill.prerequisites });
    }

    // Step 2: Remap prerequisites to new skill IDs
    for (const item of newSkillDocs) {
      const resolvedPrereqs = [];
      for (const oldPrereqId of item.oldPrereqs) {
        const newId = oldToNewMap[oldPrereqId.toString()];
        if (newId) {
          resolvedPrereqs.push(newId);
        }
      }
      if (resolvedPrereqs.length > 0) {
        item.doc.prerequisites = resolvedPrereqs;
        await item.doc.save();
      }
    }

    res.status(201).json({
      message: `Version ${newRole.version} (draft) created successfully`,
      role: newRole
    });
  } catch (error) {
    res.status(500).json({
      message: "Error duplicating job role version",
      error: error.message
    });
  }
};

// Admin: Delete a job role (only creator)
exports.deleteJobRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await JobRole.findById(id);
    if (!role) {
      return res.status(404).json({ message: "Job role not found" });
    }

    if (!(await canModifyJobRole(req.user.id, id))) {
      return res.status(403).json({
        message: "Forbidden: You do not have active access to modify this Job Role.",
      });
    }

    // Cascade delete associated skills
    const Skill = require("../models/Skill");
    await Skill.deleteMany({ jobRole: id });

    // Delete the job role
    await JobRole.findByIdAndDelete(id);

    res.status(200).json({
      message: "Job role and associated skills deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting job role",
      error: error.message
    });
  }
};
