// backend/migrations/addSkillIntelligenceFields.js

/**
 * Migration script to add Skill Intelligence fields and migrate legacy prerequisite data
 * Usage: node backend/migrations/addSkillIntelligenceFields.js
 */
const mongoose = require('mongoose');
const Skill = require('../models/Skill');
const SkillRelation = require('../models/SkillRelation');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillgap';

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // 1️⃣ Add new fields with defaults if they don't exist
    const updateResult = await Skill.updateMany({}, {
      $setOnInsert: {
        difficulty: null,
        industryDemandScore: null,
        importanceScore: null,
        statusClassification: 'Current',
        isMandatory: true,
        competencyArea: 'Core Skills',
        weightageHistory: [],
      },
      // Ensure weightageHistory exists (for older docs)
      $set: { weightageHistory: { $ifNull: ['$weightageHistory', []] } },
    }, { upsert: false, multi: true });
    console.log(`Skill fields added/ensured: ${JSON.stringify(updateResult)}`);

    // 2️⃣ Migrate legacy prerequisites (array of ObjectId) to SkillRelation edges
    const skills = await Skill.find({ prerequisites: { $exists: true, $ne: [] } });
    let createdCount = 0;
    for (const skill of skills) {
      // Legacy prerequisite array may be simple ObjectId list or sub-docs
      const legacyPrereqs = Array.isArray(skill.prerequisites)
        ? skill.prerequisites
        : [];
      for (const prereq of legacyPrereqs) {
        const prereqId = typeof prereq === 'object' && prereq.skill ? prereq.skill : prereq;
        if (!prereqId) continue;
        // Avoid duplicate edges
        const exists = await SkillRelation.findOne({
          from: skill._id,
          to: prereqId,
          type: 'prerequisite',
        });
        if (!exists) {
          await SkillRelation.create({
            from: skill._id,
            to: prereqId,
            type: 'prerequisite',
            dependencyType: 'Required',
          });
          createdCount++;
        }
      }
    }
    console.log(`Created ${createdCount} SkillRelation prerequisite edges`);

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
})();
