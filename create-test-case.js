require('dotenv').config();
const { pool } = require('./backend/config/database');

async function createTestCase() {
  try {
    console.log('\n=== Creating Test Case ===\n');
    
    // Get a user
    const [users] = await pool.query('SELECT id, phone, name FROM users LIMIT 1');
    if (users.length === 0) {
      console.log('❌ No users found. Please create a user first via USSD.');
      process.exit(1);
    }
    
    const user = users[0];
    console.log(`✅ Found user: ${user.name} (${user.phone})`);
    
    // Get a doctor
    const [doctors] = await pool.query('SELECT id, name FROM doctors LIMIT 1');
    if (doctors.length === 0) {
      console.log('❌ No doctors found. Please add a doctor first.');
      process.exit(1);
    }
    
    const doctor = doctors[0];
    console.log(`✅ Found doctor: ${doctor.name}`);
    
    // Create a test case
    const symptoms = 'I have been experiencing severe headache and fever for the past 2 days. The headache is constant and paracetamol is not helping much.';
    
    const [result] = await pool.query(
      `INSERT INTO cases (user_id, doctor_id, symptoms, status, consultation_type, priority, created_at) 
       VALUES (?, ?, ?, 'assigned', 'trial', 0, NOW())`,
      [user.id, doctor.id, symptoms]
    );
    
    const caseId = result.insertId;
    
    console.log(`\n✅ Test case created successfully!`);
    console.log(`   Case ID: #${caseId}`);
    console.log(`   Patient: ${user.name}`);
    console.log(`   Doctor: ${doctor.name}`);
    console.log(`   Symptoms: ${symptoms.substring(0, 50)}...`);
    console.log(`\n📋 You can now see this case in the doctor dashboard!`);
    console.log(`   URL: http://localhost:3000/doctor/login\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestCase();
