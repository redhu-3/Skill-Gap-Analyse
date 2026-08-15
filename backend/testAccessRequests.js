require("dotenv").config();
const axios = require("axios");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Admin = require("./models/Admin");

const BASE_URL = "http://localhost:5000/api";
const ADMIN_A = { email: "adminA@test.com", password: "password123", name: "Admin A", role: "admin" };
const ADMIN_B = { email: "adminB@test.com", password: "password123", name: "Admin B", role: "admin" };

let tokenA, tokenB;
let adminAId, adminBId;
let jobRoleId, accessRequestId, skillId;

async function setupAdmins() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB for tests");

  // Create or find Admin A
  let userA = await Admin.findOne({ email: ADMIN_A.email });
  if (!userA) userA = await Admin.create(ADMIN_A);
  adminAId = userA._id;
  tokenA = jwt.sign({ id: userA._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });

  // Create or find Admin B
  let userB = await Admin.findOne({ email: ADMIN_B.email });
  if (!userB) userB = await Admin.create(ADMIN_B);
  adminBId = userB._id;
  tokenB = jwt.sign({ id: userB._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
  console.log("✅ Admins created and tokens generated.");
}



async function runTests() {
  await setupAdmins();

  const authA = { headers: { Authorization: `Bearer ${tokenA}` } };
  const authB = { headers: { Authorization: `Bearer ${tokenB}` } };

  console.log("\n--- TEST 1: Admin A creates Job Role ---");
  const createJR = await axios.post(`${BASE_URL}/job-roles/create`, {
    name: "Access Test Role",
    description: "Testing Access Requests"
  }, authA);
  jobRoleId = createJR.data.role._id;
  console.log("✅ Job Role created by Admin A");

  console.log("\n--- TEST 2: Admin B attempts to edit (Should 403) ---");
  try {
    await axios.put(`${BASE_URL}/job-roles/${jobRoleId}`, { name: "Hacked Role" }, authB);
    console.error("❌ ERROR: Admin B was able to edit without access!");
  } catch (err) {
    if (err.response?.status === 403) console.log("✅ Admin B blocked (403)");
    else console.error("❌ Unexpected error:", err.message);
  }

  console.log("\n--- TEST 3: Admin B requests access ---");
  await axios.post(`${BASE_URL}/admin/access-requests`, { jobRoleId, message: "Let me in" }, authB);
  console.log("✅ Request created");

  console.log("\n--- TEST 4: Admin B attempts to edit while Pending (Should 403) ---");
  try {
    await axios.put(`${BASE_URL}/job-roles/${jobRoleId}`, { name: "Hacked Role" }, authB);
    console.error("❌ ERROR: Admin B was able to edit while Pending!");
  } catch (err) {
    if (err.response?.status === 403) console.log("✅ Admin B blocked (403)");
  }

  console.log("\n--- TEST 5: Admin A approves request for 5 seconds ---");
  const incoming = await axios.get(`${BASE_URL}/admin/access-requests/incoming`, authA);
  const reqToApprove = incoming.data.requests.find(r => r.jobRoleId._id === jobRoleId);
  accessRequestId = reqToApprove._id;
  await axios.put(`${BASE_URL}/admin/access-requests/${accessRequestId}/approve`, { durationMs: 5000 }, authA);
  console.log("✅ Request approved for 5 seconds");

  console.log("\n--- TEST 6: Admin B attempts to edit (Should 200) ---");
  await axios.put(`${BASE_URL}/job-roles/${jobRoleId}`, { name: "Updated by B" }, authB);
  console.log("✅ Admin B successfully edited Job Role");

  console.log("\n--- TEST 7: Admin B attempts to add Skill (Should 201) ---");
  const addSkill = await axios.post(`${BASE_URL}/skills/create`, {
    jobRoleId,
    name: "Temp Skill",
    category: "Hard Skill",
    requiredProficiency: 50
  }, authB);
  skillId = addSkill.data.skill._id;
  console.log("✅ Admin B successfully added Skill");

  console.log("\n--- Waiting 6 seconds for access to expire... ---");
  await new Promise(r => setTimeout(r, 6000));

  console.log("\n--- TEST 8: Admin B attempts to edit expired (Should 403) ---");
  try {
    await axios.put(`${BASE_URL}/job-roles/${jobRoleId}`, { name: "Hacked Role Again" }, authB);
    console.error("❌ ERROR: Admin B was able to edit after expiry!");
  } catch (err) {
    if (err.response?.status === 403) console.log("✅ Admin B blocked (403) after expiry");
  }

  console.log("\n--- Cleanup ---");
  await axios.delete(`${BASE_URL}/skills/delete/${skillId}`, authA);
  await axios.delete(`${BASE_URL}/job-roles/${jobRoleId}`, authA);
  console.log("✅ Test data cleaned up.");
  
  await mongoose.disconnect();
}

runTests().catch(console.error);
