require("dotenv").config();
process.env.NODE_ENV = "test"; // Force streamTransport

const mongoose = require("mongoose");
const Admin = require("./models/Admin");
const JobRole = require("./models/JobRole");
const AccessRequest = require("./models/AccessRequest");
const emailService = require("./utils/emailService");

const ADMIN_A = { email: "owner_email_test@test.com", password: "password123", name: "Owner Admin", role: "admin" };
const ADMIN_B = { email: "requester_email_test@test.com", password: "password123", name: "Requester Admin", role: "admin" };

async function runTests() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB for email tests");

  // Create or find Admin A
  let userA = await Admin.findOne({ email: ADMIN_A.email });
  if (!userA) userA = await Admin.create(ADMIN_A);
  
  // Create or find Admin B
  let userB = await Admin.findOne({ email: ADMIN_B.email });
  if (!userB) userB = await Admin.create(ADMIN_B);

  // Setup Job Role
  const jobRole = await JobRole.create({
    name: "Email Test Role",
    description: "Testing emails",
    createdBy: userA._id,
    version: 1
  });

  const streamToString = (stream) => {
    return new Promise((resolve, reject) => {
      let data = '';
      stream.on('data', chunk => data += chunk);
      stream.on('end', () => resolve(data));
      stream.on('error', reject);
    });
  };

  console.log("\n--- TEST 1: Password Reset Email ---");
  const resetInfo = await emailService.sendPasswordResetEmail(userB.email, userB.name, "faketoken123");
  let resetMsg = await streamToString(resetInfo.message);
  console.log("Subject:", resetMsg.match(/Subject: (.*)/)?.[1]);
  console.log("To:", resetMsg.match(/To: (.*)/)?.[1]);
  console.log("Result: ✅ Password Reset Email generated");

  console.log("\n--- TEST 2: Password Confirm Email ---");
  const confirmInfo = await emailService.sendPasswordConfirmEmail(userB.email, userB.name);
  let confirmMsg = await streamToString(confirmInfo.message);
  console.log("Subject:", confirmMsg.match(/Subject: (.*)/)?.[1]);
  console.log("To:", confirmMsg.match(/To: (.*)/)?.[1]);
  console.log("Result: ✅ Password Confirm Email generated");

  console.log("\n--- TEST 3: Access Request Email ---");
  const reqInfo = await emailService.sendAccessRequestEmail(userA.email, userB, jobRole.name, "Need access");
  let reqMsg = await streamToString(reqInfo.message);
  console.log("Subject:", reqMsg.match(/Subject: (.*)/)?.[1]);
  console.log("To:", reqMsg.match(/To: (.*)/)?.[1]);
  console.log("Result: ✅ Access Request Email generated");

  console.log("\n--- TEST 4: Access Approved Email ---");
  const expiresAt = new Date(Date.now() + 3600000);
  const appInfo = await emailService.sendAccessApprovedEmail(userB.email, userA, jobRole.name, expiresAt, "1 hours");
  let appMsg = await streamToString(appInfo.message);
  console.log("Subject:", appMsg.match(/Subject: (.*)/)?.[1]);
  console.log("To:", appMsg.match(/To: (.*)/)?.[1]);
  console.log("Result: ✅ Access Approved Email generated");

  console.log("\n--- TEST 5: Access Declined Email ---");
  const decInfo = await emailService.sendAccessDeclinedEmail(userB.email, userA, jobRole.name);
  let decMsg = await streamToString(decInfo.message);
  console.log("Subject:", decMsg.match(/Subject: (.*)/)?.[1]);
  console.log("To:", decMsg.match(/To: (.*)/)?.[1]);
  console.log("Result: ✅ Access Declined Email generated");

  console.log("\n--- Cleanup ---");
  await JobRole.findByIdAndDelete(jobRole._id);
  await Admin.findByIdAndDelete(userA._id);
  await Admin.findByIdAndDelete(userB._id);
  console.log("✅ Test data cleaned up.");
  
  await mongoose.disconnect();
}

runTests().catch(console.error);
