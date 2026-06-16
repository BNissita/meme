// A self-contained test script using Node.js native fetch API to check backend routes
const BASE_URL = 'http://localhost:5050/api';

async function runTests() {
  console.log('=== Starting HireMe AI API Integration Tests ===');
  
  try {
    // 1. Healthcheck
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthJson = await healthRes.json();
    console.log('✓ Healthcheck Response:', healthJson);
    
    // 2. Register Test User
    const testEmail = `candidate_${Date.now()}@gmail.com`;
    console.log(`\nRegistering user: ${testEmail}`);
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Dev Tester',
        email: testEmail,
        password: 'password123'
      })
    });
    const regJson = await regRes.json();
    console.log('✓ Registration Response:', regJson.success ? 'Success' : 'Failed', regJson);
    
    if (!regJson.success) {
      throw new Error('User registration endpoint failed.');
    }
    
    const token = regJson.token;
    
    // 3. Paste JD Text (authenticated request)
    console.log('\nSubmitting mock Job Description text (auth)...');
    const jdRes = await fetch(`${BASE_URL}/jd/text`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'MERN Stack Developer',
        company: 'CloudSync Systems',
        jdText: 'We are looking for a Software Engineer with expertise in React, Node.js, Express, and MongoDB. Experience with Docker and AWS is preferred. Good teamwork skills.'
      })
    });
    const jdJson = await jdRes.json();
    console.log('✓ Job Description Saved:', jdJson.success ? 'Success' : 'Failed', jdJson.jd?.title);

    if (!jdJson.success) {
      throw new Error('Job description endpoint failed.');
    }
    
    console.log('\n=== All base endpoint tests completed successfully ===');

  } catch (error) {
    console.error('\n✗ Test suite failed:', error.message);
  }
}

runTests();
