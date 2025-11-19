const cron = require('node-cron');
const SMSService = require('../services/sms.service');
const Offer = require('../models/Offer');

/**
 * Cron Jobs
 * Scheduled tasks for background processing
 */

let smsQueueJob;
let offerCleanupJob;

/**
 * Start all cron jobs
 */
function start() {
  console.log('Starting cron jobs...');

  // Process SMS queue every 2 minutes
  smsQueueJob = cron.schedule('*/2 * * * *', async () => {
    try {
      console.log('Processing SMS queue...');
      await SMSService.processQueue();
    } catch (error) {
      console.error('SMS queue processing error:', error);
    }
  });

  // Clean expired offers daily at midnight
  offerCleanupJob = cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Cleaning expired offers...');
      await Offer.cleanExpired();
    } catch (error) {
      console.error('Offer cleanup error:', error);
    }
  });

  console.log('✅ Cron jobs started');
}

/**
 * Stop all cron jobs
 */
function stop() {
  console.log('Stopping cron jobs...');
  
  if (smsQueueJob) smsQueueJob.stop();
  if (offerCleanupJob) offerCleanupJob.stop();
  
  console.log('✅ Cron jobs stopped');
}

module.exports = { start, stop };
