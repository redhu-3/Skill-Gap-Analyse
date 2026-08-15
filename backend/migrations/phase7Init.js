const mongoose = require("mongoose");
require("dotenv").config();
const Skill = require("../models/Skill");
const SkillAlias = require("../models/SkillAlias");
const ResumeKeywordMapping = require("../models/ResumeKeywordMapping");
const CertificationMapping = require("../models/CertificationMapping");
const ProjectMapping = require("../models/ProjectMapping");
const ExperienceMapping = require("../models/ExperienceMapping");
const ResumeParserConfig = require("../models/ResumeParserConfig");

const initResumeIntelligence = async () => {
  try {
    console.log("Starting Phase 7 Resume Configuration seeding...");

    // 1. Ensure global configuration exists
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
      console.log("Global ResumeParserConfig seeded.");
    } else {
      console.log("Global ResumeParserConfig already exists.");
    }

    // Fetch existing skills to map to
    const allSkills = await Skill.find();
    if (allSkills.length === 0) {
      console.log("No skills found in database. Please seed skills first before seeding aliases/mappings.");
      return;
    }

    // Helper to find skill by name, fallback to first available
    const findSkill = (name) => {
      const match = allSkills.find(s => s.name.toLowerCase() === name.toLowerCase());
      return match ? match._id : allSkills[0]._id;
    };

    const reactId = findSkill("React");
    const nodeId = findSkill("Node.js");
    const awsId = findSkill("AWS") || findSkill("Cloud Computing");
    const dbId = findSkill("MongoDB") || findSkill("SQL") || allSkills[0]._id;

    // 2. Seed Skill Aliases
    const aliasData = [
      { alias: "ReactJS", skill: reactId },
      { alias: "React.js", skill: reactId },
      { alias: "NodeJS", skill: nodeId },
      { alias: "Node", skill: nodeId },
      { alias: "Amazon Web Services", skill: awsId }
    ];

    for (const item of aliasData) {
      const exists = await SkillAlias.findOne({ alias: item.alias });
      if (!exists) {
        await SkillAlias.create(item);
        console.log(`Seeded alias: ${item.alias}`);
      }
    }

    // 3. Seed Keyword Mappings
    const keywordData = [
      { keyword: "RESTful API", skill: nodeId },
      { keyword: "API Development", skill: nodeId },
      { keyword: "Cloud Deployment", skill: awsId },
      { keyword: "Data Modeling", skill: dbId }
    ];

    for (const item of keywordData) {
      const exists = await ResumeKeywordMapping.findOne({ keyword: item.keyword });
      if (!exists) {
        await ResumeKeywordMapping.create(item);
        console.log(`Seeded keyword mapping: ${item.keyword}`);
      }
    }

    // 4. Seed Certification Mappings
    const certsData = [
      {
        certificationName: "AWS Certified Cloud Practitioner",
        mappedSkills: [awsId, findSkill("Deployment") || allSkills[0]._id]
      },
      {
        certificationName: "Google Data Analytics Certificate",
        mappedSkills: [dbId, findSkill("Data Analysis") || allSkills[0]._id]
      }
    ];

    for (const item of certsData) {
      const exists = await CertificationMapping.findOne({ certificationName: item.certificationName });
      if (!exists) {
        await CertificationMapping.create(item);
        console.log(`Seeded certification mapping: ${item.certificationName}`);
      }
    }

    // 5. Seed Project Mappings
    const projectData = [
      {
        projectPattern: "E-Commerce Application",
        mappedSkills: [reactId, nodeId, dbId]
      },
      {
        projectPattern: "Portfolio Website",
        mappedSkills: [reactId, findSkill("HTML") || allSkills[0]._id, findSkill("CSS") || allSkills[0]._id]
      }
    ];

    for (const item of projectData) {
      const exists = await ProjectMapping.findOne({ projectPattern: item.projectPattern });
      if (!exists) {
        await ProjectMapping.create(item);
        console.log(`Seeded project mapping: ${item.projectPattern}`);
      }
    }

    // 6. Seed Experience Mappings
    const expData = [
      {
        experiencePattern: "Worked with React to build user interfaces",
        mappedSkills: [reactId]
      },
      {
        experiencePattern: "Designed and developed REST APIs using Express",
        mappedSkills: [nodeId]
      }
    ];

    for (const item of expData) {
      const exists = await ExperienceMapping.findOne({ experiencePattern: item.experiencePattern });
      if (!exists) {
        await ExperienceMapping.create(item);
        console.log(`Seeded experience mapping: ${item.experiencePattern}`);
      }
    }

    console.log("Phase 7 Resume Configuration seeding completed successfully!");
  } catch (err) {
    console.error("Migration error:", err);
  }
};

// If executed directly
if (require.main === module) {
  mongoose
    .connect(process.env.MONGO_URI || "mongodb://localhost:27017/skillgap")
    .then(async () => {
      await initResumeIntelligence();
      mongoose.connection.close();
    })
    .catch((err) => {
      console.error("Mongoose connection error in seeder:", err);
    });
}

module.exports = initResumeIntelligence;
