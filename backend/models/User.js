const { pool } = require('../config/database');

/**
 * User Model
 * Handles all user-related database operations
 */
class User {
  /**
   * Find user by phone number
   */
  static async findByPhone(phone) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE phone = ?',
      [phone]
    );
    return rows[0];
  }

  /**
   * Create new user with trial period
   */
  static async create(phone, name = null, language = 'en') {
    const trialStart = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + parseInt(process.env.TRIAL_DURATION_DAYS || 1));

    const [result] = await pool.query(
      `INSERT INTO users (phone, name, trial_start, trial_end, language) 
       VALUES (?, ?, ?, ?, ?)`,
      [phone, name, trialStart, trialEnd, language]
    );

    return this.findById(result.insertId);
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  /**
   * Update user information
   */
  static async update(id, data) {
    const fields = [];
    const values = [];

    Object.keys(data).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    });

    values.push(id);

    await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  /**
   * Increment consultation count
   */
  static async incrementConsultationCount(id) {
    await pool.query(
      'UPDATE users SET consultation_count = consultation_count + 1 WHERE id = ?',
      [id]
    );
  }

  /**
   * Check if user is in trial period
   */
  static async isInTrial(id) {
    const user = await this.findById(id);
    if (!user || !user.trial_end) return false;
    
    return new Date() <= new Date(user.trial_end);
  }

  /**
   * Get user consultation history
   */
  static async getConsultationHistory(userId, limit = 10) {
    const [rows] = await pool.query(
      `SELECT c.*, d.name as doctor_name, d.specialization 
       FROM cases c 
       LEFT JOIN doctors d ON c.doctor_id = d.id 
       WHERE c.user_id = ? 
       ORDER BY c.created_at DESC 
       LIMIT ?`,
      [userId, limit]
    );
    return rows;
  }

  /**
   * Update user balance
   */
  static async updateBalance(id, amount) {
    await pool.query(
      'UPDATE users SET balance = balance + ? WHERE id = ?',
      [amount, id]
    );
  }

  /**
   * Check if user has sufficient balance
   */
  static async hasSufficientBalance(id, amount) {
    const user = await this.findById(id);
    return user && user.balance >= amount;
  }
}

module.exports = User;
