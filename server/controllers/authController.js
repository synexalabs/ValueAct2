const authService = require('../services/authService');
const logger = require('../utils/logger');

/**
 * Authentication controller for handling auth-related requests
 */
class AuthController {
  
  /**
   * Register a new user
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async register(req, res) {
    try {
      const result = await authService.registerUser(req.body);
      
      res.status(201).json({
        success: true,
        message: result.message,
        user: {
          id: result.userId,
          email: result.email
        }
      });
      
    } catch (error) {
      logger.error('Registration error:', error);
      
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.message.includes('Password')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Registration failed. Please try again.'
      });
    }
  }
  
  /**
   * Login user
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async login(req, res) {
    try {
      const result = await authService.loginUser(req.body);
      
      res.json({
        success: true,
        message: result.message,
        token: result.token,
        user: result.user
      });
      
    } catch (error) {
      logger.error('Login error:', error);
      
      if (error.message.includes('Invalid') || error.message.includes('Account')) {
        return res.status(401).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Login failed. Please try again.'
      });
    }
  }
  
  /**
   * Get user profile
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getProfile(req, res) {
    try {
      const profile = await authService.getUserProfile(req.user.id);
      
      res.json({
        success: true,
        user: profile
      });
      
    } catch (error) {
      logger.error('Get profile error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to get user profile'
      });
    }
  }
  
  /**
   * Update user profile
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async updateProfile(req, res) {
    try {
      const updatedProfile = await authService.updateUserProfile(req.user.id, req.body);
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedProfile
      });
      
    } catch (error) {
      logger.error('Update profile error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }
  }
  
  /**
   * Change password
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async changePassword(req, res) {
    try {
      const result = await authService.changePassword(req.user.id, req.body);
      
      res.json({
        success: true,
        message: result.message
      });
      
    } catch (error) {
      logger.error('Change password error:', error);
      
      if (error.message.includes('incorrect') || error.message.includes('Password')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to change password'
      });
    }
  }
  
  /**
   * Deactivate account
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async deactivateAccount(req, res) {
    try {
      const result = await authService.deactivateUser(req.user.id);
      
      res.json({
        success: true,
        message: result.message
      });
      
    } catch (error) {
      logger.error('Deactivate account error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to deactivate account'
      });
    }
  }
  
  /**
   * Verify token endpoint
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async verifyToken(req, res) {
    try {
      // If we reach here, the token is valid (authMiddleware passed)
      res.json({
        success: true,
        message: 'Token is valid',
        user: req.user
      });
      
    } catch (error) {
      logger.error('Verify token error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to verify token'
      });
    }
  }
}

module.exports = new AuthController();
