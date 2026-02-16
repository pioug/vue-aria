# @vue-stately/slider

`@vue-stately/slider` ports slider state management from upstream `@react-stately/slider`.

## API

- `useSliderState`

## Implemented modules

- `useSliderState` (initial parity slice)

## Upstream-aligned examples

```ts
import { useSliderState } from "@vue-stately/slider";

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
import { useSliderState } from "@vue-stately/slider";

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

```ts
// Multi-thumb drag lifecycle:
// onChangeEnd is emitted only after all dragging thumbs stop.
const rangeLifecycleState = useSliderState({
  defaultValue: [10, 80],
  numberFormatter: new Intl.NumberFormat("en-US", {}),
  onChange(values) {
    console.log("change", values);
  },
  onChangeEnd(values) {
    console.log("change end", values);
  },
});

rangeLifecycleState.setThumbDragging(0, true);
rangeLifecycleState.setThumbDragging(1, true);
rangeLifecycleState.setThumbValue(0, 20);
rangeLifecycleState.setThumbValue(1, 90);
rangeLifecycleState.setThumbDragging(0, false); // no onChangeEnd yet
rangeLifecycleState.setThumbDragging(1, false); // onChangeEnd now fires
```

```vue
<script setup lang="ts">
import { reactive } from "vue";
import { useSliderState } from "@vue-stately/slider";

const model = reactive({ value: [20, 80] });
const numberFormatter = new Intl.NumberFormat("en-US", {});

const state = useSliderState({
  value: model.value,
  numberFormatter,
  onChange(next) {
    model.value = next;
  },
});
</script>

<template>
  <pre>{{ state.values }}</pre>
</template>
```

```vue
<script setup lang="ts">
import { computed } from "vue";
import { useSliderState } from "@vue-stately/slider";

const state = useSliderState({
  defaultValue: [30, 70],
  numberFormatter: new Intl.NumberFormat("en-US", {}),
});

const minLeft = computed(() => `${state.getThumbPercent(0) * 100}%`);
const maxLeft = computed(() => `${state.getThumbPercent(1) * 100}%`);
</script>

<template>
  <div class="track">
    <div class="thumb" :style="{ left: minLeft }" />
    <div class="thumb" :style="{ left: maxLeft }" />
  </div>
</template>

<style scoped>
.track {
  position: relative;
  width: 320px;
  height: 16px;
  background: #e4e4e4;
}

.thumb {
  position: absolute;
  top: 50%;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #5a5a5a;
  transform: translate(-50%, -50%);
}
</style>
```

## Notes

- Supports single and multi-thumb value arrays.
- Handles step snapping, min/max clamping, drag lifecycle flags, and `onChange`/`onChangeEnd` conversion for single-value sliders.
- Controlled values can be driven from reactive external state while preserving upstream callback semantics.
- Keep `value`/`defaultValue` callback shape stable at runtime (`number` or `number[]`) to avoid callback payload type churn.
- In SSR flows, initialize slider state from deterministic server values (`defaultValue` or controlled `value`) to avoid hydration mismatches.
- Exposes thumb-level helpers used directly by `@vue-aria/slider`:
  - `getThumbMinValue` / `getThumbMaxValue`
  - `setThumbPercent` / `getPercentValue`
  - `setThumbDragging` / `isThumbDragging`
- `Spectrum S2` is ignored for this port.
