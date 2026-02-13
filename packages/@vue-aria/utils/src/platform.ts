function testUserAgent(re: RegExp): boolean {
  if (typeof window === "undefined" || window.navigator == null) {
    return false;
  }

  const brands = (window.navigator as any).userAgentData?.brands;
  return (
    (Array.isArray(brands) && brands.some((brand: { brand: string }) => re.test(brand.brand)))
    || re.test(window.navigator.userAgent)
  );
}

function testPlatform(re: RegExp): boolean {
  return typeof window !== "undefined" && window.navigator != null
    ? re.test((window.navigator as any).userAgentData?.platform || window.navigator.platform)
    : false;
}

function cached(fn: () => boolean) {
  if (process.env.NODE_ENV === "test") {
    return fn;
  }

  let res: boolean | null = null;
  return () => {
    if (res == null) {
      res = fn();
    }

    return res;
  };
}

export const isMac: () => boolean = cached(() => testPlatform(/^Mac/i));
export const isIPhone: () => boolean = cached(() => testPlatform(/^iPhone/i));
export const isIPad: () => boolean = cached(() => testPlatform(/^iPad/i) || (isMac() && navigator.maxTouchPoints > 1));
export const isIOS: () => boolean = cached(() => isIPhone() || isIPad());
export const isAppleDevice: () => boolean = cached(() => isMac() || isIOS());
export const isWebKit: () => boolean = cached(() => testUserAgent(/AppleWebKit/i) && !isChrome());
export const isChrome: () => boolean = cached(() => testUserAgent(/Chrome/i));
export const isAndroid: () => boolean = cached(() => testUserAgent(/Android/i));
export const isFirefox: () => boolean = cached(() => testUserAgent(/Firefox/i));
