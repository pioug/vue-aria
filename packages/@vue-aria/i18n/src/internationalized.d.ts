declare module "@internationalized/string" {
  export type LocalizedString = string | ((...args: any[]) => string);
  export type LocalizedStrings<K extends string = string, T extends LocalizedString = string> = Record<string, Record<K, T>>;

  export class LocalizedStringDictionary<K extends string = string, T extends LocalizedString = string> {
    constructor(strings: LocalizedStrings<K, T>);
    static getGlobalDictionaryForPackage(packageName: string): LocalizedStringDictionary<any, any> | undefined;
  }

  export class LocalizedStringFormatter<K extends string = string, T extends LocalizedString = string> {
    constructor(locale: string, dictionary: LocalizedStringDictionary<K, T>);
    format(key: K, variables?: Record<string, unknown>): string;
  }
}

declare module "@internationalized/message" {
  export type LocalizedStrings = Record<string, Record<string, string>>;

  export class MessageDictionary {
    constructor(strings: LocalizedStrings);
  }

  export class MessageFormatter {
    constructor(locale: string, dictionary: MessageDictionary);
    format(key: string, variables?: Record<string, unknown>): string;
  }
}

declare module "@internationalized/date" {
  export interface DateFormatterOptions extends Intl.DateTimeFormatOptions {
    calendar?: string;
  }

  export class DateFormatter {
    constructor(locale: string, options?: DateFormatterOptions);
    format(value: Date): string;
  }
}

declare module "@internationalized/number" {
  export interface NumberFormatOptions extends Intl.NumberFormatOptions {}

  export class NumberFormatter extends Intl.NumberFormat {
    constructor(locale: string, options?: NumberFormatOptions);
  }
}
