const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Create database if it doesn't exist
 */
async function createDatabaseIfNotExists() {
  let connection;
  try {
    // Connect without database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ Database '${process.env.DB_NAME}' ready`);
    
  } catch (error) {
    console.error('Error creating database:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Create database on module load
createDatabaseIfNotExists();

/**
 * MySQL connection pool configuration
 * Uses connection pooling for better performance
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

/**
 * Test database connection
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

module.exports = { pool, testConnection };
