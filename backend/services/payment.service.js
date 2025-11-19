const axios = require('axios');
const crypto = require('crypto');
const { pool } = require('../config/database');
const User = require('../models/User');

/**
 * Payment Service
 * Handles Zenopay payment integration
 */
class PaymentService {
  /**
   * Initiate payment via Zenopay
   */
  static async initiatePayment(userId, amount, caseId = null) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Generate unique transaction reference
    const transactionRef = this.generateTransactionRef();

    // Create transaction record
    const [result] = await pool.query(
      `INSERT INTO transactions (user_id, case_id, amount, payment_method, transaction_ref, status) 
       VALUES (?, ?, ?, 'zenopay', ?, 'pending')`,
      [userId, caseId, amount, transactionRef]
    );

    const transactionId = result.insertId;

    try {
      // Zenopay API call
      const paymentData = {
        merchant_id: process.env.ZENOPAY_MERCHANT_ID,
        amount: amount,
        currency: 'KES',
        phone: user.phone,
        reference: transactionRef,
        callback_url: `${process.env.ZENOPAY_CALLBACK_URL}?transaction_id=${transactionId}`,
        description: `SmartHealth Consultation ${caseId ? `#${caseId}` : ''}`
      };

      // Generate signature
      const signature = this.generateSignature(paymentData);
      paymentData.signature = signature;

      const response = await axios.post(
        'https://api.zenopay.com/v1/payments/initiate',
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.ZENOPAY_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update transaction with Zenopay reference
      await pool.query(
        'UPDATE transactions SET transaction_ref = ? WHERE id = ?',
        [response.data.payment_id, transactionId]
      );

      return {
        transactionId,
        paymentId: response.data.payment_id,
        status: 'pending',
        message: 'Payment initiated. Please complete on your phone.'
      };

    } catch (error) {
      console.error('Payment initiation failed:', error.message);
      
      // Update transaction status
      await pool.query(
        'UPDATE transactions SET status = ? WHERE id = ?',
        ['failed', transactionId]
      );

      throw new Error('Payment initiation failed');
    }
  }

  /**
   * Handle payment callback from Zenopay
   */
  static async handleCallback(data) {
    const { transaction_id, status, payment_id, signature } = data;

    // Verify signature
    if (!this.verifySignature(data, signature)) {
      throw new Error('Invalid signature');
    }

    // Get transaction
    const [transactions] = await pool.query(
      'SELECT * FROM transactions WHERE id = ?',
      [transaction_id]
    );

    if (transactions.length === 0) {
      throw new Error('Transaction not found');
    }

    const transaction = transactions[0];

    // Update transaction status
    const newStatus = status === 'success' ? 'completed' : 'failed';
    
    await pool.query(
      'UPDATE transactions SET status = ?, updated_at = NOW() WHERE id = ?',
      [newStatus, transaction_id]
    );

    // If successful, update user balance or process case
    if (newStatus === 'completed') {
      await User.updateBalance(transaction.user_id, transaction.amount);
      
      // If linked to a case, update case status
      if (transaction.case_id) {
        await pool.query(
          'UPDATE cases SET status = ? WHERE id = ?',
          ['assigned', transaction.case_id]
        );
      }
    }

    return { success: newStatus === 'completed' };
  }

  /**
   * Check payment status
   */
  static async checkPaymentStatus(transactionId) {
    const [transactions] = await pool.query(
      'SELECT * FROM transactions WHERE id = ?',
      [transactionId]
    );

    if (transactions.length === 0) {
      throw new Error('Transaction not found');
    }

    return transactions[0];
  }

  /**
   * Get user transaction history
   */
  static async getUserTransactions(userId, limit = 10) {
    const [transactions] = await pool.query(
      `SELECT * FROM transactions 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [userId, limit]
    );

    return transactions;
  }

  /**
   * Process refund
   */
  static async processRefund(transactionId) {
    const [transactions] = await pool.query(
      'SELECT * FROM transactions WHERE id = ?',
      [transactionId]
    );

    if (transactions.length === 0) {
      throw new Error('Transaction not found');
    }

    const transaction = transactions[0];

    if (transaction.status !== 'completed') {
      throw new Error('Only completed transactions can be refunded');
    }

    try {
      // Call Zenopay refund API
      const response = await axios.post(
        'https://api.zenopay.com/v1/payments/refund',
        {
          payment_id: transaction.transaction_ref,
          amount: transaction.amount
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.ZENOPAY_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update transaction status
      await pool.query(
        'UPDATE transactions SET status = ? WHERE id = ?',
        ['refunded', transactionId]
      );

      // Update user balance
      await User.updateBalance(transaction.user_id, -transaction.amount);

      return { success: true, message: 'Refund processed successfully' };

    } catch (error) {
      console.error('Refund failed:', error.message);
      throw new Error('Refund processing failed');
    }
  }

  /**
   * Generate transaction reference
   */
  static generateTransactionRef() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `SH${timestamp}${random}`.toUpperCase();
  }

  /**
   * Generate Zenopay signature
   */
  static generateSignature(data) {
    const sortedKeys = Object.keys(data).sort();
    const signatureString = sortedKeys
      .map(key => `${key}=${data[key]}`)
      .join('&');
    
    return crypto
      .createHmac('sha256', process.env.ZENOPAY_SECRET)
      .update(signatureString)
      .digest('hex');
  }

  /**
   * Verify Zenopay signature
   */
  static verifySignature(data, signature) {
    const { signature: _, ...dataWithoutSignature } = data;
    const expectedSignature = this.generateSignature(dataWithoutSignature);
    return signature === expectedSignature;
  }

  /**
   * Get payment statistics
   */
  static async getStats(startDate = null, endDate = null) {
    let query = `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful_transactions,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue,
        AVG(CASE WHEN status = 'completed' THEN amount ELSE NULL END) as avg_transaction_amount
      FROM transactions
    `;

    const params = [];

    if (startDate && endDate) {
      query += ' WHERE created_at BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    const [stats] = await pool.query(query, params);
    return stats[0];
  }
}

module.exports = PaymentService;
