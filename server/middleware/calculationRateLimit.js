const rateLimit = require('express-rate-limit');

const freeCalcLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3,
  message: {
    error: 'Tageslimit erreicht. Upgraden Sie auf Professional für unbegrenzte Berechnungen.',
    upgradeUrl: '/preise'
  },
  keyGenerator: (req) => req.user?.id || req.ip,
  skip: (req) => req.user?.plan === 'pro'
});

module.exports = { freeCalcLimiter };
