// backend/migrations/phase4Init.js
/**
 * Phase 4 Database Migration Script
 * Sets legacy defaults on assessments & questions for backward compatibility.
 * Usage: node backend/migrations/phase4Init.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Assessment = require('../models/Assessment');
const Question = require('../models/Question');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillgap';

(async () => {
  try {
    console.log('Connecting to MongoDB at:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully.');

    // 1️⃣ Update existing assessments
    console.log('Migrating legacy assessments to Phase 4 structural defaults...');
    const assResult = await Assessment.updateMany(
      { selectionMode: { $exists: false } },
      {
        $set: {
          version: 1,
          isActiveVersion: true,
          status: 'published',
          selectionMode: 'static',
          blueprint: {
            totalQuestions: 10,
            difficultyDistribution: { easy: 40, medium: 40, hard: 20 },
            skillsCovered: []
          },
          adaptiveRules: {
            baseDifficulty: 'easy',
            thresholdToUpgrade: 2,
            thresholdToDowngrade: 1
          },
          skillThresholds: [],
          skillWeightages: []
        }
      }
    );
    console.log(`Modified assessments count: ${assResult.modifiedCount}`);

    // 2️⃣ Update existing questions without difficulty
    console.log('Migrating questions missing difficulty or estimatedTime...');
    const qResult = await Question.updateMany(
      { 
        $or: [
          { difficulty: { $exists: false } },
          { estimatedTime: { $exists: false } }
        ]
      },
      {
        $set: {
          difficulty: 'medium',
          estimatedTime: 60
        }
      }
    );
    console.log(`Modified questions count: ${qResult.modifiedCount}`);

    console.log('Phase 4 Database migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
})();
