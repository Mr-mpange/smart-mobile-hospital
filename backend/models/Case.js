const { pool } = require('../config/database');

/**
 * Case Model
 * Handles consultation cases/sessions
 */
class Case {
  /**
   * Create new consultation case
   */
  static async create(userId, symptoms, consultationType, priority = 0) {
    const [result] = await pool.query(
      `INSERT INTO cases (user_id, symptoms, consultation_type, priority, status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      [userId, symptoms, consultationType, priority]
    );

    return this.findById(result.insertId);
  }

  /**
   * Find case by ID
   */
  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT c.*, u.name as user_name, u.phone, d.name as doctor_name 
       FROM cases c 
       JOIN users u ON c.user_id = u.id 
       LEFT JOIN doctors d ON c.doctor_id = d.id 
       WHERE c.id = ?`,
      [id]
    );
    return rows[0];
  }

  /**
   * Assign case to doctor
   */
  static async assignToDoctor(caseId, doctorId) {
    await pool.query(
      `UPDATE cases 
       SET doctor_id = ?, status = 'assigned', updated_at = NOW() 
       WHERE id = ?`,
      [doctorId, caseId]
    );

    return this.findById(caseId);
  }

  /**
   * Update case status
   */
  static async updateStatus(caseId, status) {
    const updates = { status };
    
    if (status === 'completed') {
      updates.completed_at = new Date();
    }

    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), caseId];

    await pool.query(
      `UPDATE cases SET ${fields} WHERE id = ?`,
      values
    );

    return this.findById(caseId);
  }

  /**
   * Add doctor response to case
   */
  static async addResponse(caseId, response) {
    await pool.query(
      `UPDATE cases 
       SET response = ?, status = 'completed', completed_at = NOW() 
       WHERE id = ?`,
      [response, caseId]
    );

    return this.findById(caseId);
  }

  /**
   * Get pending cases (unassigned)
   */
  static async getPending() {
    const [rows] = await pool.query(
      `SELECT c.*, u.name as user_name, u.phone 
       FROM cases c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.status = 'pending' 
       ORDER BY c.priority DESC, c.created_at ASC`
    );
    return rows;
  }

  /**
   * Get cases by user
   */
  static async getByUser(userId, limit = 10) {
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
   * Get cases by doctor
   */
  static async getByDoctor(doctorId, status = null) {
    let query = `
      SELECT c.*, u.name as user_name, u.phone 
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
   * Auto-assign case to available doctor
   */
  static async autoAssign(caseId) {
    // Get an online doctor with lowest current workload
    const [doctors] = await pool.query(
      `SELECT d.id, COUNT(c.id) as active_cases 
       FROM doctors d 
       LEFT JOIN cases c ON d.id = c.doctor_id AND c.status IN ('assigned', 'in_progress') 
       WHERE d.status = 'online' 
       GROUP BY d.id 
       ORDER BY active_cases ASC 
       LIMIT 1`
    );

    if (doctors.length > 0) {
      return this.assignToDoctor(caseId, doctors[0].id);
    }

    return null;
  }
}

module.exports = Case;
