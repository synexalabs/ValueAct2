const express = require('express');
const calculationController = require('../controllers/calculationController');
const { authMiddleware } = require('../middleware/auth');
const { freeCalcLimiter } = require('../middleware/calculationRateLimit');
const { validateRequest, calculationRequestSchema } = require('../utils/validators');
const pythonEngine = require('../services/pythonEngineService');
const calculationService = require('../services/calculationService');
const logger = require('../utils/logger');

const router = express.Router();

// Auth runs first so req.user.plan is available for the rate limiter
router.use(authMiddleware);
router.use(freeCalcLimiter);

// Dedicated IFRS 17 calculation route — returns client-ready flat shape
router.post('/ifrs17', async (req, res) => {
  try {
    const { policies, assumptions } = req.body;
    if (!policies || !Array.isArray(policies) || policies.length === 0) {
      return res.status(400).json({ error: 'policies array is required' });
    }
    const raw = await pythonEngine.calculateIFRS17(policies, assumptions || {});
    const agg = raw.aggregate_metrics || {};
    const response = {
      csm: raw.portfolio_csm,
      lossComponent: agg.loss_component,
      pvPremiums: agg.total_premium,
      pvBenefits: agg.total_benefits_pv,
      pvExpenses: agg.total_expenses_pv,
      fcf: agg.total_fcf,
      ra: agg.risk_adjustment,
      csmRunoff: raw.csm_release_pattern || [],
      source: 'server',
    };
    // Non-blocking history save
    calculationService.saveResult(req.user.id, 'ifrs17', { policies, assumptions }, {
      csm: response.csm, fcf: response.fcf, lossComponent: response.lossComponent,
    });
    res.json(response);
  } catch (err) {
    logger.error('IFRS 17 route error:', err.message);
    res.status(500).json({ error: 'IFRS 17 calculation failed' });
  }
});

// Dedicated Solvency II calculation route — returns client-ready flat shape
router.post('/solvency', async (req, res) => {
  try {
    const { policies, assumptions } = req.body;
    if (!policies || !Array.isArray(policies) || policies.length === 0) {
      return res.status(400).json({ error: 'policies array is required' });
    }
    // Extract own_funds from the first policy and enrich assumptions
    const ownFunds = policies[0]?.ownFunds || policies[0]?.own_funds;
    const enrichedAssumptions = {
      ...assumptions,
      own_funds: ownFunds,
      equity_exposure: assumptions?.equityPct ?? assumptions?.equity_exposure ?? 0.10,
      property_exposure: assumptions?.propertyPct ?? assumptions?.property_exposure ?? 0.05,
      bond_exposure: assumptions?.bondPct ?? assumptions?.bond_exposure ?? 0.60,
      currency_exposure: assumptions?.fxPct ?? assumptions?.currency_exposure ?? 0.10,
    };
    const raw = await pythonEngine.calculateSolvency(policies, enrichedAssumptions);
    const breakdown = raw.scr_breakdown || {};
    const response = {
      scr: raw.scr,
      mcr: raw.mcr,
      bscr: raw.bscr ?? raw.scr_before_lac_dt,
      opRisk: breakdown.operational_risk,
      solvencyRatio: raw.solvency_ratio,
      diversification: raw.diversification_benefit,
      riskModules: {
        marketRisk: breakdown.market_risk,
        lifeUW: breakdown.life_underwriting_risk,
        counterparty: breakdown.counterparty_risk,
        opRisk: breakdown.operational_risk,
      },
      source: 'server',
    };
    // Non-blocking history save
    calculationService.saveResult(req.user.id, 'solvency', { policies, assumptions }, {
      scr: response.scr, mcr: response.mcr, solvencyRatio: response.solvencyRatio,
    });
    res.json(response);
  } catch (err) {
    logger.error('Solvency II route error:', err.message);
    res.status(500).json({ error: 'Solvency II calculation failed' });
  }
});

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

// CSM roll-forward (Überleitung) — Pro only (rate limiter already applied)
router.post('/csm-rollforward', async (req, res) => {
  try {
    const { opening_balance, new_business, assumptions, economic_data } = req.body;
    if (!opening_balance || typeof opening_balance.csm !== 'number') {
      return res.status(400).json({ error: 'opening_balance.csm is required' });
    }
    const result = await pythonEngine.calculateCsmRollforward(
      opening_balance,
      new_business || [],
      assumptions || {},
      economic_data || {}
    );
    res.json(result);
  } catch (err) {
    logger.error('CSM rollforward route error:', err.message);
    res.status(500).json({ error: 'CSM-Überleitung Berechnung fehlgeschlagen' });
  }
});

// Sensitivity analysis route
router.post('/sensitivity',
  calculationController.runSensitivityAnalysis
);

module.exports = router;

