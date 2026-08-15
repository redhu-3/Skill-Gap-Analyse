const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const LearningResource = require("../models/LearningResource");
const LearningPathTemplate = require("../models/LearningPathTemplate");
const Skill = require("../models/Skill");
const JobRole = require("../models/JobRole");

async function seed() {
  try {
    console.log("Connecting to Database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected.");

    // Remove existing
    await LearningResource.deleteMany({});
    await LearningPathTemplate.deleteMany({});

    // Find all skills to map default resources
    const skills = await Skill.find();
    console.log(`Found ${skills.length} skills to seed resources for.`);

    const resourceTypes = ["course", "video", "documentation", "practice_platform"];

    for (const skill of skills) {
      // Seed 2 default resources per skill
      await LearningResource.create({
        skill: skill._id,
        title: `Ultimate ${skill.name} Masterclass`,
        type: "course",
        url: `https://www.udemy.com/topic/${skill.name.toLowerCase().replace(" ", "-")}/`,
        description: `Comprehensive video guide covering core fundamentals through advanced applications of ${skill.name}.`,
        estimatedDurationMins: 600
      });

      await LearningResource.create({
        skill: skill._id,
        title: `${skill.name} Developer Documentation`,
        type: "documentation",
        url: `https://developer.mozilla.org/en-US/search?q=${skill.name.toLowerCase()}`,
        description: `Official syntax spec, reference sheets, API lists, and quick-start tutorials for ${skill.name}.`,
        estimatedDurationMins: 120
      });
    }

    // Seed a default template for the first published JobRole
    const role = await JobRole.findOne();
    if (role) {
      console.log(`Creating default template for JobRole: ${role.name}`);
      
      // Get associated skills
      const skillIds = [];
      role.competencyAreas.forEach(ca => {
        ca.associatedSkills.forEach(s => {
          if (!skillIds.includes(s.toString())) {
            skillIds.push(s.toString());
          }
        });
      });

      const steps = skillIds.slice(0, 5).map((sId, idx) => ({
        stepNumber: idx + 1,
        skill: sId,
        estimatedDuration: { value: 7, unit: "days" },
        milestone: idx === 2 ? "Foundational Milestones Complete" : idx === 4 ? "Full Competency Mastery Achieve" : undefined
      }));

      await LearningPathTemplate.create({
        name: `${role.name} Standard Path`,
        jobRole: role._id,
        difficulty: "beginner",
        description: `Standard structured sequencing progression for training to become a qualified ${role.name}.`,
        steps,
        isActive: true
      });
    }

    console.log("Default Learning Resources and Templates seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

seed();
