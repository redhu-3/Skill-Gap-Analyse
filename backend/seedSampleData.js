// seedSampleData.js
// Run with: node backend/seedSampleData.js
const mongoose = require('mongoose');
const JobRole = require('./models/JobRole');
const Skill = require('./models/Skill');
const Admin = require('./models/Admin'); // assume exists

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillgap';

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Ensure an admin exists (use first admin or create a placeholder)
    let admin = await Admin.findOne();
    if (!admin) {
      admin = await Admin.create({ name: 'Seed Admin', email: 'seedadmin@example.com', password: 'password123' });
    }

    // Define competency areas
    const competencyAreas = [
      { name: 'Frontend Fundamentals', description: 'Core front‑end knowledge', weightage: 40, associatedSkills: [] },
      { name: 'UI Development', description: 'UI libraries and frameworks', weightage: 35, associatedSkills: [] },
      { name: 'Version Control', description: 'Git basics', weightage: 10, associatedSkills: [] },
      { name: 'Deployment', description: 'CI/CD and hosting', weightage: 15, associatedSkills: [] }
    ];

    // Create a job role (draft)
    const role = new JobRole({
      name: 'Frontend Developer',
      description: 'A role focused on building modern web front‑ends.',
      category: 'Engineering',
      industry: 'Software Development',
      experienceLevel: 'mid',
      estimatedLearningDuration: { value: 120, unit: 'days' },
      competencyAreas,
      createdBy: admin._id,
      status: 'draft'
    });
    await role.save();

    // Helper to create a skill and link to area
    const createSkill = async (name, areaName, weight) => {
      const skill = new Skill({
        name,
        category: areaName,
        status: 'active',
        priority: 'core',
        isMandatory: true,
        weightage: weight,
        competencyArea: areaName,
        jobRole: role._id,
        createdBy: admin._id,
        prerequisites: []
      });
      await skill.save();
      // push to area
      const area = role.competencyAreas.find(a => a.name === areaName);
      if (area) area.associatedSkills.push(skill._id);
      return skill;
    };

    // Create skills matching the weightage distribution
    await createSkill('HTML', 'Frontend Fundamentals', 15);
    await createSkill('CSS', 'Frontend Fundamentals', 15);
    await createSkill('JavaScript', 'Frontend Fundamentals', 10);
    await createSkill('React', 'UI Development', 20);
    await createSkill('Material UI', 'UI Development', 15);
    await createSkill('Git', 'Version Control', 10);
    await createSkill('CI/CD', 'Deployment', 10);
    await createSkill('Hosting (e.g., Vercel)', 'Deployment', 5);

    // Save role with populated skill references
    await role.save();

    // Publish the role (bypass validation for demo – set status directly)
    role.status = 'published';
    await role.save();

    console.log('Sample job role and skills created and published.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
})();
