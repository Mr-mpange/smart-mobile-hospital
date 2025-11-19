const { pool } = require('../config/database');

/**
 * Admin Model
 */
class Admin {
  /**
   * Find admin by email
   */
  static async findByEmail(email) {
    const [admins] = await pool.query(
      'SELECT * FROM admins WHERE email = ?',
      [email]
    );
    return admins[0];
  }

  /**
   * Find admin by ID
   */
  static async findById(id) {
    const [admins] = await pool.query(
      'SELECT id, name, email, role, created_at FROM admins WHERE id = ?',
      [id]
    );
    return admins[0];
  }

  /**
   * Create new admin
   */
  static async create(adminData) {
    const { name, email, password_hash, role = 'admin' } = adminData;
    
    const [result] = await pool.query(
      'INSERT INTO admins (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, password_hash, role]
    );
    
    return result.insertId;
  }

  /**
   * Get all admins
   */
  static async getAll() {
    const [admins] = await pool.query(
      'SELECT id, name, email, role, created_at FROM admins ORDER BY created_at DESC'
    );
    return admins;
  }

  /**
   * Update admin
   */
  static async update(id, updates) {
    const fields = [];
    const values = [];
    
    if (updates.name) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.email) {
      fields.push('email = ?');
      values.push(updates.email);
    }
    if (updates.password_hash) {
      fields.push('password_hash = ?');
      values.push(updates.password_hash);
    }
    if (updates.role) {
      fields.push('role = ?');
      values.push(updates.role);
    }
    
    if (fields.length === 0) return false;
    
    values.push(id);
    
    const [result] = await pool.query(
      `UPDATE admins SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  /**
   * Delete admin
   */
  static async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM admins WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Admin;
