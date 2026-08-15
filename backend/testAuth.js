const mongoose = require('mongoose');
const JobRole = require('./models/JobRole');
const Skill = require('./models/Skill');
const Admin = require('./models/Admin');
const { canModifyJobRole } = require('./utils/authUtils');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  try {
    const jobRole = await JobRole.findOne().populate('createdBy', 'name email');
    if (!jobRole) {
      console.log("No job roles found");
      process.exit(0);
    }
    
    console.log("Job Role ID:", jobRole._id);
    const owner = jobRole.createdBy;
    
    const requester = await Admin.findOne({ _id: { $ne: owner._id } });
    if (!requester) {
      console.log("No other admin found");
      process.exit(0);
    }
    console.log("Admin A (Owner):", owner.email);
    console.log("Admin B (Requester):", requester.email);
    
    const canModify = await canModifyJobRole(requester._id, jobRole._id);
    console.log(`canModifyJobRole for Admin B: ${canModify}`);

    // Try it with string IDs
    const canModifyStr = await canModifyJobRole(requester._id.toString(), jobRole._id.toString());
    console.log(`canModifyJobRole (string inputs): ${canModifyStr}`);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    mongoose.connection.close();
  }
}

run();
