import { describe, it, expect } from 'vitest';
import {
  calculateCSM, calculateLossComponent, calculatePresentValue,
  calculateCSMRelease, generateCSMRunoff,
} from '../ifrs17Calculations';

describe('IFRS 17 Client Calculations', () => {
  describe('calculateCSM', () => {
    it('returns positive CSM for profitable contract', () => {
      // PV premiums > PV benefits + PV expenses → profitable
      const csm = calculateCSM(50000, 30000, 5000, 3000);
      expect(csm).toBeGreaterThan(0);
    });

    it('returns zero CSM for onerous contract', () => {
      // PV premiums < PV benefits + PV expenses → onerous
      const csm = calculateCSM(10000, 80000, 5000, 3000);
      expect(csm).toBe(0);
    });

    it('CSM is never negative', () => {
      const csm = calculateCSM(0, 100000, 50000, 10000);
      expect(csm).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateLossComponent', () => {
    it('returns positive loss for onerous contract', () => {
      const lc = calculateLossComponent(10000, 80000, 5000, 3000);
      expect(lc).toBeGreaterThan(0);
    });

    it('returns zero loss for profitable contract', () => {
      const lc = calculateLossComponent(50000, 30000, 5000, 3000);
      expect(lc).toBe(0);
    });

    it('CSM and LC are mutually exclusive', () => {
      const pvPrem = 40000; const pvBen = 30000; const pvExp = 5000; const ra = 3000;
      const csm = calculateCSM(pvPrem, pvBen, pvExp, ra);
      const lc = calculateLossComponent(pvPrem, pvBen, pvExp, ra);
      expect(csm === 0 || lc === 0).toBe(true);
    });
  });

  describe('calculatePresentValue', () => {
    it('discounts cash flows correctly', () => {
      const pv = calculatePresentValue([1000, 1000, 1000], 0.05, [1, 2, 3]);
      // PV = 1000/1.05 + 1000/1.05^2 + 1000/1.05^3 ≈ 2723.25
      expect(pv).toBeCloseTo(2723.25, 0);
    });

    it('zero rate means no discounting', () => {
      const pv = calculatePresentValue([1000, 1000], 0.0, [1, 2]);
      expect(pv).toBeCloseTo(2000, 2);
    });

    it('throws on mismatched arrays', () => {
      expect(() => calculatePresentValue([1000], 0.05, [1, 2])).toThrow();
    });
  });

  describe('generateCSMRunoff', () => {
    it('releases full CSM over pattern', () => {
      const pattern = [0.2, 0.2, 0.2, 0.2, 0.2];
      const runoff = generateCSMRunoff(10000, pattern);
      expect(runoff).toHaveLength(5);
      const totalRelease = runoff.reduce((s, r) => s + r.csmRelease, 0);
      expect(totalRelease).toBeCloseTo(10000, 0);
    });

    it('each period has positive release', () => {
      const runoff = generateCSMRunoff(10000, [0.5, 0.3, 0.2]);
      runoff.forEach((r) => expect(r.csmRelease).toBeGreaterThan(0));
    });

    it('remaining CSM decreases each period', () => {
      const runoff = generateCSMRunoff(10000, [0.25, 0.25, 0.25, 0.25]);
      for (let i = 1; i < runoff.length; i++) {
        expect(runoff[i].csmRemaining).toBeLessThan(runoff[i - 1].csmRemaining);
      }
    });
  });
});
