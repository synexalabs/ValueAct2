/**
 * bAV Calculation Utilities — vereinfachte Client-side Berechnungen für Free-Tier.
 * Volle Bewertung nach IAS 19 PUC läuft auf dem Python-Engine (Pro).
 */

/**
 * Vereinfachte DBO-Schätzung für den kostenlosen Rechner.
 */
export function estimateDBO({
  birthDate, entryDate, annualPension, retirementAge = 67,
  discountRate = 0.035, pensionTrend = 0.015, fluctuationRate = 0.03,
  survivorsFraction = 0.60, hasSurvivors = true,
} = {}) {
  const today = new Date();
  const birth = new Date(birthDate);
  const entry = new Date(entryDate);

  const age = (today - birth) / (365.25 * 86400000);
  const yearsToRetirement = Math.max(0, retirementAge - age);
  const pastService = (today - entry) / (365.25 * 86400000);
  const retirementDate = new Date(birth.getFullYear() + retirementAge, birth.getMonth(), birth.getDate());
  const totalService = (retirementDate - entry) / (365.25 * 86400000);
  const attributionRatio = Math.min(1, Math.max(0, pastService / totalService));

  // Rentenbarwertfaktor (Näherung mit Gompertz-Sterblichkeit)
  let annuityFactor = 0;
  let survival = 1;
  for (let t = 1; t <= 40; t++) {
    const ageT = retirementAge + t;
    const qx = Math.min(1, 0.0005 * Math.exp(0.085 * (ageT - 30)));
    survival *= (1 - qx);
    if (survival < 0.001) break;
    annuityFactor += survival * Math.pow(1 + pensionTrend, t) / Math.pow(1 + discountRate, t);
  }

  // Hinterbliebene
  const survivorsFactor = hasSurvivors ? 1 + 0.80 * survivorsFraction * 0.85 : 1;

  // Fluktuation
  const fluctDiscount = Math.pow(1 - fluctuationRate, yearsToRetirement);

  // DBO
  const discountFactor = 1 / Math.pow(1 + discountRate, yearsToRetirement);
  const dbo = annualPension * annuityFactor * survivorsFactor * attributionRatio * discountFactor * fluctDiscount;

  const serviceCost = pastService > 0 ? dbo / pastService : 0;
  const interestCost = dbo * discountRate;

  return {
    dbo: Math.round(dbo * 100) / 100,
    currentServiceCost: Math.round(serviceCost * 100) / 100,
    interestCost: Math.round(interestCost * 100) / 100,
    projectedPension: annualPension,
    annuityFactor: Math.round(annuityFactor * 10000) / 10000,
    attributionRatio: Math.round(attributionRatio * 10000) / 10000,
    survivorsFactor: Math.round(survivorsFactor * 10000) / 10000,
    discountRate,
    age: Math.round(age * 10) / 10,
    yearsToRetirement: Math.round(yearsToRetirement * 10) / 10,
    pastService: Math.round(pastService * 10) / 10,
    totalService: Math.round(totalService * 10) / 10,
    fluctuationDiscount: Math.round(fluctDiscount * 10000) / 10000,
    psvagContribution: Math.round(dbo * fluctDiscount * 0.003 * 100) / 100,
    source: 'client',
  };
}

/** HGB-spezifische Zinssätze (§ 253 Abs. 2 HGB) */
export const HGB_RATES = {
  '2024-12-31': { '7year': 0.0183, '10year': 0.0149 },
  '2024-06-30': { '7year': 0.0170, '10year': 0.0137 },
  '2023-12-31': { '7year': 0.0157, '10year': 0.0125 },
};

export function getHGBRate(date = '2024-12-31', period = 7) {
  const key = period === 10 ? '10year' : '7year';
  const dates = Object.keys(HGB_RATES).sort().reverse();
  for (const d of dates) {
    if (d <= date) return HGB_RATES[d][key];
  }
  return HGB_RATES[dates[dates.length - 1]][key];
}
