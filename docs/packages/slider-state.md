# @vue-aria/slider-state

`@vue-aria/slider-state` ports slider state management from upstream `@react-stately/slider`.

## API

- `useSliderState`

## Implemented modules

- `useSliderState` (initial parity slice)

## Upstream-aligned example

```ts
import { useSliderState } from "@vue-aria/slider-state";

const numberFormatter = new Intl.NumberFormat("en-US", {});
const state = useSliderState({
  defaultValue: [25, 75],
  minValue: 0,
  maxValue: 100,
  step: 1,
  numberFormatter,
});

state.setThumbValue(0, 30);
state.incrementThumb(1);
```

## Notes

- Supports single and multi-thumb value arrays.
- Handles step snapping, min/max clamping, drag lifecycle flags, and `onChange`/`onChangeEnd` conversion for single-value sliders.
- `Spectrum S2` is ignored for this port.
