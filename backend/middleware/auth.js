const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Verifies JWT token for protected routes
 */
const authenticateDoctor = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach doctor info to request
    req.doctor = decoded;
    
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    return res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Admin Authentication Middleware
 * Verifies JWT token for admin routes
 */
const authenticateAdmin = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is admin
    if (decoded.type !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    // Attach admin info to request
    req.admin = decoded;
    
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    return res.status(500).json({ error: 'Authentication failed' });
  }
};

module.exports = { authenticateDoctor, authenticateAdmin };
