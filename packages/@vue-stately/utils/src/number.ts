export function clamp(value: number, min: number = -Infinity, max: number = Infinity): number {
  return Math.min(Math.max(value, min), max);
}

export function roundToStepPrecision(value: number, step: number): number {
  let roundedValue = value;
  let precision = 0;
  const stepString = step.toString();
  const eIndex = stepString.toLowerCase().indexOf("e-");

  if (eIndex > 0) {
    precision = Math.abs(Math.floor(Math.log10(Math.abs(step)))) + eIndex;
  } else {
    const pointIndex = stepString.indexOf(".");
    if (pointIndex >= 0) {
      precision = stepString.length - pointIndex;
    }
  }

  if (precision > 0) {
    const pow = Math.pow(10, precision);
    roundedValue = Math.round(roundedValue * pow) / pow;
  }

  return roundedValue;
}

export function snapValueToStep(value: number, min: number | undefined, max: number | undefined, step: number): number {
  min = Number(min);
  max = Number(max);

  const remainder = ((value - (isNaN(min) ? 0 : min)) % step);
  let snappedValue = roundToStepPrecision(
    Math.abs(remainder) * 2 >= step
      ? value + Math.sign(remainder) * (step - Math.abs(remainder))
      : value - remainder,
    step
  );

  if (!isNaN(min)) {
    if (snappedValue < min) {
      snappedValue = min;
    } else if (!isNaN(max) && snappedValue > max) {
      snappedValue = min + Math.floor(roundToStepPrecision((max - min) / step, step)) * step;
    }
  } else if (!isNaN(max) && snappedValue > max) {
    snappedValue = Math.floor(roundToStepPrecision(max / step, step)) * step;
  }

  snappedValue = roundToStepPrecision(snappedValue, step);

  return snappedValue;
}

export function toFixedNumber(value: number, digits: number, base: number = 10): number {
  const pow = Math.pow(base, digits);
  return Math.round(value * pow) / pow;
}
