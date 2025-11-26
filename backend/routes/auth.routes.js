const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

// Unified login endpoint
router.post('/login', AuthController.unifiedLogin);

module.exports = router;
