export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function snapValueToStep(value: number, min: number, max: number, step: number): number {
  const remainder = (value - (Number.isFinite(min) ? min : 0)) % step;
  let snappedValue = value - remainder;

  if (Math.abs(remainder) * 2 >= step) {
    snappedValue += remainder > 0 ? step : -step;
  }

  return clamp(snappedValue, min, max);
}
