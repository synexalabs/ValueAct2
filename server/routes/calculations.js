const express = require('express');
const calculationController = require('../controllers/calculationController');
const { authMiddleware } = require('../middleware/auth');
const { validateRequest, calculationRequestSchema } = require('../utils/validators');

const router = express.Router();

// All calculation routes require authentication
router.use(authMiddleware);

// Calculation routes
router.post('/start',
  validateRequest(calculationRequestSchema),
  calculationController.startCalculation
);

router.get('/:calculationId/status',
  calculationController.getCalculationStatus
);

router.get('/:calculationId/results',
  calculationController.getCalculationResults
);

router.post('/:calculationId/cancel',
  calculationController.cancelCalculation
);

router.get('/history',
  calculationController.getCalculationHistory
);

module.exports = router;
