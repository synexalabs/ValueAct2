const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Generate JWT token for user
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @returns {string} JWT token
 */
function generateToken(userId, email) {
  return jwt.sign(
    { 
      userId, 
      email,
      iat: Math.floor(Date.now() / 1000)
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} Decoded token payload
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string} Token string
 */
function extractTokenFromHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid authorization header format');
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromHeader
};
