type DictionaryTable = Record<string, Record<string, string>>;

function normalizeLocale(locale: string | undefined): string {
  return (locale || '').toLowerCase();
}

function extractBaseLocale(locale: string): string {
  return locale.split('-')[0];
}

function isDictionaryTable(strings: Record<string, unknown>): strings is DictionaryTable {
  let values = Object.values(strings);
  return values.length > 0 && values.every(value => value !== null && typeof value === 'object');
}

export type LocalizedString = string;
export type LocalizedStrings<K extends string = string, T extends LocalizedString = string> = Record<string, Record<K, T>>;

export class LocalizedStringDictionary<K extends string = string, T extends LocalizedString = string> {
  private static globalDictionaries = new Map<string, LocalizedStringDictionary<any, any>>();
  private dictionaries = new Map<string, Record<string, string>>();
  private defaultLocale: string;

  constructor(strings: LocalizedStrings<K, T> | Record<string, T>, defaultLocale = 'en-US') {
    this.defaultLocale = normalizeLocale(defaultLocale);

    let source = strings as Record<string, unknown>;
    if (isDictionaryTable(source)) {
      for (let [locale, dictionary] of Object.entries(source)) {
        this.dictionaries.set(normalizeLocale(locale), dictionary as Record<string, string>);
      }
    } else {
      this.dictionaries.set(this.defaultLocale, source as Record<string, string>);
    }
  }

  static getGlobalDictionaryForPackage(packageName: string) {
    return this.globalDictionaries.get(packageName) ?? null;
  }

  static setGlobalDictionaryForPackage(packageName: string, dictionary: LocalizedStringDictionary<any, any> | null) {
    if (dictionary) {
      this.globalDictionaries.set(packageName, dictionary);
    } else {
      this.globalDictionaries.delete(packageName);
    }
  }

  getStringForLocale(key: K | string, locale: string): string {
    let dictionary = this.getDictionaryForLocale(locale);
    let value = dictionary?.[key as string];
    return typeof value === 'string' ? value : String(key);
  }

  private getDictionaryForLocale(locale: string): Record<string, string> {
    let normalized = normalizeLocale(locale);
    let baseLocale = extractBaseLocale(normalized);

    return this.dictionaries.get(normalized)
      || this.dictionaries.get(baseLocale)
      || this.dictionaries.get(this.defaultLocale)
      || this.dictionaries.get('en-us')
      || this.dictionaries.values().next().value
      || {};
  }
}

export class LocalizedStringFormatter<K extends string = string, T extends LocalizedString = string> {
  constructor(private locale: string, private dictionary: LocalizedStringDictionary<K, T>) {}

  format(key: K | string, variables: Record<string, unknown> = {}): string {
    let template = this.dictionary.getStringForLocale(key, this.locale);
    return template.replace(/\{([A-Za-z0-9_]+)\}/g, (_, variableName) => {
      let value = variables[variableName];
      return value == null ? '' : String(value);
    });
  }
}
