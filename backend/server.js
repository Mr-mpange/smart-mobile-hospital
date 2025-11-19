const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { runMigrations } = require('./config/migrations');
const ussdRoutes = require('./routes/ussd.routes');
const smsRoutes = require('./routes/sms.routes');
const doctorRoutes = require('./routes/doctor.routes');
const paymentRoutes = require('./routes/payment.routes');
const voiceRoutes = require('./routes/voice.routes');

// Import cron jobs
const cronJobs = require('./utils/cron');

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Middleware
 */
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

/**
 * Routes
 */
app.get('/', (req, res) => {
  res.json({
    name: 'SmartHealth Telemedicine API',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/ussd', ussdRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/voice', voiceRoutes);

/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/**
 * Start server
 */
async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Run database migrations (auto-create/update tables)
    const migrationSuccess = await runMigrations();
    
    if (!migrationSuccess) {
      console.warn('⚠️  Migrations completed with warnings, but server will continue...');
    }

    // Start cron jobs
    cronJobs.start();

    // Start server
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   SmartHealth Telemedicine System     ║
║   Server running on port ${PORT}         ║
║   Environment: ${process.env.NODE_ENV || 'development'}            ║
╚════════════════════════════════════════╝
      `);
      console.log(`API: http://localhost:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/health`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  cronJobs.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  cronJobs.stop();
  process.exit(0);
});

startServer();

module.exports = app;
