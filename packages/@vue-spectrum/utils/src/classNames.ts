export let shouldKeepSpectrumClassNames = false;

export function keepSpectrumClassNames(): void {
  shouldKeepSpectrumClassNames = true;
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "Legacy spectrum-prefixed class names enabled for backward compatibility. " +
      "Replace spectrum selector overrides with custom class names and disable this flag when possible."
    );
  }
}

export function classNames(
  cssModule: Record<string, string>,
  ...values: Array<string | Record<string, boolean> | undefined>
): string {
  const classes: string[] = [];

  for (const value of values) {
    if (!value) {
      continue;
    }

    if (typeof value === "string") {
      const mapped = cssModule[value];
      if (mapped) {
        classes.push(mapped);
      }

      if (shouldKeepSpectrumClassNames || !mapped) {
        classes.push(value);
      }
      continue;
    }

    for (const key of Object.keys(value)) {
      if (!value[key]) {
        continue;
      }

      const mapped = cssModule[key];
      if (mapped) {
        classes.push(mapped);
      }

      if (shouldKeepSpectrumClassNames || !mapped) {
        classes.push(key);
      }
    }
  }

  return classes.join(" ");
}

export function UNSAFE_resetSpectrumClassNames(): void {
  shouldKeepSpectrumClassNames = false;
}
