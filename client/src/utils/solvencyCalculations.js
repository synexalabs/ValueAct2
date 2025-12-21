/**
 * Solvency II Calculation Utilities
 * Provides functions for Solvency Capital Requirement (SCR), 
 * Minimum Capital Requirement (MCR), and solvency ratio calculations
 */

/**
 * Calculate Solvency Capital Requirement (SCR) using standard formula
 * @param {Object} riskModules - Risk modules with their SCR values
 * @returns {number} Total SCR
 */
export const calculateSCR = (riskModules) => {
  const {
    marketRisk = 0,
    counterpartyRisk = 0,
    lifeUnderwritingRisk = 0,
    healthUnderwritingRisk = 0,
    nonLifeUnderwritingRisk = 0,
    operationalRisk = 0
  } = riskModules;

  // Correlation matrix for SCR aggregation
  const correlations = {
    marketCounterparty: 0.25,
    marketLife: 0.25,
    marketHealth: 0.25,
    marketNonLife: 0.25,
    counterpartyLife: 0.25,
    counterpartyHealth: 0.25,
    counterpartyNonLife: 0.5,
    lifeHealth: 0.25,
    lifeNonLife: 0,
    healthNonLife: 0
  };

  // Calculate correlation terms
  const correlationTerms = [
    correlations.marketCounterparty * marketRisk * counterpartyRisk,
    correlations.marketLife * marketRisk * lifeUnderwritingRisk,
    correlations.marketHealth * marketRisk * healthUnderwritingRisk,
    correlations.marketNonLife * marketRisk * nonLifeUnderwritingRisk,
    correlations.counterpartyLife * counterpartyRisk * lifeUnderwritingRisk,
    correlations.counterpartyHealth * counterpartyRisk * healthUnderwritingRisk,
    correlations.counterpartyNonLife * counterpartyRisk * nonLifeUnderwritingRisk,
    correlations.lifeHealth * lifeUnderwritingRisk * healthUnderwritingRisk,
    correlations.lifeNonLife * lifeUnderwritingRisk * nonLifeUnderwritingRisk,
    correlations.healthNonLife * healthUnderwritingRisk * nonLifeUnderwritingRisk
  ];

  const sumOfSquares = Math.pow(marketRisk, 2) + 
                      Math.pow(counterpartyRisk, 2) + 
                      Math.pow(lifeUnderwritingRisk, 2) + 
                      Math.pow(healthUnderwritingRisk, 2) + 
                      Math.pow(nonLifeUnderwritingRisk, 2) + 
                      Math.pow(operationalRisk, 2);

  const sumOfCorrelations = correlationTerms.reduce((sum, term) => sum + term, 0);

  return Math.sqrt(sumOfSquares + sumOfCorrelations);
};

/**
 * Calculate Minimum Capital Requirement (MCR)
 * @param {number} technicalProvisions - Technical provisions
 * @param {number} premiumWritten - Premium written
 * @param {number} claimsPaid - Claims paid
 * @returns {number} MCR value
 */
export const calculateMCR = (technicalProvisions, premiumWritten, claimsPaid) => {
  // MCR calculation based on technical provisions and premium/claims
  const mcrBase = technicalProvisions * 0.25; // 25% of technical provisions
  const mcrPremium = premiumWritten * 0.15; // 15% of premium written
  const mcrClaims = claimsPaid * 0.10; // 10% of claims paid
  
  return Math.max(mcrBase, mcrPremium, mcrClaims);
};

/**
 * Calculate Solvency Ratio
 * @param {number} ownFunds - Available own funds
 * @param {number} scr - Solvency Capital Requirement
 * @returns {Object} Solvency ratio and status
 */
export const calculateSolvencyRatio = (ownFunds, scr) => {
  if (scr === 0) return { ratio: Infinity, status: 'excellent', color: 'green' };
  
  const ratio = (ownFunds / scr) * 100;
  
  let status, color;
  if (ratio >= 150) {
    status = 'excellent';
    color = 'green';
  } else if (ratio >= 120) {
    status = 'good';
    color = 'yellow';
  } else if (ratio >= 100) {
    status = 'adequate';
    color = 'orange';
  } else {
    status = 'insufficient';
    color = 'red';
  }
  
  return { ratio, status, color };
};

/**
 * Calculate capital shortfall or surplus
 * @param {number} ownFunds - Available own funds
 * @param {number} scr - Solvency Capital Requirement
 * @param {number} mcr - Minimum Capital Requirement
 * @returns {Object} Capital analysis
 */
export const calculateCapitalAnalysis = (ownFunds, scr, mcr) => {
  const scrSurplus = ownFunds - scr;
  const mcrSurplus = ownFunds - mcr;
  
  return {
    scrSurplus,
    mcrSurplus,
    scrSurplusPercent: scr > 0 ? (scrSurplus / scr) * 100 : 0,
    mcrSurplusPercent: mcr > 0 ? (mcrSurplus / mcr) * 100 : 0,
    isSCRCompliant: scrSurplus >= 0,
    isMCRCompliant: mcrSurplus >= 0
  };
};

/**
 * Calculate risk module contributions to total SCR
 * @param {Object} riskModules - Risk modules with their SCR values
 * @returns {Array<Object>} Risk contributions
 */
export const calculateRiskContributions = (riskModules) => {
  const totalSCR = calculateSCR(riskModules);
  
  return Object.entries(riskModules).map(([riskType, scrValue]) => ({
    riskType,
    scrValue,
    contribution: totalSCR > 0 ? (scrValue / totalSCR) * 100 : 0,
    contributionAmount: scrValue
  }));
};

/**
 * Calculate diversification benefit
 * @param {Object} riskModules - Risk modules with their SCR values
 * @returns {Object} Diversification analysis
 */
export const calculateDiversificationBenefit = (riskModules) => {
  const individualSCRSum = Object.values(riskModules).reduce((sum, scr) => sum + scr, 0);
  const diversifiedSCR = calculateSCR(riskModules);
  const diversificationBenefit = individualSCRSum - diversifiedSCR;
  
  return {
    individualSum: individualSCRSum,
    diversifiedSCR,
    diversificationBenefit,
    diversificationPercent: individualSCRSum > 0 ? (diversificationBenefit / individualSCRSum) * 100 : 0
  };
};
