const express = require('express');
const AdminController = require('../controllers/admin.controller');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * Admin Routes
 */

// Public routes
router.post('/login', AdminController.login);

// Protected routes (require admin authentication)
router.get('/profile', authenticateAdmin, AdminController.getProfile);
router.get('/stats', authenticateAdmin, AdminController.getStats);

// Doctor management
router.get('/doctors', authenticateAdmin, AdminController.getDoctors);
router.post('/doctors', authenticateAdmin, AdminController.addDoctor);
router.put('/doctors/:id', authenticateAdmin, AdminController.updateDoctor);
router.delete('/doctors/:id', authenticateAdmin, AdminController.deleteDoctor);

// User management
router.get('/users', authenticateAdmin, AdminController.getUsers);

// Case management
router.get('/cases', authenticateAdmin, AdminController.getCases);
router.post('/cases/:id/assign', authenticateAdmin, AdminController.assignCase);

module.exports = router;
