# @vue-aria/slider

Slider accessibility primitives.

## `useSlider`

Provides group, track, and output semantics for one or more slider thumbs.

## `useSliderThumb`

Provides thumb and input behavior for an individual slider thumb.

```ts
import { useSlider, useSliderThumb } from "@vue-aria/slider";

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

- Supports track click/drag interactions and nearest-thumb selection.
- Supports thumb drag and Page/Home/End keyboard interactions.
- Composes thumb `aria-describedby`/`aria-details` from slider-level and thumb-level values.
