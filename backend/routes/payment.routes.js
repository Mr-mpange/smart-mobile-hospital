const express = require('express');
const PaymentController = require('../controllers/payment.controller');

const router = express.Router();

/**
 * Payment Routes
 */

// Initiate payment
router.post('/initiate', PaymentController.initiatePayment);

// Zenopay callback
router.post('/callback', PaymentController.handleCallback);

// Check payment status
router.get('/:transactionId/status', PaymentController.checkStatus);

// Get user transactions
router.get('/user/:userId', PaymentController.getUserTransactions);

// Process refund
router.post('/:transactionId/refund', PaymentController.processRefund);

// Get payment statistics
router.get('/stats', PaymentController.getStats);

module.exports = router;
