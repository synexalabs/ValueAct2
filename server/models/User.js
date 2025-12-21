/**
 * User data model for Firestore
 */

class UserModel {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.passwordHash = data.passwordHash;
    this.isActive = data.isActive || true;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.lastLogin = data.lastLogin;
    this.deactivatedAt = data.deactivatedAt;
    this.profile = data.profile || {};
  }

  /**
   * Create a new user document structure
   * @param {object} userData - User data
   * @returns {object} User document
   */
  static createUserDocument(userData) {
    return {
      email: userData.email.toLowerCase(),
      passwordHash: userData.passwordHash,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      profile: {
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        company: userData.company || '',
        role: userData.role || 'Actuarial Professional',
        timezone: userData.timezone || 'UTC'
      }
    };
  }

  /**
   * Update user profile data
   * @param {object} profileData - Profile update data
   * @returns {object} Updated profile
   */
  updateProfile(profileData) {
    this.profile = {
      ...this.profile,
      ...profileData,
      updatedAt: new Date()
    };
    return this.profile;
  }

  /**
   * Get user display name
   * @returns {string} Display name
   */
  getDisplayName() {
    if (this.profile.firstName && this.profile.lastName) {
      return `${this.profile.firstName} ${this.profile.lastName}`;
    }
    return this.email;
  }

  /**
   * Check if user is active
   * @returns {boolean} Is user active
   */
  isUserActive() {
    return this.isActive && !this.deactivatedAt;
  }

  /**
   * Convert to JSON (exclude sensitive data)
   * @returns {object} User data without sensitive fields
   */
  toJSON() {
    const { passwordHash, ...userData } = this;
    return userData;
  }

  /**
   * Convert to public JSON (for API responses)
   * @returns {object} Public user data
   */
  toPublicJSON() {
    return {
      id: this.id,
      email: this.email,
      profile: this.profile,
      isActive: this.isActive,
      createdAt: this.createdAt,
      lastLogin: this.lastLogin
    };
  }
}

module.exports = UserModel;
