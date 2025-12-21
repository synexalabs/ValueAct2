const { hashPassword, comparePassword, validatePasswordStrength } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const firestoreService = require('./firestoreService');
const logger = require('../utils/logger');

/**
 * Authentication service for user management
 */
class AuthService {
  
  /**
   * Register a new user
   * @param {object} userData - User registration data
   * @returns {Promise<object>} Registration result
   */
  async registerUser(userData) {
    const { email, password } = userData;
    
    try {
      // Check if user already exists
      const existingUser = await firestoreService.getUserByEmail(email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create user document
      const userDoc = {
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        lastLogin: null,
        isActive: true
      };
      
      const userId = await firestoreService.createDocument('users', userDoc);
      
      logger.info(`New user registered: ${email}`);
      
      return {
        userId,
        email: userDoc.email,
        message: 'User registered successfully'
      };
      
    } catch (error) {
      logger.error('User registration error:', error);
      throw error;
    }
  }
  
  /**
   * Authenticate user login
   * @param {object} loginData - Login credentials
   * @returns {Promise<object>} Authentication result
   */
  async loginUser(loginData) {
    const { email, password } = loginData;
    
    try {
      // Get user by email
      const user = await firestoreService.getUserByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }
      
      // Compare password
      const isPasswordValid = await comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }
      
      // Generate JWT token
      const token = generateToken(user.id, user.email);
      
      // Update last login
      await firestoreService.updateDocument('users', user.id, {
        lastLogin: new Date()
      });
      
      logger.info(`User logged in: ${email}`);
      
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          lastLogin: user.lastLogin
        },
        message: 'Login successful'
      };
      
    } catch (error) {
      logger.error('User login error:', error);
      throw error;
    }
  }
  
  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Promise<object>} User profile
   */
  async getUserProfile(userId) {
    try {
      const user = await firestoreService.getDocument('users', userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Remove sensitive data
      const { passwordHash, ...userProfile } = user;
      
      return userProfile;
      
    } catch (error) {
      logger.error('Get user profile error:', error);
      throw error;
    }
  }
  
  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {object} updateData - Profile update data
   * @returns {Promise<object>} Updated profile
   */
  async updateUserProfile(userId, updateData) {
    try {
      // Remove sensitive fields that shouldn't be updated
      const { passwordHash, createdAt, ...allowedUpdates } = updateData;
      
      await firestoreService.updateDocument('users', userId, allowedUpdates);
      
      // Return updated profile
      return await this.getUserProfile(userId);
      
    } catch (error) {
      logger.error('Update user profile error:', error);
      throw error;
    }
  }
  
  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {object} passwordData - Password change data
   * @returns {Promise<object>} Result
   */
  async changePassword(userId, passwordData) {
    const { currentPassword, newPassword } = passwordData;
    
    try {
      // Get user
      const user = await firestoreService.getDocument('users', userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Verify current password
      const isCurrentPasswordValid = await comparePassword(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }
      
      // Validate new password strength
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
      }
      
      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update password
      await firestoreService.updateDocument('users', userId, {
        passwordHash: hashedPassword
      });
      
      logger.info(`Password changed for user: ${user.email}`);
      
      return {
        message: 'Password changed successfully'
      };
      
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }
  
  /**
   * Deactivate user account
   * @param {string} userId - User ID
   * @returns {Promise<object>} Result
   */
  async deactivateUser(userId) {
    try {
      await firestoreService.updateDocument('users', userId, {
        isActive: false,
        deactivatedAt: new Date()
      });
      
      logger.info(`User account deactivated: ${userId}`);
      
      return {
        message: 'Account deactivated successfully'
      };
      
    } catch (error) {
      logger.error('Deactivate user error:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();
