export type DimensionValue = string | number;

export function dimensionValue(value: DimensionValue): string {
  if (typeof value === "number") {
    return `${value}px`;
  }

  return value;
}

export function readStyleObject(
  value: unknown
): Record<string, string | number> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, string | number>;
  }

  return {};
}
