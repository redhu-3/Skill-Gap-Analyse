const axios = require('axios');
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const JobRole = require('./models/JobRole');
const Skill = require('./models/Skill');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  try {
    const skill = await Skill.findOne().populate('jobRole');
    const jobRole = skill.jobRole;
    const fullJobRole = await JobRole.findById(jobRole._id).populate('createdBy');
    const owner = fullJobRole.createdBy;
    const adminB = await Admin.findOne({ _id: { $ne: owner._id } });
    
    const token = jwt.sign({ id: adminB._id, role: adminB.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    
    console.log("Attempting to POST to /api/admin/assessments...");
    try {
      const res = await axios.post('http://localhost:5000/api/admin/assessments/', {
        skill: skill._id.toString(),
        name: "Malicious Assessment",
        level: 1,
        timer: 1800,
        totalQuestions: 10,
        randomPick: 10,
        minPassingPercentage: 60,
        maxAttempts: 3
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("SUCCESS!!! STATUS:", res.status);
      console.log("DATA:", res.data);
    } catch (err) {
      console.log("FAILED WITH STATUS:", err.response ? err.response.status : err.message);
      if (err.response) console.log("ERROR MESSAGE:", err.response.data.message);
    }
  } finally {
    mongoose.connection.close();
  }
}

run();
