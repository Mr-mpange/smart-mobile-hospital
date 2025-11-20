require('dotenv').config();
const { pool } = require('./backend/config/database');

async function checkTable() {
  try {
    const [columns] = await pool.query('SHOW COLUMNS FROM cases');
    console.log('\nCases table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    
    // Check if completed_at exists
    const hasCompletedAt = columns.some(col => col.Field === 'completed_at');
    
    if (!hasCompletedAt) {
      console.log('\n❌ Missing column: completed_at');
      console.log('Adding column...');
      
      await pool.query('ALTER TABLE cases ADD COLUMN completed_at TIMESTAMP NULL AFTER updated_at');
      console.log('✅ Column added successfully!');
    } else {
      console.log('\n✅ All required columns exist');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTable();
