const { pool } = require('../config/database');

/**
 * Offer Model
 * Handles frequent user rewards and offers
 */
class Offer {
  /**
   * Create new offer for user
   */
  static async create(userId, offerType, discountPercentage = null, expiryDays = 30) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    const [result] = await pool.query(
      `INSERT INTO offers (user_id, offer_type, discount_percentage, expiry_date) 
       VALUES (?, ?, ?, ?)`,
      [userId, offerType, discountPercentage, expiryDate]
    );

    return this.findById(result.insertId);
  }

  /**
   * Find offer by ID
   */
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM offers WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  /**
   * Get active offers for user
   */
  static async getActiveOffers(userId) {
    const [rows] = await pool.query(
      `SELECT * FROM offers 
       WHERE user_id = ? 
       AND applied = FALSE 
       AND expiry_date > NOW() 
       ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  }

  /**
   * Apply offer
   */
  static async apply(offerId) {
    await pool.query(
      'UPDATE offers SET applied = TRUE WHERE id = ?',
      [offerId]
    );
  }

  /**
   * Check and create offers based on consultation count
   */
  static async checkAndCreateOffers(userId, consultationCount) {
    const offers = [];

    // Discount offer every 5 consultations
    if (consultationCount > 0 && consultationCount % parseInt(process.env.CONSULTATIONS_FOR_DISCOUNT || 5) === 0) {
      const discount = await this.create(
        userId, 
        'discount', 
        parseInt(process.env.DISCOUNT_PERCENTAGE || 20)
      );
      offers.push(discount);
    }

    // Free consultation every 10 consultations
    if (consultationCount > 0 && consultationCount % parseInt(process.env.CONSULTATIONS_FOR_FREE || 10) === 0) {
      const free = await this.create(userId, 'free_consultation');
      offers.push(free);
    }

    // Priority queue after 3 consultations
    if (consultationCount >= parseInt(process.env.CONSULTATIONS_FOR_PRIORITY || 3)) {
      const existing = await this.getActiveOffers(userId);
      const hasPriority = existing.some(o => o.offer_type === 'priority_queue');
      
      if (!hasPriority) {
        const priority = await this.create(userId, 'priority_queue');
        offers.push(priority);
      }
    }

    return offers;
  }

  /**
   * Get best available offer for user
   */
  static async getBestOffer(userId) {
    const offers = await this.getActiveOffers(userId);
    
    if (offers.length === 0) return null;

    // Priority: free_consultation > discount > priority_queue
    const priority = {
      'free_consultation': 3,
      'discount': 2,
      'priority_queue': 1
    };

    offers.sort((a, b) => priority[b.offer_type] - priority[a.offer_type]);
    return offers[0];
  }

  /**
   * Clean expired offers
   */
  static async cleanExpired() {
    await pool.query(
      'DELETE FROM offers WHERE expiry_date < NOW() AND applied = FALSE'
    );
  }
}

module.exports = Offer;
