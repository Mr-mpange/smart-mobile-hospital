const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Database setup script
 * Creates database and tables from schema.sql
 */
async function setupDatabase() {
  let connection;
  
  try {
    // Connect without database to create it
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    console.log('Connected to MySQL server');

    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`Database ${process.env.DB_NAME} created or already exists`);

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }

    console.log('Database schema created successfully');

    // Insert sample doctors
    await insertSampleData(connection);

    console.log('✅ Database setup completed successfully');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * Insert sample doctors for testing
 */
async function insertSampleData(connection) {
  const bcrypt = require('bcryptjs');
  
  const doctors = [
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

  for (const doctor of doctors) {
    try {
      await connection.query(
        `INSERT INTO doctors (name, phone, email, password_hash, specialization, fee) 
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=name`,
        [doctor.name, doctor.phone, doctor.email, doctor.password, doctor.specialization, doctor.fee]
      );
      console.log(`Sample doctor added: ${doctor.name}`);
    } catch (error) {
      // Ignore duplicate errors
      if (!error.message.includes('Duplicate')) {
        throw error;
      }
    }
  }
}

// Run setup
setupDatabase();
