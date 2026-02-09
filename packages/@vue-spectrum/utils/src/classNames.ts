import clsx, { type ClassValue } from "clsx";

type CSSModuleClassMap = Record<string, string>;
type MappedClassValue = string | Record<string, unknown> | undefined | null | false;

export let shouldKeepSpectrumClassNames = false;

export function keepSpectrumClassNames(): void {
  shouldKeepSpectrumClassNames = true;

  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "Legacy spectrum-prefixed class names enabled for backward compatibility. " +
        "Prefer custom class names and remove direct spectrum selector overrides over time."
    );
  }
}

export function __resetSpectrumClassNamesForTest(): void {
  shouldKeepSpectrumClassNames = false;
}

function isCSSModuleClassMap(value: unknown): value is CSSModuleClassMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value as Record<string, unknown>).every(
    (item) => typeof item === "string"
  );
}

function mapClassNames(
  cssModule: CSSModuleClassMap,
  values: MappedClassValue[]
): string {
  const classes: ClassValue[] = [];

  for (const value of values) {
    if (typeof value === "string") {
      const mappedClass = cssModule[value];
      if (mappedClass) {
        classes.push(mappedClass);
      }

      if (shouldKeepSpectrumClassNames || !mappedClass) {
        classes.push(value);
      }
      continue;
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      const mapped: Record<string, unknown> = {};

      for (const [className, enabled] of Object.entries(value)) {
        const mappedClass = cssModule[className];
        if (mappedClass) {
          mapped[mappedClass] = enabled;
        }

        if (shouldKeepSpectrumClassNames || !mappedClass) {
          mapped[className] = enabled;
        }
      }

      classes.push(mapped);
      continue;
    }

    classes.push(value);
  }

  return clsx(...classes);
}

export function classNames(...values: ClassValue[]): string;
export function classNames(
  cssModule: CSSModuleClassMap,
  ...values: MappedClassValue[]
): string;
export function classNames(...values: unknown[]): string {
  if (values.length > 0 && isCSSModuleClassMap(values[0])) {
    const [cssModule, ...classValues] = values as [
      CSSModuleClassMap,
      ...MappedClassValue[]
    ];

    return mapClassNames(cssModule, classValues);
  }

  return clsx(...(values as ClassValue[]));
}
