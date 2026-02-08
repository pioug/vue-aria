# @vue-aria/slider

Slider accessibility primitives.

## `useSliderState`

Provides Vue-native slider state compatible with `useSlider` and `useSliderThumb`.

## `useSlider`

Provides group, track, and output semantics for one or more slider thumbs.

## `useSliderThumb`

Provides thumb and input behavior for an individual slider thumb.

```ts
import { useSliderState, useSlider, useSliderThumb } from "@vue-aria/slider";

const state = useSliderState({
  defaultValue: [50],
});

const { groupProps, trackProps, outputProps } = useSlider(
  {
    label: "Volume",
  },
  state,
  trackRef
);

const thumb = useSliderThumb(
  {
    index: 0,
    trackRef,
  },
  state
);
```

### Behavior

- `useSliderState` supports controlled/uncontrolled values, min/max/step clamping, drag lifecycle, and thumb constraints.
- Supports track click/drag interactions and nearest-thumb selection.
- Supports thumb drag and Page/Home/End keyboard interactions.
- Composes thumb `aria-describedby`/`aria-details` from slider-level and thumb-level values.
