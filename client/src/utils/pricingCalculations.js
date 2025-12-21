/**
 * Pricing Calculation Utilities
 * Provides functions for premium calculation, profit testing,
 * and sensitivity analysis for life insurance products
 */

import { getMortalityRate, getSurvivalProbability } from './mortalityTables';

/**
 * Calculate net premium for term life insurance using proper mortality tables
 * @param {number} sumAssured - Sum assured amount
 * @param {number} age - Age of insured
 * @param {number} term - Policy term in years
 * @param {string} mortalityTableId - Mortality table identifier
 * @param {string} gender - Gender ('male', 'female')
 * @param {number} interestRate - Interest rate for discounting
 * @returns {number} Net premium
 */
export const calculateNetPremium = (sumAssured, age, term, mortalityTableId, gender, interestRate) => {
  let presentValueOfBenefits = 0;
  let presentValueOfPremiums = 0;
  
  // Calculate present value of benefits and premiums
  for (let t = 0; t < term; t++) {
    // Calculate survival probability to start of year t
    const survivalToStart = getSurvivalProbability(mortalityTableId, age, t, gender);
    
    // Calculate mortality rate at age + t
    const mortalityRate = getMortalityRate(mortalityTableId, age + t, gender);
    
    // Death probability in year t = survival to start * mortality rate
    const deathProbability = survivalToStart * mortalityRate;
    
    // Death benefit paid at end of year t
    const discountFactor = Math.pow(1 + interestRate, -(t + 1));
    presentValueOfBenefits += sumAssured * deathProbability * discountFactor;
    
    // Premium paid at beginning of year t
    const premiumDiscountFactor = Math.pow(1 + interestRate, -t);
    presentValueOfPremiums += survivalToStart * premiumDiscountFactor;
  }
  
  return presentValueOfBenefits / presentValueOfPremiums;
};

/**
 * Calculate gross premium including expenses and profit margin
 * @param {number} netPremium - Net premium
 * @param {number} expenseRatio - Expense ratio (as decimal)
 * @param {number} profitMargin - Profit margin (as decimal)
 * @returns {number} Gross premium
 */
export const calculateGrossPremium = (netPremium, expenseRatio, profitMargin) => {
  return netPremium / (1 - expenseRatio - profitMargin);
};

/**
 * Calculate Net Present Value (NPV) for profit testing
 * @param {Array<number>} cashFlows - Cash flows for each year
 * @param {number} discountRate - Discount rate
 * @returns {number} NPV
 */
export const calculateNPV = (cashFlows, discountRate) => {
  return cashFlows.reduce((npv, cf, year) => {
    return npv + (cf / Math.pow(1 + discountRate, year));
  }, 0);
};

/**
 * Calculate Internal Rate of Return (IRR) using Newton-Raphson method
 * @param {Array<number>} cashFlows - Cash flows for each year
 * @param {number} initialGuess - Initial guess for IRR (default 0.1)
 * @param {number} maxIterations - Maximum iterations (default 100)
 * @param {number} tolerance - Tolerance for convergence (default 1e-6)
 * @returns {number} IRR
 */
export const calculateIRR = (cashFlows, initialGuess = 0.1, maxIterations = 100, tolerance = 1e-6) => {
  let rate = initialGuess;
  
  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let npvDerivative = 0;
    
    for (let year = 0; year < cashFlows.length; year++) {
      const discountFactor = Math.pow(1 + rate, year);
      npv += cashFlows[year] / discountFactor;
      npvDerivative -= (year * cashFlows[year]) / (discountFactor * (1 + rate));
    }
    
    if (Math.abs(npv) < tolerance) {
      return rate;
    }
    
    rate = rate - npv / npvDerivative;
    
    if (rate < -1) rate = -0.99; // Prevent negative rates below -100%
  }
  
  return rate;
};

/**
 * Calculate break-even premium using proper mortality tables
 * @param {Object} assumptions - Pricing assumptions
 * @returns {number} Break-even premium
 */
export const calculateBreakEvenPremium = (assumptions) => {
  const {
    sumAssured,
    age,
    term,
    mortalityTableId,
    gender,
    interestRate,
    expenseRatio,
    targetProfitMargin = 0
  } = assumptions;
  
  const netPremium = calculateNetPremium(sumAssured, age, term, mortalityTableId, gender, interestRate);
  return calculateGrossPremium(netPremium, expenseRatio, targetProfitMargin);
};

/**
 * Perform sensitivity analysis on premium
 * @param {Object} baseAssumptions - Base case assumptions
 * @param {Object} sensitivityRanges - Ranges for sensitivity analysis
 * @returns {Array<Object>} Sensitivity analysis results
 */
export const performSensitivityAnalysis = (baseAssumptions, sensitivityRanges) => {
  const results = [];
  
  Object.entries(sensitivityRanges).forEach(([parameter, range]) => {
    const { min, max, steps = 5 } = range;
    const stepSize = (max - min) / (steps - 1);
    
    for (let i = 0; i < steps; i++) {
      const value = min + (i * stepSize);
      const modifiedAssumptions = { ...baseAssumptions, [parameter]: value };
      const premium = calculateBreakEvenPremium(modifiedAssumptions);
      
      results.push({
        parameter,
        value,
        premium,
        changeFromBase: ((premium - calculateBreakEvenPremium(baseAssumptions)) / calculateBreakEvenPremium(baseAssumptions)) * 100
      });
    }
  });
  
  return results;
};

/**
 * Calculate profit testing metrics using proper mortality tables
 * @param {Object} assumptions - Profit testing assumptions
 * @returns {Object} Profit testing results
 */
export const calculateProfitTestingMetrics = (assumptions) => {
  const {
    premium,
    sumAssured,
    age,
    term,
    mortalityTableId,
    gender,
    interestRate,
    expenseRatio,
    initialExpenses,
    renewalExpenses
  } = assumptions;
  
  const cashFlows = [];
  
  // Year 0: Initial expenses and premium
  cashFlows.push(premium - initialExpenses);
  
  // Years 1 to term-1: Renewal expenses, mortality claims, and premiums
  for (let year = 1; year < term; year++) {
    const survivalProbability = getSurvivalProbability(mortalityTableId, age, year, gender);
    const mortalityRate = getMortalityRate(mortalityTableId, age + year - 1, gender);
    
    const expectedClaims = sumAssured * survivalProbability * mortalityRate;
    const expectedExpenses = renewalExpenses * survivalProbability;
    const expectedPremium = premium * survivalProbability;
    
    cashFlows.push(expectedPremium - expectedExpenses - expectedClaims);
  }
  
  // Final year: Final claims and expenses
  const finalSurvivalProbability = getSurvivalProbability(mortalityTableId, age, term - 1, gender);
  const finalMortalityRate = getMortalityRate(mortalityTableId, age + term - 1, gender);
  const finalClaims = sumAssured * finalSurvivalProbability * finalMortalityRate;
  const finalExpenses = renewalExpenses * finalSurvivalProbability;
  const finalPremium = premium * finalSurvivalProbability;
  
  cashFlows.push(finalPremium - finalExpenses - finalClaims);
  
  const npv = calculateNPV(cashFlows, interestRate);
  const irr = calculateIRR(cashFlows);
  
  return {
    cashFlows,
    npv,
    irr,
    profitMargin: npv / (premium * term) * 100,
    paybackPeriod: calculatePaybackPeriod(cashFlows)
  };
};

/**
 * Calculate payback period
 * @param {Array<number>} cashFlows - Cash flows
 * @returns {number} Payback period in years
 */
export const calculatePaybackPeriod = (cashFlows) => {
  let cumulativeCashFlow = 0;
  
  for (let year = 0; year < cashFlows.length; year++) {
    cumulativeCashFlow += cashFlows[year];
    if (cumulativeCashFlow >= 0) {
      return year + (Math.abs(cumulativeCashFlow - cashFlows[year]) / Math.abs(cashFlows[year]));
    }
  }
  
  return cashFlows.length; // Never pays back
};

/**
 * Stochastic Pricing Engine - Monte Carlo Simulation
 * Implements stochastic modeling for pricing calculations
 */
export function runMonteCarloPricing(policies, assumptions, numSimulations = 1000) {
    const results = {
        netPresentValues: [],
        internalRatesOfReturn: [],
        profitMargins: [],
        breakEvenPremiums: [],
        confidenceIntervals: {},
        riskMetrics: {}
    };
    
    for (let i = 0; i < numSimulations; i++) {
        // Generate stochastic scenarios
        const scenarioAssumptions = generateStochasticScenario(assumptions);
        
        // Calculate metrics for this scenario
        const npv = calculateNetPresentValue(policies, scenarioAssumptions);
        const irr = calculateInternalRateOfReturn(policies, scenarioAssumptions);
        const profitMargin = calculateProfitMargin(policies, scenarioAssumptions);
        const breakEvenPremium = calculateBreakEvenPremium(policies, scenarioAssumptions);
        
        results.netPresentValues.push(npv);
        results.internalRatesOfReturn.push(irr);
        results.profitMargins.push(profitMargin);
        results.breakEvenPremiums.push(breakEvenPremium);
    }
    
    // Calculate confidence intervals
    results.confidenceIntervals = {
        npv: calculateConfidenceInterval(results.netPresentValues),
        irr: calculateConfidenceInterval(results.internalRatesOfReturn),
        profitMargin: calculateConfidenceInterval(results.profitMargins),
        breakEvenPremium: calculateConfidenceInterval(results.breakEvenPremiums)
    };
    
    // Calculate risk metrics
    results.riskMetrics = {
        valueAtRisk95: calculateValueAtRisk(results.netPresentValues, 0.95),
        valueAtRisk99: calculateValueAtRisk(results.netPresentValues, 0.99),
        expectedShortfall: calculateExpectedShortfall(results.netPresentValues, 0.95),
        volatility: calculateVolatility(results.netPresentValues)
    };
    
    return results;
}

function generateStochasticScenario(baseAssumptions) {
    const scenario = { ...baseAssumptions };
    
    // Stochastic mortality (log-normal distribution)
    const mortalityVolatility = 0.1;
    const mortalityShock = Math.exp(normalRandom() * mortalityVolatility);
    scenario.mortalityMultiplier = mortalityShock;
    
    // Stochastic lapse rates (beta distribution)
    const lapseVolatility = 0.2;
    const lapseShock = Math.max(0, baseAssumptions.lapseRate * (1 + normalRandom() * lapseVolatility));
    scenario.lapseRate = lapseShock;
    
    // Stochastic interest rates (mean-reverting process)
    const interestVolatility = 0.01;
    const interestShock = Math.max(0.01, baseAssumptions.discountRate + normalRandom() * interestVolatility);
    scenario.discountRate = interestShock;
    
    // Stochastic expenses (gamma distribution)
    const expenseVolatility = 0.15;
    const expenseShock = Math.max(0, baseAssumptions.expenseRatio * (1 + normalRandom() * expenseVolatility));
    scenario.expenseRatio = expenseShock;
    
    return scenario;
}

function normalRandom() {
    // Box-Muller transformation for normal random numbers
    let u1 = Math.random();
    let u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function calculateConfidenceInterval(values, confidence = 0.95) {
    const sorted = [...values].sort((a, b) => a - b);
    const alpha = 1 - confidence;
    const lowerIndex = Math.floor(alpha / 2 * sorted.length);
    const upperIndex = Math.ceil((1 - alpha / 2) * sorted.length);
    
    return {
        lower: sorted[lowerIndex],
        upper: sorted[upperIndex],
        mean: values.reduce((sum, val) => sum + val, 0) / values.length
    };
}

function calculateValueAtRisk(values, confidence) {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * sorted.length);
    return sorted[index];
}

function calculateExpectedShortfall(values, confidence) {
    const sorted = [...values].sort((a, b) => a - b);
    const varIndex = Math.floor((1 - confidence) * sorted.length);
    const tailValues = sorted.slice(0, varIndex);
    return tailValues.reduce((sum, val) => sum + val, 0) / tailValues.length;
}

function calculateVolatility(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
}

/**
 * Embedded Value (MCEV) Calculation
 * Calculates Market Consistent Embedded Value for life insurance portfolios
 */
export function calculateEmbeddedValue(policies, assumptions) {
    const results = {
        presentValueOfFutureProfits: 0,
        requiredCapital: 0,
        costOfCapital: 0,
        embeddedValue: 0,
        valueOfNewBusiness: 0,
        assumptions: assumptions
    };
    
    // Calculate PVFP (Present Value of Future Profits)
    results.presentValueOfFutureProfits = calculatePresentValueOfFutureProfits(policies, assumptions);
    
    // Calculate Required Capital (Solvency II SCR)
    results.requiredCapital = calculateRequiredCapital(policies, assumptions);
    
    // Calculate Cost of Capital
    results.costOfCapital = calculateCostOfCapital(results.requiredCapital, assumptions);
    
    // Calculate Embedded Value
    results.embeddedValue = results.presentValueOfFutureProfits - results.costOfCapital;
    
    // Calculate Value of New Business (VNB)
    results.valueOfNewBusiness = calculateValueOfNewBusiness(policies, assumptions);
    
    return results;
}

function calculatePresentValueOfFutureProfits(policies, assumptions) {
    let totalPVFP = 0;
    
    policies.forEach(policy => {
        const profitTesting = calculateProfitTestingMetrics(policy, assumptions);
        totalPVFP += profitTesting.npv;
    });
    
    return totalPVFP;
}

function calculateRequiredCapital(policies, assumptions) {
    // Simplified SCR calculation for embedded value
    const totalSumAssured = policies.reduce((sum, policy) => sum + policy.sumAssured, 0);
    const scrFactor = assumptions.scrFactor || 0.25;
    return totalSumAssured * scrFactor;
}

function calculateCostOfCapital(requiredCapital, assumptions) {
    const costOfCapitalRate = assumptions.costOfCapitalRate || 0.06;
    return requiredCapital * costOfCapitalRate;
}

function calculateValueOfNewBusiness(policies, assumptions) {
    // VNB = PVFP of new business - Cost of Capital
    const newBusinessPVFP = calculatePresentValueOfFutureProfits(policies, assumptions);
    const newBusinessCapital = calculateRequiredCapital(policies, assumptions);
    const costOfCapital = calculateCostOfCapital(newBusinessCapital, assumptions);
    
    return newBusinessPVFP - costOfCapital;
}
