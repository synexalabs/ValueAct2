import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPercentage, formatNumber } from '../formatters';

describe('German Locale Formatters', () => {
  it('formats EUR with German locale', () => {
    const result = formatCurrency(1234567.89);
    // Should contain period as thousands separator and comma as decimal
    expect(result).toContain('€');
    expect(result).toContain('1.234.567');
  });

  it('returns dash for null', () => {
    expect(formatCurrency(null)).toBe('—');
    expect(formatPercentage(undefined)).toBe('—');
    expect(formatNumber(NaN)).toBe('—');
  });

  it('formats percentage correctly', () => {
    const result = formatPercentage(0.0535);
    expect(result).toContain('5');
    expect(result).toContain('%');
  });
});
