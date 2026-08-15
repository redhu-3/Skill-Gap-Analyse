// backend/migrations/phase3Init.js
/**
 * Phase 3 Database Migration Script
 * Validates/ensures Skill.aiMetadata and indexes on AIRecommendation collection.
 * Usage: node backend/migrations/phase3Init.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Skill = require('../models/Skill');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillgap';

(async () => {
  try {
    console.log('Connecting to MongoDB at:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully.');

    // 1️⃣ Update all skills without aiMetadata to have a default empty object or null
    console.log('Updating Skill.aiMetadata field consistency...');
    const result = await Skill.updateMany(
      { aiMetadata: { $exists: false } },
      { $set: { aiMetadata: null } }
    );
    console.log(`Updated skills count: ${result.modifiedCount}`);

    // 2️⃣ Ensure index on AIRecommendation for fast queue lookups/filtering
    console.log('Ensuring indexes on AIRecommendation collection...');
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: 'airecommendations' }).toArray();
    
    if (collections.length > 0) {
      try {
        await db.collection('airecommendations').createIndex(
          { status: 1, type: 1, createdAt: -1 },
          { name: 'AIRecommendation_queue_idx' }
        );
        console.log('Index AIRecommendation_queue_idx successfully created/verified.');
      } catch (idxErr) {
        console.log('Index creation skipped (likely already exists):', idxErr.message);
      }
    } else {
      console.log('AIRecommendation collection does not exist yet; index will be auto-created by Mongoose model definition.');
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
})();
