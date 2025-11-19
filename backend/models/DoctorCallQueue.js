const { pool } = require('../config/database');

/**
 * Doctor Call Queue Model
 * Manages incoming consultation call requests for doctors
 */
class DoctorCallQueue {
  /**
   * Create new call request
   */
  static async create(doctorId, userId, caseId, callSid) {
    const [result] = await pool.query(
      `INSERT INTO doctor_call_queue (doctor_id, user_id, case_id, call_sid, status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      [doctorId, userId, caseId, callSid]
    );

    return this.findById(result.insertId);
  }

  /**
   * Find call request by ID
   */
  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT dcq.*, u.name as user_name, u.phone as user_phone, 
              d.name as doctor_name, c.symptoms 
       FROM doctor_call_queue dcq 
       JOIN users u ON dcq.user_id = u.id 
       JOIN doctors d ON dcq.doctor_id = d.id 
       LEFT JOIN cases c ON dcq.case_id = c.id 
       WHERE dcq.id = ?`,
      [id]
    );
    return rows[0];
  }

  /**
   * Get pending requests for doctor
   */
  static async getPendingForDoctor(doctorId) {
    const [rows] = await pool.query(
      `SELECT dcq.*, u.name as user_name, u.phone as user_phone, c.symptoms 
       FROM doctor_call_queue dcq 
       JOIN users u ON dcq.user_id = u.id 
       LEFT JOIN cases c ON dcq.case_id = c.id 
       WHERE dcq.doctor_id = ? AND dcq.status = 'pending' 
       ORDER BY dcq.created_at ASC`,
      [doctorId]
    );
    return rows;
  }

  /**
   * Accept call request
   */
  static async accept(id, doctorPhone) {
    await pool.query(
      `UPDATE doctor_call_queue 
       SET status = 'accepted', doctor_phone = ?, accepted_at = NOW() 
       WHERE id = ?`,
      [doctorPhone, id]
    );

    return this.findById(id);
  }

  /**
   * Reject call request
   */
  static async reject(id, reason = null) {
    await pool.query(
      `UPDATE doctor_call_queue 
       SET status = 'rejected', rejection_reason = ?, rejected_at = NOW() 
       WHERE id = ?`,
      [reason, id]
    );

    return this.findById(id);
  }

  /**
   * Complete call
   */
  static async complete(id, duration) {
    await pool.query(
      `UPDATE doctor_call_queue 
       SET status = 'completed', call_duration = ?, completed_at = NOW() 
       WHERE id = ?`,
      [duration, id]
    );

    return this.findById(id);
  }

  /**
   * Find by call SID
   */
  static async findByCallSid(callSid) {
    const [rows] = await pool.query(
      `SELECT dcq.*, u.name as user_name, u.phone as user_phone, 
              d.name as doctor_name, d.phone as doctor_phone 
       FROM doctor_call_queue dcq 
       JOIN users u ON dcq.user_id = u.id 
       JOIN doctors d ON dcq.doctor_id = d.id 
       WHERE dcq.call_sid = ?`,
      [callSid]
    );
    return rows[0];
  }

  /**
   * Timeout pending requests (after 5 minutes)
   */
  static async timeoutPending() {
    await pool.query(
      `UPDATE doctor_call_queue 
       SET status = 'timeout' 
       WHERE status = 'pending' 
       AND created_at < DATE_SUB(NOW(), INTERVAL 5 MINUTE)`
    );
  }

  /**
   * Get doctor statistics
   */
  static async getDoctorStats(doctorId) {
    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as total_requests,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'timeout' THEN 1 ELSE 0 END) as timeout,
        AVG(CASE WHEN status = 'completed' THEN call_duration ELSE NULL END) as avg_duration
       FROM doctor_call_queue 
       WHERE doctor_id = ?`,
      [doctorId]
    );
    return stats[0];
  }
}

module.exports = DoctorCallQueue;
