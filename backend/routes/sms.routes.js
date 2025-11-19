const express = require('express');
const SMSController = require('../controllers/sms.controller');

const router = express.Router();

/**
 * SMS Routes
 * Webhook endpoints for Africa's Talking SMS
 */

// Incoming SMS webhook
router.post('/incoming', SMSController.handleIncoming);

// Delivery report webhook
router.post('/delivery', SMSController.handleDelivery);

// Send SMS (for testing)
router.post('/send', SMSController.sendSMS);

module.exports = router;
