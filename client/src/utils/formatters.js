/**
 * Formatter Utilities — German locale defaults (de-DE, EUR)
 * Example: 1234567.89 → "1.234.567,89 €"
 */

const DEFAULT_LOCALE = 'de-DE';

export const formatCurrency = (value, locale = DEFAULT_LOCALE, currency = 'EUR') => {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const formatPercentage = (value, locale = DEFAULT_LOCALE, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

export const formatNumber = (value, locale = DEFAULT_LOCALE, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

export const formatLargeNumber = (number, decimals = 1, locale = DEFAULT_LOCALE) => {
  if (number === null || number === undefined || isNaN(number)) return '—';
  const abs = Math.abs(number);
  const sign = number < 0 ? '-' : '';
  const fmt = (n) => new Intl.NumberFormat(locale, { maximumFractionDigits: decimals }).format(n);
  if (abs >= 1e9) return sign + fmt(abs / 1e9) + ' Mrd.';
  if (abs >= 1e6) return sign + fmt(abs / 1e6) + ' Mio.';
  if (abs >= 1e3) return sign + fmt(abs / 1e3) + ' Tsd.';
  return sign + fmt(abs);
};

export const formatDate = (date, format = 'short', locale = DEFAULT_LOCALE) => {
  if (!date) return '—';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '—';
  const options = format === 'long'
    ? { year: 'numeric', month: 'long', day: 'numeric' }
    : format === 'iso'
    ? undefined
    : { year: 'numeric', month: '2-digit', day: '2-digit' };
  if (format === 'iso') return d.toISOString().split('T')[0];
  return new Intl.DateTimeFormat(locale, options).format(d);
};

export const formatActuarialNotation = (symbol, subscript, superscript) => {
  let result = symbol;
  if (superscript) result = `${superscript}${result}`;
  if (subscript) result = `${result}${subscript}`;
  return result;
};
