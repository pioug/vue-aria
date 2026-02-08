interface SliderData {
  id: string;
  "aria-describedby"?: string;
  "aria-details"?: string;
}

export const sliderData = new WeakMap<object, SliderData>();

export function getSliderThumbId(state: object, index: number): string {
  const data = sliderData.get(state);
  if (!data) {
    throw new Error("Unknown slider state");
  }

  return `${data.id}-${index}`;
}
