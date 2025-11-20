require('dotenv').config();
const { pool } = require('./backend/config/database');

async function createChatTable() {
  try {
    console.log('\n=== Creating Chat Messages Table ===\n');
    
    // Create case_messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS case_messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        case_id INT NOT NULL,
        sender_type ENUM('patient', 'doctor') NOT NULL,
        sender_id INT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
        INDEX idx_case_id (case_id),
        INDEX idx_created_at (created_at)
      )
    `);
    
    console.log('✅ Table case_messages created successfully!');
    console.log('\nTable structure:');
    console.log('  - id: Message ID');
    console.log('  - case_id: Link to case');
    console.log('  - sender_type: patient or doctor');
    console.log('  - sender_id: User ID or Doctor ID');
    console.log('  - message: Chat message content');
    console.log('  - created_at: Timestamp');
    
    console.log('\n✅ Chat feature is ready!');
    console.log('\nHow it works:');
    console.log('1. Patient pays for consultation');
    console.log('2. Patient receives SMS with chat code (e.g., CHAT123)');
    console.log('3. Patient sends: CHAT123 What food can I eat?');
    console.log('4. Message saved to database');
    console.log('5. Doctor sees message in dashboard');
    console.log('6. Doctor responds via dashboard or SMS\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createChatTable();
