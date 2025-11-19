const express = require('express');
const DoctorController = require('../controllers/doctor.controller');
const { authenticateDoctor } = require('../middleware/auth');

const router = express.Router();

/**
 * Doctor Routes
 */

// Public routes
router.post('/login', DoctorController.login);
router.get('/available', DoctorController.getAvailable);

// Protected routes (require authentication)
router.post('/logout', authenticateDoctor, DoctorController.logout);
router.get('/profile', authenticateDoctor, DoctorController.getProfile);
router.put('/status', authenticateDoctor, DoctorController.updateStatus);
router.get('/cases', authenticateDoctor, DoctorController.getCases);
router.get('/queue', authenticateDoctor, DoctorController.getQueue);
router.post('/cases/:caseId/respond', authenticateDoctor, DoctorController.respondToCase);
router.get('/stats', authenticateDoctor, DoctorController.getStats);

// Voice call queue routes
router.get('/call-queue', authenticateDoctor, DoctorController.getCallQueue);
router.post('/call-queue/:requestId/accept', authenticateDoctor, DoctorController.acceptCallRequest);
router.post('/call-queue/:requestId/reject', authenticateDoctor, DoctorController.rejectCallRequest);
router.get('/call-stats', authenticateDoctor, DoctorController.getCallStats);

module.exports = router;
