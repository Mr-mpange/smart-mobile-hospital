const { pool } = require('./database');
const fs = require('fs');
const path = require('path');

/**
 * Auto-migration system
 * Creates tables if they don't exist
 * Updates tables if schema changes
 */

/**
 * Get current table structure from database
 */
async function getTableStructure(tableName) {
  try {
    const [columns] = await pool.query(
      `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT, EXTRA
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
       ORDER BY ORDINAL_POSITION`,
      [process.env.DB_NAME, tableName]
    );
    return columns;
  } catch (error) {
    return null;
  }
}

/**
 * Check if table exists
 */
async function tableExists(tableName) {
  try {
    const [tables] = await pool.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
      [process.env.DB_NAME, tableName]
    );
    return tables.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Execute SQL statements from schema file
 */
async function executeSchema() {
  try {
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.log('⚠️  No schema.sql file found, skipping migration');
      return;
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and filter out comments and empty statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.query(statement);
        } catch (error) {
          // Ignore errors for existing tables/columns
          if (!error.message.includes('already exists') && 
              !error.message.includes('Duplicate column')) {
            console.error(`Error executing statement: ${error.message}`);
          }
        }
      }
    }

    console.log('✅ Database schema synchronized');
  } catch (error) {
    console.error('❌ Schema execution failed:', error.message);
    throw error;
  }
}

/**
 * Add missing columns to existing tables
 */
async function addMissingColumns(tableName, expectedColumns) {
  try {
    const currentColumns = await getTableStructure(tableName);
    
    if (!currentColumns) {
      return; // Table doesn't exist, will be created by schema
    }

    const currentColumnNames = currentColumns.map(col => col.COLUMN_NAME);
    
    for (const [columnName, columnDef] of Object.entries(expectedColumns)) {
      if (!currentColumnNames.includes(columnName)) {
        try {
          await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}`);
          console.log(`✅ Added column ${tableName}.${columnName}`);
        } catch (error) {
          if (!error.message.includes('Duplicate column')) {
            console.error(`Error adding column ${tableName}.${columnName}:`, error.message);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error checking columns for ${tableName}:`, error.message);
  }
}

/**
 * Run all migrations
 */
async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');

    // First, execute the schema (creates tables if not exist)
    await executeSchema();

    // Define additional columns that might be added in future
    // This allows for easy schema updates without manual intervention
    const tableUpdates = {
      users: {
        // Example: Add new columns here if needed in future
        // 'new_column': 'VARCHAR(100) DEFAULT NULL'
      },
      doctors: {
        // 'availability_hours': 'JSON DEFAULT NULL'
      },
      cases: {
        // 'recording_url': 'VARCHAR(255) DEFAULT NULL'
      },
      voice_sessions: {
        // 'recording_url': 'VARCHAR(255) DEFAULT NULL'
      },
      doctor_call_queue: {
        // 'notification_sent': 'BOOLEAN DEFAULT FALSE'
      }
    };

    // Check and add missing columns
    for (const [tableName, columns] of Object.entries(tableUpdates)) {
      if (Object.keys(columns).length > 0) {
        await addMissingColumns(tableName, columns);
      }
    }

    // Insert sample data if tables are empty
    await insertSampleDataIfNeeded();

    console.log('✅ Database migrations completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    return false;
  }
}

/**
 * Insert sample data if tables are empty
 */
async function insertSampleDataIfNeeded() {
  try {
    const bcrypt = require('bcryptjs');
    
    // Insert default admin if admins table is empty
    const [admins] = await pool.query('SELECT COUNT(*) as count FROM admins');
    
    if (admins[0].count === 0) {
      console.log('📝 Creating default admin...');
      
      const adminPassword = await bcrypt.hash('admin123', 10);
      
      await pool.query(
        `INSERT INTO admins (name, email, password_hash, role) 
         VALUES (?, ?, ?, ?)`,
        ['System Admin', 'admin@smarthealth.com', adminPassword, 'super_admin']
      );
      
      console.log('✅ Default admin created');
      console.log('   Email: admin@smarthealth.com');
      console.log('   Password: admin123');
    }
    
    // Insert sample doctors if doctors table is empty
    const [doctors] = await pool.query('SELECT COUNT(*) as count FROM doctors');
    
    if (doctors[0].count === 0) {
      console.log('📝 Inserting sample doctors...');
      
      const sampleDoctors = [
        {
          name: 'Dr. John Kamau',
          phone: '+254712345001',
          email: 'john.kamau@smarthealth.com',
          password: await bcrypt.hash('doctor123', 10),
          specialization: 'General Practitioner',
          fee: 500.00
        },
        {
          name: 'Dr. Mary Wanjiku',
          phone: '+254712345002',
          email: 'mary.wanjiku@smarthealth.com',
          password: await bcrypt.hash('doctor123', 10),
          specialization: 'Pediatrician',
          fee: 800.00
        },
        {
          name: 'Dr. James Omondi',
          phone: '+254712345003',
          email: 'james.omondi@smarthealth.com',
          password: await bcrypt.hash('doctor123', 10),
          specialization: 'Dermatologist',
          fee: 1000.00
        }
      ];

      for (const doctor of sampleDoctors) {
        await pool.query(
          `INSERT INTO doctors (name, phone, email, password_hash, specialization, fee) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [doctor.name, doctor.phone, doctor.email, doctor.password, doctor.specialization, doctor.fee]
        );
      }
      
      console.log('✅ Sample doctors inserted');
    }
  } catch (error) {
    // Ignore errors if table doesn't exist yet
    if (!error.message.includes("doesn't exist")) {
      console.error('Error inserting sample data:', error.message);
    }
  }
}

/**
 * Get migration status
 */
async function getMigrationStatus() {
  try {
    const tables = [
      'admins', 'users', 'doctors', 'cases', 'transactions', 'offers',
      'ussd_sessions', 'sms_queue', 'ratings', 'voice_sessions', 'doctor_call_queue'
    ];

    const status = {};
    
    for (const table of tables) {
      const exists = await tableExists(table);
      const structure = exists ? await getTableStructure(table) : null;
      
      status[table] = {
        exists,
        columns: structure ? structure.length : 0
      };
    }

    return status;
  } catch (error) {
    console.error('Error getting migration status:', error.message);
    return null;
  }
}

module.exports = {
  runMigrations,
  getMigrationStatus,
  tableExists,
  getTableStructure
};
