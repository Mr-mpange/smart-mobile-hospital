const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Doctor = require('../models/Doctor');

/**
 * Unified Authentication Controller
 * Handles login for both admins and doctors
 */
class AuthController {
  /**
   * Unified login endpoint
   * POST /api/auth/login
   * Automatically detects user type and redirects accordingly
   */
  static async unifiedLogin(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      // Try to find admin first
      const admin = await Admin.findByEmail(email);
      
      if (admin) {
        // Verify admin password
        const validPassword = await bcrypt.compare(password, admin.password_hash);
        
        if (!validPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate admin token
        const token = jwt.sign(
          { id: admin.id, email: admin.email, role: 'admin', type: 'admin' },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        return res.json({
          success: true,
          token,
          role: 'admin',
          user: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role
          }
        });
      }

      // Try to find doctor
      const doctor = await Doctor.findByEmail(email);
      
      if (doctor) {
        // Verify doctor password
        const validPassword = await Doctor.verifyPassword(password, doctor.password_hash);
        
        if (!validPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate doctor token
        const token = jwt.sign(
          { id: doctor.id, email: doctor.email, role: 'doctor', type: 'doctor' },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Update doctor status to online
        await Doctor.updateStatus(doctor.id, 'online');

        // Remove password from response
        const { password_hash, ...doctorData } = doctor;

        return res.json({
          success: true,
          token,
          role: 'doctor',
          user: doctorData
        });
      }

      // No user found
      return res.status(401).json({ error: 'Invalid credentials' });

    } catch (error) {
      console.error('Unified login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
}

module.exports = AuthController;
