/**
 * Check admin in database
 * Run: node check-admin.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./backend/config/database');

async function checkAdmin() {
  try {
    console.log('🔍 Checking admin account...\n');

    // Get admin from database
    const [admins] = await pool.query(
      'SELECT * FROM admins WHERE email = ?',
      ['admin@smarthealth.com']
    );

    if (admins.length === 0) {
      console.log('❌ Admin not found!');
      console.log('   Run: node create-admin.js\n');
      process.exit(1);
    }

    const admin = admins[0];
    console.log('✅ Admin found!\n');
    console.log('Admin Details:');
    console.log('   ID:', admin.id);
    console.log('   Name:', admin.name);
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   Created:', admin.created_at);
    console.log('   Password Hash:', admin.password_hash.substring(0, 20) + '...');

    // Test password
    console.log('\n🔐 Testing password...');
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, admin.password_hash);

    if (isValid) {
      console.log('✅ Password "admin123" is correct!\n');
      console.log('Login Credentials:');
      console.log('   Email: admin@smarthealth.com');
      console.log('   Password: admin123\n');
    } else {
      console.log('❌ Password does not match!');
      console.log('   Expected: admin123');
      console.log('   You may need to recreate the admin.\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAdmin();
