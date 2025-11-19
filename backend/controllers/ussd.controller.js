const USSDService = require('../services/ussd.service');

/**
 * USSD Controller
 * Handles USSD webhook requests from Africa's Talking
 */
class USSDController {
  /**
   * Handle USSD request
   * POST /api/ussd
   */
  static async handleUSSD(req, res) {
    try {
      const { sessionId, serviceCode, phoneNumber, text } = req.body;

      // Validate required fields
      if (!sessionId || !phoneNumber) {
        return res.status(400).send('END Invalid request');
      }

      // Process USSD request
      const response = await USSDService.handleUSSD(
        sessionId,
        serviceCode,
        phoneNumber,
        text || ''
      );

      // Return USSD response
      res.set('Content-Type', 'text/plain');
      res.send(response);

    } catch (error) {
      console.error('USSD handling error:', error);
      res.set('Content-Type', 'text/plain');
      res.send('END Service temporarily unavailable. Please try again.');
    }
  }
}

module.exports = USSDController;
