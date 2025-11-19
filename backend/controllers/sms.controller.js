const SMSService = require('../services/sms.service');

/**
 * SMS Controller
 * Handles SMS webhook requests from Africa's Talking
 */
class SMSController {
  /**
   * Handle incoming SMS
   * POST /api/sms/incoming
   */
  static async handleIncoming(req, res) {
    try {
      const { from, text, date, id } = req.body;

      // Validate required fields
      if (!from || !text) {
        return res.status(400).json({ error: 'Invalid request' });
      }

      // Process SMS asynchronously
      SMSService.handleIncomingSMS(from, text, date).catch(error => {
        console.error('SMS processing error:', error);
      });

      // Acknowledge receipt immediately
      res.status(200).json({ success: true });

    } catch (error) {
      console.error('SMS handling error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Handle delivery report
   * POST /api/sms/delivery
   */
  static async handleDelivery(req, res) {
    try {
      const { id, status } = req.body;

      console.log('SMS delivery report:', { id, status });

      // Update SMS queue status if needed
      // Implementation depends on your tracking requirements

      res.status(200).json({ success: true });

    } catch (error) {
      console.error('Delivery report error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Send SMS (for testing)
   * POST /api/sms/send
   */
  static async sendSMS(req, res) {
    try {
      const { phone, message } = req.body;

      if (!phone || !message) {
        return res.status(400).json({ error: 'Phone and message required' });
      }

      await SMSService.sendSMS(phone, message);

      res.json({ success: true, message: 'SMS sent successfully' });

    } catch (error) {
      console.error('SMS sending error:', error);
      res.status(500).json({ error: 'Failed to send SMS' });
    }
  }
}

module.exports = SMSController;
