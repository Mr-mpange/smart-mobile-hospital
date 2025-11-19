const Doctor = require('../models/Doctor');
const Case = require('../models/Case');
const DoctorCallQueue = require('../models/DoctorCallQueue');
const SMSService = require('../services/sms.service');
const VoiceService = require('../services/voice.service');
const jwt = require('jsonwebtoken');

/**
 * Doctor Controller
 * Handles doctor authentication and dashboard operations
 */
class DoctorController {
  /**
   * Doctor login
   * POST /api/doctors/login
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      // Find doctor
      const doctor = await Doctor.findByEmail(email);
      
      if (!doctor) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValid = await Doctor.verifyPassword(password, doctor.password_hash);
      
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: doctor.id, email: doctor.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Update status to online
      await Doctor.updateStatus(doctor.id, 'online');

      // Remove password from response
      const { password_hash, ...doctorData } = doctor;

      res.json({
        success: true,
        token,
        doctor: doctorData
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  /**
   * Doctor logout
   * POST /api/doctors/logout
   */
  static async logout(req, res) {
    try {
      const doctorId = req.doctor.id;

      // Update status to offline
      await Doctor.updateStatus(doctorId, 'offline');

      res.json({ success: true, message: 'Logged out successfully' });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  /**
   * Get doctor profile
   * GET /api/doctors/profile
   */
  static async getProfile(req, res) {
    try {
      const doctor = await Doctor.findById(req.doctor.id);
      
      if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found' });
      }

      const { password_hash, ...doctorData } = doctor;

      res.json({ success: true, doctor: doctorData });

    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  /**
   * Update doctor status
   * PUT /api/doctors/status
   */
  static async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const doctorId = req.doctor.id;

      if (!['online', 'offline', 'busy'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      await Doctor.updateStatus(doctorId, status);

      res.json({ success: true, status });

    } catch (error) {
      console.error('Status update error:', error);
      res.status(500).json({ error: 'Failed to update status' });
    }
  }

  /**
   * Get doctor's cases
   * GET /api/doctors/cases
   */
  static async getCases(req, res) {
    try {
      const doctorId = req.doctor.id;
      const { status } = req.query;

      const cases = await Doctor.getAllCases(doctorId, status);

      res.json({ success: true, cases });

    } catch (error) {
      console.error('Cases fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch cases' });
    }
  }

  /**
   * Get pending cases (queue)
   * GET /api/doctors/queue
   */
  static async getQueue(req, res) {
    try {
      const doctorId = req.doctor.id;

      const queue = await Doctor.getPendingCases(doctorId);

      res.json({ success: true, queue });

    } catch (error) {
      console.error('Queue fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch queue' });
    }
  }

  /**
   * Respond to case
   * POST /api/doctors/cases/:caseId/respond
   */
  static async respondToCase(req, res) {
    try {
      const { caseId } = req.params;
      const { response } = req.body;
      const doctorId = req.doctor.id;

      if (!response || response.trim().length < 10) {
        return res.status(400).json({ error: 'Response must be at least 10 characters' });
      }

      // Get case and verify it belongs to this doctor
      const caseData = await Case.findById(caseId);
      
      if (!caseData) {
        return res.status(404).json({ error: 'Case not found' });
      }

      if (caseData.doctor_id !== doctorId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Add response and complete case
      await Case.addResponse(caseId, response);

      // Send SMS to patient
      await SMSService.sendDoctorResponse(caseId);

      // Increment doctor's consultation count
      await Doctor.incrementConsultations(doctorId);

      res.json({ success: true, message: 'Response sent successfully' });

    } catch (error) {
      console.error('Response error:', error);
      res.status(500).json({ error: 'Failed to send response' });
    }
  }

  /**
   * Get doctor statistics
   * GET /api/doctors/stats
   */
  static async getStats(req, res) {
    try {
      const doctorId = req.doctor.id;

      const stats = await Doctor.getStats(doctorId);

      res.json({ success: true, stats });

    } catch (error) {
      console.error('Stats fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }

  /**
   * Get available doctors (public)
   * GET /api/doctors/available
   */
  static async getAvailable(req, res) {
    try {
      const doctors = await Doctor.getAvailable();

      res.json({ success: true, doctors });

    } catch (error) {
      console.error('Doctors fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch doctors' });
    }
  }

  /**
   * Get voice call queue
   * GET /api/doctors/call-queue
   */
  static async getCallQueue(req, res) {
    try {
      const doctorId = req.doctor.id;

      const queue = await DoctorCallQueue.getPendingForDoctor(doctorId);

      res.json({ success: true, queue });

    } catch (error) {
      console.error('Call queue fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch call queue' });
    }
  }

  /**
   * Accept voice call request
   * POST /api/doctors/call-queue/:requestId/accept
   */
  static async acceptCallRequest(req, res) {
    try {
      const { requestId } = req.params;
      const doctorId = req.doctor.id;

      const callRequest = await DoctorCallQueue.findById(requestId);

      if (!callRequest || callRequest.doctor_id !== doctorId) {
        return res.status(404).json({ error: 'Call request not found' });
      }

      if (callRequest.status !== 'pending') {
        return res.status(400).json({ error: 'Call request already processed' });
      }

      const doctor = await Doctor.findById(doctorId);
      await DoctorCallQueue.accept(requestId, doctor.phone);

      res.json({ success: true, message: 'Call request accepted' });

    } catch (error) {
      console.error('Accept call error:', error);
      res.status(500).json({ error: 'Failed to accept call' });
    }
  }

  /**
   * Reject voice call request
   * POST /api/doctors/call-queue/:requestId/reject
   */
  static async rejectCallRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { reason } = req.body;
      const doctorId = req.doctor.id;

      const callRequest = await DoctorCallQueue.findById(requestId);

      if (!callRequest || callRequest.doctor_id !== doctorId) {
        return res.status(404).json({ error: 'Call request not found' });
      }

      if (callRequest.status !== 'pending') {
        return res.status(400).json({ error: 'Call request already processed' });
      }

      await DoctorCallQueue.reject(requestId, reason);

      res.json({ success: true, message: 'Call request rejected' });

    } catch (error) {
      console.error('Reject call error:', error);
      res.status(500).json({ error: 'Failed to reject call' });
    }
  }

  /**
   * Get call queue statistics
   * GET /api/doctors/call-stats
   */
  static async getCallStats(req, res) {
    try {
      const doctorId = req.doctor.id;

      const stats = await DoctorCallQueue.getDoctorStats(doctorId);

      res.json({ success: true, stats });

    } catch (error) {
      console.error('Call stats fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch call statistics' });
    }
  }
}

module.exports = DoctorController;
