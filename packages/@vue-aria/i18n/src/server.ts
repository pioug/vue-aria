import type { LocalizedString } from "@internationalized/string";

type PackageLocalizedStrings = {
  [packageName: string]: Record<string, LocalizedString>;
};

const cache = new WeakMap<PackageLocalizedStrings, string>();

function serialize(strings: PackageLocalizedStrings): string {
  const cached = cache.get(strings);
  if (cached) {
    return cached;
  }

  const seen = new Set<string>();
  const common = new Map<string, string>();

  for (const pkg in strings) {
    for (const key in strings[pkg]) {
      const v = strings[pkg][key];
      let s = typeof v === "string" ? JSON.stringify(v) : v.toString();
      if (seen.has(s) && !common.has(s)) {
        const name = String.fromCharCode(common.size > 25 ? common.size + 97 : common.size + 65);
        common.set(s, name);
      }
      seen.add(s);
    }
  }

  let res = "";
  if (common.size > 0) {
    res += "let ";
  }
  for (const [string, name] of common) {
    res += `${name}=${string},`;
  }
  if (common.size > 0) {
    res = `${res.slice(0, -1)};`;
  }

  res += "window[Symbol.for('react-aria.i18n.strings')]={";
  for (const pkg in strings) {
    res += `'${pkg}':{`;
    for (const key in strings[pkg]) {
      const v = strings[pkg][key];
      let s = typeof v === "string" ? JSON.stringify(v) : v.toString();
      if (common.has(s)) {
        s = common.get(s)!;
      }
      res += `${/[ ()]/.test(key) ? JSON.stringify(key) : key}:${s},`;
    }
    res = `${res.slice(0, -1)}},`;
  }
  res = `${res.slice(0, -1)}};`;

  cache.set(strings, res);
  return res;
}

export function getPackageLocalizationScript(locale: string, strings: PackageLocalizedStrings): string {
  return `window[Symbol.for('react-aria.i18n.locale')]=${JSON.stringify(locale)};{${serialize(strings)}}`;
}
