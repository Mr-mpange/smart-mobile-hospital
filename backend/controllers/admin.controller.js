const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Doctor = require('../models/Doctor');
const { pool } = require('../config/database');

/**
 * Admin Controller
 */
class AdminController {
  /**
   * Admin login
   * POST /api/admin/login
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      // Find admin
      const admin = await Admin.findByEmail(email);
      if (!admin) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, admin.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign(
        { id: admin.id, email: admin.email, role: admin.role, type: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        success: true,
        token,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  /**
   * Get admin profile
   * GET /api/admin/profile
   */
  static async getProfile(req, res) {
    try {
      const admin = await Admin.findById(req.admin.id);
      
      if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
      }

      res.json({ success: true, admin });
    } catch (error) {
      console.error('Get admin profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  }

  /**
   * Get dashboard statistics
   * GET /api/admin/stats
   */
  static async getStats(req, res) {
    try {
      // Get counts
      const [doctorCount] = await pool.query('SELECT COUNT(*) as count FROM doctors WHERE is_active = TRUE');
      const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
      const [caseCount] = await pool.query('SELECT COUNT(*) as count FROM cases');
      const [pendingCases] = await pool.query('SELECT COUNT(*) as count FROM cases WHERE status = "pending"');
      const [completedCases] = await pool.query('SELECT COUNT(*) as count FROM cases WHERE status = "completed"');
      
      // Get revenue
      const [revenue] = await pool.query(
        'SELECT SUM(amount) as total FROM transactions WHERE status = "completed"'
      );

      // Get recent cases
      const [recentCases] = await pool.query(`
        SELECT c.*, u.name as user_name, u.phone, d.name as doctor_name
        FROM cases c
        LEFT JOIN users u ON c.user_id = u.id
        LEFT JOIN doctors d ON c.doctor_id = d.id
        ORDER BY c.created_at DESC
        LIMIT 10
      `);

      res.json({
        success: true,
        stats: {
          doctors: doctorCount[0].count,
          users: userCount[0].count,
          totalCases: caseCount[0].count,
          pendingCases: pendingCases[0].count,
          completedCases: completedCases[0].count,
          revenue: revenue[0].total || 0
        },
        recentCases
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: 'Failed to get statistics' });
    }
  }

  /**
   * Get all doctors
   * GET /api/admin/doctors
   */
  static async getDoctors(req, res) {
    try {
      const [doctors] = await pool.query(`
        SELECT id, name, phone, email, specialization, fee, status, 
               rating, total_consultations, is_active, created_at
        FROM doctors
        ORDER BY created_at DESC
      `);

      res.json({ success: true, doctors });
    } catch (error) {
      console.error('Get doctors error:', error);
      res.status(500).json({ error: 'Failed to get doctors' });
    }
  }

  /**
   * Add new doctor
   * POST /api/admin/doctors
   */
  static async addDoctor(req, res) {
    try {
      const { name, phone, email, password, specialization, fee } = req.body;

      // Validate required fields
      if (!name || !phone || !email || !password || !specialization || !fee) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Check if email or phone already exists
      const existingDoctor = await Doctor.findByEmail(email);
      if (existingDoctor) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Create doctor
      const doctorId = await Doctor.create({
        name,
        phone,
        email,
        password_hash,
        specialization,
        fee
      });

      res.status(201).json({
        success: true,
        message: 'Doctor added successfully',
        doctorId
      });
    } catch (error) {
      console.error('Add doctor error:', error);
      res.status(500).json({ error: 'Failed to add doctor' });
    }
  }

  /**
   * Update doctor
   * PUT /api/admin/doctors/:id
   */
  static async updateDoctor(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // If password is being updated, hash it
      if (updates.password) {
        updates.password_hash = await bcrypt.hash(updates.password, 10);
        delete updates.password;
      }

      const success = await Doctor.update(id, updates);

      if (!success) {
        return res.status(404).json({ error: 'Doctor not found' });
      }

      res.json({ success: true, message: 'Doctor updated successfully' });
    } catch (error) {
      console.error('Update doctor error:', error);
      res.status(500).json({ error: 'Failed to update doctor' });
    }
  }

  /**
   * Delete/Deactivate doctor
   * DELETE /api/admin/doctors/:id
   */
  static async deleteDoctor(req, res) {
    try {
      const { id } = req.params;

      // Soft delete - just deactivate
      const [result] = await pool.query(
        'UPDATE doctors SET is_active = FALSE WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Doctor not found' });
      }

      res.json({ success: true, message: 'Doctor deactivated successfully' });
    } catch (error) {
      console.error('Delete doctor error:', error);
      res.status(500).json({ error: 'Failed to delete doctor' });
    }
  }

  /**
   * Get all users
   * GET /api/admin/users
   */
  static async getUsers(req, res) {
    try {
      const [users] = await pool.query(`
        SELECT id, phone, name, email, trial_start, trial_end, 
               consultation_count, balance, language, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT 100
      `);

      res.json({ success: true, users });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to get users' });
    }
  }

  /**
   * Get all cases
   * GET /api/admin/cases
   */
  static async getCases(req, res) {
    try {
      const { status, doctor_id } = req.query;
      
      let query = `
        SELECT c.*, u.name as user_name, u.phone, d.name as doctor_name
        FROM cases c
        LEFT JOIN users u ON c.user_id = u.id
        LEFT JOIN doctors d ON c.doctor_id = d.id
        WHERE 1=1
      `;
      const params = [];

      if (status) {
        query += ' AND c.status = ?';
        params.push(status);
      }

      if (doctor_id) {
        query += ' AND c.doctor_id = ?';
        params.push(doctor_id);
      }

      query += ' ORDER BY c.created_at DESC LIMIT 100';

      const [cases] = await pool.query(query, params);

      res.json({ success: true, cases });
    } catch (error) {
      console.error('Get cases error:', error);
      res.status(500).json({ error: 'Failed to get cases' });
    }
  }

  /**
   * Assign case to doctor
   * POST /api/admin/cases/:id/assign
   */
  static async assignCase(req, res) {
    try {
      const { id } = req.params;
      const { doctor_id } = req.body;

      if (!doctor_id) {
        return res.status(400).json({ error: 'Doctor ID required' });
      }

      const [result] = await pool.query(
        'UPDATE cases SET doctor_id = ?, status = "assigned" WHERE id = ?',
        [doctor_id, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Case not found' });
      }

      res.json({ success: true, message: 'Case assigned successfully' });
    } catch (error) {
      console.error('Assign case error:', error);
      res.status(500).json({ error: 'Failed to assign case' });
    }
  }
}

module.exports = AdminController;
