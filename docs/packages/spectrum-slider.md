# @vue-spectrum/slider

`@vue-spectrum/slider` ports the React Spectrum slider components to Vue 3 using `@vue-aria/slider` and `@vue-stately/slider`.

## API

- `Slider`
- `RangeSlider`
- `SliderBase`
- `SliderThumb`

## Implemented modules

- `SliderBase` (shared state/label/output wiring)
- `SliderThumb` (thumb rendering + hidden range input wiring)
- `Slider`
- `RangeSlider`

## Basic Slider example

```ts
import { Slider } from "@vue-spectrum/slider";
```

```vue
<Slider label="Volume" :defaultValue="20" />
```

## Controlled Slider (`v-model`)

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Slider } from "@vue-spectrum/slider";

const value = ref(35);
const handleChange = (next: number) => {
  value.value = next;
};
</script>

<template>
  <Slider
    label="Volume"
    :value="value"
    :onChange="handleChange"
  />
</template>
```

## Value formatting (`formatOptions`)

```vue
<Slider
  label="Opacity"
  :minValue="0"
  :maxValue="1"
  :step="0.01"
  :defaultValue="0.2"
  :formatOptions="{ style: 'percent' }"
/>
```

## Filled and gradient track styles

```vue
<Slider
  label="Temperature"
  :defaultValue="30"
  isFilled
  :fillOffset="20"
  :trackGradient="['#0ea5e9 0%', '#22c55e 50%', '#f59e0b 100%']"
/>
```

## Basic RangeSlider example

```ts
import { RangeSlider } from "@vue-spectrum/slider";
```

```vue
<RangeSlider
  label="Price range"
  :defaultValue="{ start: 10, end: 60 }"
  startName="minPrice"
  endName="maxPrice"
/>
```

## Controlled RangeSlider (`v-model` pattern)

```vue
<script setup lang="ts">
import { ref } from "vue";
import { RangeSlider } from "@vue-spectrum/slider";

const value = ref({ start: 10, end: 60 });
const handleChange = (next: { start: number; end: number }) => {
  value.value = next;
};
</script>

<template>
  <RangeSlider
    label="Price range"
    :value="value"
    :onChange="handleChange"
    startName="minPrice"
    endName="maxPrice"
  />
</template>
```

## Notes

- Current parity slice covers labeling, controlled/default values, form wiring/reset behavior, keyboard behavior, track-click interactions, locale-aware thumb labels, and value-output formatting.
- Spectrum class/token composition parity is preserved; load your Spectrum theme CSS/tokens in the host app for full visual fidelity.
- `Spectrum S2` is out of scope for this port.
