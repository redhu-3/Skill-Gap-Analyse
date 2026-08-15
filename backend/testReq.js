const axios = require('axios');

async function testApi() {
  try {
    // 1. Get an admin token by logging in (assuming there's an admin at redhu@gmail.com with password 'password123', or just fetch a job role)
    // Actually, I can just mock the middleware directly in `accessRequestRoutes.js` again and test.
    // Let's do that! I will mock it and then do a request here.
    const res = await axios.post('http://localhost:5000/api/job-roles/access-requests', {
      jobRoleId: '64d3f3f3f3f3f3f3f3f3f3f3', 
      message: 'test'
    });
    console.log(res.data);
  } catch (error) {
    if (error.response) {
      console.error(`STATUS: ${error.response.status}`);
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
  }
}
testApi();
