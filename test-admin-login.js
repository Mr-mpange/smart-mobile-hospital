/**
 * Test admin login
 * Run: node test-admin-login.js
 */

const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('🧪 Testing Admin Login...\n');

    const response = await axios.post('http://localhost:5000/api/admin/login', {
      email: 'admin@smarthealth.com',
      password: 'admin123'
    });

    console.log('✅ Login successful!\n');
    console.log('Response:');
    console.log('   Token:', response.data.token.substring(0, 20) + '...');
    console.log('   Admin:', response.data.admin.name);
    console.log('   Email:', response.data.admin.email);
    console.log('   Role:', response.data.admin.role);
    console.log('\n✅ Admin login is working!\n');

  } catch (error) {
    console.error('❌ Login failed!');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data.error);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   Server is not running!');
      console.error('   Start server with: npm start');
    } else {
      console.error('   Error:', error.message);
    }
    console.log('\n');
  }
}

testAdminLogin();
