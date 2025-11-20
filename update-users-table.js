/**
 * Add password_hash column to users table
 * Run: node update-users-table.js
 */

require('dotenv').config();
const { pool } = require('./backend/config/database');

async function updateUsersTable() {
  try {
    console.log('🔧 Updating users table...\n');

    // Check if column already exists
    const [columns] = await pool.query(
      "SHOW COLUMNS FROM users LIKE 'password_hash'"
    );

    if (columns.length > 0) {
      console.log('✅ Column password_hash already exists!\n');
      process.exit(0);
    }

    // Add password_hash column
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN password_hash VARCHAR(255) DEFAULT NULL AFTER email
    `);

    console.log('✅ Column password_hash added successfully!\n');

    // Verify
    const [newColumns] = await pool.query(
      "SHOW COLUMNS FROM users LIKE 'password_hash'"
    );

    if (newColumns.length > 0) {
      console.log('✅ Column verified!');
      console.log(`   Field: ${newColumns[0].Field}`);
      console.log(`   Type: ${newColumns[0].Type}`);
      console.log(`   Null: ${newColumns[0].Null}\n`);
    }

    console.log('✅ Done!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateUsersTable();
