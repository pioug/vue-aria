# @vue-aria/slider

`@vue-aria/slider` ports slider accessibility behavior from upstream `@react-aria/slider`.

## API

- `useSlider`
- `useSliderThumb`

## Implemented modules

- `useSlider` (initial parity slice)
- `useSliderThumb` (initial parity slice)
- `useSlider` + `useSliderThumb` integration with `@vue-aria/slider-state`

## Story variants mirrored

- Single slider with visible label
- Single slider with `aria-label`
- Range slider (2 thumbs)
- Multi-thumb slider (3+ thumbs)
- Disabled-thumb combinations
- Vertical orientation behavior

## Single slider example

```ts
import { ref } from "vue";
import { useSlider, useSliderThumb } from "@vue-aria/slider";
import { useSliderState } from "@vue-aria/slider-state";

const trackRef = { current: null as Element | null };
const inputRef = ref<HTMLInputElement | null>(null);
const numberFormatter = new Intl.NumberFormat("en-US", {});

const state = useSliderState({
  defaultValue: [50],
  minValue: 0,
  maxValue: 100,
  numberFormatter,
});

const slider = useSlider({ label: "Volume" }, state, trackRef);
const thumb = useSliderThumb({ index: 0, trackRef, inputRef }, state);
```

## Range slider example

```ts
import { ref } from "vue";
import { useSlider, useSliderThumb } from "@vue-aria/slider";
import { useSliderState } from "@vue-aria/slider-state";

const trackRef = { current: null as Element | null };
const minInputRef = ref<HTMLInputElement | null>(null);
const maxInputRef = ref<HTMLInputElement | null>(null);
const numberFormatter = new Intl.NumberFormat("en-US", {});

const state = useSliderState({
  defaultValue: [20, 80],
  minValue: 0,
  maxValue: 100,
  numberFormatter,
});

const slider = useSlider({ label: "Range" }, state, trackRef);
const minThumb = useSliderThumb({ index: 0, "aria-label": "Minimum", trackRef, inputRef: minInputRef }, state);
const maxThumb = useSliderThumb({ index: 1, "aria-label": "Maximum", trackRef, inputRef: maxInputRef }, state);
```

## Multi-thumb editable/disabled example

```ts
const numberFormatter = new Intl.NumberFormat("en-US", {});
const state = useSliderState({
  defaultValue: [10, 35, 70, 90],
  minValue: 0,
  maxValue: 100,
  numberFormatter,
});

// Match upstream story behavior where some thumbs are read-only.
state.setThumbEditable(1, false);
state.setThumbEditable(3, false);
```

## Base style parity snippet

```css
.slider {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 300px;
  touch-action: none;
}

.track {
  position: relative;
  height: 30px;
  width: 100%;
}

.rail {
  position: absolute;
  background-color: #e4e4e4;
  height: 3px;
  top: 13px;
  width: 100%;
}

.filledRail {
  position: absolute;
  background-color: #707070;
  height: 3px;
  top: 13px;
  left: 0;
}

.thumbHandle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #707070;
  background-color: #f5f5f5;
  box-shadow: 0 0 0 4px #f5f5f5;
}
```

## Notes

- Track and thumb interactions include pointer, mouse, touch, and keyboard flows.
- Form reset wiring for range input values follows upstream behavior through `useFormReset`.
- `Spectrum S2` is ignored for this port.
