const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * Authentication middleware to verify JWT tokens
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Authorization header is required' 
      });
    }

    // Extract token from header
    const token = extractTokenFromHeader(authHeader);
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Add user info to request
    req.user = {
      id: decoded.userId,
      email: decoded.email
    };
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({ 
      error: 'Invalid or expired token' 
    });
  }
}

/**
 * Optional authentication middleware - doesn't fail if no token
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
async function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = extractTokenFromHeader(authHeader);
      const decoded = verifyToken(token);
      
      req.user = {
        id: decoded.userId,
        email: decoded.email
      };
    }
    
    next();
  } catch (error) {
    // For optional auth, we don't fail the request
    logger.warn('Optional auth failed:', error.message);
    next();
  }
}

module.exports = {
  authMiddleware,
  optionalAuthMiddleware
};
