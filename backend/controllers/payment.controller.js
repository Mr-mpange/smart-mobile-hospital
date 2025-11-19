const PaymentService = require('../services/payment.service');

/**
 * Payment Controller
 * Handles payment operations and Zenopay callbacks
 */
class PaymentController {
  /**
   * Initiate payment
   * POST /api/payments/initiate
   */
  static async initiatePayment(req, res) {
    try {
      const { userId, amount, caseId } = req.body;

      if (!userId || !amount) {
        return res.status(400).json({ error: 'User ID and amount required' });
      }

      if (amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      const result = await PaymentService.initiatePayment(userId, amount, caseId);

      res.json({ success: true, ...result });

    } catch (error) {
      console.error('Payment initiation error:', error);
      res.status(500).json({ error: error.message || 'Payment initiation failed' });
    }
  }

  /**
   * Handle Zenopay callback
   * POST /api/payments/callback
   */
  static async handleCallback(req, res) {
    try {
      const callbackData = req.body;

      const result = await PaymentService.handleCallback(callbackData);

      res.json({ success: result.success });

    } catch (error) {
      console.error('Payment callback error:', error);
      res.status(500).json({ error: 'Callback processing failed' });
    }
  }

  /**
   * Check payment status
   * GET /api/payments/:transactionId/status
   */
  static async checkStatus(req, res) {
    try {
      const { transactionId } = req.params;

      const transaction = await PaymentService.checkPaymentStatus(transactionId);

      res.json({ success: true, transaction });

    } catch (error) {
      console.error('Status check error:', error);
      res.status(500).json({ error: error.message || 'Failed to check status' });
    }
  }

  /**
   * Get user transactions
   * GET /api/payments/user/:userId
   */
  static async getUserTransactions(req, res) {
    try {
      const { userId } = req.params;
      const { limit } = req.query;

      const transactions = await PaymentService.getUserTransactions(
        userId,
        limit ? parseInt(limit) : 10
      );

      res.json({ success: true, transactions });

    } catch (error) {
      console.error('Transactions fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  }

  /**
   * Process refund
   * POST /api/payments/:transactionId/refund
   */
  static async processRefund(req, res) {
    try {
      const { transactionId } = req.params;

      const result = await PaymentService.processRefund(transactionId);

      res.json({ success: true, ...result });

    } catch (error) {
      console.error('Refund error:', error);
      res.status(500).json({ error: error.message || 'Refund failed' });
    }
  }

  /**
   * Get payment statistics
   * GET /api/payments/stats
   */
  static async getStats(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const stats = await PaymentService.getStats(startDate, endDate);

      res.json({ success: true, stats });

    } catch (error) {
      console.error('Stats fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }
}

module.exports = PaymentController;
