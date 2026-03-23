/**
 * Solvency II Calculation Utilities — simplified free-tier client-side logic.
 * Full standard formula calculations run on the Python engine (server-side).
 */

export const calculateSolvencyRatio = (ownFunds, scr) => {
  if (!scr || scr === 0) return null;
  return ownFunds / scr;
};

export const calculateBSCR = (riskModules) => {
  const {
    marketRisk = 0,
    counterpartyRisk = 0,
    lifeUnderwritingRisk = 0,
  } = riskModules;

  // Simplified aggregation with correlation matrix (EU 2015/35 Annex IV)
  return Math.sqrt(
    marketRisk ** 2 +
    counterpartyRisk ** 2 +
    lifeUnderwritingRisk ** 2 +
    2 * 0.25 * marketRisk * counterpartyRisk +
    2 * 0.25 * marketRisk * lifeUnderwritingRisk +
    2 * 0.25 * counterpartyRisk * lifeUnderwritingRisk
  );
};
