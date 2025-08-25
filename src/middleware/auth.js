const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

/**
 * Verify JWT token and attach user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied',
        message: 'No token provided'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure they still exist and are active
    const user = await userRepository.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Access denied',
        message: 'User not found'
      });
    }
    
    if (!user.active) {
      return res.status(401).json({
        success: false,
        error: 'Access denied',
        message: 'Account is deactivated'
      });
    }
    
    // Attach user to request with organization info
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
      // Get the first organization the user belongs to
      organizationId: user.organizations?.[0]?.organization?.id || null,
      organizations: user.organizations?.map(uo => uo.organization) || []
    };
    
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Access denied',
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Access denied',
        message: 'Token expired'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Authentication failed'
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return next(); // Continue without authentication
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await userRepository.findById(decoded.userId);
    
    if (user && user.active) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
        // Get the first organization the user belongs to
        organizationId: user.organizations?.[0]?.organization?.id || null,
        organizations: user.organizations?.map(uo => uo.organization) || []
      };
    }
    
    next();
    
  } catch (error) {
    // Continue without authentication on token errors
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
}; 