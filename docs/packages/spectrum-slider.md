# @vue-spectrum/slider

`@vue-spectrum/slider` ports the React Spectrum slider components to Vue 3 using `@vue-aria/slider` and `@vue-aria/slider-state`.

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

## Notes

- Initial parity slice focuses on upstream behavior for labeling, controlled/default values, thumb form wiring, and value-output formatting.
- `Spectrum S2` is out of scope for this port.
