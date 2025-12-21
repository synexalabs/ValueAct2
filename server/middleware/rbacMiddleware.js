const logger = require('../utils/logger');

/**
 * Require a specific permission
 * Usage: router.get('/protected', requirePermission('read'), controller.handler)
 */
const requirePermission = (permission) => {
    return (req, res, next) => {
        // Ensure tenant middleware has run
        if (!req.tenant) {
            logger.error('RBAC middleware called without tenant context. Ensure tenantMiddleware is used first.');
            return res.status(500).json({ error: 'Security context missing' });
        }

        if (!req.tenant.permissions || !req.tenant.permissions.includes(permission)) {
            logger.warn(`Access denied for user ${req.user?.uid}. Required: ${permission}, Has: ${req.tenant.permissions}`);
            return res.status(403).json({
                error: 'Insufficient permissions',
                required: permission
            });
        }
        next();
    };
};

/**
 * Require a specific role
 * Usage: router.post('/admin', requireRole('admin'), controller.handler)
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.tenant) {
            logger.error('RBAC middleware called without tenant context.');
            return res.status(500).json({ error: 'Security context missing' });
        }

        if (!allowedRoles.includes(req.tenant.role)) {
            logger.warn(`Role access denied for user ${req.user?.uid}. Required one of: ${allowedRoles}, Has: ${req.tenant.role}`);
            return res.status(403).json({
                error: 'Insufficient role',
                required: allowedRoles
            });
        }
        next();
    };
};

module.exports = { requirePermission, requireRole };
