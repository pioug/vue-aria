export function createFormatterProxy<T extends object>(getFormatter: () => T): T {
  return new Proxy({} as T, {
    get(_target, prop, _receiver) {
      const formatter = getFormatter();
      const value = (formatter as any)[prop as any];
      return typeof value === "function" ? value.bind(formatter) : value;
    },
  });
}
