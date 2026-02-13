# @vue-aria/slider

`@vue-aria/slider` ports slider accessibility behavior from upstream `@react-aria/slider`.

## API

- `useSlider`
- `useSliderThumb`

## Implemented modules

- `useSlider` (initial parity slice)
- `useSliderThumb` (initial parity slice)

## Upstream-aligned example

```ts
import { ref } from "vue";
import { useSlider, useSliderThumb } from "@vue-aria/slider";

const trackRef = { current: null as Element | null };
const inputRef = ref<HTMLInputElement | null>(null);

const state = {
  values: [50],
  defaultValues: [50],
  orientation: "horizontal" as const,
  step: 1,
  pageSize: 10,
  focusedThumb: undefined as number | undefined,
  isDisabled: false,
  isThumbDragging: () => false,
  isThumbEditable: () => true,
  getThumbPercent: () => 0.5,
  getPercentValue: (percent: number) => percent * 100,
  setThumbDragging: () => {},
  setThumbPercent: () => {},
  setThumbValue: () => {},
  setFocusedThumb: () => {},
  getThumbMinValue: () => 0,
  getThumbMaxValue: () => 100,
  getThumbValueLabel: () => "50",
  decrementThumb: () => {},
  incrementThumb: () => {},
  setThumbEditable: () => {},
};

const slider = useSlider({ label: "Volume" }, state, trackRef);
const thumb = useSliderThumb({ index: 0, trackRef, inputRef }, state);
```

## Notes

- Track and thumb interactions include pointer, mouse, touch, and keyboard flows.
- Form reset wiring for range input values follows upstream behavior through `useFormReset`.
- `Spectrum S2` is ignored for this port.
