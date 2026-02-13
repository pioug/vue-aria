import { useCollator } from "./useCollator";

export interface Filter {
  startsWith: (string: string, substring: string) => boolean;
  endsWith: (string: string, substring: string) => boolean;
  contains: (string: string, substring: string) => boolean;
}

export function useFilter(options?: Intl.CollatorOptions): Filter {
  const collator = useCollator({
    usage: "search",
    ...options,
  });

  const startsWith = (string: string, substring: string) => {
    if (substring.length === 0) {
      return true;
    }

    string = string.normalize("NFC");
    substring = substring.normalize("NFC");
    return collator.compare(string.slice(0, substring.length), substring) === 0;
  };

  const endsWith = (string: string, substring: string) => {
    if (substring.length === 0) {
      return true;
    }

    string = string.normalize("NFC");
    substring = substring.normalize("NFC");
    return collator.compare(string.slice(-substring.length), substring) === 0;
  };

  const contains = (string: string, substring: string) => {
    if (substring.length === 0) {
      return true;
    }

    string = string.normalize("NFC");
    substring = substring.normalize("NFC");

    const sliceLen = substring.length;
    for (let scan = 0; scan + sliceLen <= string.length; scan += 1) {
      const slice = string.slice(scan, scan + sliceLen);
      if (collator.compare(substring, slice) === 0) {
        return true;
      }
    }

    return false;
  };

  return { startsWith, endsWith, contains };
}
