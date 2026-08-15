const mongoose = require('mongoose');
const JobRole = require('./models/JobRole');
const Admin = require('./models/Admin');
const AccessRequest = require('./models/AccessRequest');
const emailService = require('./utils/emailService');
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
    if (!owner) {
      console.log("Owner is null");
      process.exit(0);
    }
    
    console.log("Owner:", owner.email);
    
    const requester = await Admin.findOne({ _id: { $ne: owner._id } });
    if (!requester) {
      console.log("No other admin found");
      process.exit(0);
    }
    console.log("Requester:", requester.email);
    
    // Simulate what happens in controller
    console.log("Saving access request...");
    const reqData = new AccessRequest({
      requesterId: requester._id,
      ownerId: owner._id,
      jobRoleId: jobRole._id,
      message: "Test message"
    });
    await reqData.save();
    console.log("Saved.");

    console.log("Sending email...");
    await emailService.sendAccessRequestEmail(owner.email, requester, jobRole.name, "Test message");
    console.log("Email sent.");
    
  } catch (err) {
    console.error("Error:", err);
  } finally {
    mongoose.connection.close();
  }
}

run();
