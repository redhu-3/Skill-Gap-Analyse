const SkillAlias = require("../models/SkillAlias");
const ResumeKeywordMapping = require("../models/ResumeKeywordMapping");
const CertificationMapping = require("../models/CertificationMapping");
const ProjectMapping = require("../models/ProjectMapping");
const ExperienceMapping = require("../models/ExperienceMapping");

// ─────────────────────────────────────────────────────────────────────────────
// SKILL ALIASES CRUD
// ─────────────────────────────────────────────────────────────────────────────

exports.getAliases = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.alias = { $regex: search, $options: "i" };
    }
    const aliases = await SkillAlias.find(query).populate("skill");
    res.status(200).json({ aliases });
  } catch (error) {
    console.error("getAliases error:", error);
    res.status(500).json({ message: "Error loading skill aliases", error: error.message });
  }
};

exports.createAlias = async (req, res) => {
  try {
    const { alias, skill } = req.body;
    if (!alias || !skill) {
      return res.status(400).json({ message: "Alias name and skill ID are required" });
    }

    // Check duplicate
    const existing = await SkillAlias.findOne({ alias: alias.trim() });
    if (existing) {
      return res.status(400).json({ message: `Alias "${alias}" already exists.` });
    }

    const newAlias = new SkillAlias({
      alias: alias.trim(),
      skill,
      createdBy: req.user ? req.user.id : null
    });

    await newAlias.save();
    const populated = await newAlias.populate("skill");
    res.status(201).json({ message: "Skill alias created successfully", alias: populated });
  } catch (error) {
    console.error("createAlias error:", error);
    res.status(500).json({ message: "Error creating skill alias", error: error.message });
  }
};

exports.updateAlias = async (req, res) => {
  try {
    const { id } = req.params;
    const { alias, skill } = req.body;

    const target = await SkillAlias.findById(id);
    if (!target) {
      return res.status(404).json({ message: "Alias not found" });
    }

    if (alias) {
      const existing = await SkillAlias.findOne({ alias: alias.trim(), _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ message: `Alias "${alias}" already exists.` });
      }
      target.alias = alias.trim();
    }
    if (skill) {
      target.skill = skill;
    }

    await target.save();
    const populated = await target.populate("skill");
    res.status(200).json({ message: "Skill alias updated successfully", alias: populated });
  } catch (error) {
    console.error("updateAlias error:", error);
    res.status(500).json({ message: "Error updating skill alias", error: error.message });
  }
};

exports.deleteAlias = async (req, res) => {
  try {
    const { id } = req.params;
    const target = await SkillAlias.findByIdAndDelete(id);
    if (!target) {
      return res.status(404).json({ message: "Alias not found" });
    }
    res.status(200).json({ message: "Skill alias deleted successfully" });
  } catch (error) {
    console.error("deleteAlias error:", error);
    res.status(500).json({ message: "Error deleting skill alias", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// KEYWORD MAPPINGS CRUD
// ─────────────────────────────────────────────────────────────────────────────

exports.getKeywords = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.keyword = { $regex: search, $options: "i" };
    }
    const keywords = await ResumeKeywordMapping.find(query).populate("skill");
    res.status(200).json({ keywords });
  } catch (error) {
    console.error("getKeywords error:", error);
    res.status(500).json({ message: "Error loading keyword mappings", error: error.message });
  }
};

exports.createKeyword = async (req, res) => {
  try {
    const { keyword, skill } = req.body;
    if (!keyword || !skill) {
      return res.status(400).json({ message: "Keyword and skill ID are required" });
    }

    const existing = await ResumeKeywordMapping.findOne({ keyword: keyword.trim() });
    if (existing) {
      return res.status(400).json({ message: `Keyword "${keyword}" already exists.` });
    }

    const newKeyword = new ResumeKeywordMapping({
      keyword: keyword.trim(),
      skill,
      createdBy: req.user ? req.user.id : null
    });

    await newKeyword.save();
    const populated = await newKeyword.populate("skill");
    res.status(201).json({ message: "Keyword mapping created successfully", keyword: populated });
  } catch (error) {
    console.error("createKeyword error:", error);
    res.status(500).json({ message: "Error creating keyword mapping", error: error.message });
  }
};

exports.updateKeyword = async (req, res) => {
  try {
    const { id } = req.params;
    const { keyword, skill } = req.body;

    const target = await ResumeKeywordMapping.findById(id);
    if (!target) {
      return res.status(404).json({ message: "Keyword mapping not found" });
    }

    if (keyword) {
      const existing = await ResumeKeywordMapping.findOne({ keyword: keyword.trim(), _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ message: `Keyword "${keyword}" already exists.` });
      }
      target.keyword = keyword.trim();
    }
    if (skill) {
      target.skill = skill;
    }

    await target.save();
    const populated = await target.populate("skill");
    res.status(200).json({ message: "Keyword mapping updated successfully", keyword: populated });
  } catch (error) {
    console.error("updateKeyword error:", error);
    res.status(500).json({ message: "Error updating keyword mapping", error: error.message });
  }
};

exports.deleteKeyword = async (req, res) => {
  try {
    const { id } = req.params;
    const target = await ResumeKeywordMapping.findByIdAndDelete(id);
    if (!target) {
      return res.status(404).json({ message: "Keyword mapping not found" });
    }
    res.status(200).json({ message: "Keyword mapping deleted successfully" });
  } catch (error) {
    console.error("deleteKeyword error:", error);
    res.status(500).json({ message: "Error deleting keyword mapping", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CERTIFICATION MAPPINGS CRUD
// ─────────────────────────────────────────────────────────────────────────────

exports.getCertifications = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.certificationName = { $regex: search, $options: "i" };
    }
    const certifications = await CertificationMapping.find(query).populate("mappedSkills");
    res.status(200).json({ certifications });
  } catch (error) {
    console.error("getCertifications error:", error);
    res.status(500).json({ message: "Error loading certification mappings", error: error.message });
  }
};

exports.createCertification = async (req, res) => {
  try {
    const { certificationName, mappedSkills } = req.body;
    if (!certificationName || !Array.isArray(mappedSkills)) {
      return res.status(400).json({ message: "Certification name and mapped skills array are required" });
    }

    const existing = await CertificationMapping.findOne({ certificationName: certificationName.trim() });
    if (existing) {
      return res.status(400).json({ message: `Certification "${certificationName}" mapping already exists.` });
    }

    const newCert = new CertificationMapping({
      certificationName: certificationName.trim(),
      mappedSkills,
      createdBy: req.user ? req.user.id : null
    });

    await newCert.save();
    const populated = await newCert.populate("mappedSkills");
    res.status(201).json({ message: "Certification mapping created successfully", certification: populated });
  } catch (error) {
    console.error("createCertification error:", error);
    res.status(500).json({ message: "Error creating certification mapping", error: error.message });
  }
};

exports.updateCertification = async (req, res) => {
  try {
    const { id } = req.params;
    const { certificationName, mappedSkills } = req.body;

    const target = await CertificationMapping.findById(id);
    if (!target) {
      return res.status(404).json({ message: "Certification mapping not found" });
    }

    if (certificationName) {
      const existing = await CertificationMapping.findOne({ certificationName: certificationName.trim(), _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ message: `Certification "${certificationName}" mapping already exists.` });
      }
      target.certificationName = certificationName.trim();
    }
    if (mappedSkills) {
      target.mappedSkills = mappedSkills;
    }

    await target.save();
    const populated = await target.populate("mappedSkills");
    res.status(200).json({ message: "Certification mapping updated successfully", certification: populated });
  } catch (error) {
    console.error("updateCertification error:", error);
    res.status(500).json({ message: "Error updating certification mapping", error: error.message });
  }
};

exports.deleteCertification = async (req, res) => {
  try {
    const { id } = req.params;
    const target = await CertificationMapping.findByIdAndDelete(id);
    if (!target) {
      return res.status(404).json({ message: "Certification mapping not found" });
    }
    res.status(200).json({ message: "Certification mapping deleted successfully" });
  } catch (error) {
    console.error("deleteCertification error:", error);
    res.status(500).json({ message: "Error deleting certification mapping", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT MAPPINGS CRUD
// ─────────────────────────────────────────────────────────────────────────────

exports.getProjects = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.projectPattern = { $regex: search, $options: "i" };
    }
    const projects = await ProjectMapping.find(query).populate("mappedSkills");
    res.status(200).json({ projects });
  } catch (error) {
    console.error("getProjects error:", error);
    res.status(500).json({ message: "Error loading project mappings", error: error.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { projectPattern, mappedSkills } = req.body;
    if (!projectPattern || !Array.isArray(mappedSkills)) {
      return res.status(400).json({ message: "Project pattern and mapped skills array are required" });
    }

    const existing = await ProjectMapping.findOne({ projectPattern: projectPattern.trim() });
    if (existing) {
      return res.status(400).json({ message: `Project mapping for "${projectPattern}" already exists.` });
    }

    const newProject = new ProjectMapping({
      projectPattern: projectPattern.trim(),
      mappedSkills,
      createdBy: req.user ? req.user.id : null
    });

    await newProject.save();
    const populated = await newProject.populate("mappedSkills");
    res.status(201).json({ message: "Project mapping created successfully", project: populated });
  } catch (error) {
    console.error("createProject error:", error);
    res.status(500).json({ message: "Error creating project mapping", error: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { projectPattern, mappedSkills } = req.body;

    const target = await ProjectMapping.findById(id);
    if (!target) {
      return res.status(404).json({ message: "Project mapping not found" });
    }

    if (projectPattern) {
      const existing = await ProjectMapping.findOne({ projectPattern: projectPattern.trim(), _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ message: `Project mapping for "${projectPattern}" already exists.` });
      }
      target.projectPattern = projectPattern.trim();
    }
    if (mappedSkills) {
      target.mappedSkills = mappedSkills;
    }

    await target.save();
    const populated = await target.populate("mappedSkills");
    res.status(200).json({ message: "Project mapping updated successfully", project: populated });
  } catch (error) {
    console.error("updateProject error:", error);
    res.status(500).json({ message: "Error updating project mapping", error: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const target = await ProjectMapping.findByIdAndDelete(id);
    if (!target) {
      return res.status(404).json({ message: "Project mapping not found" });
    }
    res.status(200).json({ message: "Project mapping deleted successfully" });
  } catch (error) {
    console.error("deleteProject error:", error);
    res.status(500).json({ message: "Error deleting project mapping", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPERIENCE MAPPINGS CRUD
// ─────────────────────────────────────────────────────────────────────────────

exports.getExperiences = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.experiencePattern = { $regex: search, $options: "i" };
    }
    const experiences = await ExperienceMapping.find(query).populate("mappedSkills");
    res.status(200).json({ experiences });
  } catch (error) {
    console.error("getExperiences error:", error);
    res.status(500).json({ message: "Error loading experience mappings", error: error.message });
  }
};

exports.createExperience = async (req, res) => {
  try {
    const { experiencePattern, mappedSkills } = req.body;
    if (!experiencePattern || !Array.isArray(mappedSkills)) {
      return res.status(400).json({ message: "Experience pattern and mapped skills array are required" });
    }

    const existing = await ExperienceMapping.findOne({ experiencePattern: experiencePattern.trim() });
    if (existing) {
      return res.status(400).json({ message: `Experience mapping for "${experiencePattern}" already exists.` });
    }

    const newExp = new ExperienceMapping({
      experiencePattern: experiencePattern.trim(),
      mappedSkills,
      createdBy: req.user ? req.user.id : null
    });

    await newExp.save();
    const populated = await newExp.populate("mappedSkills");
    res.status(201).json({ message: "Experience mapping created successfully", experience: populated });
  } catch (error) {
    console.error("createExperience error:", error);
    res.status(500).json({ message: "Error creating experience mapping", error: error.message });
  }
};

exports.updateExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const { experiencePattern, mappedSkills } = req.body;

    const target = await ExperienceMapping.findById(id);
    if (!target) {
      return res.status(404).json({ message: "Experience mapping not found" });
    }

    if (experiencePattern) {
      const existing = await ExperienceMapping.findOne({ experiencePattern: experiencePattern.trim(), _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ message: `Experience mapping for "${experiencePattern}" already exists.` });
      }
      target.experiencePattern = experiencePattern.trim();
    }
    if (mappedSkills) {
      target.mappedSkills = mappedSkills;
    }

    await target.save();
    const populated = await target.populate("mappedSkills");
    res.status(200).json({ message: "Experience mapping updated successfully", experience: populated });
  } catch (error) {
    console.error("updateExperience error:", error);
    res.status(500).json({ message: "Error updating experience mapping", error: error.message });
  }
};

exports.deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const target = await ExperienceMapping.findByIdAndDelete(id);
    if (!target) {
      return res.status(404).json({ message: "Experience mapping not found" });
    }
    res.status(200).json({ message: "Experience mapping deleted successfully" });
  } catch (error) {
    console.error("deleteExperience error:", error);
    res.status(500).json({ message: "Error deleting experience mapping", error: error.message });
  }
};
