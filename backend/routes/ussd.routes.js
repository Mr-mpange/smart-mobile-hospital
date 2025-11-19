const express = require('express');
const USSDController = require('../controllers/ussd.controller');

const router = express.Router();

/**
 * USSD Routes
 * Webhook endpoint for Africa's Talking USSD
 */

// USSD callback endpoint
router.post('/', USSDController.handleUSSD);

module.exports = router;
