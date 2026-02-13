import { toRaw } from "vue";

interface SliderData {
  id: string;
  "aria-describedby"?: string;
  "aria-details"?: string;
}

export const sliderData: WeakMap<object, SliderData> = new WeakMap<object, SliderData>();

function getData(state: object): SliderData | undefined {
  return sliderData.get((toRaw(state) as object) ?? state) ?? sliderData.get(state);
}

export function setSliderData(state: object, data: SliderData): void {
  const rawState = (toRaw(state) as object) ?? state;
  sliderData.set(rawState, data);
  if (rawState !== state) {
    sliderData.set(state, data);
  }
}

export function getSliderThumbId(state: object, index: number): string {
  const data = getData(state);
  if (!data) {
    throw new Error("Unknown slider state");
  }

  return `${data.id}-${index}`;
}

export function getSliderData(state: object): SliderData | undefined {
  return getData(state);
}
