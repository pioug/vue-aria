# @vue-spectrum/utils

Shared utility baseline for the Spectrum component migration.

## Exports

- `classNames`
- `keepSpectrumClassNames`
- `shouldKeepSpectrumClassNames`
- `useSlotProps`
- `cssModuleToSlots`
- `SlotProvider`
- `ClearSlots`

## `classNames`

`classNames` supports both:

- generic `clsx`-style joining
- React Spectrum-style CSS module mapping (`classNames(cssModule, ...)`)

```ts
import { classNames } from "@vue-spectrum/utils";

const classes = classNames("base", { selected: true });
```

```ts
const styles = { root: "mapped-root" };
const classes = classNames(styles, "root", { external: true });
// => "mapped-root external"
```

## `keepSpectrumClassNames`

Enable temporary legacy class-name compatibility mode when CSS overrides still target raw Spectrum selectors.

```ts
import { keepSpectrumClassNames } from "@vue-spectrum/utils";

keepSpectrumClassNames();
```

## Slots Utilities

`useSlotProps` and `SlotProvider` bring the React Spectrum slot-prop merge pattern to Vue package ports.

```ts
import { SlotProvider, useSlotProps } from "@vue-spectrum/utils";
```

## Notes

- Class-name and slot-prop compatibility behavior are ported; broader `@react-spectrum/utils` surfaces remain in progress.
