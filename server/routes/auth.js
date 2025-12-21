const express = require('express');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { validateRequest, userRegistrationSchema, userLoginSchema } = require('../utils/validators');

const router = express.Router();

// Public routes
router.post('/register', 
  validateRequest(userRegistrationSchema),
  authController.register
);

router.post('/login',
  validateRequest(userLoginSchema),
  authController.login
);

// Protected routes (require authentication)
router.get('/profile',
  authMiddleware,
  authController.getProfile
);

router.put('/profile',
  authMiddleware,
  authController.updateProfile
);

router.post('/change-password',
  authMiddleware,
  authController.changePassword
);

router.post('/deactivate',
  authMiddleware,
  authController.deactivateAccount
);

router.get('/verify',
  authMiddleware,
  authController.verifyToken
);

module.exports = router;
