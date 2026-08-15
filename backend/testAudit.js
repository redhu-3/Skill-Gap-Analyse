const axios = require('axios');
const mongoose = require('mongoose');

// Helper to wait
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function runTest() {
  const adminAEmail = "adminA_test_sec@test.com";
  const adminBEmail = "adminB_test_sec@test.com";
  const pass = "password123";

  // 1. Register/Login Admin A
  let res = await axios.post('http://localhost:5000/auth/register', {
    name: "Admin A", email: adminAEmail, password: pass, role: "admin"
  }).catch(e => e.response);
  
  res = await axios.post('http://localhost:5000/auth/login', { email: adminAEmail, password: pass });
  const tokenA = res.data.token;
  const adminAId = res.data.user.id;

  // 2. Register/Login Admin B
  res = await axios.post('http://localhost:5000/auth/register', {
    name: "Admin B", email: adminBEmail, password: pass, role: "admin"
  }).catch(e => e.response);
  
  res = await axios.post('http://localhost:5000/auth/login', { email: adminBEmail, password: pass });
  const tokenB = res.data.token;

  // 3. Admin A Creates a Job Role
  res = await axios.post('http://localhost:5000/api/job-roles', {
    name: "Cyber Security Expert", description: "Sec test",
    category: "IT", industry: "Tech", experienceLevel: "senior",
    competencyAreas: [{ name: "Sec", weightage: 100 }]
  }, { headers: { Authorization: `Bearer ${tokenA}` }});
  const jobRoleId = res.data.jobRole._id;

  // 4. Admin A Creates a Skill
  res = await axios.post('http://localhost:5000/api/skills', {
    name: "Penetration Testing", category: "Core", requiredProficiency: 5, jobRoleId,
    priority: "core", isMandatory: true, weightage: 100, competencyArea: "Sec"
  }, { headers: { Authorization: `Bearer ${tokenA}` }});
  const skillId = res.data.skill._id;

  // 5. Admin A Creates an Assessment
  res = await axios.post('http://localhost:5000/api/admin/assessments/blueprints', {
    skillId: skillId, name: "Pen Test Level 1", level: 1, timer: 1800,
    minPassingPercentage: 70, maxAttempts: 3
  }, { headers: { Authorization: `Bearer ${tokenA}` }});
  const assessmentId = res.data.assessment._id;

  // 6. Admin A Adds a Question
  res = await axios.post('http://localhost:5000/api/questions', {
    skill: skillId, assessment: assessmentId, type: "mcq", questionText: "What is XSS?",
    options: ["A", "B"], correctAnswer: "A"
  }, { headers: { Authorization: `Bearer ${tokenA}` }});
  const questionId = res.data.question._id;

  // 7. ADMIN B ATTEMPTS UNAUTHORIZED ACTIONS
  console.log("--- TESTING UNAUTHORIZED ACTIONS BY ADMIN B ---");
  const headersB = { headers: { Authorization: `Bearer ${tokenB}` } };

  // Try adding a question
  res = await axios.post('http://localhost:5000/api/questions', {
    skill: skillId, assessment: assessmentId, type: "mcq", questionText: "Hack?",
    options: ["A", "B"], correctAnswer: "A"
  }, headersB).catch(e => e.response);
  console.log(`Add Question: ${res.status} (Expected: 403)`);

  // Try updating a question
  res = await axios.put(`http://localhost:5000/api/questions/${questionId}`, {
    questionText: "Hacked!"
  }, headersB).catch(e => e.response);
  console.log(`Update Question: ${res.status} (Expected: 403)`);

  // Try deleting a question
  res = await axios.delete(`http://localhost:5000/api/questions/${questionId}`, headersB).catch(e => e.response);
  console.log(`Delete Question: ${res.status} (Expected: 403)`);

  // Try creating an assessment with fake skill ID
  const fakeId = new mongoose.Types.ObjectId().toString();
  res = await axios.post('http://localhost:5000/api/admin/assessments/blueprints', {
    skillId: fakeId, name: "Hacked Assessment", level: 1
  }, headersB).catch(e => e.response);
  console.log(`Create Assessment (fake skill): ${res.status} (Expected: 404)`);

  console.log("All tests completed!");
  process.exit(0);
}

runTest().catch(console.error);
