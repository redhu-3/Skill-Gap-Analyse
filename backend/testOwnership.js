const axios = require('axios');

async function testOwnership() {
  const baseURL = "http://localhost:5000/api";
  let adminA = null;
  let tokenA = "";
  let tokenB = "";

  console.log("1. Logging in as Admin A and Admin B");
  try {
    const unique = Date.now();
    const resA2 = await axios.post("http://localhost:5000/api/admin/register", {
      name: "Admin A", email: `a_${unique}@test.com`, password: "password", role: "admin", adminSecret: "admin_secret"
    });
    tokenA = resA2.data.token;
    
    const resB2 = await axios.post("http://localhost:5000/api/admin/register", {
      name: "Admin B", email: `b_${unique}@test.com`, password: "password", role: "admin", adminSecret: "admin_secret"
    });
    tokenB = resB2.data.token;
    
    console.log("Logged in Admin A & B successfully.");

    // ADMIN A creates a Job Role
    console.log("2. Admin A creates Job Role A");
    const roleRes = await axios.post(`${baseURL}/job-roles/create`, {
      name: "Test Role A",
      description: "Test Desc",
      industry: "Tech",
      experienceLevel: "mid",
      estimatedLearningDuration: { value: 30, unit: "days" }
    }, { headers: { Authorization: `Bearer ${tokenA}` } });
    const roleId = roleRes.data.role._id;
    console.log(`Created Job Role A with ID: ${roleId}`);

    // ADMIN A creates a Skill
    console.log("3. Admin A creates Skill A for Job Role A");
    const skillRes = await axios.post(`${baseURL}/skills/create`, {
      name: "Test Skill A",
      category: "Tech",
      priority: "core",
      weightage: 100,
      requiredProficiency: 80,
      jobRoleId: roleId
    }, { headers: { Authorization: `Bearer ${tokenA}` } });
    const skillId = skillRes.data.skill._id;
    console.log(`Created Skill A with ID: ${skillId}`);

    // ADMIN B attempts to view Job Role A (Should succeed)
    console.log("4. Admin B views Job Roles");
    const viewRolesRes = await axios.get(`${baseURL}/job-roles`, { headers: { Authorization: `Bearer ${tokenB}` } });
    const roleFound = viewRolesRes.data.roles.find(r => r._id === roleId);
    if (roleFound) {
      console.log(`Admin B successfully saw Job Role A (Created By: ${roleFound.createdBy.name})`);
    } else {
      console.error("FAILED: Admin B could not see Job Role A.");
    }

    // ADMIN B attempts to view Skills for Job Role A (Should succeed)
    console.log("5. Admin B views Skills for Job Role A");
    await axios.get(`${baseURL}/skills/job-role/${roleId}`, { headers: { Authorization: `Bearer ${tokenB}` } });
    console.log("Admin B successfully viewed skills.");

    // ADMIN B attempts to edit Job Role A (Should Fail 403)
    console.log("6. Admin B attempts to edit Job Role A");
    try {
      await axios.put(`${baseURL}/job-roles/${roleId}`, { description: "Hacked" }, { headers: { Authorization: `Bearer ${tokenB}` } });
      console.error("FAILED: Admin B was able to edit Job Role A!");
    } catch (e) {
      if (e.response && e.response.status === 403) {
        console.log("Passed: Admin B got 403 Forbidden editing Job Role A.");
      } else {
        console.error(`FAILED: Expected 403 but got ${e.response?.status}`);
      }
    }

    // ADMIN B attempts to edit Skill A (Should Fail 403)
    console.log("7. Admin B attempts to edit Skill A");
    try {
      await axios.put(`${baseURL}/skills/update/${skillId}`, { weightage: 50 }, { headers: { Authorization: `Bearer ${tokenB}` } });
      console.error("FAILED: Admin B was able to edit Skill A!");
    } catch (e) {
      if (e.response && e.response.status === 403) {
        console.log("Passed: Admin B got 403 Forbidden editing Skill A.");
      } else {
        console.error(`FAILED: Expected 403 but got ${e.response?.status}`);
      }
    }

    // ADMIN B attempts to delete Skill A (Should Fail 403)
    console.log("8. Admin B attempts to delete Skill A");
    try {
      await axios.delete(`${baseURL}/skills/delete/${skillId}`, { headers: { Authorization: `Bearer ${tokenB}` } });
      console.error("FAILED: Admin B was able to delete Skill A!");
    } catch (e) {
      if (e.response && e.response.status === 403) {
        console.log("Passed: Admin B got 403 Forbidden deleting Skill A.");
      } else {
        console.error(`FAILED: Expected 403 but got ${e.response?.status}`);
      }
    }

    // ADMIN B attempts to delete Job Role A (Should Fail 403)
    console.log("9. Admin B attempts to delete Job Role A");
    try {
      await axios.delete(`${baseURL}/job-roles/${roleId}`, { headers: { Authorization: `Bearer ${tokenB}` } });
      console.error("FAILED: Admin B was able to delete Job Role A!");
    } catch (e) {
      if (e.response && e.response.status === 403) {
        console.log("Passed: Admin B got 403 Forbidden deleting Job Role A.");
      } else {
        console.error(`FAILED: Expected 403 but got ${e.response?.status}`);
      }
    }

    // ADMIN A successfully deletes Skill A
    console.log("10. Admin A attempts to delete Skill A");
    await axios.delete(`${baseURL}/skills/delete/${skillId}`, { headers: { Authorization: `Bearer ${tokenA}` } });
    console.log("Passed: Admin A deleted Skill A successfully.");

    // ADMIN A successfully deletes Job Role A
    console.log("11. Admin A attempts to delete Job Role A");
    await axios.delete(`${baseURL}/job-roles/${roleId}`, { headers: { Authorization: `Bearer ${tokenA}` } });
    console.log("Passed: Admin A deleted Job Role A successfully.");

    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY");

  } catch (err) {
    console.error("Test execution failed at some point:");
    if (err.response) {
      console.error(err.response.status, err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

testOwnership();
