export type NumberFormatOptions = Intl.NumberFormatOptions;

function normalizeNumberInput(value: string) {
  return value
    .trim()
    .replace(/,/g, '')
    .replace(/[^\d.+-]/g, '');
}

export class NumberFormatter {
  private formatter: Intl.NumberFormat;

  constructor(locale: string, options: Intl.NumberFormatOptions = {}) {
    this.formatter = new Intl.NumberFormat(locale, options);
  }

  format(value: number) {
    return this.formatter.format(value);
  }

  formatToParts(value: number | Date) {
    return this.formatter.formatToParts(value as number);
  }

  resolvedOptions() {
    return this.formatter.resolvedOptions();
  }
}

export class NumberParser {
  private formatter: Intl.NumberFormat;

  constructor(locale: string, options: Intl.NumberFormatOptions = {}) {
    this.formatter = new Intl.NumberFormat(locale, options);
  }

  parse(value: string) {
    let normalized = normalizeNumberInput(value);
    if (!normalized || normalized === '-' || normalized === '+' || normalized === '.' || normalized === '-.' || normalized === '+.') {
      return NaN;
    }

    let parsed = Number.parseFloat(normalized);
    return Number.isNaN(parsed) ? NaN : parsed;
  }

  isValidPartialNumber(value: string, minValue = -Infinity, maxValue = Infinity) {
    if (value === '' || value === '-' || value === '+' || value === '.' || value === '-.' || value === '+.') {
      return true;
    }

    let parsed = this.parse(value);
    if (Number.isNaN(parsed)) {
      return false;
    }

    return parsed >= minValue && parsed <= maxValue;
  }

  getNumberingSystem(_value: string) {
    return this.formatter.resolvedOptions().numberingSystem || 'latn';
  }
}
