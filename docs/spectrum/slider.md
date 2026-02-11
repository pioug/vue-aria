# @vue-spectrum/slider

Vue port of `@react-spectrum/slider`.

> Status: in progress baseline for runtime behavior, tests, and docs.

<script setup lang="ts">
import { Flex, RangeSlider, Slider } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <Flex direction="column" gap="size-300" class="spectrum-preview-panel">
    <Slider label="Volume" :defaultValue="35" />

    <RangeSlider
      label="Price range"
      :defaultValue="{ start: 20, end: 70 }"
      :minValue="0"
      :maxValue="100"
    />
  </Flex>
</div>

## Exports

- `Slider`
- `RangeSlider`

## Example

```ts
import { h } from "vue";
import { RangeSlider, Slider } from "@vue-spectrum/slider";

const single = h(Slider, {
  label: "Volume",
  defaultValue: 35,
  onChange: (value) => {
    console.log(value);
  },
});

const range = h(RangeSlider, {
  label: "Price range",
  defaultValue: { start: 20, end: 70 },
  onChange: (value) => {
    console.log(value.start, value.end);
  },
});
```

## Notes

- Baseline includes controlled/uncontrolled slider and range-slider behavior.
- Includes keyboard/page/home/end value updates (including range-derived PageUp/PageDown step snapping), form integration, and SSR coverage.
- Advanced interaction/formatting parity work is still in progress.
