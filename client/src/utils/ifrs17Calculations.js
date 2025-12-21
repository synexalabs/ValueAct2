/**
 * IFRS 17 Calculation Utilities
 * Provides functions for Contractual Service Margin (CSM), Risk Adjustment (RA), 
 * and other IFRS 17 calculations
 */

/**
 * Calculate Contractual Service Margin (CSM)
 * @param {number} premium - Total premium received
 * @param {number} fcf - Future Cash Flows (present value)
 * @param {number} ra - Risk Adjustment
 * @returns {number} CSM value
 */
export const calculateCSM = (premium, fcf, ra) => {
  return Math.max(0, premium - fcf - ra);
};

/**
 * Calculate Risk Adjustment using VaR method
 * @param {Array<number>} cashFlows - Array of cash flow scenarios
 * @param {number} confidenceLevel - Confidence level (e.g., 0.95 for 95%)
 * @returns {number} Risk Adjustment value
 */
export const calculateRiskAdjustment = (cashFlows, confidenceLevel = 0.95) => {
  if (!cashFlows || cashFlows.length === 0) return 0;
  
  const sortedFlows = [...cashFlows].sort((a, b) => a - b);
  const index = Math.floor((1 - confidenceLevel) * sortedFlows.length);
  const varValue = sortedFlows[index] || sortedFlows[0];
  const expectedValue = cashFlows.reduce((sum, cf) => sum + cf, 0) / cashFlows.length;
  
  return Math.max(0, varValue - expectedValue);
};

/**
 * Calculate CSM release for a given period
 * @param {number} csmOpening - Opening CSM balance
 * @param {number} serviceProvided - Service provided in the period
 * @param {number} totalService - Total service to be provided
 * @returns {number} CSM release amount
 */
export const calculateCSMRelease = (csmOpening, serviceProvided, totalService) => {
  if (totalService === 0) return 0;
  return csmOpening * (serviceProvided / totalService);
};

/**
 * Calculate Loss Component
 * @param {number} fcf - Future Cash Flows
 * @param {number} ra - Risk Adjustment
 * @param {number} premium - Premium received
 * @returns {number} Loss Component value
 */
export const calculateLossComponent = (fcf, ra, premium) => {
  return Math.max(0, fcf + ra - premium);
};

/**
 * Calculate present value of cash flows
 * @param {Array<number>} cashFlows - Array of cash flows
 * @param {number} discountRate - Discount rate (annual)
 * @param {Array<number>} periods - Array of periods (years from now)
 * @returns {number} Present value
 */
export const calculatePresentValue = (cashFlows, discountRate, periods) => {
  if (cashFlows.length !== periods.length) {
    throw new Error('Cash flows and periods arrays must have the same length');
  }
  
  return cashFlows.reduce((pv, cf, index) => {
    return pv + (cf / Math.pow(1 + discountRate, periods[index]));
  }, 0);
};

/**
 * Calculate discount rate with risk-free rate and spread
 * @param {number} riskFreeRate - Risk-free rate
 * @param {number} spread - Credit spread
 * @returns {number} Total discount rate
 */
export const calculateDiscountRate = (riskFreeRate, spread) => {
  return riskFreeRate + spread;
};

/**
 * Generate CSM run-off schedule
 * @param {number} initialCSM - Initial CSM
 * @param {Array<number>} servicePattern - Service pattern over time
 * @returns {Array<Object>} CSM run-off schedule
 */
export const generateCSMRunoff = (initialCSM, servicePattern) => {
  const totalService = servicePattern.reduce((sum, service) => sum + service, 0);
  let remainingCSM = initialCSM;
  
  return servicePattern.map((service, index) => {
    const release = calculateCSMRelease(remainingCSM, service, totalService);
    remainingCSM -= release;
    
    return {
      period: index + 1,
      serviceProvided: service,
      csmRelease: release,
      csmRemaining: remainingCSM
    };
  });
};
