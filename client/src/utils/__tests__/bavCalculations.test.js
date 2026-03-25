import { describe, it, expect } from 'vitest';
import { estimateDBO, getHGBRate } from '../bavCalculations';

describe('bAV Client Calculations', () => {
  const base = {
    birthDate: '1975-06-15',
    entryDate: '2000-01-01',
    annualPension: 12000,
    retirementAge: 67,
    discountRate: 0.035,
  };

  it('DBO is positive', () => {
    const r = estimateDBO(base);
    expect(r.dbo).toBeGreaterThan(0);
  });

  it('DBO is reasonable magnitude', () => {
    const r = estimateDBO(base);
    expect(r.dbo).toBeGreaterThan(10000);
    expect(r.dbo).toBeLessThan(500000);
  });

  it('higher discount rate lowers DBO', () => {
    const low = estimateDBO({ ...base, discountRate: 0.02 });
    const high = estimateDBO({ ...base, discountRate: 0.06 });
    expect(high.dbo).toBeLessThan(low.dbo);
  });

  it('service cost is positive', () => {
    const r = estimateDBO(base);
    expect(r.currentServiceCost).toBeGreaterThan(0);
  });

  it('attribution ratio between 0 and 1', () => {
    const r = estimateDBO(base);
    expect(r.attributionRatio).toBeGreaterThan(0);
    expect(r.attributionRatio).toBeLessThanOrEqual(1);
  });

  it('HGB rate is positive', () => {
    expect(getHGBRate('2024-12-31', 7)).toBeGreaterThan(0);
  });

  it('HGB 10-year rate lower than 7-year', () => {
    expect(getHGBRate('2024-12-31', 10)).toBeLessThan(getHGBRate('2024-12-31', 7));
  });
});
