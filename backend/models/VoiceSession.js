const { pool } = require('../config/database');

/**
 * Voice Session Model
 * Handles voice call session tracking
 */
class VoiceSession {
  /**
   * Create new voice session
   */
  static async create(userId, sessionId, callSid) {
    const [result] = await pool.query(
      `INSERT INTO voice_sessions (user_id, session_id, call_sid, step) 
       VALUES (?, ?, ?, 'welcome')`,
      [userId, sessionId, callSid]
    );

    return this.findById(result.insertId);
  }

  /**
   * Find session by ID
   */
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM voice_sessions WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  /**
   * Find session by call SID
   */
  static async findByCallSid(callSid) {
    const [rows] = await pool.query(
      'SELECT * FROM voice_sessions WHERE call_sid = ?',
      [callSid]
    );
    return rows[0];
  }

  /**
   * Update session step and data
   */
  static async updateSession(callSid, step, data = null) {
    const updates = { step };
    
    if (data) {
      updates.temporary_data = JSON.stringify(data);
    }

    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), callSid];

    await pool.query(
      `UPDATE voice_sessions SET ${fields}, updated_at = NOW() WHERE call_sid = ?`,
      values
    );

    return this.findByCallSid(callSid);
  }

  /**
   * Get session data
   */
  static async getSessionData(callSid) {
    const session = await this.findByCallSid(callSid);
    
    if (session && session.temporary_data) {
      return JSON.parse(session.temporary_data);
    }
    
    return null;
  }

  /**
   * Complete session
   */
  static async completeSession(callSid, duration) {
    await pool.query(
      `UPDATE voice_sessions 
       SET status = 'completed', call_duration = ?, updated_at = NOW() 
       WHERE call_sid = ?`,
      [duration, callSid]
    );
  }

  /**
   * Get active sessions for user
   */
  static async getActiveSessions(userId) {
    const [rows] = await pool.query(
      `SELECT * FROM voice_sessions 
       WHERE user_id = ? AND status = 'active' 
       ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  }
}

module.exports = VoiceSession;
