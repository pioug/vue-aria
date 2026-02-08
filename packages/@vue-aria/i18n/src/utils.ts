// https://en.wikipedia.org/wiki/Right-to-left
const RTL_SCRIPTS = new Set([
  "Arab",
  "Syrc",
  "Samr",
  "Mand",
  "Thaa",
  "Mend",
  "Nkoo",
  "Adlm",
  "Rohg",
  "Hebr",
]);

const RTL_LANGS = new Set([
  "ae",
  "ar",
  "arc",
  "bcc",
  "bqi",
  "ckb",
  "dv",
  "fa",
  "glk",
  "he",
  "ku",
  "mzn",
  "nqo",
  "pnb",
  "ps",
  "sd",
  "ug",
  "ur",
  "yi",
]);

export function isRTL(localeString: string): boolean {
  if (typeof Intl.Locale === "function") {
    const locale = new Intl.Locale(localeString).maximize();

    // `getTextInfo` is standardized, but some engines still expose `textInfo`.
    const textInfo =
      typeof (locale as Intl.Locale & { getTextInfo?: () => { direction: string } })
        .getTextInfo === "function"
        ? (locale as Intl.Locale & { getTextInfo: () => { direction: string } }).getTextInfo()
        : (locale as Intl.Locale & { textInfo?: { direction: string } }).textInfo;

    if (textInfo) {
      return textInfo.direction === "rtl";
    }

    if (locale.script) {
      return RTL_SCRIPTS.has(locale.script);
    }
  }

  const lang = localeString.split("-")[0];
  return RTL_LANGS.has(lang);
}
