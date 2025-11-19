/**
 * Create admins table manually
 * Run: node create-admins-table.js
 */

require('dotenv').config();
const { pool } = require('./backend/config/database');

async function createAdminsTable() {
  try {
    console.log('🔧 Creating admins table...\n');

    // Create admins table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('super_admin', 'admin') DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('✅ Admins table created successfully!\n');

    // Check if table exists
    const [tables] = await pool.query("SHOW TABLES LIKE 'admins'");
    
    if (tables.length > 0) {
      console.log('✅ Table verified!\n');
      
      // Show table structure
      const [columns] = await pool.query('DESCRIBE admins');
      console.log('Table Structure:');
      columns.forEach(col => {
        console.log(`   ${col.Field}: ${col.Type}`);
      });
    }

    console.log('\n✅ Done! Now run: node create-admin.js\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdminsTable();
