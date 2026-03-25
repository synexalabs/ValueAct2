/**
 * IFRS 17 Calculation Utilities — simplified free-tier client-side logic.
 * All pro/portfolio calculations run on the Python engine (server-side).
 * Sign convention: FCF = PV(Benefits) + PV(Expenses) - PV(Premiums)
 * Positive FCF = net cash outflow (IFRS 17 para. 38)
 */

export const calculateCSM = (pvPremiums, pvBenefits, pvExpenses, ra) => {
  const fcf = pvBenefits + pvExpenses - pvPremiums;
  return Math.max(0, -(fcf + ra));
};

export const calculateLossComponent = (pvPremiums, pvBenefits, pvExpenses, ra) => {
  const fcf = pvBenefits + pvExpenses - pvPremiums;
  return Math.max(0, fcf + ra);
};

export const calculatePresentValue = (cashFlows, discountRate, periods) => {
  if (cashFlows.length !== periods.length) {
    throw new Error('Cash flows and periods arrays must have the same length');
  }
  return cashFlows.reduce((pv, cf, index) => {
    return pv + cf / Math.pow(1 + discountRate, periods[index]);
  }, 0);
};

export const calculateCSMRelease = (csmOpening, serviceProvided, totalService) => {
  if (totalService === 0) return 0;
  return csmOpening * (serviceProvided / totalService);
};

export const generateCSMRunoff = (initialCSM, servicePattern) => {
  const totalService = servicePattern.reduce((sum, s) => sum + s, 0);
  let remainingCSM = initialCSM;

  return servicePattern.map((service, index) => {
    const release = calculateCSMRelease(initialCSM, service, totalService);
    remainingCSM -= release;
    return {
      period: index + 1,
      serviceProvided: service,
      csmRelease: release,
      csmRemaining: remainingCSM
    };
  });
};
