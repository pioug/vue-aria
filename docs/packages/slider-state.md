# @vue-aria/slider-state

`@vue-aria/slider-state` ports slider state management from upstream `@react-stately/slider`.

## API

- `useSliderState`

## Implemented modules

- `useSliderState` (initial parity slice)

## Upstream-aligned examples

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

```ts
// Single-value slider callback behavior matches upstream:
// `onChange` and `onChangeEnd` receive a number (not an array).
const singleState = useSliderState({
  defaultValue: 25,
  minValue: 0,
  maxValue: 100,
  numberFormatter: new Intl.NumberFormat("en-US", {}),
  onChange(value) {
    console.log("single onChange", value); // number
  },
  onChangeEnd(value) {
    console.log("single onChangeEnd", value); // number
  },
});

singleState.setThumbDragging(0, true);
singleState.setThumbValue(0, 30);
singleState.setThumbDragging(0, false);
```

```ts
// Multi-thumb callback behavior:
// `onChange` and `onChangeEnd` receive number[].
const rangeState = useSliderState({
  defaultValue: [10, 80],
  minValue: 0,
  maxValue: 100,
  numberFormatter: new Intl.NumberFormat("en-US", {}),
  onChange(values) {
    console.log("range onChange", values); // number[]
  },
  onChangeEnd(values) {
    console.log("range onChangeEnd", values); // number[]
  },
});
```

```ts
import { reactive } from "vue";
import { useSliderState } from "@vue-aria/slider-state";

// Controlled/reactive usage: state values follow external prop updates.
const props = reactive({
  value: [15, 65],
});

const state = useSliderState({
  value: props.value,
  numberFormatter: new Intl.NumberFormat("en-US", {}),
  onChange(next) {
    props.value = next;
  },
});
```

## Notes

- Supports single and multi-thumb value arrays.
- Handles step snapping, min/max clamping, drag lifecycle flags, and `onChange`/`onChangeEnd` conversion for single-value sliders.
- Controlled values can be driven from reactive external state while preserving upstream callback semantics.
- Exposes thumb-level helpers used directly by `@vue-aria/slider`:
  - `getThumbMinValue` / `getThumbMaxValue`
  - `setThumbPercent` / `getPercentValue`
  - `setThumbDragging` / `isThumbDragging`
- `Spectrum S2` is ignored for this port.
