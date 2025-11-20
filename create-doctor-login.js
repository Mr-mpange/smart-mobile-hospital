require('dotenv').config();
const { pool } = require('./backend/config/database');
const bcrypt = require('bcryptjs');

async function createDoctorLogin() {
  try {
    console.log('\n=== Creating Doctor Login ===\n');
    
    // Get first doctor
    const [doctors] = await pool.query('SELECT id, name, email FROM doctors LIMIT 1');
    if (doctors.length === 0) {
      console.log('❌ No doctors found.');
      process.exit(1);
    }
    
    const doctor = doctors[0];
    
    // Set password
    const password = 'doctor123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Update doctor with password
    await pool.query(
      'UPDATE doctors SET password_hash = ?, email = ? WHERE id = ?',
      [passwordHash, doctor.email || `doctor${doctor.id}@smarthealth.com`, doctor.id]
    );
    
    console.log(`✅ Doctor login created!`);
    console.log(`\n📋 Login Credentials:`);
    console.log(`   URL: http://localhost:3000/doctor/login`);
    console.log(`   Email: ${doctor.email || `doctor${doctor.id}@smarthealth.com`}`);
    console.log(`   Password: ${password}`);
    console.log(`\n✅ You can now login and see pending cases!\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createDoctorLogin();
