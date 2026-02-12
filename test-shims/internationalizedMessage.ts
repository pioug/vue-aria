type MessageTable = Record<string, Record<string, string>>;

function normalizeLocale(locale: string | undefined): string {
  return (locale || '').toLowerCase();
}

function extractBaseLocale(locale: string): string {
  return locale.split('-')[0];
}

function isMessageTable(strings: Record<string, unknown>): strings is MessageTable {
  let values = Object.values(strings);
  return values.length > 0 && values.every(value => value !== null && typeof value === 'object');
}

export type LocalizedStrings = Record<string, Record<string, string>>;

export class MessageDictionary {
  private dictionaries = new Map<string, Record<string, string>>();
  private defaultLocale = 'en-us';

  constructor(strings: LocalizedStrings | Record<string, string>) {
    let source = strings as Record<string, unknown>;
    if (isMessageTable(source)) {
      for (let [locale, dictionary] of Object.entries(source)) {
        this.dictionaries.set(normalizeLocale(locale), dictionary as Record<string, string>);
      }
    } else {
      this.dictionaries.set(this.defaultLocale, source as Record<string, string>);
    }
  }

  getStringForLocale(key: string, locale: string): string {
    let normalized = normalizeLocale(locale);
    let baseLocale = extractBaseLocale(normalized);
    let dictionary = this.dictionaries.get(normalized)
      || this.dictionaries.get(baseLocale)
      || this.dictionaries.get(this.defaultLocale)
      || this.dictionaries.values().next().value
      || {};
    return dictionary[key] ?? key;
  }
}

export class MessageFormatter {
  constructor(private locale: string, private dictionary: MessageDictionary) {}

  format(key: string, variables: Record<string, unknown> = {}) {
    let template = this.dictionary.getStringForLocale(key, this.locale);
    return template.replace(/\{([A-Za-z0-9_]+)\}/g, (_, variableName) => {
      let value = variables[variableName];
      return value == null ? '' : String(value);
    });
  }
}
