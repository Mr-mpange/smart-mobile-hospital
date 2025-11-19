/**
 * Add is_active column to doctors table
 * Run: node update-doctors-table.js
 */

require('dotenv').config();
const { pool } = require('./backend/config/database');

async function updateDoctorsTable() {
  try {
    console.log('🔧 Updating doctors table...\n');

    // Check if column already exists
    const [columns] = await pool.query(
      "SHOW COLUMNS FROM doctors LIKE 'is_active'"
    );

    if (columns.length > 0) {
      console.log('✅ Column is_active already exists!\n');
      process.exit(0);
    }

    // Add is_active column
    await pool.query(`
      ALTER TABLE doctors 
      ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER total_consultations
    `);

    console.log('✅ Column is_active added successfully!\n');

    // Verify
    const [newColumns] = await pool.query(
      "SHOW COLUMNS FROM doctors LIKE 'is_active'"
    );

    if (newColumns.length > 0) {
      console.log('✅ Column verified!');
      console.log(`   Field: ${newColumns[0].Field}`);
      console.log(`   Type: ${newColumns[0].Type}`);
      console.log(`   Default: ${newColumns[0].Default}\n`);
    }

    console.log('✅ Done!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateDoctorsTable();
