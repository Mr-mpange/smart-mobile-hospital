const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Doctor Model
 * Handles all doctor-related database operations
 */
class Doctor {
  /**
   * Find doctor by ID
   */
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM doctors WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  /**
   * Find doctor by email
   */
  static async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM doctors WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  /**
   * Create new doctor
   */
  static async create(doctorData) {
    const { name, phone, email, password_hash, specialization, fee } = doctorData;
    
    const [result] = await pool.query(
      `INSERT INTO doctors (name, phone, email, password_hash, specialization, fee, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [name, phone, email, password_hash, specialization, fee]
    );
    
    return result.insertId;
  }

  /**
   * Update doctor
   */
  static async update(id, updates) {
    const fields = [];
    const values = [];
    
    if (updates.name) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.phone) {
      fields.push('phone = ?');
      values.push(updates.phone);
    }
    if (updates.email) {
      fields.push('email = ?');
      values.push(updates.email);
    }
    if (updates.password_hash) {
      fields.push('password_hash = ?');
      values.push(updates.password_hash);
    }
    if (updates.specialization) {
      fields.push('specialization = ?');
      values.push(updates.specialization);
    }
    if (updates.fee !== undefined) {
      fields.push('fee = ?');
      values.push(updates.fee);
    }
    if (updates.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(updates.is_active);
    }
    if (updates.is_verified !== undefined) {
      fields.push('is_active = ?');
      values.push(updates.is_verified);
    }
    
    if (fields.length === 0) return false;
    
    values.push(id);
    
    const [result] = await pool.query(
      `UPDATE doctors SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  /**
   * Verify doctor password
   */
  static async verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  /**
   * Get all available doctors
   */
  static async getAvailable() {
    const [rows] = await pool.query(
      `SELECT id, name, specialization, fee, rating, total_consultations 
       FROM doctors 
       WHERE status IN ('online', 'offline') 
       ORDER BY fee ASC`
    );
    return rows;
  }

  /**
   * Get online doctors
   */
  static async getOnline() {
    const [rows] = await pool.query(
      `SELECT id, name, specialization, fee, rating 
       FROM doctors 
       WHERE status = 'online' 
       ORDER BY fee ASC`
    );
    return rows;
  }

  /**
   * Update doctor status
   */
  static async updateStatus(id, status) {
    await pool.query(
      'UPDATE doctors SET status = ? WHERE id = ?',
      [status, id]
    );
  }

  /**
   * Get doctor's pending cases
   */
  static async getPendingCases(doctorId) {
    const [rows] = await pool.query(
      `SELECT c.*, u.name as user_name, u.phone 
       FROM cases c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.doctor_id = ? AND c.status IN ('assigned', 'in_progress') 
       ORDER BY c.priority DESC, c.created_at ASC`,
      [doctorId]
    );
    return rows;
  }

  /**
   * Get all cases for doctor dashboard
   */
  static async getAllCases(doctorId, status = null) {
    let query = `
      SELECT c.*, u.name as user_name, u.phone, u.consultation_count 
      FROM cases c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.doctor_id = ?
    `;
    const params = [doctorId];

    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }

    query += ' ORDER BY c.priority DESC, c.created_at DESC';

    const [rows] = await pool.query(query, params);
    return rows;
  }

  /**
   * Update doctor rating
   */
  static async updateRating(doctorId) {
    await pool.query(
      `UPDATE doctors d 
       SET rating = (
         SELECT AVG(rating) 
         FROM ratings 
         WHERE doctor_id = d.id
       ) 
       WHERE id = ?`,
      [doctorId]
    );
  }

  /**
   * Increment total consultations
   */
  static async incrementConsultations(id) {
    await pool.query(
      'UPDATE doctors SET total_consultations = total_consultations + 1 WHERE id = ?',
      [id]
    );
  }

  /**
   * Get doctor statistics
   */
  static async getStats(doctorId) {
    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as total_cases,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_cases,
        SUM(CASE WHEN status = 'pending' OR status = 'assigned' THEN 1 ELSE 0 END) as pending_cases,
        AVG(rating) as avg_rating
       FROM cases c
       LEFT JOIN ratings r ON c.id = r.case_id
       WHERE c.doctor_id = ?`,
      [doctorId]
    );
    return stats[0];
  }
}

module.exports = Doctor;
