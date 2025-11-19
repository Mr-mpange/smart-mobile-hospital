/**
 * Create default admin account
 * Run: node create-admin.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./backend/config/database');

async function createAdmin() {
  try {
    console.log('🔧 Creating admin account...\n');

    // Check if admins table exists
    const [tables] = await pool.query(
      "SHOW TABLES LIKE 'admins'"
    );

    if (tables.length === 0) {
      console.log('❌ Admins table does not exist!');
      console.log('   Run: npm start (to create tables automatically)');
      process.exit(1);
    }

    // Check if admin already exists
    const [existingAdmins] = await pool.query(
      'SELECT * FROM admins WHERE email = ?',
      ['admin@smarthealth.com']
    );

    if (existingAdmins.length > 0) {
      console.log('✅ Admin already exists!');
      console.log('\nAdmin Details:');
      console.log('   Email:', existingAdmins[0].email);
      console.log('   Name:', existingAdmins[0].name);
      console.log('   Role:', existingAdmins[0].role);
      console.log('\nDefault Password: admin123');
      console.log('\nIf you forgot the password, delete and re-run this script.');
      process.exit(0);
    }

    // Create admin
    console.log('📝 Creating new admin...');
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO admins (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['System Admin', 'admin@smarthealth.com', hashedPassword, 'super_admin']
    );

    console.log('\n✅ Admin created successfully!\n');
    console.log('Login Credentials:');
    console.log('   URL: http://localhost:3000/admin/login');
    console.log('   Email: admin@smarthealth.com');
    console.log('   Password: admin123');
    console.log('\n⚠️  Change the password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
