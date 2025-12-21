const firestoreDataService = require('../services/firestoreDataService');
const logger = require('../utils/logger');

/**
 * Multi-tenant middleware
 * Ensures users can only access their organization's data
 * Attaches tenant context to request
 */
const tenantMiddleware = async (req, res, next) => {
    try {
        // Skip for public routes or if already handled (e.g. auth middleware might not have run yet if placed incorrectly)
        if (!req.user || !req.user.uid) {
            // If no user is authenticated, we can't determine tenant.
            // Assuming this middleware runs AFTER auth middleware.
            // If auth is optional for a route, next()
            return next();
        }

        const userId = req.user.uid;

        // Get user's profile to find organization
        // Assuming firestoreDataService has a getUser method or we access collection directly
        // If not, we might need to implement it or use admin SDK directly here (but service is better)

        // For now, let's assume we can get user profile. 
        // If firestoreDataService doesn't have getUser, we'll need to add it or fetch directly.
        // Let's use a hypothetical getUserProfile or similar.
        // Checking firestoreDataService content might be safer first, but per plan:

        // Mocking/Implementing basic fetch if service doesn't expose it directly yet
        // In a real app, we'd probably have a specific userService or method.
        // Using a direct db call if needed or extending service. 
        // Let's assume user document has organizationId.

        const db = require('firebase-admin').firestore();
        const userDocRef = db.collection('users').doc(userId);
        const userSnapshot = await userDocRef.get();

        if (!userSnapshot.exists) {
            // User exists in Auth but not in DB? Edge case.
            logger.warn(`User ${userId} authenticated but has no profile document`);
            return res.status(403).json({ error: 'User profile not found' });
        }

        const userData = userSnapshot.data();
        const organizationId = userData.organizationId;
        const role = userData.role || 'viewer';

        if (!organizationId) {
            // Allow personal accounts? Or enforce org? For "Enterprise", enforce org.
            // Or handle "personal workspace"
            // For this task, we fail if no org.
            return res.status(403).json({
                error: 'User not associated with an organization'
            });
        }

        // Attach tenant context
        req.tenant = {
            organizationId,
            organizationName: userData.organizationName || 'Unknown Org',
            role: role,
            permissions: getPermissions(role)
        };

        logger.info(`Tenant context set for user ${userId}: Org ${organizationId}, Role ${role}`);

        next();
    } catch (error) {
        logger.error('Tenant middleware error:', error);
        res.status(500).json({ error: 'Internal Server Error during tenant resolution' });
    }
};

/**
 * Helper to define permissions based on role
 */
const getPermissions = (role) => {
    const permissionMap = {
        admin: ['read', 'write', 'delete', 'manage_users', 'export', 'approve_calculations'],
        actuary: ['read', 'write', 'export', 'run_calculations'],
        auditor: ['read', 'export', 'audit_logs'],
        viewer: ['read']
    };
    return permissionMap[role] || ['read'];
};

module.exports = tenantMiddleware;
